// Preloader.js
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./style.css";

const Preloader = ({ type = "cover" }) => {
	return (
		<div className={`preloader preloader-${type}`}>
			<div>
				<FontAwesomeIcon icon="fa-solid fa-spinner-third" spin={true} />
			</div>
		</div>
	);
};

export default Preloader;
