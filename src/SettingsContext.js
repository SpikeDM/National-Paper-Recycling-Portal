// src/SettingsContext.js
import { createContext, useState, useEffect } from "react";
import config from "./config";

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
	const [settings, setSettings] = useState(null);
	const [loading, setLoading] = useState(true);
	const [globalError, setGlobalError] = useState(null);

	useEffect(() => {
		const fetchSettings = async () => {
			try {
				const response = await fetch(`${config.apiBaseUrl}/sdmp/settings`);
				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message);
				} else {
					setSettings(data);
				}
			} catch (error) {
				setGlobalError({ message: error.message, title: "Unable to fetch settings" });
			} finally {
				setLoading(false);
			}
		};

		fetchSettings();
	}, []);

	return <SettingsContext.Provider value={{ settings, loading, globalError }}>{children}</SettingsContext.Provider>;
};
