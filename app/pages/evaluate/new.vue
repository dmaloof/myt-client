<script setup lang="ts">
import { checkPromptInjection } from '~/utils/promptGuard'
import { TEST_SCHEMAS, getTestSchema, type TestName } from '~/data/testSchemas'

import PerfilForm from '~/components/evaluate/PerfilForm.vue'
import CulturaForm from '~/components/evaluate/CulturaForm.vue'
import CandidateForm from '~/components/evaluate/CandidateForm.vue'
import ConfigForm from '~/components/evaluate/ConfigForm.vue'
import { useJsonTemplateImporter } from '~/composables/useJsonTemplateImporter'
import { usePromptInjectionScan } from '~/composables/usePromptInjectionScan'


definePageMeta({ layout: 'default' })

const tabs = ['Configuración', 'Perfil', 'Cultura', 'Candidatos'] as const
type Tab = typeof tabs[number]
const tab = ref<Tab>('Configuración')

/** ------------ constants (dropdowns, chips) ------------ **/
const NIVEL_PROFESIONAL = ["No aplica", "Bachiller", "Técnico", "Tecnólogo", "Profesional", "Especialista", "Doctorado"] as const
const IDIOMAS = ["Inglés", "Chino Mandarín", "Francés", "Portugués", "Alemán", "Italiano", "otro"] as const
const MODALIDAD = ["Presencial", "Remoto", "Híbrido"] as const
const SENIORITY = ["Junior", "Semi-Senior", "Senior", "Liderazgo"] as const

const CULT_ESTILO_TRABAJO = ["COLABORATIVO", "AUTONOMO", "ORIENTADO AL LOGRO", "ORIENTADO AL PROCESO", "MIXTO"] as const
const CULT_RITMO = ["RAPIDO", "MODERADO", "ESTABLE", "VARIABLE"] as const
const CULT_TOL_ERR = ["ALTA", "MEDIA", "BAJA"] as const
const CULT_ESTILO_LIDERAZGO = ["PARTICIPATIVO", "COACHING", "DIRECTIVO", "ORIENTADO A RESULTADOS", "SERVICIAL"] as const
const CULT_NIVEL_ESTRUCTURA = ["ALTA", "MEDIA", "BAJA"] as const

const SERVICE = ["FULL_REPORT", "CANDIDATE", "RANKING"] as const
const REPORT_MODE = ["EXECUTIVE", "LIGHT"] as const

const DEFAULT_TEST_NAME = "" as TestName

/** ------------ state ------------ **/
const form = reactive({
	perfil: {
		cargo: '',
		descripcion: '',
		funciones: [''],
		requisitos: {
			formacion: {
				nivelProfesional: 'No aplica',
				carrerasAfines: '',
				idiomas: [] as string[],
				conocimientosEspecificos: '',
			},
			experienciaLaboral: {
				tiempo: 0,
				areas: '',
			},
		},
		competencias: {
			tecnicas: [''],
			conductuales: [{ competencia: '', nivel: 'Medio' }],
		},
		identificacionDelCargo: {
			personalACargo: false,
			modalidad: 'Presencial',
			disponibilidadViajes: false,
		},
		nivelSeniority: null as null | string,
	},

	cultura: {
		enabled: false,
		valores: [''],
		estiloTrabajo: 'COLABORATIVO',
		ritmo: 'MODERADO',
		toleranciaAlError: 'MEDIA',
		comportamientosDeseados: [''],
		comportamientosNoAceptados: [''],
		estiloLiderazgo: 'PARTICIPATIVO',
		nivelEstructura: 'MEDIA',
	},

	candidatos: [
		{
			nombre: '',
			cvEnabled: false,
			cv: {
				perfil: '',
				aspiracionSalarial: 0,
				fechaNacimiento: '',
				profesion: '',
				nivelEducativo: 'No aplica',
				experienciaLaboral: [{ empresa: '', cargo: '', area: '', funciones: '', fechaInicio: '', fechaFin: '' }],
				formacionAcademica: [{ institucion: '', carrera: '', nivel: 'Bachiller', estado: 'Terminado', fechaInicio: '' }],
				idiomas: [],
			},
			resultadosPruebas: [{ name: DEFAULT_TEST_NAME, scores: {} as any }],
			entrevistaEnabled: false,
			resultadoEntrevista: {
				preguntas: [{ pregunta: '', respuesta: '', calificacion: 5, concepto: '' }],
				calificacion: 5,
				concepto: '',
			},
		},
	],

	config: {
		service: 'RANKING' as 'FULL_REPORT' | 'CANDIDATE' | 'RANKING',
		reportMode: 'EXECUTIVE' as 'EXECUTIVE' | 'LIGHT',
		ponderaciones: { cv: 0, pruebas: 10, entrevista: 0 },
	},
})

