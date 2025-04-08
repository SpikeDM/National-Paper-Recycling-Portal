import { _n } from "@wordpress/i18n";
import config from "./config";
import { format, parse } from "date-fns";

export const prepareQueryString = (args) => {
	return Object.keys(args)
		.map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(args[key]))
		.join("&");
};

export const userColumns = [
	{ label: "Company", value: "company_name" },
	{ label: "Contact Name", value: "name" },
	{ label: "Records", value: "records" },
	{ label: "Email Address", value: "email", icon: "fa-solid fa-envelope" },
	{ label: "Phone Numbers", value: "telephone", icon: "fa-solid fa-phone" },
	{ label: "Mobile Numbers", value: "mobile", icon: "fa-solid fa-mobile-screen" },
	{ label: "Fax Numbers", value: "fax", icon: "fa-solid fa-fax" },
	{ label: "Address", value: "address", icon: "fa-solid fa-location-dot" },
];

export const userViews = [
	{ label: "List", value: "table" },
	{ label: "Full", value: "list" },
];

export const recordColumns = [
	{ label: "Date", value: "date" },
	{ label: "Company Name", value: "company_name" },
	{ label: "Location", value: "location" },
	{ label: "Invoice #", value: "invoice_number" },
	{ label: "Type", value: "type" },
	{ label: "Weight", value: "weight" },
	{ label: "Price", value: "price" },
	{ label: "Ticket", value: "ticket_number" },
	{ label: "Transport", value: "transport" },
	{ label: "Transport Price", value: "transport_price" },
	{ label: "Transport Invoice #", value: "transport_invoice_number" },
];

/**
 * Formats the phone number in the given item based on the specified column.
 *
 * @param {object} item - The item containing the phone number.
 * @param {string} column - The column to determine the phone number type (telephone or fax).
 * @returns {string|array} - The formatted phone number or the original value of the specified column.
 */
const maybeFormatPhone = (itemData, column, item) => {
	if (["telephone", "fax", "mobile"].includes(column)) {
		const type = "telephone" === column ? "phone" : column;

		const numbers = item["phone"];

		if (numbers) {
			const newItem = numbers
				.map((number, i) => {
					if (number.number_type === type) {
						return (
							<span className="maybe-data-seperator" key={i}>
								<a href={`tel:${number.number}`}>{number.number}</a>
							</span>
						);
					} else {
						return null;
					}
				})
				.filter((n) => n);

			return newItem.length ? newItem : "";
		}
	}

	return itemData;
};

/**
 * Formats the email value in the given item based on the specified column.
 * If the column is "email", the email value will be wrapped in an anchor tag with a mailto link.
 *
 * @param {Object} itemData - The item containing the email value.
 * @param {string} column - The column to check for email formatting.
 * @returns {string} - The formatted email value or the original value if the column is not "email".
 */
const maybeFormatEmail = (itemData, column) => {
	if (["email"].includes(column)) {
		return itemData && <a href={`mailto:${itemData}`}>{itemData}</a>;
	}

	return itemData;
};

const maybeFormatAddress = (itemData, column, item) => {
	if (["address"].includes(column)) {
		return [item["address_one"], item["address_two"], item["address_city"], item["address_county"], item["address_postcode"]].filter((n) => n).join(", ");
	}

	return itemData;
};

const maybeFormatCompanyName = (itemData, column, item, type) => {
	// if ("company_name" === column) {
	// 	const id = item?.customer_id ?? item?.id;
	// 	const value = itemData ?? item?.customer_name;
	// 	type = "user" ? "customer" : type;

	// 	return <a href={`/${type}s/${id}`}>{value}</a>;
	// }
	return itemData;
};
const maybeFormatRecordCount = (itemData, column, item) => {
	if ("records" === column) {
		return (
			<a href={`/records/${item?.id}`} className="button primary">
				{itemData} {_n("record", `records`, parseInt(itemData))}
			</a>
		);
	}
	return itemData;
};

export const maybeFormatDate = (itemData, column, item) => {
	if ("date" === column && itemData) {
		const date = parse(itemData, "yyyy-MM-dd HH:mm:ss", new Date());
		return format(date, "do MMMM yyyy");
	}
	return itemData;
};

export const maybeFormatData = (item, column, data, type) => {
	let itemData = item?.[column] ?? "";
	itemData = maybeFormatPhone(itemData, column, item);
	itemData = maybeFormatEmail(itemData, column);
	itemData = maybeFormatAddress(itemData, column, item);
	itemData = maybeFormatCompanyName(itemData, column, item, type);
	itemData = maybeFormatRecordCount(itemData, column, item);
	itemData = maybeFormatDate(itemData, column, item);

	return itemData;
};

export const fetchUser = async ({ queryKey }) => {
	const response = await fetch(`${config.apiBaseUrl}/wp/v2/users/${queryKey[1]}`, {
		method: "GET",
		mode: "cors",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${queryKey[2]}`,
		},
		referrer: "",
	});
	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message, { cause: data });
	}

	return data;
};

export const updateUser = async ({ userId, data, authToken }) => {
	const response = await fetch(`${config.apiBaseUrl}/sdmp/users/${userId}`, {
		method: "POST",
		mode: "cors",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${authToken}`,
		},
		body: JSON.stringify(data),
		referrer: "",
	});
	const responseData = await response.json();

	if (!response.ok) {
		throw new Error(responseData.message, { cause: responseData });
	}

	return responseData;
};

