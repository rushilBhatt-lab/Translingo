import { pipeline, PipelineType, Pipeline } from "@xenova/transformers";
import { MessageTypes, Models } from "./presets";
import { ModelCallbackData, TranscriptionChunk, GenerationTrackerResult } from "@/interface/interface";

class MyTranscriptionPipeline {
	static task: PipelineType = "automatic-speech-recognition";
	static model = Models.WHISPER_TINY_EN;
	static instance: any = null;

	static async getInstance(progressCallback?: (data: ModelCallbackData) => void): Promise<Pipeline | null> {
		if (this.instance === null) {
			try {
				this.instance = await pipeline(this.task, undefined, {
					progress_callback: progressCallback || undefined,
				});
			} catch (error) {
				console.error("Failed to initialize pipeline:", error);
				this.instance = null;
			}
		}
		return this.instance;
	}
}

// Handle message events
self.addEventListener("message", async (event: MessageEvent) => {
	const { type, audio } = event.data;
	if (type === MessageTypes.INFERENCE_REQUEST && audio) {
		await transcribe(audio);
	}
});

// Transcribe audio and handle errors
async function transcribe(audio: Blob): Promise<void> {
	sendLoadingMessage("loading");

	const pipelineInstance = await MyTranscriptionPipeline.getInstance(loadModelCallback);

	if (!pipelineInstance) {
		console.error("Pipeline instance is not available.");
		return;
	}

	sendLoadingMessage("success");

	const strideLengthS = 5;
	const generationTracker = new GenerationTracker(pipelineInstance, strideLengthS);

	try {
		await pipelineInstance(audio, {
			top_k: 0,
			do_sample: false,
			chunk_length: 30,
			stride_length: strideLengthS,
			return_timestamps: true,
			callback_function: generationTracker.callbackFunction.bind(generationTracker),
			chunk_callback: generationTracker.chunkCallback.bind(generationTracker),
		});
	} catch (error) {
		console.error("Error during transcription:", error);
	}

	generationTracker.sendFinalResult();
}

// Model callback for progress updates
async function loadModelCallback(data: ModelCallbackData): Promise<void> {
	const { status, file, progress, loaded, total } = data;
	if (status === "progress" && file && progress !== undefined && loaded !== undefined && total !== undefined) {
		sendDownloadingMessage(file, progress, loaded, total);
	}
}

// Send loading status messages
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

// Generation tracker class
class GenerationTracker {
	private pipeline: Pipeline;
	private strideLengthS: number;
	private chunks: TranscriptionChunk[];
	private timePrecision: number;
	private processedChunks: GenerationTrackerResult[];
	private callbackFunctionCounter: number;

	constructor(pipeline: Pipeline, strideLengthS: number) {
		this.pipeline = pipeline;
		this.strideLengthS = strideLengthS;
		this.chunks = [];
		this.timePrecision = pipeline?.processor.feature_extractor.config.chunk_length / pipeline.model.config.max_source_positions;
		this.processedChunks = [];
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

		const result: GenerationTrackerResult = {
			text,
			start: this.getLastChunkTimestamp(),
			end: undefined,
		};

		createPartialResultMessage(result);
	}

	chunkCallback(data: TranscriptionChunk): void {
		this.chunks.push(data);
		const decodedChunks = this.pipeline.tokenizer.decoder(this.chunks, {
			time_precision: this.timePrecision,
			return_timestamps: true,
			force_full_sequence: false,
		});

		this.processedChunks = decodedChunks.map((chunk: TranscriptionChunk, index: number) => {
			return this.processChunk(chunk, index);
		});

		createResultMessage(this.processedChunks, false, this.getLastChunkTimestamp());
	}

	getLastChunkTimestamp(): number {
		if (this.processedChunks.length === 0) {
			return 0;
		}

		const lastChunk = this.processedChunks[this.processedChunks.length - 1];
		return lastChunk.end;
	}

	processChunk(chunk: TranscriptionChunk, index: number) {
		const { text, timestamp } = chunk;
		const [start, end] = timestamp;

		return {
			index,
			text: text.trim(),
			start: Math.round(start),
			end: Math.round(end) || Math.round(start + 0.9 * this.strideLengthS),
		};
	}
}

// Create and send result messages
function createResultMessage(results: GenerationTrackerResult[], isDone: boolean, completedUntilTimestamp: number): void {
	self.postMessage({
		type: MessageTypes.RESULT,
		results,
		isDone,
		completedUntilTimestamp,
	});
}

function createPartialResultMessage(result: GenerationTrackerResult): void {
	self.postMessage({
		type: MessageTypes.RESULT_PARTIAL,
		result,
	});
}