/** ------------ prompt injection guard ------------ **/
type GuardIssue = { path: string; hits: ReturnType<typeof checkPromptInjection> }
const guardIssues = ref<GuardIssue[]>([])

const { scanFreeText } = usePromptInjectionScan(form)

/** ------------ config logic ------------ **/
const anyCvPresent = computed(() => form.candidatos.some(c => c.cvEnabled))
const anyInterviewPresent = computed(() => form.candidatos.some(c => c.entrevistaEnabled))

watch([anyCvPresent, anyInterviewPresent], () => {
	if (!anyCvPresent.value) form.config.ponderaciones.cv = 0
	if (!anyInterviewPresent.value) form.config.ponderaciones.entrevista = 0

	const sum = form.config.ponderaciones.cv + form.config.ponderaciones.pruebas + form.config.ponderaciones.entrevista
	if (sum !== 10) {
		const fixed = 10 - (form.config.ponderaciones.cv + form.config.ponderaciones.entrevista)
		form.config.ponderaciones.pruebas = Math.max(1, Math.min(10, fixed))
	}
})

const ponderacionesSum = computed(() =>
	form.config.ponderaciones.cv + form.config.ponderaciones.pruebas + form.config.ponderaciones.entrevista
)

/**------------- JSON import Helpers ------------**/
const fileInput = ref<HTMLInputElement | null>(null)

const { onImportFile } = useJsonTemplateImporter({
	form,
	scanFreeText,
	setGuardIssues: (issues) => (guardIssues.value = issues),
	setSubmitError: (msg) => (submitError.value = msg),
})

/** ------------ payload builder ------------ **/
function buildPayload() {
	const tiempoAnios = `${form.perfil.requisitos.experienciaLaboral.tiempo} años`

	return {
		perfil: {
			...form.perfil,
			requisitos: {
				...form.perfil.requisitos,
				experienciaLaboral: {
					...form.perfil.requisitos.experienciaLaboral,
					tiempo: tiempoAnios,
				},
			},
		},
		cultura: form.cultura.enabled
			? {
				valores: form.cultura.valores.filter(Boolean),
				estiloTrabajo: form.cultura.estiloTrabajo,
				ritmo: form.cultura.ritmo,
				toleranciaAlError: form.cultura.toleranciaAlError,
				comportamientosDeseados: form.cultura.comportamientosDeseados.filter(Boolean),
				comportamientosNoAceptados: form.cultura.comportamientosNoAceptados.filter(Boolean),
				estiloLiderazgo: form.cultura.estiloLiderazgo,
				nivelEstructura: form.cultura.nivelEstructura,
			}
			: undefined,
		candidatos: form.candidatos.map((c) => ({
			nombre: c.nombre,
			cv: c.cvEnabled ? c.cv : undefined,
			resultadosPruebas: c.resultadosPruebas.map((rp) => ({ name: rp.name, scores: rp.scores })),
			resultadoEntrevista: c.entrevistaEnabled ? c.resultadoEntrevista : undefined,
		})),
		config: {
			service: form.config.service,
			reportMode: form.config.service === 'RANKING' ? null : form.config.reportMode,
			ponderaciones: {
				cv: anyCvPresent.value ? form.config.ponderaciones.cv : 0,
				pruebas: form.config.ponderaciones.pruebas,
				entrevista: anyInterviewPresent.value ? form.config.ponderaciones.entrevista : 0,
			},
		},
	}
}

/** ------------ token calculator ------------ **/
const candidateCount = computed(() => form.candidatos.length)
const overLimit = computed(() => candidateCount.value > (form.config.service === "FULL_REPORT" ? 5 : 10))


const perCandidateRate = computed(() => {
	const service = form.config.service

	if (service === "RANKING") return 0.5

	const mode = form.config.reportMode // "EXECUTIVE" | "LIGHT"
	if (service === "CANDIDATE") return mode === "EXECUTIVE" ? 1.2 : 1.0
	if (service === "FULL_REPORT") return mode === "EXECUTIVE" ? 2.0 : 1.5

	return 0
})

const estimatedCostTokens = computed(() => {
	const total = perCandidateRate.value * candidateCount.value
	// keep 0.5 increments clean (since RANKING uses halves)
	return Math.round(total * 2) / 2
})


/** ------------ submit ------------ **/
const submitting = ref(false)
const submitError = ref<string | null>(null)