export const createUser = async ({ data, authToken }) => {
	const response = await fetch(`${config.apiBaseUrl}/sdmp/users`, {
		method: "POST",
		mode: "cors",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${authToken}`,
		},
		body: JSON.stringify(data),
		referrer: "",
	});
	const responseData = await response.json();

	if (!response.ok) {
		throw new Error(responseData.message, { cause: responseData });
	}

	return responseData;
};

export const updateRecord = async ({ recordId, data, authToken }) => {
	const response = await fetch(`${config.apiBaseUrl}/sdmp/records/${recordId}`, {
		method: "POST",
		mode: "cors",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${authToken}`,
		},
		body: JSON.stringify(data),
		referrer: "",
	});
	const responseData = await response.json();

	if (!response.ok) {
		throw new Error(responseData.message, { cause: responseData });
	}

	return responseData;
};

export const createRecord = async ({ data, authToken }) => {
	const response = await fetch(`${config.apiBaseUrl}/sdmp/records`, {
		method: "POST",
		mode: "cors",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${authToken}`,
		},
		body: JSON.stringify(data),
		referrer: "",
	});
	const responseData = await response.json();

	if (!response.ok) {
		throw new Error(responseData.message, { cause: responseData });
	}

	return responseData;
};

export const fetchRecord = async ({ queryKey }) => {
	const response = await fetch(`${config.apiBaseUrl}/sdmp/records/${queryKey[1]}`, {
		method: "GET",
		mode: "cors",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${queryKey[2]}`,
		},
		referrer: "",
	});
	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message, { cause: data });
	}

	return data;
};

export const fetchRecords = async (settings, authToken) => {
	const response = await fetch(`${config.apiBaseUrl}/sdmp/records?${prepareQueryString(settings.filters)}`, {
		method: "GET",
		mode: "cors",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${authToken}`,
		},
		referrer: "",
	});

	const responseData = await response.json();

	if (!response.ok) {
		throw new Error(responseData.message);
	}

	const total = response.headers.get("X-WP-Total");
	const totalPages = response.headers.get("X-WP-TotalPages");

	return { data: responseData, totals: { total, totalPages } };
};

export const fetchUsers = async (settings, authToken) => {
	if (!settings.filters.orderby) {
		settings.filters.orderby = "company_name";
	}

	const response = await fetch(`${config.apiBaseUrl}/wp/v2/users?${prepareQueryString(settings.filters)}`, {
		method: "GET",
		mode: "cors",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${authToken}`,
		},
		referrer: "",
	});

	const responseData = await response.json();

	if (!response.ok) {
		throw new Error(responseData.message);
	}

	const total = response.headers.get("X-WP-Total");
	const totalPages = response.headers.get("X-WP-TotalPages");

	return { data: responseData, totals: { total, totalPages } };
};

export const exportItems = async ({ items, type, authToken, filters = {} }) => {
	const exportUrl = `${config.apiBaseUrl}/sdmp/${type}/export`;

	let exportId = null;
	let offset = null;
	let fileUrl = null;

	do {
		const response = await fetch(exportUrl, {
			method: "POST",
			mode: "cors",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${authToken}`,
			},
			body: JSON.stringify({ ids: items, export_id: exportId, offset, filters }),
			referrer: "",
		});

		const responseData = await response.json();

		if (!response.ok) {
			throw new Error(responseData.message);
		}

		exportId = responseData.export_id;
		offset = responseData.offset;
		fileUrl = responseData.file;

		if (!fileUrl) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	} while (!fileUrl);

	return { file: fileUrl };
};

export const printItems = async ({ items, type, authToken, filters = {} }) => {
	const exportUrl = `${config.apiBaseUrl}/sdmp/${type}/print`;

	let print_id = null;
	let offset = null;
	let fileUrl = null;

	do {
		const response = await fetch(exportUrl, {
			method: "POST",
			mode: "cors",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${authToken}`,
			},
			body: JSON.stringify({ ids: items, print_id: print_id, offset, filters }),
			referrer: "",
		});

		const responseData = await response.json();

		if (!response.ok) {
			throw new Error(responseData.message);
		}

		print_id = responseData.print_id;
		offset = responseData.offset;
		fileUrl = responseData.file;

		if (!fileUrl) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	} while (!fileUrl);

	return { file: fileUrl };
};

export const deleteItems = async ({ items, authToken, filters = {}, type }) => {
	const response = await fetch(`${config.apiBaseUrl}/sdmp/${type}/delete`, {
		method: "POST",
		mode: "cors",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${authToken}`,
		},
		body: JSON.stringify({
			ids: items,
			filters,
		}),
		referrer: "",
	});

	const responseData = await response.json();

	if (!response.ok) {
		throw new Error(responseData.message);
	}

	return responseData;
};
