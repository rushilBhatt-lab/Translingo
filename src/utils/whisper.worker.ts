import { pipeline, PipelineType } from "@xenova/transformers";
import { MessageTypes, Models } from "./presets";

class MyTranscriptionPipeline {
	static task: PipelineType = "automatic-speech-recognition";
	static model = Models.WHISPER_TINY_EN;
	static instance: any = null;

	static async getInstance(progress_callback: ((data: any) => void) | null = null): Promise<any> {
		if (this.instance === null) {
			this.instance = await pipeline(this.task, undefined, {
				progress_callback: progress_callback || undefined,
			});
		}

		return this.instance;
	}
}
self.addEventListener("message", async (event: MessageEvent) => {
	const { type, audio } = event.data;
	if (type === MessageTypes.INFERENCE_REQUEST) {
		await transcribe(audio);
	}
});

async function transcribe(audio: any): Promise<void> {
	sendLoadingMessage("loading");

	let pipelineInstance: any;

	try {
		pipelineInstance = await MyTranscriptionPipeline.getInstance(load_model_callback);
	} catch (err: any) {
		console.error(err.message);
	}

	sendLoadingMessage("success");

	const stride_length_s = 5;
	const generationTracker = new GenerationTracker(pipelineInstance, stride_length_s);

	await pipelineInstance(audio, {
		top_k: 0,
		do_sample: false,
		chunk_length: 30,
		stride_length_s,
		return_timestamps: true,
		callback_function: generationTracker.callbackFunction.bind(generationTracker),
		chunk_callback: generationTracker.chunkCallback.bind(generationTracker),
	});

	generationTracker.sendFinalResult();
}

async function load_model_callback(data: any): Promise<void> {
	const { status } = data;
	if (status === "progress") {
		const { file, progress, loaded, total } = data;
		sendDownloadingMessage(file, progress, loaded, total);
	}
}

function sendLoadingMessage(status: string): void {
	self.postMessage({
		type: MessageTypes.LOADING,
		status,
	});
}

async function sendDownloadingMessage(file: string, progress: number, loaded: number, total: number): Promise<void> {
	self.postMessage({
		type: MessageTypes.DOWNLOADING,
		file,
		progress,
		loaded,
		total,
	});
}

class GenerationTracker {
	pipeline: any;
	stride_length_s: number;
	chunks: any[];
	time_precision: number;
	processed_chunks: any[];
	callbackFunctionCounter: number;

	constructor(pipeline: any, stride_length_s: number) {
		this.pipeline = pipeline;
		this.stride_length_s = stride_length_s;
		this.chunks = [];
		this.time_precision = pipeline?.processor.feature_extractor.config.chunk_length / pipeline.model.config.max_source_positions;
		this.processed_chunks = [];
		this.callbackFunctionCounter = 0;
	}

	sendFinalResult(): void {
		self.postMessage({ type: MessageTypes.INFERENCE_DONE });
	}

	callbackFunction(beams: any[]): void {
		this.callbackFunctionCounter += 1;
		if (this.callbackFunctionCounter % 10 !== 0) {
			return;
		}

		const bestBeam = beams[0];
		const text = this.pipeline.tokenizer.decode(bestBeam.output_token_ids, {
			skip_special_tokens: true,
		});

		const result = {
			text,
			start: this.getLastChunkTimestamp(),
			end: undefined,
		};

		createPartialResultMessage(result);
	}

	chunkCallback(data: any): void {
		this.chunks.push(data);
		const { chunks } = this.pipeline.tokenizer._decode_asr(this.chunks, {
			time_precision: this.time_precision,
			return_timestamps: true,
			force_full_sequence: false,
		});

		this.processed_chunks = chunks.map((chunk: any, index: number) => {
			return this.processChunk(chunk, index);
		});

		createResultMessage(this.processed_chunks, false, this.getLastChunkTimestamp());
	}

	getLastChunkTimestamp(): number {
		if (this.processed_chunks.length === 0) {
			return 0;
		}

		const lastChunk = this.processed_chunks[this.processed_chunks.length - 1];
		return lastChunk.end;
	}

	processChunk(chunk: any, index: number): { index: number; text: string; start: number; end: number } {
		const { text, timestamp } = chunk;
		const [start, end] = timestamp;

		return {
			index,
			text: `${text.trim()}`,
			start: Math.round(start),
			end: Math.round(end) || Math.round(start + 0.9 * this.stride_length_s),
		};
	}
}

function createResultMessage(results: any[], isDone: boolean, completedUntilTimestamp: number): void {
	self.postMessage({
		type: MessageTypes.RESULT,
		results,
		isDone,
		completedUntilTimestamp,
	});
}

function createPartialResultMessage(result: any): void {
	self.postMessage({
		type: MessageTypes.RESULT_PARTIAL,
		result,
	});
}