async function onSubmit() {
	submitError.value = null

	guardIssues.value = scanFreeText()
	if (guardIssues.value.length) {
		submitError.value = 'Algunos textos parecen inseguros (posiblemente prompt injection). Por favor, revisar campos señalados.'
		tab.value = 'Perfil'
		return
	}

	if (ponderacionesSum.value !== 10) {
		submitError.value = 'Ponderaciones debe sumar 10.'
		tab.value = 'Configuración'
		return
	}

	if (!form.perfil.cargo.trim()) {
		submitError.value = 'perfil.cargo es obligatorio.'
		tab.value = 'Perfil'
		return
	}
	if (!form.candidatos.length || !form.candidatos[0]?.nombre.trim()) {
		submitError.value = 'Al menos debe haber un candidato con nombre.'
		tab.value = 'Candidatos'
		return
	}

	const payload = buildPayload()

	submitting.value = true
	try {
		const res = await $fetch('/api/evaluate', { method: 'POST', body: { payload } })
		await navigateTo(`/evaluate/${(res as any).jobId}`)
	} catch (e: any) {
		submitError.value = e?.data?.message ?? e?.message ?? 'Falló al enviar la evaluación.'
	} finally {
		submitting.value = false
	}
}

function addCandidate() {
	if (form.candidatos.length >= candidateLimit.value) return
	const clone = JSON.parse(JSON.stringify(form.candidatos[0]))
	clone.resultadosPruebas = [{ name: DEFAULT_TEST_NAME, scores: {} }]
	form.candidatos.push(clone)
}

function removeCandidate(idx: number) {
	if (form.candidatos.length <= 1) return
	form.candidatos.splice(idx, 1)
}

function addTest(ci: number) {
	form.candidatos[ci]?.resultadosPruebas.push({ name: DEFAULT_TEST_NAME, scores: {} })
}

function removeTest(ci: number, ti: number) {
	form.candidatos[ci]?.resultadosPruebas.splice(ti, 1)
}

/** ------------ collapsible candidates ------------ **/
const openCandidates = ref<Set<number>>(new Set([0]))
const candidateLimit = computed(() => (form.config.service === 'FULL_REPORT' ? 5 : 10))

function isOpenCandidate(idx: number) {
	return openCandidates.value.has(idx)
}

function toggleCandidate(idx: number) {
	const s = new Set(openCandidates.value)
	if (s.has(idx)) s.delete(idx)
	else s.add(idx)
	openCandidates.value = s
}

function openAllCandidates() {
	openCandidates.value = new Set(form.candidatos.map((_, i) => i))
	openCandidates.value = new Set(form.candidatos.map((_, i) => i))
}

function closeAllCandidates() {
	openCandidates.value = new Set()
}

watch(
	() => form.candidatos.length,
	(len) => {
		const s = new Set<number>()
		for (const i of openCandidates.value) if (i >= 0 && i < len) s.add(i)
		if (s.size === 0 && len > 0) s.add(0)
		openCandidates.value = s
	}
)

function schemaFor(name: TestName) {
	return getTestSchema(name)!
}

watch(
	() => form.config.service,
	() => {
		// Trim candidates if the user switches to FULL_REPORT (limit 5)
		if (form.candidatos.length > candidateLimit.value) {
			form.candidatos.splice(candidateLimit.value)
		}

		// Keep collapsible state consistent
		openCandidates.value = new Set([...openCandidates.value].filter((i) => i < form.candidatos.length))
		if (openCandidates.value.size === 0 && form.candidatos.length > 0) openCandidates.value = new Set([0])
	},
	{ immediate: true }
)
</script>

