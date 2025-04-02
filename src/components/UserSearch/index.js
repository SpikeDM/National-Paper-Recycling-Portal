import FormElement from "../FormElement";

const UserSearch = ({ placeholder, register }) => {
	return (
		<FormElement id="search">
			<input type="search" id="search" {...register("search", {})} placeholder={placeholder} />
		</FormElement>
	);
};
export default UserSearch;
