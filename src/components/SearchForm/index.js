import { useForm } from "react-hook-form";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/pro-solid-svg-icons";

import "./style.css";

const SearchForm = ({ placeholder, setSettings, settings, action, element }) => {
	const {
		register,
		handleSubmit,
		control,
		formState: { isSubmitting },
	} = useForm({
		defaultValues: {
			search: settings?.filters?.search ?? "",
			customer_id: settings?.filters?.customer_id ?? "",
		},
	});

	// on submit.
	const submit = async (submitData) => {
		const filters = { ...settings.filters, ...submitData };

		setSettings({ ...settings, filters: Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null)) });
	};

	const Element = element;

	return (
		<div className="search-form">
			{action?.function && (
				<button className="button primary" onClick={action.function}>
					{action?.label() ?? "Action"}
				</button>
			)}
			<form onSubmit={handleSubmit(submit)} noValidate>
				<FontAwesomeIcon icon={faSearch} />
				<Element {...{ placeholder, register, control }} />
				<button type="submit" className="button primary" disabled={isSubmitting}>
					Search {isSubmitting ? <FontAwesomeIcon icon="fa-solid fa-spinner-third" spin /> : <FontAwesomeIcon icon={faSearch} />}
				</button>
			</form>
		</div>
	);
};
export default SearchForm;
