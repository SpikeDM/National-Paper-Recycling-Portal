// src/ToastContext.js
import React, { createContext, useState, useContext } from "react";

const ToastContext = createContext();

export const useToast = () => {
	return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
	const [toasts, setToasts] = useState([]);

	const addToast = (toast) => {
		const newToast = { ...toast, id: Date.now() };
		setToasts((prevToasts) => [...prevToasts, newToast]);
	};

	const removeToast = (id) => {
		setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
	};

	const clearToasts = () => {
		setToasts([]);
	};

	return <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>{children}</ToastContext.Provider>;
};
