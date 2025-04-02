import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	const { validateToken } = context;

	// Call validateToken whenever useAuth is called
	useEffect(() => {
		validateToken();
	}, [validateToken]);

	return context;
};

const AuthProvider = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("authToken"));
	const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
	const [authToken, setAuthToken] = useState(localStorage.getItem("authToken") || null);
	const [tokenExpiry, setTokenExpiry] = useState(localStorage.getItem("tokenExpiry"));

	const navigate = useNavigate();

	const setAuthData = ({ token, expire, ...user }) => {
		localStorage.setItem("authToken", token);
		localStorage.setItem("user", JSON.stringify(user));
		localStorage.setItem("tokenExpiry", expire);

		setIsAuthenticated(!!token);
		setUser(user);
		setAuthToken(token);
		setTokenExpiry(expire);
	};

	const validateToken = () => {
		if (tokenExpiry && tokenExpiry <= Date.now() / 1000) {
			logout();
		}
	};

	const logout = () => {
		localStorage.removeItem("authToken");
		localStorage.removeItem("user");
		localStorage.removeItem("tokenExpiry");

		setIsAuthenticated(false);
		setUser(null);
		setAuthToken(null);
		setTokenExpiry(null);
		navigate("/");
	};

	useEffect(() => {
		if (tokenExpiry && tokenExpiry <= Date.now() / 1000) {
			logout();
		}
	}, [tokenExpiry]);

	useEffect(() => {
		const handleStorageChange = () => {
			setIsAuthenticated(!!localStorage.getItem("authToken"));
			setUser(JSON.parse(localStorage.getItem("user")) || null);
			setAuthToken(localStorage.getItem("authToken"));
			setTokenExpiry(localStorage.getItem("tokenExpiry"));
		};

		window.addEventListener("storage", handleStorageChange);

		return () => {
			window.removeEventListener("storage", handleStorageChange);
		};
	}, []);

	return <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setAuthData, logout, authToken, validateToken }}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
