import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SearchForm from "../components/SearchForm";
import RecordSearch from "../components/RecordSearch";
import Preloader from "../components/Preloader";
import PageHeader from "../components/PageHeader";
import RecordFilters from "../components/RecordFilters";
import DataTable from "../components/DataTable";
import DataFooter from "../components/DataFooter";
import RecordsForm from "../components/RecordsForm";

import { deleteItems, exportItems, printItems, fetchRecords, recordColumns } from "../helpers";
import { useAuth } from "../AuthContext";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DataList from "../components/DataList";

const RecordsPage = ({ title = "Records", icon }) => {
	const { id } = useParams();
	const { user, authToken } = useAuth();
	let navigate = useNavigate();

	const [settings, setSettings] = useState({ filters: {} });
	const p = localStorage.getItem("userRecordsPreferences");
	const [preferences, setPreferences] = useState(p ? JSON.parse(p) : { view: "table" });

	const [selectedItems, setSelectedItems] = useState([]);
	const [showEditModal, setShowEditModal] = useState(false);
	Modal.setAppElement(document.getElementById("root"));

	const canEdit = user.user_role === "sdmp_admin";

	// on load force the settings if a customer.
	useEffect(() => {
		const newFilters = { per_page: 10 };

		if (!canEdit) {
			newFilters.customer_id = user.user_id;
		} else if (id) {
			newFilters.customer_id = id;
		}

		setSettings((prevSettings) => ({ ...prevSettings, filters: newFilters }));
	}, [id, user, canEdit]);

	useEffect(() => {
		setSelectedItems([]);
		// change the url if the customer has changed.
		if (settings.filters.customer_id && settings.filters.customer_id !== id) {
			navigate(`/records/${settings.filters.customer_id}`, { replace: true });
		}
	}, [settings]);

	const queryKey = canEdit ? ["records", settings] : [`records`, user.user_id, authToken];

	const { data, isLoading, error } = useQuery({
		queryKey: queryKey,
		queryFn: () => fetchRecords(settings, authToken),
		enabled: !!settings,
	});

	return (
		<div className="recordsPage">
			{isLoading && <Preloader />}

			<Modal
				isOpen={showEditModal}
				style={{
					overlay: {
						zIndex: 999,
						backgroundColor: "rgba(245, 247, 242, 0.7)",
					},
				}}
				preventScroll={true}
				onRequestClose={() => {
					setShowEditModal(false);
				}}
			>
				{
					<RecordsForm
						{...{
							showFormModal: setShowEditModal,
							record_id: showEditModal,
							settings,
							setSettings,
							items: data?.data ?? [],
							functions: {
								deleteItem: canEdit ? deleteItems : null,
								exportItem: exportItems,
								printItem: printItems,
							},
						}}
					/>
				}
			</Modal>

			{canEdit && (
				<SearchForm
					action={{
						label: () => {
							return (
								<>
									Create <FontAwesomeIcon icon="fa-solid fa-plus-circle" />
								</>
							);
						},
						function: () => {
							setShowEditModal("create");
						},
					}}
					{...{ settings, setSettings, element: RecordSearch }}
				/>
			)}

			{preferences && (
				<PageHeader {...{ title, icon, appendTitle: settings?.filters?.customer_id, data }}>
					<RecordFilters {...{ preferences, settings, setPreferences, setSettings }} />
				</PageHeader>
			)}
			{error && (
				<div className="global-error">
					<div>
						<h2>Unable to fetch records</h2>
						<div dangerouslySetInnerHTML={{ __html: error.message }}></div>
					</div>
				</div>
			)}
			{!error && !isLoading && data?.data?.length > 0 && preferences.view === "table" && (
				<>
					<DataTable
						{...{
							preferences,
							settings,
							setSettings,
							data: data.data,
							selectedItems,
							setSelectedItems,
							type: "record",
							defaultColumns: recordColumns,
							functions: {
								deleteItem: canEdit ? deleteItems : null,
								editItem: canEdit ? setShowEditModal : null,
								exportItem: exportItems,
								printItem: printItems,
							},
						}}
					/>
				</>
			)}
			{!error && !isLoading && data?.data?.length > 0 && preferences.view === "list" && (
				<>
					<DataList
						{...{
							preferences,
							settings,
							setSettings,
							data: data.data,
							selectedItems,
							setSelectedItems,
							type: "record",
							defaultColumns: recordColumns,
							functions: {
								deleteItem: canEdit ? deleteItems : null,
								editItem: canEdit ? setShowEditModal : null,
								exportItem: exportItems,
								printItem: printItems,
							},
						}}
					/>
				</>
			)}

			{!error && !isLoading && data?.data?.length > 0 && (
				<DataFooter
					{...{
						selectedItems,
						totals: data.totals,
						data: data.data,
						setSettings,
						settings,
						type: "record",
						functions: {
							deleteItems: canEdit ? deleteItems : null,
							setShowEditModal: canEdit ? setShowEditModal : null,
							exportItems,
							printItems,
						},
					}}
				/>
			)}
			{!error && !isLoading && !data?.data.length && (
				<div className="global-error">
					<div>
						<h2>No records to show</h2>
						<div> Your search didn't return any results.</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default RecordsPage;