<template>
	<div class="mx-auto w-full max-w-6xl p-6">
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-2xl font-semibold">Nueva Evaluación</h1>

			<div class="flex items-center gap-3">
				<button class="rounded-lg border border-slate-900 px-4 py-2" type="button" @click="fileInput?.click()">
					Importar JSON
				</button>

				<button class="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-60" :disabled="submitting" @click="onSubmit">
					{{ submitting ? 'Enviando…' : 'Enviar' }}
				</button>
			</div>
		</div>

		<div v-if="submitError" class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
			{{ submitError }}
			<div v-if="guardIssues.length" class="mt-2 text-xs text-red-700">
				<div class="font-semibold">Flagged fields:</div>
				<ul class="list-inside list-disc">
					<li v-for="(g, i) in guardIssues" :key="i">
						{{ g.path }} ({{ g.hits[0]?.reason }})
					</li>
				</ul>
			</div>
		</div>

		<input ref="fileInput" type="file" accept="application/json" class="hidden" @change="onImportFile" />

		<!-- tabs -->
		<div class="mb-6 flex flex-wrap gap-2">
			<button
				v-for="t in tabs"
				:key="t"
				class="rounded-full border px-4 py-2 text-sm"
				:class="t === tab ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700'"
				@click="tab = t"
			>
				{{ t }}
			</button>
		</div>

		<!-- sticky token calculator -->
		<div class="sticky top-3 z-10 mb-5">
			<div class="rounded-2xl border bg-white/90 backdrop-blur p-4 shadow-sm">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div>
						<div class="text-xs text-slate-500">Costo estimado</div>
						<div class="text-lg font-semibold">
							{{ estimatedCostTokens }}
							<span class="text-sm font-normal text-slate-600">tokens</span>
							<span class="mx-2 text-slate-300">•</span>
							<span class="text-sm font-normal text-slate-700">
            {{ candidateCount }} candidato(s) × {{ perCandidateRate }} / candidato
          </span>
						</div>
					</div>

					<div class="text-xs text-slate-500">
						Se actualiza automáticamente. Cobro real al enviar.
					</div>
				</div>
			</div>
		</div>
		<div v-if="overLimit" class="text-sm font-semibold text-red-700">
			Límite excedido para {{ form.config.service }}.
		</div>

		<!-- PERFIL -->
		<div v-if="tab === 'Perfil'">
			<PerfilForm
				:perfil="form.perfil"
				:nivelProfesional="NIVEL_PROFESIONAL"
				:idiomas="IDIOMAS"
				:modalidad="MODALIDAD"
				:seniority="SENIORITY"
			/>
		</div>

		<!-- CULTURA -->
		<div v-else-if="tab === 'Cultura'">
			<CulturaForm
				:cultura="form.cultura"
				:estiloTrabajo="CULT_ESTILO_TRABAJO"
				:ritmo="CULT_RITMO"
				:toleranciaError="CULT_TOL_ERR"
				:estiloLiderazgo="CULT_ESTILO_LIDERAZGO"
				:nivelEstructura="CULT_NIVEL_ESTRUCTURA"
			/>
		</div>

		<!-- CANDIDATOS -->
		<div v-else-if="tab === 'Candidatos'" class="space-y-4">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<div class="text-sm text-slate-600">
					Candidatos: <span class="font-semibold text-slate-900">{{ form.candidatos.length }}</span> / {{ candidateLimit }}
				</div>
				<div class="flex items-center gap-2">
					<button class="rounded-lg border px-3 py-2 text-sm" type="button" @click="openAllCandidates">Abrir todos</button>
					<button class="rounded-lg border px-3 py-2 text-sm" type="button" @click="closeAllCandidates">Cerrar todos</button>
					<button
						class="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-60"
						type="button"
						:disabled="form.candidatos.length >= candidateLimit"
						@click="addCandidate"
					>
						+ Agregar candidato
					</button>
				</div>
			</div>

			<div
				v-for="(c, ci) in form.candidatos"
				:key="ci"
				class="rounded-2xl border bg-white"
			>
				<button
					type="button"
					class="flex w-full items-center justify-between gap-3 px-5 py-4"
					@click="toggleCandidate(ci)"
				>
					<div class="min-w-0 text-left">
						<div class="text-sm font-semibold">
							Candidato {{ ci + 1 }}
							<span v-if="c.nombre?.trim()" class="font-normal text-slate-600">· {{ c.nombre }}</span>
						</div>
						<div class="mt-1 text-xs text-slate-500">
							Tests: {{ c.resultadosPruebas.length }}
							<span class="mx-2">•</span>
							CV: {{ c.cvEnabled ? 'Yes' : 'No' }}
							<span class="mx-2">•</span>
							Entrevista: {{ c.entrevistaEnabled ? 'Yes' : 'No' }}
						</div>
					</div>

					<div class="flex items-center gap-2">
						<span class="text-xs text-slate-500">{{ isOpenCandidate(ci) ? 'Ocultar' : 'Mostrar' }}</span>
						<span class="text-slate-500">{{ isOpenCandidate(ci) ? '▾' : '▸' }}</span>
					</div>
				</button>

				<div v-if="isOpenCandidate(ci)" class="border-t px-5 py-5">
					<CandidateForm
						:candidate="c"
						:candidateIndex="ci"
						:testSchemas="TEST_SCHEMAS"
						:schemaFor="schemaFor"
						@removeCandidate="removeCandidate"
						@addTest="addTest"
						@removeTest="removeTest"
					/>
				</div>
			</div>
		</div>

		<!-- CONFIG -->
		<div v-else class="space-y-6">
			<ConfigForm
				:config="form.config"
				:anyCvPresent="anyCvPresent"
				:anyInterviewPresent="anyInterviewPresent"
			/>
		</div>
	</div>
</template>
