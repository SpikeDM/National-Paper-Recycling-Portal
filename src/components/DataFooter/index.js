import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BulkActions from "../BulkActions";
import "./style.css";
import { faArrowLeft, faArrowRight } from "@fortawesome/pro-solid-svg-icons";

const DataFooter = ({ totals, data, selectedItems, setSettings, settings, functions, type }) => {
	const currentPage = settings.filters.page ?? 1;
	const perPage = settings.filters.per_page ?? 100;

	const showingStart = perPage * (currentPage - 1) + 1;
	const showingEnd = currentPage === parseInt(totals.totalPages) ? totals.total : perPage * currentPage;

	return (
		<div className="data-footer">
			<div>
				{selectedItems.length ? (
					<>
						<BulkActions {...{ selectedItems, data, totals, setSettings, settings, perPage, currentPage, functions, type }} />
					</>
				) : (
					""
				)}
			</div>

			<div className="pagination">
				{currentPage !== 1 && (
					<button
						onClick={() => {
							const filters = { ...settings.filters, ...{ page: currentPage - 1 } };
							setSettings({ ...settings, ...{ filters } });
						}}
						className="button secondary"
					>
						<FontAwesomeIcon icon={faArrowLeft} />
					</button>
				)}
				Showing {showingStart} - {showingEnd} of {totals.total}
				{currentPage !== parseInt(totals.totalPages) && (
					<button
						onClick={() => {
							const filters = { ...settings.filters, ...{ page: currentPage + 1 } };
							setSettings({ ...settings, ...{ filters } });
						}}
						className="button secondary"
					>
						<FontAwesomeIcon icon={faArrowRight} />
					</button>
				)}
			</div>
		</div>
	);
};

export default DataFooter;
