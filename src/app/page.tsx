"use client";
import { useEffect, useRef, useState } from "react";
import Header from "./components/Header/Header";
import HomePage from "./components/Home/Home";
import FileDisplay from "./components/FileDisplay/FileDisplay";
import Transcribing from "./components/Transcribing/Transcribing";
import Information from "./components/Information/Information";
import { MessageTypes } from "@/utils/presets";

export default function Home() {
	const [file, setFile] = useState<File | null>(null);
	const [audioStream, setAudioStream] = useState<MediaStream | File | null>(null);
	const [downloading, setDownloading] = useState<boolean>(false);
	const [output, setOutput] = useState(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [finished, setIsFinished] = useState<boolean>(false);

	const isAudioAvailable = file || audioStream;

	const resetAudio = () => {
		setFile(null);
		setAudioStream(null);
	};

	const worker = useRef<Worker | null>(null);

	useEffect(() => {
		if (!worker.current) {
			worker.current = new Worker(new URL("@/utils/whisper.worker.ts", import.meta.url), {
				type: "module",
			});
		}

		// Event listener for receiving messages from the worker
		const onMessageRecieved = async (e: MessageEvent) => {
			switch (e.data.type) {
				case MessageTypes.DOWNLOADING:
					setDownloading(true);
					console.log("Downloading");
					break;
				case MessageTypes.LOADING:
					setLoading(true);
					console.log("loading");
					break;
				case MessageTypes.RESULT:
					setOutput(e.data.results);
					console.log("Result");
					break;
				case MessageTypes.INFERENCE_DONE:
					setIsFinished(true);
					console.log("INFERENCE_DONE");
					break;
			}
		};

		worker.current.addEventListener("message", onMessageRecieved);

		return () => worker.current?.removeEventListener("message", onMessageRecieved);
	}, []);
	const readAudioFrom = async (file: File) => {
		const sampling_rate = 16000;
		const audioCTX = new AudioContext({ sampleRate: sampling_rate });
		const response = await file.arrayBuffer();

		const decoded = await audioCTX.decodeAudioData(response);
		const audio = decoded.getChannelData(0);
		return audio;
	};

	const handleFormSubmission = async () => {
		if (!file && !audioStream) {
			return;
		}

		// Ensure only File is passed
		let audio = await readAudioFrom(file as File);
		const modelName = `openai/whisper-tiny.en`;
		worker.current?.postMessage({
			type: MessageTypes.INFERENCE_REQUEST,
			audio,
			modelName,
		});
	};

	return (
		<div className="flex flex-col max-w-[1000px] mx-auto w-full">
			<section className="min-h-screen flex flex-col">
				<Header />
				{output ? (
					<Information output={output} finished={finished} />
				) : loading ? (
					<Transcribing />
				) : isAudioAvailable ? (
					<FileDisplay handleFormSubmission={handleFormSubmission} handleAudioReset={resetAudio} file={file} audioStream={audioStream} />
				) : (
					<HomePage setFile={setFile} setAudioStream={setAudioStream} />
				)}
			</section>
			<footer></footer>
		</div>
	);
}
