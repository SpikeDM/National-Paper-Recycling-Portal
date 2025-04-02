// Yes, this is a little pointless, but if I need to add extra dropdowns e.g. filters later, then it'll make sense.

import PageView from "../PageView";
import { recordColumns, userViews } from "../../helpers";
import RecordsSearchFilters from "../RecordsSearchFilters";

const RecordFilters = (props) => {
	return (
		<>
			<RecordsSearchFilters {...{ ...props }} />
			<PageView {...{ ...props, type: "Records", columns: recordColumns, views: userViews }} />
		</>
	);
};

export default RecordFilters;
