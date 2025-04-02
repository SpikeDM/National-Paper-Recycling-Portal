import FormElement from "../FormElement";
import CustomerField from "../CustomerField";
import { Controller } from "react-hook-form";

const RecordSearch = ({ control }) => {
	return (
		<FormElement id="customer_id">
			<Controller
				name="customer_id"
				control={control}
				render={({ field }) => {
					return <CustomerField {...{ field }} />;
				}}
			/>
		</FormElement>
	);
};

export default RecordSearch;
