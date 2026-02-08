import {z} from "zod";

const QuerySchema = z.object({
	clientId: z.string().min(1),
	clientKey: z.string().min(1),
});

export default defineEventHandler(async (event) => {
	const cfg = useRuntimeConfig();
	const q = getQuery(event);

	const { clientId, clientKey } = QuerySchema.parse(q);

	// Return ONLY safe metadata; do not persist key yet in this step.
	return await $fetch(`${cfg.mytApiBaseUrl}/client`, {
		method: "GET",
		headers: {
			"x-client-id": clientId,
			"x-client-key": clientKey,
		},
	});
});