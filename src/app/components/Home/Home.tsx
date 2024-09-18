import React, { useState, useEffect, useRef } from "react";
import Icon from "@/app/Icon/Icon";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";

interface Props {
	setFile: (file: File) => void;
	setAudioStream: (file: File) => void;
}

const HomePage = ({ setFile, setAudioStream }: Props) => {
	const [recordingStatus, setRecordingStatus] = useState("inactive");
	const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
	const [duration, setDuration] = useState(0);
	const mediaRecorder = useRef<MediaRecorder | null>(null);
	const mimeType = "audio/webm";
	const [stream, setStream] = useState<MediaStream | null>(null);

	const StartRecording = async () => {
		let tempStream: MediaStream | null = null;
		try {
			const streamData = await navigator.mediaDevices.getUserMedia({
				audio: true,
				video: false,
			});
			tempStream = streamData;
		} catch (err: any) {
			console.error("Error accessing media devices.", err.message);
			return;
		}
		setStream(tempStream);
		setRecordingStatus("recording");
		const media = new MediaRecorder(tempStream, {
			mimeType: mimeType,
		});
		mediaRecorder.current = media;
		mediaRecorder.current.start();

		const localAudioChunks: Blob[] = [];
		mediaRecorder.current.ondataavailable = (event) => {
			if (event.data.size > 0) {
				localAudioChunks.push(event.data);
			}
		};
		setAudioChunks(localAudioChunks);
	};

	const StopRecording = () => {
		if (mediaRecorder.current) {
			mediaRecorder.current.stop();
			mediaRecorder.current.onstop = () => {
				const audioBlob = new Blob(audioChunks, { type: mimeType });
				const audioFile = new File([audioBlob], "recorded-audio.webm", {
					type: mimeType,
				});
				setAudioStream(audioFile);
				setAudioChunks([]);
				setDuration(0);
				setRecordingStatus("inactive");
				if (stream) {
					stream.getTracks().forEach((track) => track.stop());
				}
			};
		} else {
			console.error("MediaRecorder is null");
		}
	};

	useEffect(() => {
		if (recordingStatus === "inactive") {
			return;
		}

		const interval = setInterval(() => {
			setDuration((curr) => curr + 1);
		}, 1000);
		return () => clearInterval(interval);
	}, [recordingStatus]);

	return (
		<main className="flex-1 p-4 flex flex-col justify-center gap-3 text-center sm:gap-4 pb-20">
			<h1 className="font-semibold text-5xl sm:text-6xl">TransLingo</h1>
			<h3 className="font-medium md:text-lg">
				Record <span>&rarr;</span> Transcribe <span>&rarr;</span> Translate
			</h3>
			<button
				className="flex items-center text-base justify-between gap-4 mx-auto w-72 max-w-full my-4 specialBtn px-4 py-2 rounded-xl"
				onClick={recordingStatus === "recording" ? StopRecording : StartRecording}
			>
				<p>{recordingStatus === "inactive" ? "Record" : "Stop Recording"}</p>
				<div className="flex items-center gap-2">{duration > 0 && <p className="text-sm">{duration}s</p>}</div>
				<Icon
					icon={faMicrophone}
					className={`fa-solid duration-200 fa-microphone ${recordingStatus === "recording" ? "text-rose-300" : ""}`}
				/>
			</button>
			<p>
				Or
				<label className="cursor-pointer font-bold">
					<span> Upload </span>
					<input
						className="hidden"
						type="file"
						accept=".mp3,.wave"
						onChange={(e) => {
							const files = e.target.files;
							if (files && files.length > 0) {
								setFile(files[0]);
							}
						}}
					/>
				</label>
				a mp3 file
			</p>
		</main>
	);
};

export default HomePage;
