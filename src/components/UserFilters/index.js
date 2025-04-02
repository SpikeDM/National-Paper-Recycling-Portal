// Yes, this is a little pointless, but if I need to add extra dropdowns e.g. filters later, then it'll make sense.

import PageView from "../PageView";
import { userColumns as originalColumns, userViews } from "../../helpers";

const UserFilters = ({ isUsers, ...props }) => {
	let userColumns = originalColumns;
	if (isUsers) {
		userColumns = originalColumns.filter((column) => column.value !== "records");
	}

	return (
		<div>
			<PageView {...{ ...props, type: isUsers ? "Accounts" : "Customer", columns: userColumns, views: userViews }} />
		</div>
	);
};

export default UserFilters;
