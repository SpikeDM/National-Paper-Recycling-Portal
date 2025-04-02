import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink } from "react-router-dom";

import { faLock, faUser, faUserTie } from "@fortawesome/pro-solid-svg-icons";

import { useAuth } from "../../AuthContext";

import "./style.css";

const AccountMenu = () => {
	const { user } = useAuth();

	const items = {
		sdmp_customer: [
			{
				name: "Logout",
				icon: faLock,
				path: "/logout",
			},
			{
				name: user.user_display_name,
				icon: faUser,
				path: `/`,
				className: "user-menu-item",
			},
		],
		sdmp_admin: [
			{
				name: "Users",
				icon: faUserTie,
				path: "/accounts",
			},
			{
				name: "Logout",
				icon: faLock,
				path: "/logout",
				className: "",
			},
			{
				name: user.user_display_name,
				icon: faUser,
				path: `/accounts/${user.user_id}`,
				className: "user-menu-item",
			},
		],
	};

	return (
		<nav className="account-menu">
			{items[user.user_role].map((item, key) => {
				return (
					<NavLink to={item.path} key={key} className={({ isActive }) => (isActive ? ` ${item?.className} active account-menu-link` : ` ${item?.className} account-menu-link`)}>
						<span className="account-menu-icon">
							<FontAwesomeIcon icon={item.icon} />
						</span>
						{item.name}
					</NavLink>
				);
			})}
		</nav>
	);
};

export default AccountMenu;
