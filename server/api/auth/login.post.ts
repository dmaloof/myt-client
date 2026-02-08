import { z } from "zod";
import { sessionSet } from "../../utils/session";

const BodySchema = z.object({
	clientId: z.string().min(1),
	clientKey: z.string().min(1),
});

export default defineEventHandler(async (event) => {
	const cfg = useRuntimeConfig();
	const body = await readBody(event); // <- Nuxt auto-import
	const { clientId, clientKey } = BodySchema.parse(body);

	const clientInfo: any = await $fetch(`${cfg.mytApiBaseUrl}/client`, {
		method: "GET",
		headers: {
			"x-client-id": clientId,
			"x-client-key": clientKey,
		},
	});

	sessionSet(event, cfg.sessionSecret, {
		clientId,
		clientKey,
		clientName: clientInfo.clientName,
		tokenBalance: clientInfo.tokenBalance ?? clientInfo.tokenBalanceTokens,
		isActive: clientInfo.isActive,
		updatedAt: clientInfo.updatedAt,
	});

	return {
		clientId: clientInfo.clientId ?? clientId,
		clientName: clientInfo.clientName,
		tokenBalance: clientInfo.tokenBalance ?? clientInfo.tokenBalanceTokens,
		usedTokens: clientInfo.usedTokens,
		isActive: clientInfo.isActive,
		lastUsedAt: clientInfo.lastUsedAt,
	};
});
