import { faFilter } from "@fortawesome/pro-regular-svg-icons";
import DropdownBox from "../DropdownBox";
import FormElement from "../FormElement";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const RecordsSearchFilters = ({ setSettings, settings }) => {
	const filters = settings?.filters ?? {};
	const trackedFilters = ["date_from", "date_to"];

	const filterCount = Object.keys(filters)
		.map((i) => {
			return trackedFilters.includes(i) && filters[i];
		})
		.filter((n) => n);

	const {
		handleSubmit,
		formState: { isSubmitting },
		control,
	} = useForm();

	const submit = (data) => {
		setSettings((prevSettings) => ({
			...prevSettings,
			filters: {
				...prevSettings.filters,
				...data,
			},
		}));
	};

	return (
		<DropdownBox {...{ title: "Filters", icon: faFilter, titleExtra: filterCount.length }}>
			<form onSubmit={handleSubmit(submit)} noValidate>
				<div className="dropdown-section">
					<strong>Dates</strong>
					<FormElement label="Date From" id="date_from">
						<Controller
							name="date_from"
							control={control}
							render={({ field }) => (
								<DatePicker
									popperProps={{
										strategy: "fixed",
									}}
									dateFormat="dd/MM/yyyy"
									placeholderText="Select date"
									onChange={(date) => {
										const formatted = format(new Date(date), "yyyy-MM-dd");
										field.onChange(formatted);
									}}
									selected={field.value}
								/>
							)}
						/>
					</FormElement>
					<FormElement label="Date To" id="date_to">
						<Controller
							name="date_to"
							control={control}
							render={({ field }) => (
								<DatePicker
									popperProps={{
										strategy: "fixed",
									}}
									dateFormat="dd/MM/yyyy"
									placeholderText="Select date"
									onChange={(date) => {
										const formatted = format(new Date(date), "yyyy-MM-dd");
										field.onChange(formatted);
									}}
									selected={field.value}
								/>
							)}
						/>
					</FormElement>
				</div>
				<button type="submit" className="button primary" disabled={isSubmitting} aria-label="search">
					Filter {isSubmitting && <FontAwesomeIcon icon="fa-solid fa-spinner-third" spin />}
				</button>
			</form>
		</DropdownBox>
	);
};

export default RecordsSearchFilters;
