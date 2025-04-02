import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SearchForm from "../components/SearchForm";
import Preloader from "../components/Preloader";
import PageHeader from "../components/PageHeader";
import UserFilters from "../components/UserFilters";
import DataTable from "../components/DataTable";
import DataFooter from "../components/DataFooter";
import UserSearch from "../components/UserSearch";

import { deleteItems, exportItems, fetchUsers, printItems, fetchUser, userColumns as originalColumns } from "../helpers";
import { useAuth } from "../AuthContext";
import UserForm from "../components/UserForm";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DataList from "../components/DataList";

const UsersPage = ({ title = "Customers", filters, placeholder, role, icon, type = "Customer" }) => {
	const { id } = useParams();
	const { user, authToken } = useAuth();

	const [settings, setSettings] = useState({ filters: {} });
	const p = localStorage.getItem(`user${type}Preferences`);

	const [preferences, setPreferences] = useState(p ? JSON.parse(p) : { view: "table" });
	const [selectedItems, setSelectedItems] = useState([]);
	const [showEditModal, setShowEditModal] = useState(false);
	Modal.setAppElement(document.getElementById("root"));

	const canEdit = user.user_role === "sdmp_admin";

	const isUsers = type !== "Customer";

	// on load force the settings if a customer.
	useEffect(() => {
		const newFilters = { ...filters };
		newFilters.per_page = 100;
		if (!canEdit) {
			setPreferences({ view: "list" });
		} else if (id) {
			newFilters.include = [id];
			if (id === parseInt(user.user_id)) {
				delete newFilters.roles;
			}
			setPreferences({ view: "list" });
		}
		setSettings((prevSettings) => ({ ...prevSettings, filters: newFilters }));
	}, [filters, id, user, canEdit]);

	useEffect(() => {
		if (canEdit && !id) {
			const p = localStorage.getItem(`user${type}Preferences`);
			setPreferences(p ? JSON.parse(p) : { view: "table" });
		}
	}, [type]);

	useEffect(() => {
		setSelectedItems([]);
	}, [settings]);

	const queryKey = canEdit ? ["users", settings] : [`user`, user.user_id, authToken];
	const func = canEdit ? () => fetchUsers(settings, authToken) : fetchUser;

	const { data, isLoading, error } = useQuery({
		queryKey: queryKey,
		queryFn: func,
		enabled: !!settings,
		select: (final) => {
			if (canEdit) {
				return final;
			} else {
				return {
					data: [final],
					totals: {
						total: 1,
						totalPages: 1,
					},
				};
			}
		},
	});
	let userColumns = originalColumns;
	if (isUsers) {
		userColumns = originalColumns.filter((column) => column.value !== "records");
	}

	return (
		<div className="usersPage">
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
					<UserForm
						{...{
							showFormModal: setShowEditModal,
							user_id: showEditModal,
							settings,
							setSettings,
							items: data?.data ?? [],
							role: role,
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
					placeholder={placeholder}
					element={UserSearch}
					{...{ settings }}
					setSettings={setSettings}
				/>
			)}
			{preferences && (
				<PageHeader {...{ title, icon }}>
					{canEdit && (
						<>
							<UserFilters {...{ preferences, settings, setPreferences, setSettings, isUsers }} />
						</>
					)}
				</PageHeader>
			)}
			{error && (
				<div className="global-error">
					<div>
						<h2>Unable to fetch items</h2>
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
							type: "user",
							defaultColumns: userColumns,
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
							defaultColumns: userColumns,
							type: "user",
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
						type: "user",
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
						<h2>No items to show</h2>
						<div> Your search didn't return any results.</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default UsersPage;
