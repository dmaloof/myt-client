import { z } from "zod";
import { requireSession, mytBaseUrl, clientHeaders } from "#server/utils/myt";

const ParamsSchema = z.object({
	jobId: z.string().min(1),
});

export default defineEventHandler(async (event) => {
	const session = requireSession(event);
	const { jobId } = ParamsSchema.parse(event.context.params);

	// 1) get job to retrieve presigned URL
	const job: any = await $fetch(`${mytBaseUrl()}/evaluate/${encodeURIComponent(jobId)}`, {
		method: "GET",
		headers: clientHeaders(session),
	});

	if (job?.status !== "DONE") {
		throw createError({
			statusCode: 409,
			statusMessage: "Job is not DONE yet",
		});
	}

	const url = job?.result_url;
	if (!url || typeof url !== "string") {
		throw createError({
			statusCode: 404,
			statusMessage: "result_url not available",
		});
	}

	// 2) fetch result.json from server side (no CORS)
	const result = await $fetch(url, { method: "GET" });

	return result;
});
