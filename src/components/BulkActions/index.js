import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareCheck } from "@fortawesome/pro-solid-svg-icons";
import Modal from "react-modal";
import { useAuth } from "../../AuthContext";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { _n } from "@wordpress/i18n";
import { useToast } from "../../ToastsContext";

import "./style.css";

const BulkActions = ({ totals, selectedItems, data: users, perPage, currentPage, settings, setSettings, functions, type }) => {
	const [action, setAction] = useState(false);
	const [allSelected, setAllSelected] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const { authToken } = useAuth();
	const queryClient = useQueryClient();
	const { addToast, clearToasts } = useToast();

	const { deleteItems, printItems, exportItems } = functions;

	useEffect(() => {
		setAllSelected(false);
	}, [selectedItems]);

	const actionSelectedItems = !allSelected ? selectedItems : "all";

	const totalCount = allSelected ? totals.total : selectedItems.length;

	const deleteMutation = useMutation({
		mutationFn: () => deleteItems({ items: actionSelectedItems, authToken, filters: settings.filters, type: `${type}s` }),
		onSuccess: async (data) => {
			let newSettings = { ...settings.filters };

			if (actionSelectedItems === "all") {
				// everythings delete force first page.
				newSettings = { ...settings.filters, ...{ page: 1 } };
			} else if (selectedItems.length === users.length) {
				// the page is gone, and we're greater than one, so go back a page.
				if (currentPage > 1) {
					newSettings = { ...settings.filters, ...{ page: currentPage - 1 } };
				}
			}

			// Update the cache for whichever page we're going to
			await queryClient.invalidateQueries({ queryKey: [`${type}s`, { ...settings, filters: newSettings }], refetchType: "active" });

			// invalidate the current page query.
			await queryClient.invalidateQueries({ queryKey: [`${type}s`, settings], refetchType: "active" });
			setAction(false);

			setSettings({ ...settings, filters: newSettings });
		},
		onError: (error) => {
			addToast({ title: error?.code ?? `Unable to delete the ${type}s`, message: error.message, type: "error" });
		},
	});

	const exportMutation = useMutation({
		mutationFn: () => exportItems({ items: actionSelectedItems, authToken, type: `${type}s`, filters: settings?.filters }),
		onSuccess: (data) => {
			window.open(data.file, "_blank");
		},
		onError: (error) => {
			setIsLoading(false);
			addToast({ title: `Unable to export ${type}`, message: error.message, type: "error" });
		},
	});

	const printMutation = useMutation({
		mutationFn: () => printItems({ items: actionSelectedItems, authToken, type: `${type}s`, filters: settings?.filters }),
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
		<div className="bulk-actions">
			{selectedItems.length === perPage && (
				<button
					type="button"
					className="button secondary"
					disabled={exportMutation.isPending || printMutation.isPending || isLoading}
					onClick={() => {
						setAllSelected(!allSelected);
					}}
				>
					<FontAwesomeIcon icon={faSquareCheck} /> {allSelected ? `Select Chosen (${selectedItems.length})` : `Select All (${totals.total})`}
				</button>
			)}
			{exportItems && (
				<button
					type="button"
					className="button primary"
					disabled={exportMutation.isPending || printMutation.isPending || isLoading}
					onClick={async () => {
						clearToasts();
						try {
							await exportMutation.mutateAsync();
						} catch (e) {}
					}}
				>
					<FontAwesomeIcon icon={exportMutation.isPending ? "fa-spinner-third" : "fa-download"} spin={exportMutation.isPending} /> Export
				</button>
			)}

			{printItems && (
				<button
					type="button"
					className="button secondary"
					disabled={exportMutation.isPending || printMutation.isPending || isLoading}
					onClick={async () => {
						clearToasts();
						try {
							await printMutation.mutateAsync();
						} catch (e) {}
					}}
				>
					<FontAwesomeIcon icon={printMutation.isPending ? "fa-spinner-third" : "fa-print"} spin={printMutation.isPending} /> Print
				</button>
			)}
			{deleteItems && (
				<button
					type="button"
					className="button text"
					disabled={exportMutation.isPending || printMutation.isPending || isLoading}
					onClick={() => {
						setAction({
							function: async () => {
								clearToasts();
								setIsLoading(true);
								try {
									await deleteMutation.mutateAsync();
								} catch (e) {}
								setIsLoading(false);
							},
							title: _n(`Are you sure you want to delete ${totalCount} item?`, `Are you sure you want to delete ${totalCount} items?`, totalCount),
							description: _n(`This will delete ${totalCount} item, and their related content.`, `This will delete ${totalCount} items, and their related content.`, totalCount),
							items: selectedItems,
						});
					}}
				>
					<FontAwesomeIcon icon={isLoading ? "fa-spinner-third" : "fa-trash"} spin={isLoading} /> Delete
				</button>
			)}

			<Modal
				isOpen={action}
				style={{
					overlay: {
						zIndex: 999,
						backgroundColor: "rgba(245, 247, 242, 0.7)",
					},
					content: {
						maxWidth: "550px",
					},
				}}
				preventScroll={true}
				onRequestClose={() => {
					setAction(false);
				}}
			>
				<h2>{action.title}</h2>
				{action.description && <p>{action.description}</p>}
				<div className="modal-footer">
					<div className="modal-footer-actions">
						<button
							className="button primary"
							disabled={isLoading}
							onClick={() => {
								action.function();
							}}
						>
							Continue {isLoading && <FontAwesomeIcon icon="fa-solid fa-spinner-third" spin />}
						</button>
						<button
							className="button secondary"
							onClick={() => {
								setAction(false);
							}}
						>
							Cancel
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default BulkActions;
