<script setup lang="ts">
import RankingTable from "~/components/results/RankingTable.vue"
import CandidateAccordion from "~/components/results/CandidateAccordion.vue"
import ComparacionCandidatos from "~/components/results/ComparacionCandidatos.vue"
import { useCandidateIdText } from "~/composables/useCandidateIdText"

definePageMeta({
	layout: "print",
})

const route = useRoute()
const jobId = computed(() => String(route.params.jobId))
const storageKey = computed(() => ( `myt:print:${jobId.value}` ))

const result = ref<any>(null)
const loadError = ref<string>("")

onMounted(() => {
	try {
		const raw = localStorage.getItem(storageKey.value)
		if (!raw) {
			loadError.value =
				"No encontré el resultado en esta pestaña. Abre esta página desde /evaluate/:jobId (cuando ya esté cargado el reporte) y vuelve a intentar."
			return
		}
		result.value = JSON.parse(raw)

		// Wait a tick to render, then print
		setTimeout(() => window.print(), 250)

		// Some browsers fire afterprint after print dialog closes (print OR cancel)
		window.addEventListener("afterprint", cleanupAndClose, { once: true })

		// Fallback: if afterprint doesn't fire, still cleanup/close
		setTimeout(cleanupAndClose, 30000)

	} catch (e: any) {
		loadError.value = e?.message ?? "No pude leer el reporte guardado."
	}
})

function cleanupAndClose() {
	try {
		if (storageKey.value) localStorage.removeItem(storageKey.value)
	} catch {}
	// Give the browser a moment, then close
	setTimeout(() => window.close(), 150)
}



const idText = computed(() => (result.value ? useCandidateIdText(result.value) : null))
const replaceIdsInText = (v: any) => idText.value?.replaceIdsInText?.(v) ?? v

const ranking = computed(() =>
	Array.isArray(result.value?.resultadosRanking) ? result.value.resultadosRanking : null
)
const resultados = computed(() =>
	Array.isArray(result.value?.resultados) ? result.value.resultados : null
)
const comparacion = computed(() => result.value?.comparacionCandidatos ?? null)

function onPrint() {
	window.print()
}

onMounted(() => {
	if (result.value) setTimeout(() => window.print(), 250)
})
</script>

<template>
	<div class="space-y-6">
		<div class="flex items-center justify-between gap-3">
			<div>
				<div class="text-xs text-slate-500">MYT Talent Evaluation</div>
				<div class="text-lg font-semibold">Reporte</div>
				<div class="text-xs text-slate-500">Job: {{ jobId }}</div>
			</div>

			<div class="no-print ">
				<button
					type="button"
					class="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
					@click="onPrint"
				>
					Descargar PDF
				</button>
				<button
					type="button"
					class="rounded-lg border px-3 py-2 text-sm hover:bg-brand-gray ml-5"
					@click="cleanupAndClose"
				>
					Cerrar
				</button>
			</div>

		</div>

		<div v-if="loadError" class="rounded-xl border bg-slate-50 p-4 text-sm text-slate-700">
			{{ loadError }}
		</div>

		<div v-else-if="result" class="space-y-6">
			<!-- Header summary -->
			<div class="print-avoid-break rounded-xl border p-4">
				<div class="text-sm font-semibold">Resumen</div>
				<div class="mt-2 grid gap-3 md:grid-cols-3">
					<div class="rounded-lg bg-slate-50 p-3">
						<div class="text-xs text-slate-500">Candidatos</div>
						<div class="text-xl font-semibold">{{ ranking?.length ?? resultados?.length ?? 0 }}</div>
					</div>
					<div v-if="ranking" class="rounded-lg bg-slate-50 p-3">
						<div class="text-xs text-slate-500">Shortlisted</div>
						<div class="text-xl font-semibold">
							{{ ranking.filter((r:any) => r?.shortlisted === true).length }}
						</div>
					</div>
					<div class="rounded-lg bg-slate-50 p-3">
						<div class="text-xs text-slate-500">Generado</div>
						<div class="text-sm font-medium">{{ new Date().toLocaleString() }}</div>
					</div>
				</div>
			</div>

			<!-- Ranking -->
			<div v-if="ranking" class="print-avoid-break">
				<div class="text-sm font-semibold mb-2">Ranking</div>
				<div class="rounded-xl border overflow-hidden">
					<RankingTable :rows="ranking" />
				</div>
			</div>

			<!-- Comparación -->
			<div v-if="comparacion" class="print-break-before print-avoid-break">
				<div class="text-sm font-semibold mb-2">Comparación</div>
				<ComparacionCandidatos
					v-if="comparacion"
					:comparacion="comparacion"
					:replace-ids-in-text="replaceIdsInText"
				/>
			</div>

			<!-- Candidate details -->
			<div v-if="resultados?.length" class="print-break-before print-avoid-break">
				<div class="text-sm font-semibold mb-2">Detalle por candidato</div>
				<CandidateAccordion v-if="resultados?.length"
				                    :result="result"
				                    :force-open-all="true"
				                    :replace-ids-in-text="replaceIdsInText" />
			</div>
		</div>
	</div>
</template>
