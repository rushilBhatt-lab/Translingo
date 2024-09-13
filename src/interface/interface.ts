export interface TranslationMessageEvent {
	text: string;
	tgt_lang: string;
	src_lang: string;
}

export interface ProgressCallbackData {
	progress: number;
}
