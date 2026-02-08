import { requireSession, mytBaseUrl, clientHeaders } from "../../utils/myt";
import { z } from "zod";

const ParamsSchema = z.object({
	jobId: z.string().min(1),
});

export default defineEventHandler(async (event) => {
	const session = requireSession(event);
	const { jobId } = ParamsSchema.parse(getRouterParams(event));

	try {
		return await $fetch(`${mytBaseUrl()}/evaluate/${encodeURIComponent(jobId)}`, {
			method: "GET",
			headers: clientHeaders(session),
		});
	} catch (err: any) {
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
