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

export interface TranscriptionProgressData {
	file: string;
	progress: number;
	loaded: number;
	total: number;
}

export interface ModelCallbackData {
	status: string;
	file?: string;
	progress?: number;
	loaded?: number;
	total?: number;
}

export interface GenerationTrackerResult {
	text: string;
	start: number;
	end: any;
}

export interface TranscriptionChunk {
	text: string;
	timestamp: [number, number];
}
