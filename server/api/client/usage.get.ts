import { requireSession, mytBaseUrl, clientHeaders } from "../../utils/myt";
import { z } from "zod";

const IsoOrDate = z
	.string()
	.min(1)
	.refine((v) => {
		// Accept full ISO date-time OR YYYY-MM-DD
		const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(v);
		if (isDateOnly) return true;

		const t = Date.parse(v);
		return Number.isFinite(t);
	}, "Expected ISO datetime or YYYY-MM-DD");

const QuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).optional(),
	from: IsoOrDate.optional(),
	to: IsoOrDate.optional(),
	status: z.string().optional(),
});

export default defineEventHandler(async (event) => {
	const session = requireSession(event);
	const q = QuerySchema.parse(getQuery(event));

	const params = new URLSearchParams();
	if (q.limit) params.set("limit", String(q.limit));
	if (q.from) params.set("from", q.from);
	if (q.to) params.set("to", q.to);
	if (q.status) params.set("status", q.status);

	const url = `${mytBaseUrl()}/client/usage${params.toString() ? `?${params}` : ""}`;

	return await $fetch(url, {
		method: "GET",
		headers: clientHeaders(session),
	});
});
