"use client";
import React, { useEffect, useRef, useState } from "react";
import Transcription from "../Transcription/Transcription";
import Translation from "../Translation/Translation";
import cn from "classnames";

// Define prop types
interface Props {
	output: any;
	finished: boolean;
}

const Information = ({ output, finished }: Props) => {
	const [tab, setTab] = useState("transcription");
	const [translation, setTranslation] = useState<string | null>(null);
	const [toLanguage, setToLanguage] = useState<string>("Select language");
	const [translating, setTranslating] = useState<boolean>(false);

	const worker = useRef<Worker | null>(null);

	useEffect(() => {
		if (!worker.current) {
			worker.current = new Worker(new URL("@/utils/translate.worker.ts", import.meta.url), {
				type: "module",
			});
		}

		const onMessageReceived = (e: MessageEvent) => {
			switch (e.data.status) {
				case "initiate":
					console.log("DOWNLOADING");
					break;
				case "progress":
					console.log("LOADING");
					break;
				case "update":
					setTranslation(e.data.output);
					console.log(e.data.output);
					break;
				case "complete":
					setTranslating(false);
					console.log("DONE");
					break;
			}
		};

		worker.current?.addEventListener("message", onMessageReceived);

		return () => worker.current?.removeEventListener("message", onMessageReceived);
	}, []);

	const textElement = tab === "transcription" ? output.map((val: any) => val.text).join(" ") : translation || "";

	// Handle copying the transcribed/translated text
	function handleCopy() {
		navigator.clipboard.writeText(textElement);
	}

	// Handle downloading the transcribed/translated text as a file
	function handleDownload() {
		const element = document.createElement("a");
		const file = new Blob([textElement], { type: "text/plain" });
		element.href = URL.createObjectURL(file);
		element.download = `Freescribe_${new Date().toString()}.txt`;
		document.body.appendChild(element);
		element.click();
	}

	// Trigger translation with the worker
	function generateTranslation() {
		if (translating || toLanguage === "Select language") {
			return;
		}

		setTranslating(true);

		worker.current?.postMessage({
			text: output.map((val: any) => val.text),
			src_lang: "eng_Latn",
			tgt_lang: toLanguage,
		});
	}

	return (
		<main className="flex-1 p-4 flex flex-col gap-3 text-center sm:gap-4 justify-center pb-20 max-w-prose w-full mx-auto sm:w-96">
			<h1 className="font-semibold text-4xl sm:text-5xl md:text-6xl whitespace-nowrap">Your Transcription</h1>
			<div className="grid grid-cols-2 items-center mx-auto bg-white shadow rounded-full overflow-hidden">
				<button
					className={cn("px-4 duration-200 py-1 font-medium", {
						"bg-blue-400 text-white": tab === "transcription",
						"text-blue-400 hover:text-blue-600": tab !== "transcription",
					})}
					onClick={() => setTab("transcription")}
				>
					Transcription
				</button>
				<button
					className={cn("px-4 duration-200 py-1 font-medium", {
						"bg-blue-400 text-white": tab === "translation",
						"text-blue-400 hover:text-blue-600": tab !== "translation",
					})}
					onClick={() => setTab("translation")}
				>
					Translation
				</button>
			</div>
			{tab === "transcription" ? (
				<Transcription textElement={textElement} />
			) : (
				<Translation
					toLanguage={toLanguage}
					translating={translating}
					textElement={textElement}
					//setTranslating={setTranslating}
					//setTranslation={setTranslation}
					setToLanguage={setToLanguage}
					generateTranslation={generateTranslation}
				/>
			)}
		</main>
	);
};

export default Information;
