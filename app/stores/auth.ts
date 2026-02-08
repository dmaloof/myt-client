import { defineStore } from "pinia";
import { z } from "zod";

const ClientInfoSchema = z.object({
	clientId: z.string().optional(),
	clientName: z.string().optional(),
	tokenBalance: z.number().optional(),
	tokenBalanceTokens: z.number().optional(),
	usedTokens: z.number().optional(),
	isActive: z.boolean().optional(),
	lastUsedAt: z.string().optional(),
});

export const useAuthStore = defineStore("auth", {
	state: () => ({
		ready: false,
		loggedIn: false,
		clientInfo: null as null | z.infer<typeof ClientInfoSchema>,
	}),
	actions: {
		async me() {
			try {
				const headers = import.meta.server ? useRequestHeaders(["cookie"]) : undefined

				const data = await $fetch("/api/auth/me", { headers })

				this.clientInfo = ClientInfoSchema.parse(data)
				this.loggedIn = true
			} catch {
				this.clientInfo = null
				this.loggedIn = false
			} finally {
				this.ready = true
			}
		},
		async login(clientId: string, clientKey: string) {
			const data = await $fetch("/api/auth/login", {
				method: "POST",
				body: { clientId, clientKey },
			});
			this.clientInfo = ClientInfoSchema.parse(data);
			this.loggedIn = true;
			this.ready = true;
		},
		async logout() {
			await $fetch("/api/auth/logout", { method: "POST" });
			this.clientInfo = null;
			this.loggedIn = false;
		},
	},
});
