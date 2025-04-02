import { useForm, useFieldArray } from "react-hook-form";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import { useAuth } from "../../AuthContext";
import FormElement from "../FormElement";
import ItemActions from "../ItemActions";
import Preloader from "../Preloader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useToast } from "../../ToastsContext";
import { fetchUser, updateUser, createUser } from "../../helpers";
import "./style.css";

const PhoneField = ({ control, register, errors }) => {
	const { fields, remove, insert } = useFieldArray({
		control, // control props comes from useForm (optional: if you are using FormProvider)
		name: "phone", // unique name for your Field Array
	});

	return fields.map((field, index) => {
		return (
			<div className=" form-row-repeater form-repeater-phone" key={field.id}>
				<div className="phone-field-type">
					<select {...register(`phone.${index}.number_type`)}>
						<option value="phone">Phone</option>
						<option value="mobile">Mobile</option>
						<option value="fax">Fax</option>
					</select>
					{errors["phone"]?.[index]?.["number_type"] && <p className="error">{errors["phone"]?.[index]?.["number_type"]}</p>}
				</div>
				<div className="phone-field-number">
					<input
						type="text"
						key={field.id} // important to include key with field's id
						{...register(`phone.${index}.number`)}
					/>
					{errors["phone"]?.[index]?.["number"] && <p className="error">{errors["phone"]?.[index]?.["number"].message}</p>}
				</div>
				<div className="repeater-controls">
					<button
						type="button"
						className="repeater-button"
						onClick={() => {
							insert(index, { number_type: "phone", number: "" });
						}}
					>
						<FontAwesomeIcon icon="fa-solid fa-plus" />
					</button>
					<button
						type="button"
						className="repeater-button"
						onClick={() => {
							remove(index);
						}}
					>
						<FontAwesomeIcon icon="fa-solid fa-minus" />
					</button>
				</div>
			</div>
		);
	});
};

const Form = ({ user, settings, showFormModal, functions, setSettings, items, role = "sdmp_customer" }) => {
	const { authToken } = useAuth();
	const queryClient = useQueryClient();
	const { addToast, clearToasts } = useToast();

	if (user) {
		user.contact_name = user.name;

		if (!user.phone.length) {
			user.phone = [{ number_type: "phone", number: "" }];
		}
	} else {
		user = {
			phone: [{ number_type: "phone", number: "" }],
			role,
		};
	}

	const {
		register,
		handleSubmit,
		formState: { isSubmitting, errors },
		control,
		setError,
	} = useForm({ defaultValues: user });

	const mutation = useMutation({
		mutationFn: (data) => (user?.id ? updateUser({ userId: user.id, data, authToken }) : createUser({ data, authToken })),
		onSuccess: (data) => {
			// Update the cache with the new user data
			queryClient.setQueryData(["user", user.id, authToken], data);
		},
	});

	const submit = async (data) => {
		clearToasts();

		// if the passwords not set then don't send it.
		if (!data.password) {
			delete data.password;
		}

		data.phone = data.phone.filter((i) => {
			return i.number.length;
		});

		data.email_address = data.email;

		try {
			await mutation.mutateAsync(data);
			await queryClient.refetchQueries({ queryKey: ["users", settings], type: "active" });
			if (user?.id) {
				addToast({ title: `User Updated`, message: "The user has been updated", type: "success" });
			} else {
				addToast({ title: `User Created`, message: "The user has been created", type: "success" });
			}
			// invalidate the current page query.
			await queryClient.invalidateQueries({ queryKey: [`users`, settings], refetchType: "active" });
			showFormModal(false);
		} catch (error) {
			if (user?.id) {
				addToast({ title: error?.code ?? "Unable to update the user", message: error.message, type: "error" });
			} else {
				addToast({ title: error?.code ?? "Unable to create the user", message: error.message, type: "error" });
			}

			if (error?.cause?.data?.details) {
				const errs = error.cause.data.details;
				Object.keys(errs).forEach((err) => {
					let field = err;
					if ("phone" === err) {
						const index = errs[err].message.match(/\d+/)[0];
						field = `${err}.${index}.number`;
						errs[err].message = "This is not a valid contact number";
					} else if ("email_address" === err) {
						field = "email";
					}
					setError(field, { type: "custom", message: errs[err].message });
				});
			} else if (error?.cause?.data?.params) {
				const field = error?.cause?.data?.params[0] === "email_address" ? "email" : error?.cause?.data?.params[0];
				setError(field, { type: "custom", message: error.message });
			}
		}
	};

	return (
		<form onSubmit={handleSubmit(submit)} noValidate>
			<div className="form-row">
				<FormElement id="company_name" label="Company Name" errors={errors}>
					<input type="text" id="company_name" {...register("company_name")} />
				</FormElement>

				<FormElement id="name" label="Contact Name" errors={errors}>
					<input type="text" id="name" {...register("contact_name")} />
				</FormElement>
			</div>

			<div className="form-row">
				<FormElement id="email" label="Email Address" errors={errors}>
					<input type="text" id="email" {...register("email")} />
				</FormElement>
			</div>

			<div className="form-row">
				<FormElement label="Contact Numbers">
					<PhoneField {...{ register, control, errors }} />
				</FormElement>
			</div>

			<div className="form-row">
				<FormElement id="address_one" label="Address Line One" errors={errors}>
					<input type="text" id="address_one" {...register("address_one")} />
				</FormElement>
				<FormElement id="address_two" label="Address Line Two" errors={errors}>
					<input type="text" id="address_two" {...register("address_two")} />
				</FormElement>
				<FormElement id="address_city" label="City" errors={errors}>
					<input type="text" id="address_city" {...register("address_city")} />
				</FormElement>
				<FormElement id="address_county" label="County" errors={errors}>
					<input type="text" id="address_county" {...register("address_county")} />
				</FormElement>
				<FormElement id="address_postcode" label="Postcode" errors={errors}>
					<input type="text" id="address_postcode" {...register("address_postcode")} />
				</FormElement>
			</div>

			<div className="form-row">
				<FormElement id="notes" label="Notes" errors={errors}>
					<textarea type="text" id="notes" {...register("notes")}></textarea>
				</FormElement>
			</div>

			<div className="form-row">
				<FormElement id="password" label="Password" errors={errors} description="Setting this will send an email to inform the user of the change.">
					<input type="text" id="password" {...register("password")} />
				</FormElement>
			</div>

			<div className="modal-footer user-footer">
				<button type="submit" className="button primary" disabled={isSubmitting}>
					Save {isSubmitting ? <FontAwesomeIcon icon="fa-solid fa-spinner-third" spin /> : <FontAwesomeIcon icon={"fa-save"} />}
				</button>
				{user?.id && (
					<div className="modal-footer-actions">
						<ItemActions
							{...{
								item: user,
								settings,
								setSettings,
								type: "user",
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

const UserForm = ({ user_id = "create", showFormModal, settings, functions, setSettings, items, role }) => {
	const { authToken } = useAuth();
	const queryKey = [`user`, user_id, authToken];

	const {
		data: user,
		isLoading,
		error,
	} = useQuery({
		queryKey: queryKey,
		queryFn: fetchUser,
		enabled: user_id !== "create",
	});

	let title = "Create User";

	if (user?.company_name) {
		title = user.company_name;
	} else if (user?.name) {
		title = user.name;
	}

	return (
		<div className="user-form">
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
					<Form {...{ user, settings, showFormModal, functions, setSettings, items, role }} />
				</>
			)}
		</div>
	);
};

export default UserForm;
