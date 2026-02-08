<script setup lang="ts">
definePageMeta({ layout: false });

const auth = useAuthStore();

const clientId = ref("");
const clientKey = ref("");

const loading = ref(false);
const errorMsg = ref<string | null>(null);

async function onSubmit() {
	errorMsg.value = null;
	loading.value = true;
	try {
		await auth.login(clientId.value.trim(), clientKey.value.trim());
		await navigateTo("/dashboard");
	} catch (e: any) {
		errorMsg.value = e?.data?.statusMessage || e?.data?.message || e?.message || "No se pudo iniciar sesión.";
	} finally {
		loading.value = false;
	}
}
</script>

<template>
	<div class="min-h-screen bg-brand-gray flex items-center justify-center p-6">
		<div class="w-full max-w-lg bg-white rounded-xl2 shadow-card p-8">
			<div class="mb-6">
				<div class="text-brand-navy text-2xl font-bold">MYT Talent Evaluation</div>
				<div class="text-gray-500 text-sm">Inicia sesión con tu clientId y clientKey.</div>
			</div>

			<form class="space-y-4" @submit.prevent="onSubmit">
				<div>
					<label class="text-sm text-gray-600">Client ID</label>
					<input v-model="clientId" class="mt-1 w-full border rounded-lg px-3 py-2" placeholder="acme" />
				</div>

				<div>
					<label class="text-sm text-gray-600">Client Key</label>
					<input v-model="clientKey" type="password" class="mt-1 w-full border rounded-lg px-3 py-2" placeholder="••••••••" />
				</div>

				<p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>

				<button
					class="w-full bg-brand-navy text-white py-2 rounded-lg hover:opacity-95 disabled:opacity-60"
					:disabled="loading"
				>
					{{ loading ? "Ingresando..." : "Ingresar" }}
				</button>
			</form>

			<div class="text-xs text-gray-400 mt-6">
				Tus credenciales se guardan en sesión segura (cookie HttpOnly) en el servidor.
			</div>
		</div>
	</div>
</template>
