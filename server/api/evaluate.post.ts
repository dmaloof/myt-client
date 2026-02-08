import { z } from "zod";
import { requireSession, mytBaseUrl, clientHeaders } from "../utils/myt";

const UrlString = z.string().min(1).refine((v) => {
	try {
		new URL(v);
		return true;
	} catch {
		return false;
	}
}, "Invalid URL");

const BodySchema = z.object({
	payload: z.unknown(),
	webhook: z
		.object({
			url: UrlString,
			headers: z.record(z.string(), z.string()).optional(),
		})
		.optional(),
});



// we accept idempotencyKey from client OR generate one if missing
function makeIdempotencyKey(clientId: string) {
	return `${clientId}:${crypto.randomUUID()}`;
}

export default defineEventHandler(async (event) => {
	const session = requireSession(event);
	const body = BodySchema.parse(await readBody(event));

	const incomingKey = getHeader(event, "x-idempotency-key");
	const idempotencyKey = incomingKey?.trim() || makeIdempotencyKey(session.clientId);

	if (!idempotencyKey.startsWith(`${session.clientId}:`)) {
		throw createError({
			statusCode: 400,
			statusMessage: `x-idempotency-key must start with ${session.clientId}:`,
		});
	}

	try {
		return await $fetch(`${mytBaseUrl()}/evaluate`, {
			method: "POST",
			headers: {
				...clientHeaders(session),
				"content-type": "application/json",
				"x-idempotency-key": idempotencyKey,
			},
			body,
		});
	} catch (err: any) {
		// forward upstream status codes nicely
		const statusCode = err?.statusCode || err?.response?.status;
		if (statusCode) {
			throw createError({
				statusCode,
				statusMessage: err?.statusMessage || err?.message || "UPSTREAM_ERROR",
				data: err?.data,
			});
		}
		throw err;
	}
});
