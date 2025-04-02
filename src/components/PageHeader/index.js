import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./style.css";

const PageHeader = ({ title, icon, children, appendTitle = false, data }) => {
	if (appendTitle && data?.data?.[0]?.company_name) {
		title = `${title}: <strong>${data?.data?.[0]?.company_name}</strong>`;
	}

	return (
		<header className="page-header">
			<div className="page-title">
				<FontAwesomeIcon icon={icon} />
				<h1 dangerouslySetInnerHTML={{ __html: title }}></h1>
			</div>
			{children && <div>{children}</div>}
		</header>
	);
};

export default PageHeader;
