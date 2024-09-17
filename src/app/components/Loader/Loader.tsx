import React from "react";

const Loader = () => {
	return (
		<div className="flex flex-col gap-2 sm:gap-4 max-w-[400px] mx-auto w-full">
			{[0, 1, 2].map((val) => {
				return <div key={val} className={"rounded-full h-2 sm:h-3 bg-slate-400 loading " + `loading${val}`}></div>;
			})}
		</div>
	);
};

export default Loader;
