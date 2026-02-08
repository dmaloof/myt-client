<script setup lang="ts">
import RankingTable from "~/components/results/RankingTable.vue";
import CandidateAccordion from "~/components/results/CandidateAccordion.vue";
import ComparacionCandidatos from "~/components/results/ComparacionCandidatos.vue"
import { useCandidateIdText } from "~/composables/useCandidateIdText"

type AnyObj = Record<string, any>

const props = defineProps<{
	result: AnyObj
}>()
const { replaceIdsInText, replaceIdsInArray } = useCandidateIdText(props.result)


const ranking = computed(() =>
	Array.isArray(props.result?.resultadosRanking) ? props.result.resultadosRanking : null
)
const resultados = computed(() =>
	Array.isArray(props.result?.resultados) ? props.result.resultados : null
)

const comparacion = computed(() => props.result?.comparacionCandidatos ?? null)

const hasResumen = computed(() => Boolean(comparacion.value?.resumenEjecutivo))
const hasComparacion = computed(() => Boolean(comparacion.value))
const hasRanking = computed(() => Boolean(ranking.value?.length))
const hasCandidatos = computed(() => Boolean(resultados.value?.length))

const hasExtras = computed(() =>
	Boolean(props.result?.escalaInterpretacion) ||
	Array.isArray(props.result?.criteriosShortlistBase)
)

// always allow JSON as last resort
const availableTabs = computed(() => {
	const t: string[] = []
	if (hasResumen.value) t.push("Resumen")
	if (hasRanking.value) t.push("Ranking")
	if (hasComparacion.value) t.push("Comparación")
	if (hasCandidatos.value) t.push("Candidatos")
	if (hasExtras.value) t.push("Extras")
	t.push("JSON")
	return t as Array<"Resumen" | "Ranking" | "Comparación" | "Candidatos" | "Extras" | "JSON">
})

const tab = ref<"Resumen" | "Comparación" | "Ranking" | "Candidatos" | "Extras" | "JSON">("JSON")
const initialized = ref(false)

watch(
	() => availableTabs.value,
	() => {
		if (!initialized.value) {
			if (hasResumen.value) tab.value = "Resumen"
			else if (hasRanking.value) tab.value = "Ranking"
			else if (hasComparacion.value) tab.value = "Comparación"
			else if (hasCandidatos.value) tab.value = "Candidatos"
			else tab.value = "JSON"

			initialized.value = true
			return
		}

		if (!availableTabs.value.includes(tab.value)) {
			tab.value = availableTabs.value[0] ?? "JSON"
		}
	},
	{ immediate: true }
)

const resumenEjecutivo = computed(() => comparacion.value?.resumenEjecutivo as string | undefined)

const shortlistedCount = computed(() => {
	if (!ranking.value) return 0
	return ranking.value.filter((r: any) => r?.shortlisted === true).length
})

const candidateCount = computed(() => ranking.value?.length ?? resultados.value?.length ?? 0)

const topCandidate = computed(() => {
	if (ranking.value?.length) return ranking.value[0]
	return null
})

function asArray<T = any>(v: any): T[] {
	return Array.isArray(v) ? v : []
}

function labelOrId(v: any) {
	if (!v) return "—"
	if (typeof v === "string") return v
	return v?.nombreCandidato ?? v?.name ?? v?.idCandidato ?? v?.id ?? "—"
}
</script>

