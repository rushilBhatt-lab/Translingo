"use client";
import { useEffect, useState } from "react";
import Header from "./components/Header/Header";
import HomePage from "./components/Home/Home";
import FileDisplay from "./components/FileDisplay/FileDisplay";
import Transcribing from "./components/Transcribing/Transcribing";
import Information from "./components/Information/Information";

export default function Home() {
	const [file, setFile] = useState<File | null>(null);
	const [audioStream, setAudioStream] = useState<MediaStream | File | null>(null);
	const [output, setOutput] = useState<boolean>(true);
	const [loading, setLoading] = useState<boolean>(false);

	const isAudioAvailable = file || audioStream;

	const resetAudio = () => {
		setFile(null);
		setAudioStream(null);
	};

	useEffect(() => {
		console.log(audioStream);
	}, [audioStream]);

	return (
		<div className="flex flex-col max-w-[1000px] mx-auto w-full">
			<section className="min-h-screen flex flex-col">
				<Header />
				{output ? (
					<Information />
				) : loading ? (
					<Transcribing downloading={undefined} />
				) : isAudioAvailable ? (
					<FileDisplay handleAudioReset={resetAudio} file={file} audioStream={audioStream} />
				) : (
					<HomePage setFile={setFile} setAudioStream={setAudioStream} />
				)}
			</section>
			<footer></footer>
		</div>
	);
}
