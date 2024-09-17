import React, { ChangeEvent, useCallback } from "react";
import { LANGUAGES } from "@/utils/presets";
import Loader from "../Loader/Loader";

interface props {
	textElement: string;
	toLanguage: string;
	translating: boolean;
	setToLanguage: (value: string) => void;
	generateTranslation: () => void;
}

export default function Translation({ textElement, toLanguage, translating, setToLanguage, generateTranslation }: props) {
	const handleLanguageChange = useCallback(
		(e: ChangeEvent<HTMLSelectElement>) => {
			setToLanguage(e.target.value);
		},
		[setToLanguage],
	);

	return (
		<>
			{textElement && !translating && <p>{textElement}</p>}

			{translating && <Loader />}
			{!translating && (
				<div className="flex flex-col gap-1 mb-4">
					<p className="text-xs sm:text-sm font-medium text-slate-500 mr-auto">To language</p>
					<div className="flex items-stretch gap-2 sm:gap-4">
						<select
							value={toLanguage}
							className="flex-1 outline-none w-full focus:outline-none bg-white duration-200 p-2  rounded"
							onChange={handleLanguageChange}
						>
							<option value="Select language">Select language</option>
							{Object.entries(LANGUAGES).map(([key, value]) => {
								return (
									<option key={key} value={value}>
										{key}
									</option>
								);
							})}
						</select>
						<button
							onClick={generateTranslation}
							className="specialBtn px-3 py-2 rounded-lg text-blue-400 hover:text-blue-600 duration-200"
						>
							Translate
						</button>
					</div>
				</div>
			)}
		</>
	);
}
