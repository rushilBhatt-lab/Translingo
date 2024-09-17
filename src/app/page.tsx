"use client";
import { useEffect, useRef, useState } from "react";
import Header from "./components/Header/Header";
import HomePage from "./components/Home/Home";
import FileDisplay from "./components/FileDisplay/FileDisplay";
import Transcribing from "./components/Transcribing/Transcribing";
import Information from "./components/Information/Information";
import { MessageTypes } from "@/utils/presets";
import Link from "next/link";
import { outputInterface } from "@/interface/interface";

export default function Home() {
	const worker = useRef<Worker | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [audioStream, setAudioStream] = useState<MediaSource | File | null>(null);
	const [output, setOutput] = useState<outputInterface[]>([]);
	const [downloading, setDownloading] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [finished, setIsFinished] = useState<boolean>(false);

	const isAudioAvailable = file || audioStream;

	const resetAudio = () => {
		setFile(null);
		setAudioStream(null);
	};

	useEffect(() => {
		if (!worker.current) {
			worker.current = new Worker(new URL("@/utils/whisper.worker.ts", import.meta.url), {
				type: "module",
			});
		}

		const onMessageRecieved = async (e: MessageEvent) => {
			switch (e.data.type) {
				case MessageTypes.DOWNLOADING:
					setDownloading(true);
					break;
				case MessageTypes.LOADING:
					setLoading(true);
					break;
				case MessageTypes.RESULT:
					setOutput(e.data.results);
					break;
				case MessageTypes.INFERENCE_DONE:
					setIsFinished(true);
					break;
			}
		};

		worker.current.addEventListener("message", onMessageRecieved);

		return () => worker.current?.removeEventListener("message", onMessageRecieved);
	}, []);

	const readAudioFrom = async (file: File) => {
		const sampling_rate = 16000;
		const audioContext = new AudioContext({ sampleRate: sampling_rate });
		const response = await file.arrayBuffer();

		const decoded = await audioContext.decodeAudioData(response);
		const audio = decoded.getChannelData(0);
		return audio;
	};

	const handleFormSubmission = async () => {
		if (!file && !audioStream) {
			return;
		}

		let audio: Float32Array | null = null;

		if (file) {
			audio = await readAudioFrom(file);
		}

		if (audioStream && audioStream instanceof File) {
			audio = await readAudioFrom(audioStream);
		}

		if (audio) {
			const modelName = `openai/whisper-tiny.en`;
			worker.current?.postMessage({
				type: MessageTypes.INFERENCE_REQUEST,
				audio,
				modelName,
			});
		}
	};

	const resetToHomePage = () => {
		setFile(null);
		setAudioStream(null);
		setOutput([]);
		setIsFinished(false);
		setLoading(false);
		setDownloading(false);
	};

	const renderContent = () => {
		if (output.length > 0) {
			return <Information output={output} finished={finished} resetToHomePage={resetToHomePage} />;
		}

		if (loading) {
			return <Transcribing downloading={downloading} />;
		}

		if (isAudioAvailable) {
			return <FileDisplay handleFormSubmission={handleFormSubmission} handleAudioReset={resetAudio} file={file} audioStream={audioStream} />;
		}

		return <HomePage setFile={setFile} setAudioStream={setAudioStream} />;
	};

	return (
		<div className="flex flex-col max-w-[1000px] mx-auto w-full items-center justify-center">
			<section className="min-h-[47rem] flex flex-col">
				<Header />
				{renderContent()}
			</section>
			<footer className="text-center pb-10">
				Built with ❤️ by
				<Link href="https://rushilbhatt.com/" className="underline" target="_blank">
					Rushil
				</Link>
			</footer>
		</div>
	);
}
