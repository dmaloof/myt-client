<script setup lang="ts">
import { computed, watch } from "vue"

type Service = "RANKING" | "CANDIDATE" | "FULL_REPORT"
type ReportMode = "LIGHT" | "EXECUTIVE"

const props = defineProps<{
	config: {
		service: Service
		reportMode: ReportMode
		ponderaciones: { cv: number; pruebas: number; entrevista: number }
	}
	anyCvPresent: boolean
	anyInterviewPresent: boolean
}>()

const SERVICE: readonly Service[] = ["RANKING", "CANDIDATE", "FULL_REPORT"] as const
const REPORT_MODE: readonly ReportMode[] = ["LIGHT", "EXECUTIVE"] as const

const sum = computed(() =>
	(props.config.ponderaciones.cv ?? 0) +
	(props.config.ponderaciones.pruebas ?? 0) +
	(props.config.ponderaciones.entrevista ?? 0)
)

// enforce cv/interview rules + keep sum=10
watch(
	() => [props.anyCvPresent, props.anyInterviewPresent],
	() => {
		if (!props.anyCvPresent) props.config.ponderaciones.cv = 0
		if (!props.anyInterviewPresent) props.config.ponderaciones.entrevista = 0

		const fixed = 10 - (props.config.ponderaciones.cv + props.config.ponderaciones.entrevista)
		props.config.ponderaciones.pruebas = Math.max(1, Math.min(10, fixed))
	},
	{ immediate: true }
)

// also keep sum=10 whenever any number changes (user edits)
watch(
	() => ({ ...props.config.ponderaciones }),
	() => {
		if (!props.anyCvPresent) props.config.ponderaciones.cv = 0
		if (!props.anyInterviewPresent) props.config.ponderaciones.entrevista = 0

		const fixed = 10 - (props.config.ponderaciones.cv + props.config.ponderaciones.entrevista)
		props.config.ponderaciones.pruebas = Math.max(1, Math.min(10, fixed))
	},
	{ deep: true }
)
</script>

<template>
	<div class="space-y-6">
		<div class="rounded-2xl border border-slate-900 p-5 text-sm text-slate-600">
			<div class="font-semibold text-slate-900">Servicios</div>
			<div class="mt-2 list-inside list-disc space-y-3">
				<pre>RANKING (max 10 candidatos)</pre> Compara varios candidatos y devuelve un ranking ordenado con fortalezas/debilidades clave. Ideal para “shortlist” rápida.
				<pre>CANDIDATE (max 10 candidatos)</pre>
					Genera el informe de uno o varios candidatos (sin ranking) individualmente. Útil cuando ya elegiste a alguien y quieres un análisis más profundo.
				<pre>FULL_REPORT (max 5 candidatos)</pre>
					Incluye ranking + informes detallados por candidato, con interpretación completa y recomendaciones. Es la opción más completa para decisiones finales.
			</div>
			<div class="font-semibold text-slate-900 mt-5">Tipos de reporte
				<span class="text-xs font-thin">(Aplica solo para <em>CANDIDATE</em> y <em>FULL_REPORT)</em></span>
			</div>
			<div class="mt-2 list-inside list-disc space-y-3">
				<pre>LIGHT</pre>
				Más corto y directo: puntos clave, alertas y conclusiones. Menor costo/tiempo, ideal para revisión inicial.

				<pre>EXECUTIVE</pre>
				Más profundo y narrativo: mayor contexto, detalle y justificación. Útil para presentar a líderes o para decisiones críticas.
			</div>

		</div>

		<div class="rounded-2xl border border-slate-900 p-5">
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<label class="text-sm font-medium">Servicio</label>
					<select v-model="props.config.service" class="mt-1 w-full rounded-lg border px-3 py-2">
						<option v-for="s in SERVICE" :key="s" :value="s">{{ s }}</option>
					</select>
				</div>

				<div v-if="props.config.service !== 'RANKING'">
					<label class="text-sm font-medium">Tipo de reporte</label>
					<select v-model="props.config.reportMode" class="mt-1 w-full rounded-lg border px-3 py-2">
						<option v-for="m in REPORT_MODE" :key="m" :value="m">{{ m }}</option>
					</select>
				</div>

				<div class="md:col-span-2">
					<div class="mb-2 text-sm font-semibold">Ponderaciones (la suma debe dar 10)</div>

					<div class="grid gap-4 md:grid-cols-3">

						<div>
							<label class="text-sm font-medium">Pruebas</label>
							<input
								v-model.number="props.config.ponderaciones.pruebas"
								type="number"
								min="1"
								max="10"
								class="mt-1 w-full rounded-lg border px-3 py-2"
							/>
							<div class="mt-1 text-xs text-slate-500">Valor entre 1..10</div>
						</div>

						<div>
							<label class="text-sm font-medium">CV</label>
							<input
								v-model.number="props.config.ponderaciones.cv"
								type="number"
								min="0"
								max="10"
								class="mt-1 w-full rounded-lg border px-3 py-2"
								:disabled="!props.anyCvPresent"
							/>
							<div v-if="!props.anyCvPresent" class="mt-1 text-xs text-slate-500">
								CV candidato deshabilitada
							</div>
							<div v-else class="mt-1 text-xs text-slate-500">
								Valor entre 1..10
							</div>
						</div>

						<div>
							<label class="text-sm font-medium">Entrevista</label>
							<input
								v-model.number="props.config.ponderaciones.entrevista"
								type="number"
								min="0"
								max="10"
								class="mt-1 w-full rounded-lg border px-3 py-2"
								:disabled="!props.anyInterviewPresent"
							/>
							<div v-if="!props.anyInterviewPresent" class="mt-1 text-xs text-slate-500">
								Entrevista candidato deshabilitada
							</div>
							<div v-else class="mt-1 text-xs text-slate-500">
								Valor entre 1..10
							</div>
						</div>
					</div>

					<div class="mt-4 rounded-lg border py-2 text-sm">
						Total:
						<span class="font-semibold" :class="sum === 10 ? 'text-emerald-700' : 'text-red-700'">{{ sum }}</span>
						<span class="text-slate-500"> / 10</span>
					</div>
				</div>
				<div class="rounded-2xl py-5 text-sm text-slate-600">
					<div class="font-semibold text-slate-900">Reglas</div>
					<ul class="mt-2 list-inside list-disc space-y-1">
						<li>cv=0 cuando <em>CV</em> no está presente en ningún candidato</li>
						<li>entrevista=0  <em>entrevista</em> no está presente en ningún candidato</li>
						<li><em>pruebas</em> se auto ajusta para que la suma de 10</li>
					</ul>
				</div>
			</div>
		</div>


	</div>
</template>
