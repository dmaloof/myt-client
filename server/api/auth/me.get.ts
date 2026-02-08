import { sessionGet } from "../../utils/session";

export default defineEventHandler(async (event) => {
	const cfg = useRuntimeConfig();
	const session = sessionGet(event, cfg.sessionSecret);
	if (!session) {
		setResponseStatus(event, 401);
		return { error: "NOT_AUTHENTICATED" };
	}

	// Fetch fresh metadata each time (or you can return cached and refresh in background)
	const clientInfo: any = await $fetch(`${cfg.mytApiBaseUrl}/client`, {
		method: "GET",
		headers: {
			"x-client-id": session.clientId,
			"x-client-key": session.clientKey,
		},
	});

	return clientInfo;
});