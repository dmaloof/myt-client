<script setup lang="ts">
type AnyObj = Record<string, any>

const props = defineProps<{
	result: any
	forceOpenAll?: boolean
	replaceIdsInText?: (t: any) => any
}>()

const rankingById = computed(() => {
	const arr = Array.isArray(props.result?.resultadosRanking) ? props.result.resultadosRanking : []
	const map = new Map<string, any>()
	for (const r of arr) map.set(r.idCandidato, r)
	return map
})

const resultados = computed(() => (Array.isArray(props.result?.resultados) ? props.result.resultados : []))

const openId = ref<string | null>(resultados.value[0]?.idCandidato ?? null)

function pillClass(v?: string) {
	const s = (v || "").toUpperCase()
	if (s === "ALTO") return "bg-emerald-50 text-emerald-800 border-emerald-200"
	if (s === "MEDIO") return "bg-amber-50 text-amber-900 border-amber-200"
	if (s === "BAJO") return "bg-rose-50 text-rose-800 border-rose-200"
	return "bg-slate-50 text-slate-700 border-slate-200"
}

function isOpen(id: string) {
	return props.forceOpenAll ? true : openId.value === id
}

function toggle(id: string) {
	if (props.forceOpenAll) return
	openId.value = openId.value === id ? null : id
}

function t(v: any) {
	if (v == null) return v
	return props.replaceIdsInText ? props.replaceIdsInText(v) : v
}

function tArr(v: any) {
	if (!Array.isArray(v)) return []
	return props.replaceIdsInText ? v.map((x) => (typeof x === "string" ? props.replaceIdsInText!(x) : x)) : v
}

function candidateDisplayName(c: AnyObj) {
	const name = c.nombreCandidato ?? rankingById.value.get(c.idCandidato)?.nombreCandidato ?? c.idCandidato
	return t(name)
}
</script>

