import "./style.css";

const FormElement = ({ label, id, errors, children, description }) => {
	return (
		<div className="form-element">
			{label && <label htmlFor={id ?? ""}>{label}</label>}
			{description && <small>{description}</small>}
			{children}
			{errors?.[id] && <p className="error">{errors[id].message}</p>}
		</div>
	);
};

export default FormElement;
