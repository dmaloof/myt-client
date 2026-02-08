import { setResponseStatus, createError } from "h3"
import { sessionGet } from "./session";

export function requireSession(event: any) {
	const cfg = useRuntimeConfig();
	const session = sessionGet(event, cfg.sessionSecret);
	if (!session) {
		setResponseStatus(event, 401);
		throw createError({ statusCode: 401, statusMessage: "NOT_AUTHENTICATED" });
	}
	return session;
}

export function mytBaseUrl() {
	const cfg = useRuntimeConfig();
	if (!cfg.mytApiBaseUrl) {
		throw createError({ statusCode: 500, statusMessage: "MYT_API_BASE_URL_NOT_SET" });
	}
	return cfg.mytApiBaseUrl as string;
}

export function clientHeaders(session: { clientId: string; clientKey: string }) {
	return {
		"x-client-id": session.clientId,
		"x-client-key": session.clientKey,
	};
}