<template>
	<div class="space-y-3">
		<div v-for="(c, i) in resultados" :key="c.idCandidato"
		     class="rounded-xl border overflow-hidden"
		     :class="{ 'print-break-after': i !== resultados.length - 1 }">
			<!-- header -->
			<button
				type="button"
				class="w-full text-left p-4 hover:bg-brand-gray/50 flex items-start justify-between gap-4"
				:class="forceOpenAll ? 'cursor-default' : ''"
				@click="toggle(c.idCandidato)"
			>
				<div class="min-w-0">
					<div class="font-semibold truncate">
						{{ candidateDisplayName(c) }}
					</div>

					<div class="text-sm text-slate-600 mt-1 flex flex-wrap gap-2">
						<span v-if="rankingById.get(c.idCandidato)?.puntajeAjusteGlobal != null" class="tabular-nums">
							Score: {{ rankingById.get(c.idCandidato).puntajeAjusteGlobal }}
						</span>

						<span
							v-if="c.nivelRecomendacion || rankingById.get(c.idCandidato)?.nivelRecomendacion"
							class="inline-flex items-center rounded-full border px-2 py-1 text-xs"
							:class="pillClass(c.nivelRecomendacion ?? rankingById.get(c.idCandidato)?.nivelRecomendacion)"
						>
							Recomendación:
							{{ String(c.nivelRecomendacion ?? rankingById.get(c.idCandidato)?.nivelRecomendacion).toUpperCase() }}
						</span>

						<span
							v-if="rankingById.get(c.idCandidato)"
							class="inline-flex items-center rounded-full border px-2 py-1 text-xs"
							:class="
								rankingById.get(c.idCandidato).shortlisted
									? 'bg-emerald-50 text-emerald-800 border-emerald-200'
									: 'bg-slate-50 text-slate-700 border-slate-200'
							"
						>
							{{ rankingById.get(c.idCandidato).shortlisted ? "Shortlisted" : "No shortlist" }}
						</span>
					</div>
				</div>

				<!-- Hide/View only for interactive mode -->
				<div v-if="!forceOpenAll" class="text-slate-500 text-sm">
					{{ isOpen(c.idCandidato) ? "Hide" : "View" }}
				</div>
			</button>

			<!-- body -->
			<div v-if="isOpen(c.idCandidato)" class="p-4 space-y-4 bg-white">
				<!-- strengths / risks -->
				<div
					v-if="Array.isArray(c.fortalezasClaves) || Array.isArray(c.riesgosOGaps)"
					class="grid gap-4 md:grid-cols-2"
				>
					<div class="rounded-xl bg-slate-50 p-4" v-if="Array.isArray(c.fortalezasClaves)">
						<div class="font-semibold text-sm mb-2">Fortalezas</div>
						<div class="flex flex-wrap gap-2">
							<span
								v-for="(x, i) in tArr(c.fortalezasClaves)"
								:key="i"
								class="text-xs rounded-lg border bg-white px-2 py-2"
							>
								{{ x }}
							</span>
						</div>
					</div>

					<div class="rounded-xl bg-slate-50 p-4" v-if="Array.isArray(c.riesgosOGaps)">
						<div class="font-semibold text-sm mb-2">Riesgos / Gaps</div>
						<div class="flex flex-wrap gap-2">
							<span
								v-for="(x, i) in tArr(c.riesgosOGaps)"
								:key="i"
								class="text-xs rounded-lg border bg-white px-2 py-2"
							>
								{{ x }}
							</span>
						</div>
					</div>
				</div>

				<!-- final rec -->
				<div v-if="c.recomendacionFinal" class="rounded-xl border p-4">
					<div class="font-semibold text-sm mb-2">Recomendación final</div>
					<p class="text-sm text-slate-700 whitespace-pre-line">{{ t(c.recomendacionFinal) }}</p>
				</div>

				<!-- narrative blocks -->
				<div class="grid gap-4 md:grid-cols-2">
					<div class="rounded-xl border p-4" v-if="c.ajusteFormacion">
						<div class="font-semibold text-sm mb-2">Formación</div>
						<p class="text-sm text-slate-700 whitespace-pre-line">{{ t(c.ajusteFormacion) }}</p>
					</div>

					<div class="rounded-xl border p-4" v-if="c.ajusteExperiencia">
						<div class="font-semibold text-sm mb-2">Experiencia</div>
						<p class="text-sm text-slate-700 whitespace-pre-line">{{ t(c.ajusteExperiencia) }}</p>
					</div>

					<div class="rounded-xl border p-4" v-if="c.ajusteCompetenciasTecnicas">
						<div class="font-semibold text-sm mb-2">Competencias técnicas</div>
						<p class="text-sm text-slate-700 whitespace-pre-line">{{ t(c.ajusteCompetenciasTecnicas) }}</p>
					</div>

					<div class="rounded-xl border p-4" v-if="c.ajusteCompetenciasConductuales">
						<div class="font-semibold text-sm mb-2">Competencias conductuales</div>
						<p class="text-sm text-slate-700 whitespace-pre-line">{{ t(c.ajusteCompetenciasConductuales) }}</p>
					</div>

					<div class="rounded-xl border p-4" v-if="c.ajusteIdiomas">
						<div class="font-semibold text-sm mb-2">Idiomas</div>
						<p class="text-sm text-slate-700 whitespace-pre-line">{{ t(c.ajusteIdiomas) }}</p>
					</div>

					<div class="rounded-xl border p-4" v-if="c.comentariosAjusteCultural || c.ajusteCultural">
						<div class="font-semibold text-sm mb-2">Cultura</div>
						<p class="text-sm text-slate-700 whitespace-pre-line">
							<span v-if="c.ajusteCultural" class="font-semibold">{{ t(c.ajusteCultural) }}</span>
							<span v-if="c.ajusteCultural && c.comentariosAjusteCultural">: </span>
							{{ t(c.comentariosAjusteCultural ?? "") }}
						</p>
					</div>
				</div>

				<!-- extras -->
				<div class="grid gap-4 md:grid-cols-2">
					<div class="rounded-xl bg-slate-50 p-4" v-if="c.proyeccionDesarrollo || c.comentariosProyeccionDesarrollo">
						<div class="font-semibold text-sm mb-2">Proyección de desarrollo</div>
						<p class="text-sm text-slate-700 whitespace-pre-line">
							<span v-if="c.proyeccionDesarrollo" class="font-semibold">{{ t(c.proyeccionDesarrollo) }}</span>
							<span v-if="c.proyeccionDesarrollo && c.comentariosProyeccionDesarrollo">: </span>
							{{ t(c.comentariosProyeccionDesarrollo ?? "") }}
						</p>
					</div>

					<div class="rounded-xl bg-slate-50 p-4" v-if="c.riesgoRotacion || c.motivoRiesgoRotacion">
						<div class="font-semibold text-sm mb-2">Riesgo de rotación</div>
						<p class="text-sm text-slate-700 whitespace-pre-line">
							<span v-if="c.riesgoRotacion" class="font-semibold">{{ t(c.riesgoRotacion) }}</span>
							<span v-if="c.riesgoRotacion && c.motivoRiesgoRotacion">: </span>
							{{ t(c.motivoRiesgoRotacion ?? "") }}
						</p>
					</div>
				</div>

				<!-- Notes -->
				<details class="rounded-xl border p-4" :open="forceOpenAll ? true : undefined">
					<summary class="cursor-pointer text-sm font-semibold">
						Notas (pruebas / entrevista / inconsistencias)
					</summary>

					<div class="mt-3 space-y-3">
						<div v-if="c.comentariosSobrePruebas">
							<div class="text-xs font-semibold text-slate-500">Pruebas</div>
							<p class="text-sm text-slate-700 whitespace-pre-line">{{ t(c.comentariosSobrePruebas) }}</p>
						</div>

						<div v-if="c.comentariosSobreEntrevista">
							<div class="text-xs font-semibold text-slate-500">Entrevista</div>
							<p class="text-sm text-slate-700 whitespace-pre-line">{{ t(c.comentariosSobreEntrevista) }}</p>
						</div>

						<div v-if="Array.isArray(c.inconsistenciasDetectadas) && c.inconsistenciasDetectadas.length">
							<div class="text-xs font-semibold text-slate-500">Inconsistencias</div>
							<ul class="list-disc pl-5 text-sm text-slate-700">
								<li v-for="(x, i) in tArr(c.inconsistenciasDetectadas)" :key="i">{{ x }}</li>
							</ul>
						</div>
					</div>
				</details>
			</div>
		</div>
	</div>
</template>