<template>
	<div class="space-y-4">
		<!-- tabs -->
		<div class="flex flex-wrap gap-2">
			<button
				v-for="t in availableTabs"
				:key="t"
				class="rounded-lg border px-3 py-2 text-sm"
				:class="tab === t ? 'bg-slate-900 text-white border-slate-900' : 'hover:bg-brand-gray'"
				type="button"
				@click="tab = t"
			>
				{{ t }}
			</button>
		</div>

		<!-- Resumen -->
		<div v-if="tab === 'Resumen'" class="space-y-4">
			<div class="grid gap-4 md:grid-cols-3">
				<div class="rounded-xl border p-4">
					<div class="text-xs text-slate-500">Candidatos</div>
					<div class="text-2xl font-semibold mt-1">{{ candidateCount }}</div>
				</div>
				<div class="rounded-xl border p-4" v-if="ranking">
					<div class="text-xs text-slate-500">Shortlisted</div>
					<div class="text-2xl font-semibold mt-1">{{ shortlistedCount }}</div>
				</div>
				<div class="rounded-xl border p-4" v-if="topCandidate">
					<div class="text-xs text-slate-500">Top candidato</div>
					<div class="mt-1 font-semibold">{{ topCandidate.nombreCandidato ?? topCandidate.name ?? "—" }}</div>
					<div class="text-sm text-slate-600">
						Score: {{ topCandidate.puntajeAjusteGlobal ?? topCandidate.score ?? "—" }}
					</div>
				</div>
			</div>

			<div v-if="resumenEjecutivo" class="rounded-xl border bg-slate-50 p-4">
				<div class="text-sm font-semibold mb-2">Resumen ejecutivo</div>
				<p class="text-sm text-slate-700 whitespace-pre-line">
					{{ replaceIdsInText(comparacion.resumenEjecutivo) }}
				</p>
			</div>

			<div v-else class="text-sm text-slate-600">
				No hay “resumen ejecutivo” en este tipo de reporte.
			</div>
		</div>

		<!-- Comparación -->
		<div v-else-if="tab === 'Comparación'">
			<ComparacionCandidatos
				v-if="comparacion"
				:comparacion="comparacion"
				:replace-ids-in-text="replaceIdsInText"
			/>
			<div v-else class="text-sm text-slate-600">
				Este reporte no incluye comparación de candidatos.
			</div>
		</div>

		<!-- Ranking -->
		<div v-else-if="tab === 'Ranking'">
			<div v-if="ranking" class="overflow-auto rounded-xl border">
				<RankingTable v-if="ranking" :rows="ranking" />
			</div>

			<div v-else class="text-sm text-slate-600">
				Este tipo de reporte no incluye ranking.
			</div>
		</div>

		<!-- Candidatos -->
		<div v-else-if="tab === 'Candidatos'">
			<div v-if="resultados?.length" class="space-y-3">
				<CandidateAccordion :result="props.result" />
			</div>
			<div v-else class="text-sm text-slate-600">
				No hay resultados detallados por candidato.
			</div>
		</div>

		<!-- Extras -->
		<div v-else-if="tab === 'Extras'" class="space-y-4">
			<div v-if="props.result?.escalaInterpretacion" class="rounded-xl border p-4">
				<div class="font-semibold mb-2">Escala de interpretación</div>
				<div class="text-sm text-slate-700 mb-3">
					{{ props.result.escalaInterpretacion.descripcion }}
				</div>
				<div class="grid gap-2">
					<div
						v-for="(v, k) in props.result.escalaInterpretacion.rangos"
						:key="k"
						class="rounded-lg bg-slate-50 p-3 text-sm"
					>
						<div class="font-semibold">{{ k }}</div>
						<div class="text-slate-700">{{ v }}</div>
					</div>
				</div>
			</div>

			<div v-if="Array.isArray(props.result?.criteriosShortlistBase)" class="rounded-xl border p-4">
				<div class="font-semibold mb-2">Criterios base de shortlist</div>
				<ul class="list-disc pl-5 text-sm text-slate-700 space-y-1">
					<li v-for="(c, idx) in props.result.criteriosShortlistBase" :key="idx">{{ c }}</li>
				</ul>
			</div>

			<div v-if="!props.result?.escalaInterpretacion && !props.result?.criteriosShortlistBase" class="text-sm text-slate-600">
				No hay bloques adicionales en este reporte.
			</div>
		</div>

		<!-- JSON -->
		<div v-else class="rounded-xl border bg-slate-50 p-4">
			<pre class="text-xs overflow-auto max-h-[520px]">{{ JSON.stringify(props.result, null, 2) }}</pre>
		</div>
	</div>
</template>
