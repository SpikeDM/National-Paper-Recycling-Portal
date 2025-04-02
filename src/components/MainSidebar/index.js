import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import MainMenu from "../MainMenu";
import AccountMenu from "../AccountMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/pro-solid-svg-icons";

const MainSidebar = ({ settings }) => {
	const [menuOpen, setMenuOpen] = useState(false);

	const menuRef = useRef(null);

	const handleClickOutside = (event) => {
		if ((menuRef.current && !menuRef.current.contains(event.target)) || menuRef.current === event.target) {
			setMenuOpen(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<aside className={`main-sidebar ${menuOpen && "is-open"}`} ref={menuRef}>
			<button
				type="button"
				className="toggle"
				onClick={() => {
					setMenuOpen(!menuOpen);
				}}
			>
				<FontAwesomeIcon icon={menuOpen ? "fa-solid fa-xmark" : faBars} />
			</button>
			<div>
				{settings?.portal_logo && (
					<Link to="/">
						<img src={settings.portal_logo[0]} alt="Go home" width={settings.portal_logo[1]} height={settings.portal_logo[2]} />
					</Link>
				)}
				<MainMenu />
				<AccountMenu />
			</div>
		</aside>
	);
};

export default MainSidebar;
