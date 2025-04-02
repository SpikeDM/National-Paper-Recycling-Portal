// src/components/Toasts.js
import React from "react";
import { useToast } from "../../ToastsContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import classNames from "classnames";

import "./style.css";
const Toasts = () => {
	const { toasts, removeToast } = useToast();

	return (
		<div className="toasts-container">
			{toasts.map((toast, key) => {
				return (
					<div key={key} className={classNames("toast", `toast-${toast.type ?? "info"}`)}>
						<header>
							{toast.title ? <strong>{toast.title}</strong> : <span></span>}
							<button
								type="button"
								onClick={() => {
									removeToast(toast.id);
								}}
								aria-label={"Close message"}
							>
								<FontAwesomeIcon icon="fa-xmark fa-solid" />
							</button>
						</header>
						<div dangerouslySetInnerHTML={{ __html: toast.message }}></div>
					</div>
				);
			})}
		</div>
	);
};

export default Toasts;
