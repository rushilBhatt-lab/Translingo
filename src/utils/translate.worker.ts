import { ProgressCallbackData, TranslationMessageEvent } from "@/interface/interface";
import { pipeline, PipelineType } from "@xenova/transformers";

class MyTranslationPipeline {
	static task: PipelineType = "translation";
	static model: string = "Xenova/nllb-200-distilled-600M";
	static instance: any = null;

	static async getInstance(progress_callback?: (data: ProgressCallbackData) => void): Promise<any> {
		if (this.instance === null) {
			this.instance = await pipeline(this.task, this.model, { progress_callback });
		}
		return this.instance;
	}
}

self.addEventListener("message", async (event: MessageEvent<TranslationMessageEvent>) => {
	const { data } = event;
	const translator = await MyTranslationPipeline.getInstance((progressData) => {
		self.postMessage(progressData);
	});

	const output = await translator(data.text, {
		tgt_lang: data.tgt_lang,
		src_lang: data.src_lang,
		callback_function: (beams: any[]) => {
			self.postMessage({
				status: "update",
				output: translator.tokenizer.decode(beams[0].output_token_ids, {
					skip_special_tokens: true,
				}),
			});
		},
	});

	self.postMessage({
		status: "complete",
		output,
	});
});
