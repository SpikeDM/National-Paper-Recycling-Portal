import { faEye } from "@fortawesome/pro-regular-svg-icons";
import DropdownBox from "../DropdownBox";
import FormElement from "../FormElement";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";

const PageView = ({ preferences, setPreferences, type, columns, views }) => {
	const defaults = { ...preferences };

	if (!defaults?.view) {
		defaults.view = "table";
	}

	if (!defaults?.columns) {
		defaults.columns = columns.map((item) => {
			return item.value;
		});
	} else {
		defaults.columns = defaults.columns.map((item) => {
			if (item?.value) {
				return item.value;
			} else {
				return item;
			}
		});
	}

	const {
		register,
		handleSubmit,
		formState: { isSubmitting },
		control,
		reset,
	} = useForm({
		defaultValues: defaults,
	});

	useEffect(() => {
		reset({ ...defaults, ...preferences });
	}, [preferences]);

	const submit = (data) => {
		if (data.columns) {
			data.columns = columns
				.map((item) => {
					return data.columns.includes(item.value) ? item : null;
				})
				.filter((n) => n);
		} else {
			data.columns = columns;
		}
		setPreferences(data);
		localStorage.setItem(`user${type}Preferences`, JSON.stringify(data));
	};

	return (
		<DropdownBox {...{ title: "View", icon: faEye }}>
			<form onSubmit={handleSubmit(submit)} noValidate>
				<div className="dropdown-section">
					<strong>Layout</strong>
					<FormElement id="view">
						<Controller
							control={control}
							name="view"
							render={({ field }) =>
								views.map((option, index) => (
									<label key={index} className="radio-item">
										<strong>{option.label}</strong>
										<input type="radio" {...field} value={option.value} checked={field.value === option.value} id={`view-${option.value}`} />
									</label>
								))
							}
						/>
					</FormElement>
				</div>
				<div className="dropdown-section">
					<strong>Columns</strong>
					<FormElement id="columns">
						<Controller
							control={control}
							name="columns"
							render={({ field: { onChange, ...props } }) =>
								columns.map((option, index) => {
									return (
										<label key={index} className="checkbox-item">
											<strong>{option.label}</strong>
											<input type="checkbox" {...props} value={option.value} {...register(`columns.${index}`)} />
										</label>
									);
								})
							}
						/>
					</FormElement>
				</div>
				<button type="submit" className="button primary" disabled={isSubmitting} aria-label="search">
					Save {isSubmitting && <FontAwesomeIcon icon="fa-solid fa-spinner-third" spin />}
				</button>
			</form>
		</DropdownBox>
	);
};

export default PageView;
