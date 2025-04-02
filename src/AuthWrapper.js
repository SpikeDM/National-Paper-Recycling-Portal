import React, { useContext } from "react";

import { AuthContext } from "./AuthContext";
import LoginForm from "./components/LoginForm";

const AuthWrapper = ({ children, settings }) => {
	const { isAuthenticated } = useContext(AuthContext);
	return isAuthenticated ? children : <LoginForm {...{ settings }} />;
};

export default AuthWrapper;
