<script setup lang="ts">
import ResultPreview from "~/components/results/ResultPreview.vue";

definePageMeta({ layout: "default" })

const route = useRoute()
const jobId = computed(() => String(route.params.jobId || ""))
const resultFetchedOnce = ref(false)
const pollingStarted = ref(false)

type JobStatus = "PENDING" | "RUNNING" | "DONE" | "ERROR"

type JobResponse = {
	jobId: string
	status: JobStatus
	createdAt?: string
	updatedAt?: string
	error?: any
	service: string
	reportMode?: string
	candidateNames:string[5]

	resultadosRanking?: any[] | null
	result_url?: string | null

	webhookStatus?: any
	webhookAttempts?: number
	webhookLastStatusCode?: number | null
	webhookLastError?: any
	webhookLastAt?: string | null
}

const job = ref<JobResponse | null>(null)
const loading = ref(true)
const errorMsg = ref<string | null>(null)

const polling = ref(true)
let timer: any = null

const resultJson = ref<any | null>(null)
const resultLoading = ref(false)
const resultError = ref<string | null>(null)

async function fetchJob() {
	if (!jobId.value) return
	errorMsg.value = null
	try {
		job.value = await $fetch<JobResponse>(`/api/evaluate/${encodeURIComponent(jobId.value)}`)
	} catch (e: any) {
		errorMsg.value = e?.data?.statusMessage || e?.data?.message || e?.message || "Failed to load job."
	} finally {
		loading.value = false
	}
}

async function fetchResultJson() {
	if (resultLoading.value || resultFetchedOnce.value) return

	resultError.value = null
	resultLoading.value = true
	try {
		resultJson.value = await $fetch(`/api/evaluate/${encodeURIComponent(jobId.value)}/result`)
		resultFetchedOnce.value = true
	} catch (e: any) {
		resultError.value = e?.data?.statusMessage || e?.data?.message || e?.message || "Failed to fetch result.json"
	} finally {
		resultLoading.value = false
	}
}

function startPolling() {
	if (pollingStarted.value) return

	stopPolling()
	pollingStarted.value = true
	polling.value = true

	timer = setInterval(async () => {
		await fetchJob()
		const st = job.value?.status

		if (st === "DONE") {
			stopPolling()
			polling.value = false
			pollingStarted.value = false
			await fetchResultJson()
		}

		if (st === "ERROR") {
			stopPolling()
			polling.value = false
			pollingStarted.value = false
		}
	}, 10000)
}

function stopPolling() {
	if (timer) clearInterval(timer)
	timer = null
}

onMounted(async () => {
	await fetchJob()

	const st = job.value?.status
	if (st === "DONE") {
		polling.value = false
		await fetchResultJson()
		return
	}

	if (st === "ERROR") {
		polling.value = false
		return
	}

	startPolling()
})

onBeforeUnmount(() => {
	stopPolling()
	pollingStarted.value = false
})

const ranking = computed(() => {
	const r1 = resultJson.value?.resultadosRanking
	if (Array.isArray(r1)) return r1
	const r2 = job.value?.resultadosRanking
	if (Array.isArray(r2)) return r2
	return null
})

function copy(text: string) {
	navigator.clipboard?.writeText(text)
}

watch(jobId, async () => {
	resultJson.value = null
	resultFetchedOnce.value = false
	stopPolling()
	pollingStarted.value = false

	await fetchJob()
	const st = job.value?.status
	if (st === "DONE") {
		polling.value = false
		await fetchResultJson()
		return
	}
	if (st === "ERROR") {
		polling.value = false
		return
	}
	startPolling()
})

function onPrint() {
	try {
		localStorage.setItem(`myt:print:${jobId.value}`, JSON.stringify(resultJson.value))
	} catch {
		// ignore
	}

	const url = `/evaluate/${jobId.value}/print`
	const w = window.open(url, "_blank")
	w?.focus?.()
}
</script>

