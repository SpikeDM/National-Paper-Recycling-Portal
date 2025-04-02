import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { maybeFormatData, maybeFormatDate } from "../../helpers";
import { faEllipsisVertical } from "@fortawesome/pro-solid-svg-icons";
import DropdownBox from "../DropdownBox";
import ItemActions from "../ItemActions";
import "./style.css";

const DataListItem = ({ item, selectedItems, settings, setSettings, setSelectedItems, data: items, columns, type, functions = {}, role }) => {
	const getTitle = () => {
		if ("user" === type) {
			return item?.company_name?.length ? item.company_name : item?.name;
		} else {
			return `${item?.company_name?.length ? item.company_name : item?.name} - ${maybeFormatDate(item.date, "date", item)}`;
		}
	};

	return (
		<div className="data-list-item">
			<header>
				<div className={"list-item-actions"}>
					<DropdownBox forward icon={faEllipsisVertical} options={{ align: "start", side: "right", triggerClassName: "list-single-actions-trigger", contentClassName: "table-single-actions" }}>
						<ItemActions {...{ item, settings, setSettings, type, functions, items, role, buttons: { showView: true } }} />
					</DropdownBox>

					<input
						type="checkbox"
						value={item.id}
						checked={selectedItems.includes(item.id)}
						onChange={() => {
							if (selectedItems.includes(item.id)) {
								setSelectedItems(selectedItems.filter((id) => id !== item.id));
							} else {
								setSelectedItems([...selectedItems, item.id]);
							}
						}}
					/>
				</div>
				<h2>{getTitle()}</h2>
			</header>
			{columns.map((column, i) => {
				const formatted = maybeFormatData(item, column.value, items, type);
				return (
					<div className="list-item-data" key={i}>
						<label>{column.label}:</label>
						<div>
							{formatted && column?.icon && <FontAwesomeIcon icon={column.icon} />}
							{formatted ? formatted : <span className="no-data"></span>}
						</div>
					</div>
				);
			})}
		</div>
	);
};

const DataList = ({ data, type, preferences, selectedItems = [], settings, setSettings, setSelectedItems, functions, role, defaultColumns }) => {
	const columns = preferences?.columns?.length ? preferences.columns : defaultColumns;

	return (
		<>
			<div className="data-list">
				<div className="data-list-head">
					<label>
						<input
							type="checkbox"
							value="true"
							checked={selectedItems.length === data.length}
							onChange={() => {
								const ids = data.map((item) => item.id);
								if (selectedItems.length === data.length) {
									setSelectedItems([]);
								} else {
									setSelectedItems(ids);
								}
							}}
						/>
						Select All
					</label>
				</div>
				{data.map((item, key) => {
					return <DataListItem {...{ columns, item, settings, setSettings, functions, selectedItems, setSelectedItems, preferences, data, type, role }} key={key} />;
				})}
			</div>
		</>
	);
};

export default DataList;
