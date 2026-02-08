<script setup lang="ts">
const auth = useAuthStore();
const open = ref(false);

const clientName = computed(() => auth.clientInfo?.clientName || auth.clientInfo?.clientId || "Usuario");
const tokenBalance = computed(() => auth.clientInfo?.tokenBalance ?? auth.clientInfo?.tokenBalanceTokens ?? "-");

async function logout() {
	await auth.logout();
	await navigateTo("/login");
}
</script>

<template>
	<header class="h-16 bg-white flex items-center justify-end px-6 border-b border-black/5">
		<button class="relative mr-6" aria-label="Notificaciones">
			<span class="text-xl">🔔</span>
		</button>

		<div class="relative">
			<button class="flex items-center gap-3" @click="open = !open">
				<div class="h-9 w-9 rounded-full bg-brand-gray flex items-center justify-center">👤</div>
				<div class="font-semibold text-gray-800">{{ clientName }}</div>
				<div class="text-gray-500">▾</div>
			</button>

			<div
				v-if="open"
				class="absolute right-0 mt-2 w-64 bg-white border border-black/10 rounded-lg shadow-card overflow-hidden z-20"
			>
				<div class="px-4 py-3 text-sm border-b border-black/5">
					<div class="text-gray-500">Tokens disponibles</div>
					<div class="text-lg font-bold text-gray-900">{{ tokenBalance }}</div>
				</div>

				<button class="w-full text-left px-4 py-3 hover:bg-brand-gray text-sm" @click="logout">
					Cerrar sesión
				</button>
			</div>
		</div>
	</header>
</template>
