import React from "react";
import Loader from "../Loader/Loader";

interface props {
	downloading?: boolean;
}
const Transcribing = ({ downloading }: props) => {
	return (
		<div className="flex items-center flex-col flex-1 justify-center gap-10 md:gap-14 pb-24 p-4 text-center">
			<div className="flex flex-col gap-2 sm:gap-4"></div>
			<h1 className="font-semibold text-4xl sm:text-5xxl md:text-6xl">Transcribing</h1>
			<p>{!downloading ? "warming up cylinders" : "core cylinders engaged"}</p>
			<Loader />
		</div>
	);
};

export default Transcribing;
