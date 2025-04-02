import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { maybeFormatData } from "../../helpers";
import { faEllipsisVertical } from "@fortawesome/pro-solid-svg-icons";
import DropdownBox from "../DropdownBox";
import ItemActions from "../ItemActions";

import "./style.css";

const DataTableRow = ({ item, selectedItems, settings, setSettings, setSelectedItems, data: items, columns, type, functions = {} }) => {
	return (
		<tr>
			<td className={"table-row-actions"}>
				<DropdownBox forward icon={faEllipsisVertical} options={{ align: "start", side: "right", triggerClassName: "table-single-actions-trigger", contentClassName: "table-single-actions" }}>
					<ItemActions {...{ item, settings, setSettings, type, functions, items, buttons: { showView: true } }} />
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
			</td>
			{columns.map((column, i) => {
				const formatted = maybeFormatData(item, column.value, items, type);
				return (
					<td key={i}>
						{formatted && column?.icon && <FontAwesomeIcon icon={column.icon} />}
						{formatted ? formatted : <span className="no-data"></span>}
					</td>
				);
			})}
		</tr>
	);
};

const DataTable = ({ data, type, preferences, selectedItems = [], settings, setSettings, setSelectedItems, functions, defaultColumns }) => {
	const columns = preferences?.columns?.length ? preferences.columns : defaultColumns;

	return (
		<div className="data-table">
			<table>
				<thead>
					<tr>
						<th>
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
						</th>
						{columns.map((column, i) => {
							return <th key={i}>{column.label}</th>;
						})}
					</tr>
				</thead>
				<tbody>
					{data.map((item, key) => {
						return <DataTableRow {...{ columns, item, settings, setSettings, functions, selectedItems, setSelectedItems, preferences, data, type }} key={key} />;
					})}
				</tbody>
			</table>
		</div>
	);
};

export default DataTable;
