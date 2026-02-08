<script setup lang="ts">
import type { TestName } from '~/data/testSchemas'
import CvForm from '~/components/evaluate/candidates/CvForm.vue'
import TestResultsForm from '~/components/evaluate/candidates/TestResultsForm.vue'
import InterviewForm from '~/components/evaluate/candidates/InterviewForm.vue'

const props = defineProps<{
	candidate: any
	candidateIndex: number
	testSchemas: readonly { name: string; label?: string }[]
	schemaFor: (name: TestName) => any
}>()

const emit = defineEmits<{
	(e: 'removeCandidate', idx: number): void
	(e: 'addTest', candidateIdx: number): void
	(e: 'removeTest', candidateIdx: number, testIdx: number): void
}>()

function ensureCandidateShape() {
	if (!Array.isArray(props.candidate.resultadosPruebas)) props.candidate.resultadosPruebas = []
	if (!props.candidate.cv) {
		props.candidate.cv = {
			perfil: "",
			aspiracionSalarial: 0,
			fechaNacimiento: "",
			profesion: "",
			nivelEducativo: "No aplica",
			experienciaLaboral: [],
			formacionAcademica: [],
			idiomas: [],
		}
	}
	if (!props.candidate.resultadoEntrevista) {
		props.candidate.resultadoEntrevista = {
			preguntas: [],
			calificacion: 5,
			concepto: "",
		}
	}
}
ensureCandidateShape()

function onToggleCv(next: boolean) {
	props.candidate.cvEnabled = next
	if (next) ensureCandidateShape()
}
function onToggleInterview(next: boolean) {
	props.candidate.entrevistaEnabled = next
	if (next) ensureCandidateShape()
}
</script>

<template>
	<div class="space-y-6">
		<div class="flex flex-wrap items-center justify-between gap-2">
			<div class="text-sm font-semibold">Candidato</div>
			<button
				class="rounded-lg border px-3 py-2 text-sm disabled:opacity-60"
				type="button"
				:disabled="candidateIndex === 0 && false"
				@click="emit('removeCandidate', candidateIndex)"
			>
				Eliminar candidato
			</button>
		</div>

		<div class="rounded-2xl border p-5">
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<label class="text-sm font-medium">Nombre</label>
					<input v-model="candidate.nombre" maxlength="100" class="mt-1 w-full rounded-lg border px-3 py-2" />
				</div>

				<div class="flex items-end gap-4">
					<label class="flex items-center gap-2 text-sm font-medium">
						<input type="checkbox" :checked="candidate.cvEnabled" @change="onToggleCv(($event.target as HTMLInputElement).checked)" />
						Incluir CV
					</label>

					<label class="flex items-center gap-2 text-sm font-medium">
						<input
							type="checkbox"
							:checked="candidate.entrevistaEnabled"
							@change="onToggleInterview(($event.target as HTMLInputElement).checked)"
						/>
						Incluir entrevista
					</label>
				</div>
			</div>
		</div>

		<!-- CV (component) -->
		<CvForm v-if="candidate.cvEnabled" :cv="candidate.cv" />

		<!-- TESTS (component, collapsible items) -->
		<TestResultsForm
			:resultados-pruebas="candidate.resultadosPruebas"
			:test-schemas="testSchemas"
			:schema-for="schemaFor"
			:candidate-index="candidateIndex"
			@add-test="emit('addTest', candidateIndex)"
			@remove-test="(ci, ti) => emit('removeTest', ci, ti)"
		/>

		<!-- INTERVIEW (component) -->
		<InterviewForm v-if="candidate.entrevistaEnabled" :entrevista="candidate.resultadoEntrevista" />
	</div>
</template>
