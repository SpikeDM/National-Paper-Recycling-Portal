import { useForm, Controller } from "react-hook-form";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import { useAuth } from "../../AuthContext";
import FormElement from "../FormElement";
import ItemActions from "../ItemActions";
import Preloader from "../Preloader";
import CustomerField from "../CustomerField";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useToast } from "../../ToastsContext";
import { fetchRecord, updateRecord, createRecord, maybeFormatDate } from "../../helpers";
import "./style.css";
import { useContext, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { SettingsContext } from "../../SettingsContext";

const Form = ({ record, settings, showFormModal, functions, setSettings, items }) => {
	const { authToken } = useAuth();
	const queryClient = useQueryClient();
	const { addToast, clearToasts } = useToast();
	const [addAnother, setAddAnother] = useState();
	const [isUpdate, setIsUpdate] = useState(!!record?.id);

	const {
		register,
		handleSubmit,
		formState: { isSubmitting, errors },
		control,
		setError,
		reset,
	} = useForm({ defaultValues: record });

	const maybeUpdateRecord = async (data) => {
		if (isUpdate) {
			return await updateRecord({ recordId: record.id, data, authToken });
		} else {
			return await createRecord({ data, authToken });
		}
	};

	const mutation = useMutation({
		mutationFn: maybeUpdateRecord,
		onSuccess: (data) => {
			// Update the cache with the new user data
			queryClient.setQueryData(["record", data.id, authToken], data);
		},
	});

	const { settings: globalSettings } = useContext(SettingsContext);

	const submit = async (data) => {
		clearToasts();
		data = Object.fromEntries(Object.entries(data).filter(([key, value]) => value !== "" && value !== null && value !== undefined));

		try {
			await mutation.mutateAsync(data);

			await queryClient.refetchQueries({ queryKey: ["records", settings], type: "active" });
			if (record?.id) {
				addToast({ title: `Record Updated`, message: "The record has been updated", type: "success" });
			} else {
				addToast({ title: `Record Created`, message: "The record has been created", type: "success" });
			}
			// invalidate the current page query.
			await queryClient.invalidateQueries({ queryKey: [`records`, settings], refetchType: "active" });

			if (!addAnother) {
				showFormModal(false);
			} else {
				const clearedData = Object.keys(data).reduce((acc, key) => {
					if (key !== "customer_id") {
						acc[key] = ""; // or set to default values if needed
					}
					return acc;
				}, {});

				delete clearedData?.id;
				clearedData.customer_id = data.customer_id;

				reset(clearedData);
				showFormModal("create");
				setIsUpdate(false);
			}
		} catch (error) {
			if (record?.id) {
				addToast({ title: error?.code ?? "Unable to update the record", message: error.message, type: "error" });
			} else {
				addToast({ title: error?.code ?? "Unable to create the record", message: error.message, type: "error" });
			}
			if (error?.cause?.data?.details) {
				const errs = error.cause.data.details;
				Object.keys(errs).forEach((err) => {
					let field = err;
					setError(field, { type: "custom", message: errs[err].message });
				});
			} else if (error?.cause?.data?.params) {
				error?.cause?.data?.params.forEach((i) => {
					setError(i, { type: "custom", message: error.message });
				});
			}
		}

		setAddAnother(false);
	};

	return (
		<form onSubmit={handleSubmit(submit)} noValidate>
			<div className="form-row">
				<FormElement id="customer_id" label="Customer" errors={errors}>
					<Controller
						name="customer_id"
						control={control}
						render={({ field }) => {
							return <CustomerField {...{ field, showNotes: true }} initialValue={record?.id && { value: parseInt(record.customer_id), label: `${record.company_name}` }} />;
						}}
					/>
				</FormElement>
			</div>

			<div className="form-row">
				<FormElement id="location" label="Location" errors={errors}>
					<input type="text" id="location" {...register("location")} />
				</FormElement>
				<FormElement id="date" label="Date" errors={errors}>
					<Controller
						name="date"
						control={control}
						render={({ field }) => (
							<DatePicker
								popperProps={{
									strategy: "fixed",
								}}
								dateFormat="dd/MM/yyyy"
								placeholderText="Select date"
								onChange={(date) => field.onChange(date)}
								selected={field.value}
							/>
						)}
					/>
				</FormElement>
				<FormElement id="invoice_number" label="Invoice Number" errors={errors}>
					<input type="text" id="invoice_number" {...register("invoice_number")} />
				</FormElement>
			</div>
			<hr />
			<div className="form-row">
				<FormElement id="type" label="Type" errors={errors}>
					{globalSettings.type_options.length > 0 && (
						<select id="type" {...register("type")}>
							<option value="">Select One</option>
							{globalSettings.type_options.map((option, key) => {
								return (
									<option key={key} value={option}>
										{option}
									</option>
								);
							})}
						</select>
					)}
				</FormElement>
			</div>
			<div className="form-row">
				<FormElement id="weight" label="Weight" errors={errors}>
					<input type="number" id="weight" {...register("weight")} />
				</FormElement>
				<FormElement id="price" label="Price" errors={errors}>
					<div className="form-prefixed">
						<span>£</span>
						<input type="number" id="price" {...register("price")} />
					</div>
				</FormElement>
				<FormElement id="ticket_number" label="Ticket #" errors={errors}>
					<input type="number" id="ticket_number" {...register("ticket_number")} />
				</FormElement>
			</div>
			<hr />
			<div className="form-row">
				<FormElement id="transport" label="Transport" errors={errors}>
					<input type="text" id="transport" {...register("transport")} />
				</FormElement>
				<FormElement id="transport_price" label="Transport Price" errors={errors}>
					<div className="form-prefixed">
						<span>£</span>
						<input type="number" id="transport_price" {...register("transport_price")} />
					</div>
				</FormElement>
				<FormElement id="transport_invoice_number" label="Transport Invoice #" errors={errors}>
					<input type="text" id="transport_invoice_number" {...register("transport_invoice_number")} />
				</FormElement>
			</div>
			<div className="modal-footer user-footer">
				<div className="modal-footer-save-actions">
					<button type="submit" className="button primary" disabled={isSubmitting}>
						{isSubmitting ? <FontAwesomeIcon icon="fa-solid fa-spinner-third" spin /> : <FontAwesomeIcon icon={"fa-save"} />} Save
					</button>
					<button type="submit" className="button secondary" disabled={isSubmitting} onClick={() => setAddAnother(true)}>
						{isSubmitting ? <FontAwesomeIcon icon="fa-solid fa-spinner-third" spin /> : <FontAwesomeIcon icon={"fa-save"} />}Save & Add Another
					</button>
				</div>
				{record?.id && (
					<div className="modal-footer-actions">
						<ItemActions
							{...{
								item: record,
								settings,
								setSettings,
								type: "record",
								functions,
								items,
								buttons: {
									showView: false,
									delete: {
										class: "button text",
										label: () => {
											return (
												<>
													<FontAwesomeIcon icon="fa-solid fa-trash" /> Delete
												</>
											);
										},
									},
									print: {
										class: "button secondary",
										label: () => {
											return (
												<>
													<FontAwesomeIcon icon="fa-solid fa-print" /> Print
												</>
											);
										},
									},
									export: {
										class: "button primary",
										label: () => {
											return (
												<>
													<FontAwesomeIcon icon="fa-solid fa-download" /> Export
												</>
											);
										},
									},
								},
							}}
						/>
					</div>
				)}
			</div>
		</form>
	);
};

const RecordsForm = ({ record_id = "create", showFormModal, settings, functions, setSettings, items, role }) => {
	const { authToken } = useAuth();
	const queryKey = [`record`, record_id, authToken];

	const {
		data: record,
		isLoading,
		error,
	} = useQuery({
		queryKey: queryKey,
		queryFn: fetchRecord,
		enabled: record_id !== "create",
	});

	let title = "Create Record";

	if (record?.id) {
		title = `${record?.company_name?.length ? record.company_name : record?.name} - ${maybeFormatDate(record.date, "date", record)}`;
	}

	return (
		<div className="record-form">
			{isLoading && <Preloader type="inline" />}
			{!isLoading && error && (
				<div className="global-error">
					<div>
						<h2>{error.cause.code}</h2>
						<div dangerouslySetInnerHTML={{ __html: error.message }}></div>
					</div>
				</div>
			)}
			{!isLoading && !error && (
				<>
					<header>
						<h2>{title}</h2>
						<button
							onClick={() => {
								showFormModal(false);
							}}
						>
							<FontAwesomeIcon icon="fa-solid fa-xmark" /> Close
						</button>
					</header>
					<Form {...{ record, settings, showFormModal, functions, setSettings, items, role }} />
				</>
			)}
		</div>
	);
};

export default RecordsForm;
