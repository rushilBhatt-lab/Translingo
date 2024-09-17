import React, { useEffect, useRef } from "react";
import Icon from "@/app/Icon/Icon";
import { faPenNib } from "@fortawesome/free-solid-svg-icons";

interface props {
	file: File | null;
	audioStream: MediaSource | File | null;
	handleAudioReset: () => void;
	handleFormSubmission: () => void;
}

const FileDisplay = ({ file, audioStream, handleAudioReset, handleFormSubmission }: props) => {
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		if (file && audioRef.current) {
			const objectUrl = URL.createObjectURL(file);
			audioRef.current.src = objectUrl;
			return () => URL.revokeObjectURL(objectUrl);
		} else if (audioStream && audioRef.current) {
			const objectUrl = URL.createObjectURL(audioStream);
			audioRef.current.src = objectUrl;
			return () => URL.revokeObjectURL(objectUrl);
		}
	}, [file, audioStream]);

	return (
		<main className="flex-1 p-4 flex flex-col gap-3 text-center sm:gap-4 justify-center pb-20 w-72 max-w-full mx-auto sm:w-96">
			<h1 className="font-semibold text-4xl sm:text-5xl md:text-6xl">Your file</h1>
			<div className="flex flex-col text-left my-4">
				<h3 className="font-semibold">
					Name
					<p>{file ? file.name : "custom Audio"}</p>
				</h3>
			</div>
			<div className="flex flex-col mb-2">
				<audio ref={audioRef} className="w-full" controls>
					Your browser does not support the audio element.
				</audio>
			</div>
			<div className="flex items-center justify-between gap-4">
				<button onClick={handleAudioReset} className="text-slate-400 hover:text-blue-600 duration-200">
					Reset
				</button>
				<button onClick={handleFormSubmission} className="specialBtn  px-3 p-2 rounded-lg text-blue-400 flex items-center gap-2 font-medium ">
					<p>Transcribe</p>
					<i className="fa-solid fa-pen-nib"></i>
				</button>
			</div>
		</main>
	);
};

export default FileDisplay;
