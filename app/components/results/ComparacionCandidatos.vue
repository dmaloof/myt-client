<script setup lang="ts">
type AnyObj = Record<string, any>

const props = defineProps<{
	comparacion: AnyObj
	replaceIdsInText?: (text: any) => any
}>()

function asArray<T = any>(v: any): T[] {
	return Array.isArray(v) ? v : []
}

function t(v: any) {
	if (!props.replaceIdsInText) return v
	return props.replaceIdsInText(v)
}

function tArr(arr: any) {
	const a = asArray(arr)
	return props.replaceIdsInText ? a.map((x) => (typeof x === "string" ? props.replaceIdsInText!(x) : x)) : a
}
</script>

<template>
	<div class="space-y-4">
		<!-- Resumen -->
		<div v-if="comparacion?.resumenEjecutivo" class="rounded-xl border bg-slate-50 p-4">
			<div class="text-sm font-semibold mb-2">Resumen ejecutivo</div>
			<p class="text-sm text-slate-700 whitespace-pre-line">{{ t(comparacion.resumenEjecutivo) }}</p>
		</div>

		<!-- Top recomendación -->
		<div v-if="comparacion?.top2_3Recomendacion" class="rounded-xl border p-4 space-y-3">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<div class="text-sm font-semibold">Top recomendación</div>
				<div class="flex flex-wrap gap-2">
          <span
	          v-for="c in asArray(comparacion.top2_3Recomendacion.candidatos)"
	          :key="c"
	          class="rounded-full border px-3 py-1 text-xs"
          >
            {{ t(c) }}
          </span>
				</div>
			</div>

			<div v-if="comparacion.top2_3Recomendacion.rationale" class="text-sm text-slate-700 whitespace-pre-line">
				{{ t(comparacion.top2_3Recomendacion.rationale) }}
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<div class="rounded-xl border p-4">
					<div class="text-xs font-semibold text-slate-600 mb-2">Riesgos clave</div>
					<ul class="list-disc pl-5 text-sm text-slate-700 space-y-1">
						<li v-for="(r, i) in tArr(comparacion.top2_3Recomendacion.riesgosClave)" :key="i">{{ r }}</li>
					</ul>
					<div v-if="!asArray(comparacion.top2_3Recomendacion.riesgosClave).length" class="text-sm text-slate-500">
						Sin riesgos listados.
					</div>
				</div>

				<div class="rounded-xl border p-4">
					<div class="text-xs font-semibold text-slate-600 mb-2">Condiciones de éxito</div>
					<ul class="list-disc pl-5 text-sm text-slate-700 space-y-1">
						<li v-for="(r, i) in tArr(comparacion.top2_3Recomendacion.condicionesDeExito)" :key="i">{{ r }}</li>
					</ul>
					<div v-if="!asArray(comparacion.top2_3Recomendacion.condicionesDeExito).length" class="text-sm text-slate-500">
						Sin condiciones listadas.
					</div>
				</div>
			</div>
		</div>

		<!-- Matriz comparativa -->
		<div v-if="asArray(comparacion?.matrizComparativa).length" class="space-y-3">
			<div class="text-sm font-semibold">Matriz comparativa</div>

			<details
				v-for="(row, i) in asArray(comparacion.matrizComparativa)"
				:key="i"
				class="rounded-xl border p-4 bg-slate-50"
				open
			>
				<summary class="cursor-pointer select-none flex flex-wrap items-center justify-between gap-2">
					<div class="font-semibold text-sm">{{ row.dimension ?? "Dimensión" }}</div>
					<span v-if="row.pesos" class="rounded-full border px-3 py-1 text-xs">
            {{ row.pesos }}
          </span>
				</summary>

				<div class="mt-4 space-y-3">
					<div
						v-for="(c, j) in asArray(row.comparacion)"
						:key="j"
						class="rounded-lg border p-4"
					>
						<div class="flex flex-wrap items-center justify-between gap-2">
							<div class="font-semibold text-sm">
								{{ t(c.idCandidato ?? c.nombreCandidato ?? `Candidato ${j + 1}`) }}
							</div>
							<span v-if="c.nivel" class="rounded-full border px-3 py-1 text-xs">{{ c.nivel }}</span>
						</div>

						<ul class="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
							<li v-for="(e, k) in tArr(c.evidencia)" :key="k">{{ e }}</li>
						</ul>

						<div v-if="!asArray(c.evidencia).length" class="mt-2 text-sm text-slate-500">
							Sin evidencia listada.
						</div>
					</div>

					<div v-if="row.implicacion" class="rounded-lg border bg-slate-50 p-4 text-sm text-slate-700">
						<span class="font-semibold">Implicación:</span> {{ t(row.implicacion) }}
					</div>
				</div>
			</details>
		</div>

		<!-- Diferenciadores / Riesgos / Escenarios -->
		<div
			v-if="asArray(comparacion?.diferenciadoresClave).length || asArray(comparacion?.riesgosComparativos).length || asArray(comparacion?.escenariosDeDecision).length"
			class="space-y-6"
		>
			<!-- Diferenciadores -->
			<section>
				<div class="text-sm font-semibold mb-2">Diferenciadores</div>
				<div class="rounded-xl border p-4">
					<div v-for="(d, i) in asArray(comparacion?.diferenciadoresClave)" :key="i" class="rounded-lg border p-3 mb-2 last:mb-0">
						<div class="text-xs text-slate-500">{{ d.tema ?? "Tema" }}</div>
						<div class="text-sm font-semibold">{{ t(d.ganador ?? "—") }}</div>
						<div v-if="d.porQue" class="text-sm text-slate-700 mt-1">{{ t(d.porQue) }}</div>
						<div v-if="d.tradeoff" class="text-xs text-slate-500 mt-2">Tradeoff: {{ t(d.tradeoff) }}</div>
					</div>
					<div v-if="!asArray(comparacion?.diferenciadoresClave).length" class="text-sm text-slate-500">Sin datos.</div>
				</div>
			</section>


			<!-- Riesgos comparativos -->
			<section>
				<div class="text-sm font-semibold mb-2">Riesgos comparativos</div>
				<div class="rounded-xl border p-4">
					<div v-for="(r, i) in asArray(comparacion?.riesgosComparativos)" :key="i" class="rounded-lg border p-3 mb-2 last:mb-0">
						<div class="text-sm font-semibold">{{ t(r.riesgo ?? "Riesgo") }}</div>

						<div v-if="asArray(r.candidatosMasExpuestos ?? r.expuestos).length" class="text-xs text-slate-500 mt-1">
							Expuestos:
							{{
								asArray(r.candidatosMasExpuestos ?? r.expuestos)
									.map((id: string) => t(id))
									.join(", ")
							}}
						</div>

						<div v-if="r.severidad" class="text-xs text-slate-500 mt-1">Severidad: {{ r.severidad }}</div>
						<div v-if="r.mitigacion" class="text-sm text-slate-700 mt-2">{{ t(r.mitigacion) }}</div>
					</div>
					<div v-if="!asArray(comparacion?.riesgosComparativos).length" class="text-sm text-slate-500">Sin datos.</div>
				</div>
			</section>


			<!-- Escenarios de decisión -->
			<section>
				<div class="text-sm font-semibold mb-2">Escenarios de decisión</div>
				<div class="rounded-xl border p-4">

					<div v-for="(s, i) in asArray(comparacion?.escenariosDeDecision)" :key="i" class="rounded-lg border p-3 mb-2 last:mb-0">
						<div class="text-sm font-semibold">{{ t(s.escenario ?? "Escenario") }}</div>
						<div v-if="s.mejorOpcion" class="text-xs text-slate-500 mt-1">Mejor opción: {{ t(s.mejorOpcion) }}</div>
						<div v-if="s.alternativa" class="text-xs text-slate-500 mt-1">Alternativa: {{ t(s.alternativa) }}</div>
						<div v-if="s.justificacion" class="text-sm text-slate-700 mt-2">{{ t(s.justificacion) }}</div>
					</div>
					<div v-if="!asArray(comparacion?.escenariosDeDecision).length" class="text-sm text-slate-500">Sin datos.</div>
				</div>
			</section>

		</div>

		<!-- Preguntas sugeridas -->
		<div v-if="asArray(comparacion?.preguntasSugeridasSiguienteEtapa).length" class="space-y-3">
			<div class="text-sm font-semibold">Preguntas sugeridas (siguiente etapa)</div>

			<details
				v-for="(p, i) in asArray(comparacion.preguntasSugeridasSiguienteEtapa)"
				:key="i"
				class="rounded-xl border p-4"
				open
			>
				<summary class="cursor-pointer select-none flex items-center justify-between">
					<div class="text-sm font-semibold">
						{{ t(p.idCandidato ?? `Candidato ${i + 1}`) }}
					</div>
				</summary>

				<ul class="mt-3 list-disc pl-5 text-sm text-slate-700 space-y-1">
					<li v-for="(q, qi) in tArr(p.preguntas)" :key="qi">{{ q }}</li>
				</ul>
			</details>
		</div>

		<!-- Recomendación final -->
		<div v-if="comparacion?.recomendacionEjecutivaFinal" class="rounded-xl border bg-slate-50 p-4">
			<div class="text-sm font-semibold mb-2">Recomendación ejecutiva final</div>
			<p class="text-sm text-slate-700 whitespace-pre-line">{{ t(comparacion.recomendacionEjecutivaFinal) }}</p>
		</div>

		<div v-if="!comparacion" class="text-sm text-slate-600">
			Este reporte no incluye comparación de candidatos.
		</div>
	</div>
</template>
