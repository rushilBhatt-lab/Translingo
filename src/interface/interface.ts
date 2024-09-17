import { PipelineType } from "@xenova/transformers";

export interface TranslationMessageEvent {
	text: string;
	tgt_lang: string;
	src_lang: string;
}

export interface ProgressCallbackData {
	progress: number;
}

export interface outputInterface {
	end: number;
	index: number;
	start: number;
	text: string;
}

export interface Beam {
	output_token_ids: number[];
}

export interface progressData {
	model: string;
	status: string;
	task: PipelineType;
}

export type Tabs = "transcription" | "translation";
