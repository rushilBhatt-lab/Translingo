import React from "react";

interface props {
	textElement?: string;
}
const Transcription = ({ textElement }: props) => {
	return <div>{textElement}</div>;
};

export default Transcription;
