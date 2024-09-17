import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Transcription from "../Transcription/Transcription";
import Translation from "../Translation/Translation";
import cn from "classnames";
import { outputInterface, Tabs } from "@/interface/interface";
import { toast } from "@/hooks/use-toast";

interface Props {
	output: outputInterface[];
	finished: boolean;
	resetToHomePage: () => void;
}

const Information: React.FC<Props> = ({ output, finished, resetToHomePage }) => {
	const worker = useRef<Worker | null>(null);
	const [tab, setTab] = useState<Tabs>("transcription");
	const [translation, setTranslation] = useState<string | null>(null);
	const [toLanguage, setToLanguage] = useState<string>("Select language");
	const [translating, setTranslating] = useState<boolean>(false);

	const textElement = useMemo(() => {
		return tab === "transcription" ? output.map((val) => val.text).join(" ") : translation || "";
	}, [tab, output, translation]);

	useEffect(() => {
		if (!worker.current) {
			worker.current = new Worker(new URL("@/utils/translate.worker.ts", import.meta.url), {
				type: "module",
			});
		}

		const onMessageReceived = (e: MessageEvent) => {
			switch (e.data.status) {
				case "initiate":
					break;
				case "progress":
					break;
				case "update":
					setTranslation(e.data.output);
					break;
				case "complete":
					setTranslating(false);
					break;
				default:
					break;
			}
		};

		worker.current?.addEventListener("message", onMessageReceived);

		return () => worker.current?.removeEventListener("message", onMessageReceived);
	}, []);

	const generateTranslation = useCallback(() => {
		if (translating || toLanguage === "Select language") return;

		setTranslating(true);

		worker.current?.postMessage({
			text: output.map((val) => val.text),
			src_lang: "eng_Latn",
			tgt_lang: toLanguage,
		});
	}, [translating, toLanguage, output]);

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(textElement);
		toast({
			description: "Text copied successfully!",
		});
	}, [textElement]);

	const handleDownload = useCallback(() => {
		const element = document.createElement("a");
		const file = new Blob([textElement], { type: "text/plain" });
		element.href = URL.createObjectURL(file);
		element.download = `Translingo_${new Date().toString()}.txt`;
		document.body.appendChild(element);
		element.click();
	}, [textElement]);

	return (
		<main className="flex-1 p-4 flex flex-col gap-3 text-center sm:gap-4 justify-center pb-20 max-w-prose w-full mx-auto">
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
			<div className="my-8 flex flex-col-reverse max-w-prose w-full mx-auto gap-4">
				{(!finished || translating) && (
					<div className="grid place-items-center">
						<i className="fa-solid fa-spinner animate-spin"></i>
					</div>
				)}
				{tab === "transcription" ? (
					<Transcription textElement={textElement} />
				) : (
					<Translation
						toLanguage={toLanguage}
						translating={translating}
						textElement={textElement}
						setToLanguage={setToLanguage}
						generateTranslation={generateTranslation}
					/>
				)}
			</div>
			<div className="flex items-center gap-4 mx-auto">
				<button
					onClick={handleCopy}
					title="Copy"
					className="bg-white hover:text-blue-500 duration-200 text-blue-300 px-2 aspect-square grid place-items-center rounded"
				>
					📝 ➡️ 📄📄
				</button>
				<button
					onClick={handleDownload}
					title="Download"
					className="bg-white hover:text-blue-500 duration-200 text-blue-300 px-2 aspect-square grid place-items-center rounded"
				>
					⬇️
				</button>
				<button onClick={resetToHomePage}>↩️</button>
			</div>
		</main>
	);
};

export default Information;
