// src/App.js
import "./App.css";
import { useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthWrapper from "./AuthWrapper";
import AuthProvider from "./AuthContext";
import { ToastProvider } from "./ToastsContext";
import { SettingsProvider, SettingsContext } from "./SettingsContext";

import Preloader from "./components/Preloader";
import Toasts from "./components/Toasts";
import MainSidebar from "./components/MainSidebar";

import UsersPage from "./pages/UsersPage";
import Logout from "./pages/Logout";
import NotFoundPage from "./pages/NotFoundPage";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faPlusCircle, faMobileScreen, faPlus, faMinus, faSpinnerThird, faUsers, faUserTie, faXmark, faLocationDot, faPhone, faFax, faEnvelope, faDownload, faSave, faTrash, faPrint, faFiles } from "@fortawesome/pro-solid-svg-icons";

import RecordsPage from "./pages/RecordsPage";

const queryClient = new QueryClient();

library.add(faPlusCircle, faMobileScreen, faPlus, faMinus, faXmark, faSpinnerThird, faUsers, faUserTie, faLocationDot, faPhone, faFax, faEnvelope, faSave, faDownload, faTrash, faPrint);

function App() {
	const { loading, globalError, settings } = useContext(SettingsContext);

	if (loading) {
		return <Preloader />;
	}

	if (globalError) {
		return (
			<div className="global-error">
				<div>
					<h2>{globalError.title}</h2>
					<div dangerouslySetInnerHTML={{ __html: globalError.message }}></div>
				</div>
			</div>
		);
	}

	return (
		<Router>
			<AuthProvider>
				<QueryClientProvider client={queryClient}>
					<ToastProvider>
						<div className="app-wrapper">
							<AuthWrapper {...{ settings }}>
								<MainSidebar {...{ settings }} />
								<main className="main-content">
									<Routes>
										<Route path="/" exact element={<UsersPage icon={faUsers} type="Customer" placeholder="Search for customers by name, email address, id or postcode" filters={{ roles: "sdmp_customer" }} role={"sdmp_customer"} />} />
										<Route path="/customers" element={<UsersPage title="Customers" type="Customer" icon={faUsers} placeholder="Search for customers by name, email address, id or postcode" filters={{ roles: "sdmp_customer" }} role={"sdmp_customer"} />}>
											<Route path=":id" element={<UsersPage type="Customer" placeholder="Search for customers by name, email address, id or postcode" icon={faUsers} filters={{ roles: "sdmp_customer" }} role={"sdmp_customer"} />} />
										</Route>
										<Route path="/records" element={<RecordsPage title="Records" icon={faFiles} />}>
											<Route path=":id" element={<RecordsPage icon={faFiles} />} />
										</Route>
										<Route path="/accounts" element={<UsersPage title="Admin Accounts" type="Account" icon={faUserTie} placeholder="Search for users by name, email address or id" filters={{ roles: "sdmp_admin" }} role={"sdmp_admin"} />}>
											<Route path=":id" element={<UsersPage icon={faUserTie} type="Account" placeholder="Search for users by name, email address or id" filters={{ roles: "sdmp_admin" }} role={"sdmp_admin"} />} />
										</Route>
										<Route path="/logout" element={<Logout />} />
										<Route path="*" element={<NotFoundPage />} />
									</Routes>
								</main>
							</AuthWrapper>
							<Toasts />
						</div>
					</ToastProvider>
				</QueryClientProvider>
			</AuthProvider>
		</Router>
	);
}

export default function RootApp() {
	return (
		<SettingsProvider>
			<App />
		</SettingsProvider>
	);
}
