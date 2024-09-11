import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface props {
	icon: IconDefinition;
	className: string;
}

const Icon = ({ icon, className }: props) => {
	return <FontAwesomeIcon icon={icon} className={className} />;
};

export default Icon;
