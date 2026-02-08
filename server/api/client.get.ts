import { requireSession, mytBaseUrl, clientHeaders } from "../utils/myt";

export default defineEventHandler(async (event) => {
	const session = requireSession(event);

	return await $fetch(`${mytBaseUrl()}/client`, {
		method: "GET",
		headers: clientHeaders(session),
	});
});
