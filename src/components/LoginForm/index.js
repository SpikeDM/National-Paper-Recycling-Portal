import { useForm } from "react-hook-form";
import FormElement from "../FormElement";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import YupPassword from "yup-password";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useToast } from "../../ToastsContext";
import config from "../../config";
import { useAuth } from "../../AuthContext";

import "./style.css";

YupPassword(yup);

// form validation requirements.
const schema = yup
	.object({
		email: yup.string().required("You must provide an email adress").email("Your email address is not formatted correctly."),
		// password: yup.string().required("You must provide a password").min(6, "Your password must contain 8 or more characters with at least one of each: uppercase, lowercase, number and special").minLowercase(1, "Your password must contain at least 1 lower case letter").minUppercase(1, "Your password must contain at least 1 upper case letter").minNumbers(1, "Your password must contain at least 1 number").minSymbols(1, "Your password must contain at least 1 special character"),
		password: yup.string().required("You must provide a password"),
	})
	.required();

// the form itseld.
const LoginForm = ({ settings }) => {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm({
		resolver: yupResolver(schema),
	});

	const { addToast, clearToasts } = useToast();
	const { setAuthData } = useAuth();

	// on submit.
	const submit = async (submitData) => {
		try {
			submitData.username = submitData.email;
			clearToasts();
			const response = await fetch(`${config.apiBaseUrl}/jwt-auth/v1/token`, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"content-type": "application/json",
				},
				body: JSON.stringify(submitData),
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.code, { cause: data });
			} else {
				setAuthData(data);
			}
		} catch (error) {
			addToast({ title: error.message, message: error.cause.message, type: "error" });
		}
	};

	return (
		<div className="login-form">
			<div>
				<p>
					<img src={settings.portal_logo[0]} alt="Go home" width={settings.portal_logo[1]} height={settings.portal_logo[2]} />
				</p>
				<form onSubmit={handleSubmit(submit)} noValidate>
					<FormElement label="Email Address" id="email" errors={errors}>
						<input type="email" id="email" {...register("email", { required: "Your email address is required." })} placeholder="e.g. example@example.com" />
					</FormElement>
					<FormElement label="Password" id="password" errors={errors}>
						<input id="password" type="password" {...register("password", { required: "Your password is required." })} placeholder="*********" />
					</FormElement>
					<FormElement>
						<button type="submit" className="button primary" disabled={isSubmitting}>
							Login {isSubmitting && <FontAwesomeIcon icon="fa-solid fa-spinner-third" spin />}
						</button>
					</FormElement>
				</form>
			</div>
		</div>
	);
};
export default LoginForm;
