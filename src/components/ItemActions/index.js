import { useAuth } from "../../AuthContext";
import { useToast } from "../../ToastsContext";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

const ItemActions = ({ functions, item, settings, setSettings, items, type, buttons }) => {
	const { authToken } = useAuth();
	const { addToast, clearToasts } = useToast();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { deleteItem, editItem, printItem, exportItem } = functions;

	const deleteMutation = useMutation({
		mutationFn: () => deleteItem({ items: [item.id], authToken, filters: settings.filters, type: `${type}s` }),
		onSuccess: async () => {
			let newSettings = { ...settings.filters };

			// the current page no longer exists, so go back a page.
			if (items.length === 1 && newSettings.page !== 1) {
				newSettings = { ...settings.filters, ...{ page: newSettings.page - 1 } };
			}

			// Update the cache for whichever page we're going to
			await queryClient.invalidateQueries({ queryKey: [`${type}s`, { ...settings, filters: newSettings }], refetchType: "active" });

			// invalidate the current page query.
			await queryClient.invalidateQueries({ queryKey: [`${type}s`, settings], refetchType: "active" });

			setSettings({ ...settings, filters: newSettings });
		},
		onError: (error) => {
			addToast({ title: error?.code ?? `Unable to delete the ${type}`, message: error.message, type: "error" });
		},
	});

	const exportMutation = useMutation({
		mutationFn: () => exportItem({ items: [item.id], authToken, type: `${type}s`, filters: settings?.filters }),
		onSuccess: (data) => {
			window.open(data.file, "_blank");
		},
		onError: (error) => {
			addToast({ title: `Unable to export ${type}`, message: error.message, type: "error" });
		},
	});

	const printMutation = useMutation({
		mutationFn: () => printItem({ items: [item.id], authToken, type: `${type}s`, filters: settings?.filters }),
		onSuccess: (data) => {
			if (data.file) {
				window.open(data.file, "_blank");
			}
		},
		onError: (error) => {
			addToast({ title: `Unable to print ${type}`, message: error.message, type: "error" });
		},
	});

	return (
		<>
			{editItem && (
				<button
					onClick={() => {
						editItem(item.id);
					}}
					type="button"
				>
					View/Edit
				</button>
			)}
			{buttons?.showView && (
				<button
					onClick={() => {
						const url = type === "user" ? "records" : "customers";
						const id = type === "user" ? item.id : item.customer_id;
						navigate(`/${url}/${id}`);
					}}
				>
					View {type === "user" ? "Records" : "Customer"}
				</button>
			)}
			{exportItem && (
				<button
					type="button"
					className={buttons?.export?.class}
					disabled={exportMutation.isPending}
					onClick={async () => {
						clearToasts();
						try {
							await exportMutation.mutateAsync();
						} catch (e) {}
					}}
				>
					{buttons?.export?.label() ?? "Export"}
					{exportMutation.isPending && <FontAwesomeIcon icon={"fa-spinner-third fa-solid"} spin />}
				</button>
			)}
			{printItem && (
				<button
					type="button"
					className={buttons?.print?.class}
					disabled={printMutation.isPending}
					onClick={async () => {
						clearToasts();
						try {
							await printMutation.mutateAsync();
						} catch (e) {}
					}}
				>
					{buttons?.print?.label() ?? "Print"}
					{printMutation.isPending && <FontAwesomeIcon icon={"fa-spinner-third fa-solid"} spin />}
				</button>
			)}
			{deleteItem && (
				<button
					type="button"
					disabled={deleteMutation.isPending}
					onClick={async () => {
						clearToasts();
						try {
							await deleteMutation.mutateAsync();
						} catch (e) {}
					}}
					className={buttons?.delete?.class}
				>
					{buttons?.delete?.label() ?? `Delete`}
					{deleteMutation.isPending && <FontAwesomeIcon icon={"fa-spinner-third fa-solid"} spin />}
				</button>
			)}
		</>
	);
};

export default ItemActions;
