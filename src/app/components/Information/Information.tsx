"use client";
import React, { useState } from "react";
import Transcription from "../Transcription/Transcription";
import Translation from "../Translation/Translation";

const Information = () => {
	const [tab, setTab] = useState("transcription");
	return (
		<main className="flex-1 p-4 flex flex-col gap-3 text-center sm:gap-4 justify-center pb-20 max-w-prose w-full mx-auto sm:w-96">
			<h1 className="font-semibold text-4xl sm:text-5xl md:text-6xl whitespace-nowrap">Your Transcription</h1>
			<div className="grid grid-cols-2 items-center mx-auto bg-white  shadow rounded-full overflow-hidden">
				<button
					className={
						"px-4 duration-200 py-1 font-medium " +
						(tab === "transcription" ? "bg-blue-400 text-white" : "text-blue-400 hover:text-blue-600")
					}
					onClick={() => setTab("transcription")}
				>
					Transcription
				</button>
				<button
					className={
						"px-4  duration-200 py-1 font-medium " +
						(tab === "translation" ? "bg-blue-400 text-white" : "text-blue-400 hover:text-blue-600")
					}
					onClick={() => setTab("translation")}
				>
					Translation
				</button>
			</div>
			{tab === "transcription" ? <Transcription /> : <Translation />}
		</main>
	);
};

export default Information;
