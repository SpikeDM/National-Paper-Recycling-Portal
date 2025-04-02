import { fetchUsers, fetchUser } from "../../helpers";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "../../AuthContext";
import AsyncSelect from "react-select/async";

const CustomerField = ({ field, initialValue, showNotes = false }) => {
	const { authToken } = useAuth();

	const [hasSearched, setHasSearched] = useState(false);

	const setUserId = field?.value ?? initialValue?.value;

	const queryKey = [`user`, setUserId, authToken];

	const { data: setUser } = useQuery({
		queryKey: queryKey,
		queryFn: fetchUser,
		enabled: !!setUserId,
	});

	const loadOptions = async (inputValue) => {
		if (inputValue) {
			const users = await fetchUsers({ filters: { per_page: 50, search: inputValue, roles: "sdmp_customer" } }, authToken);
			if (users?.data.length) {
				setHasSearched(true);
				return users.data.map((user) => ({ value: user.id, label: `${user.company_name}`, user: user }));
			}
		}
		return [];
	};

	const handleChange = (selectedOption) => {
		field.onChange(selectedOption?.value);
	};

	const defaultOptions = initialValue ? [initialValue] : [];

	const selectedOption = defaultOptions.find((option) => {
		return option.value === parseFloat(field.value) || null;
	});

	return (
		<div>
			<AsyncSelect {...field} className="select-suggest" value={selectedOption} isClearable={true} id="customer_id" defaultOptions={!hasSearched && defaultOptions} loadOptions={loadOptions} placeholder="Search by Customer" filterOption={null} onChange={handleChange} />
			{setUser?.notes && showNotes && (
				<div className="customer-notes">
					<strong>Notes</strong>
					<div dangerouslySetInnerHTML={{ __html: setUser.notes.replace(/(?:\r\n|\r|\n)/g, "<br />") }}></div>
				</div>
			)}
		</div>
	);
};

export default CustomerField;