<template>
	<div class="max-w-6xl mx-auto p-6 space-y-6">
		<div class="flex items-start justify-between gap-4 flex-wrap">
			<div>
				<h1 class="text-2xl font-semibold">Evaluación {{ job?.service }} {{ job?.reportMode?? '' }}</h1>
				<div class="text-sm text-slate-600">
					JobId:
					<span class="font-mono">{{ jobId }}</span>
					<button class="ml-2 text-brand-navy hover:underline" @click="copy(jobId)">
						Copy
					</button>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<NuxtLink to="/evaluate/new" class="rounded-lg border px-4 py-2 hover:bg-brand-gray">
					+ Nuevo
				</NuxtLink>

				<button
					v-if="polling"
					class="rounded-lg border px-4 py-2 hover:bg-brand-gray"
					@click="stopPolling(); polling=false"
				>
					Detener polling
				</button>
				<button
					v-else
					class="rounded-lg bg-slate-900 text-white px-4 py-2 hover:opacity-95"
					:disabled="job?.status === 'DONE' || job?.status === 'ERROR'"
					@click="startPolling()"
				>
					Iniciar polling
				</button>
			</div>
		</div>

		<div v-if="loading" class="bg-white rounded-xl2 shadow-card p-6 text-slate-600">
			Cargando…
		</div>

		<div v-else-if="errorMsg" class="bg-white rounded-xl2 shadow-card p-6">
			<div class="text-red-700 font-semibold">Error</div>
			<div class="text-red-700 text-sm mt-1">{{ errorMsg }}</div>
		</div>

		<div v-else class="grid gap-6 md:grid-cols-3">
			<!-- status card -->
			<div class="bg-white rounded-xl2 shadow-card p-6 md:col-span-2">
				<div class="text-sm text-slate-500">Status</div>
				<div class="mt-2 text-3xl font-bold"
				     :class="job?.status === 'DONE' ? 'text-green-700' : job?.status === 'ERROR' ? 'text-red-700' : 'text-brand-navy'">
					{{ job?.status }}
				</div>

				<div class="mt-4 text-sm text-slate-700 space-y-1">
					<div><span class="text-slate-500">Created:</span> {{ job?.createdAt ?? "-" }}</div>
					<div><span class="text-slate-500">Updated:</span> {{ job?.updatedAt ?? "-" }}</div>
				</div>

				<div v-if="job?.status === 'ERROR'" class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
					<div class="font-semibold">Job error</div>
					<pre class="mt-2 text-xs overflow-auto">{{ job?.error }}</pre>
				</div>

				<div v-if="job?.status === 'DONE' && job?.result_url" class="mt-4 space-y-2">
					<a
						:href="job.result_url"
						target="_blank"
						class="inline-flex items-center justify-center w-full rounded-lg bg-brand-gold px-4 py-2 font-semibold text-slate-900 hover:opacity-95"
					>
						Download result.json
					</a>

					<button
						class="w-full rounded-lg border px-4 py-2 hover:bg-brand-gray"
						:disabled="resultLoading"
						@click="fetchResultJson()"
					>
						{{ resultLoading ? "Fetching…" : "Fetch & preview" }}
					</button>

					<div v-if="resultError" class="text-xs text-red-700">{{ resultError }}</div>
				</div>
			</div>

			<!-- webhook card -->
			<div class="bg-white rounded-xl2 shadow-card p-6 md:col-span-1">
				<div class="text-lg font-semibold mb-3">Webhook</div>
				<div class="grid gap-3 md:grid-cols-2 text-sm text-slate-700">
					<div><span class="text-slate-500">Status:</span> {{ job?.webhookStatus ?? "-" }}</div>
					<div><span class="text-slate-500">Attempts:</span> {{ job?.webhookAttempts ?? 0 }}</div>
					<div><span class="text-slate-500">Last status code:</span> {{ job?.webhookLastStatusCode ?? "-" }}</div>
					<div><span class="text-slate-500">Last at:</span> {{ job?.webhookLastAt ?? "-" }}</div>
				</div>

				<div v-if="job?.webhookLastError" class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
					<div class="font-semibold">Last webhook error</div>
					<pre class="mt-2 text-xs overflow-auto">{{ job?.webhookLastError }}</pre>
				</div>
			</div>
		</div>

		<!-- result preview -->
		<div v-if="job?.status === 'DONE'" class="bg-white rounded-xl2 shadow-card p-6 space-y-4">
			<div class="flex items-center justify-between flex-wrap gap-2">
				<div class="text-lg font-semibold">Resultados</div>
				<div class="flex gap-2" v-if="resultJson">
					<button
						type="button"
						class="rounded-lg border px-3 py-2 hover:bg-brand-gray"
						@click="onPrint"
					>
						Imprimir / PDF
					</button>
					<button
						class="rounded-lg border px-3 py-2 hover:bg-brand-gray"
						@click="copy(JSON.stringify(resultJson, null, 2))"
					>
						Copy JSON
					</button>
				</div>
			</div>

			<div v-if="resultJson" class="rounded-xl border p-4">
				<ResultPreview :result="resultJson" />
			</div>

			<div v-else class="text-slate-600 text-sm">
				No results loaded yet. Use “Fetch & preview”.
			</div>
		</div>
	</div>
</template>
