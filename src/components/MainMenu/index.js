import { useContext } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink, useLocation } from "react-router-dom";

import { faFiles, faHome, faUser, faUsers } from "@fortawesome/pro-solid-svg-icons";
import { AuthContext } from "../../AuthContext";

import "./style.css";

const MainMenu = () => {
	const { user } = useContext(AuthContext);
	const { pathname } = useLocation();

	const items = {
		sdmp_customer: [
			{
				canActivate: false,
				name: "Home",
				icon: faHome,
				path: "/",
			},
			{
				canActivate: true,
				name: "My Details",
				icon: faUser,
				path: "/",
			},
			{
				canActivate: true,

				name: "My Records",
				icon: faFiles,
				path: "/records",
			},
		],
		sdmp_admin: [
			{
				canActivate: false,
				name: "Home",
				icon: faHome,
				path: "/",
			},
			{
				canActivate: true,
				name: "Customers",
				icon: faUsers,
				path: "/customers",
			},
			{
				canActivate: true,
				name: "Records",
				icon: faFiles,
				path: "/records",
			},
		],
	};

	return (
		<nav className="main-menu">
			{items[user.user_role].map((item, key) => {
				return (
					<NavLink
						to={item.path}
						key={key}
						className={({ isActive }) => {
							if (pathname === "/" && item.path === "/customers") {
								isActive = true;
							}
							return isActive && item.canActivate ? "active main-menu-link" : "main-menu-link";
						}}
					>
						<FontAwesomeIcon icon={item.icon} />
						{item.name}
					</NavLink>
				);
			})}
		</nav>
	);
};

export default MainMenu;
