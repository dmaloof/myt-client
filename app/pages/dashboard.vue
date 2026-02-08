<script setup lang="ts">
definePageMeta({ layout: "default" });

const auth = useAuthStore();

const loading = ref(true);
const errorMsg = ref<string | null>(null);
const usage = ref<any[]>([]);

async function refreshClient() {
	const info: any = await $fetch("/api/client");
	auth.clientInfo = { ...(auth.clientInfo || {}), ...info };
}

async function loadUsage() {
	loading.value = true;
	errorMsg.value = null;
	try {
		await refreshClient();
		const data: any = await $fetch("/api/client/usage?limit=20");
		usage.value = Array.isArray(data) ? data : (data?.items ?? data?.jobs ?? []);
	} catch (e: any) {
		errorMsg.value = e?.data?.statusMessage || e?.message || "No se pudo cargar el dashboard.";
	} finally {
		loading.value = false;
	}
}

onMounted(loadUsage);

const tokenBalance = computed(() => auth.clientInfo?.tokenBalance ?? auth.clientInfo?.tokenBalanceTokens ?? "-");
const usedTokens = computed(() => auth.clientInfo?.usedTokens ?? "-");

// FILTERS
const statusFilter = ref<string>("ALL")
const serviceFilter = ref<string>("ALL")

const STATUS_OPTIONS = ["ALL", "PENDING", "RUNNING", "DONE", "ERROR"] as const
const SERVICE_OPTIONS = ["ALL", "RANKING", "CANDIDATE", "FULL_REPORT"] as const

const filteredUsage = computed(() => {
	const rows = usage.value ?? []
	return rows.filter((row: any) => {
		const okStatus = statusFilter.value === "ALL" || row.status === statusFilter.value
		const okService = serviceFilter.value === "ALL" || row.service === serviceFilter.value || row.serviceType === serviceFilter.value
		return okStatus && okService
	})
})


</script>

<template>
	<div class="space-y-6">
		<div class="flex items-center justify-between flex-wrap gap-4">
			<h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>

			<NuxtLink
				to="/evaluate/new"
				class="inline-flex items-center gap-2 bg-brand-gold text-gray-900 font-semibold px-4 py-2 rounded-lg hover:opacity-95"
			>
				➕ Nueva evaluación
			</NuxtLink>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div class="bg-white rounded-xl2 shadow-card p-6">
				<div class="text-sm text-gray-500">Tokens disponibles</div>
				<div class="text-4xl font-bold text-brand-navy mt-2">{{ tokenBalance }}</div>
			</div>

			<div class="bg-white rounded-xl2 shadow-card p-6">
				<div class="text-sm text-gray-500">Tokens usados</div>
				<div class="text-4xl font-bold text-gray-900 mt-2">{{ usedTokens }}</div>
			</div>

			<div class="bg-white rounded-xl2 shadow-card p-6">
				<div class="text-sm text-gray-500">Cliente</div>
				<div class="text-lg font-bold text-gray-900 mt-2">
					{{ auth.clientInfo?.clientName || auth.clientInfo?.clientId || "-" }}
				</div>
				<div class="text-sm text-gray-500 mt-1">
					{{ auth.clientInfo?.isActive === false ? "Inactivo" : "Activo" }}
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl2 shadow-card p-6">
			<div class="flex items-center justify-between gap-4 mb-4 flex-wrap">
				<div class="text-xl font-semibold">Historial reciente</div>
				<button class="border rounded-lg px-4 py-2 hover:bg-brand-gray" @click="loadUsage">
					↻ Actualizar
				</button>
			</div>

			<div v-if="loading" class="text-gray-500">Cargando...</div>
			<div v-else-if="errorMsg" class="text-red-600">{{ errorMsg }}</div>

			<div v-else class="overflow-auto">
				<div class="flex flex-wrap items-end gap-3">
					<div>
						<label class="text-xs font-semibold text-slate-600">Status</label>
						<select v-model="statusFilter" class="mt-1 rounded-lg border px-3 py-2 text-sm">
							<option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ s }}</option>
						</select>
					</div>

					<div>
						<label class="text-xs font-semibold text-slate-600">Service</label>
						<select v-model="serviceFilter" class="mt-1 rounded-lg border px-3 py-2 text-sm">
							<option v-for="s in SERVICE_OPTIONS" :key="s" :value="s">{{ s }}</option>
						</select>
					</div>

					<button
						type="button"
						class="rounded-lg border px-3 py-2 text-sm"
						@click="() => { statusFilter = 'ALL'; serviceFilter = 'ALL' }"
					>
						Clear
					</button>

					<div class="ml-auto text-sm text-slate-600">
						Showing <span class="font-semibold">{{ filteredUsage.length }}</span> of {{ usage?.length ?? 0 }}
					</div>
				</div>

				<table class="w-full text-sm">
					<thead class="text-gray-400">
					<tr class="border-b">
						<th class="text-left py-3 font-medium">Service</th>
						<th class="text-left py-3 font-medium">Report</th>
						<th class="text-left py-3 font-medium">Status</th>
						<th class="text-left py-3 font-medium">Candidatos</th>
						<th class="text-left py-3 font-medium">Tokens</th>
						<th class="text-left py-3 font-medium">Creado</th>
						<th class="text-right py-3 font-medium">Acciones</th>
					</tr>
					</thead>

					<tbody>
					<tr v-for="row in filteredUsage" :key="row.jobId" class="border-b hover:bg-brand-gray/50">
						<td class="py-3">{{ row.service }}</td>
						<td class="py-3">{{ row.reportMode }}</td>
						<td class="py-3">{{ row.status }}</td>
						<td class="py-3">{{ row.candidateCount ?? "-" }}</td>
						<td class="py-3">{{ row.tokensChargedTokens ?? "-" }}</td>
						<td class="py-3">{{ row.createdAt ?? "-" }}</td>
						<td class="py-3 text-right">
							<NuxtLink
								:to="`/evaluate/${row.jobId}`"
								class="text-brand-navy font-semibold hover:underline"
							>
								Ver
							</NuxtLink>
						</td>
					</tr>

					<tr v-if="usage.length === 0">
						<td colspan="6" class="py-6 text-center text-gray-500">
							Sin registros todavía.
						</td>
					</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>
