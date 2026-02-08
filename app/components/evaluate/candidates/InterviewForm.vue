<script setup lang="ts">
const props = defineProps<{
	entrevista: any
}>()

function ensure() {
	if (!props.entrevista) return
	if (!Array.isArray(props.entrevista.preguntas)) props.entrevista.preguntas = []
}
ensure()

function addPregunta() {
	ensure()
	props.entrevista.preguntas.push({
		pregunta: "",
		respuesta: "",
		calificacion: 5,
		concepto: "",
	})
}

function removePregunta(i: number) {
	props.entrevista.preguntas.splice(i, 1)
}
</script>

<template>
	<div class="rounded-2xl border p-5">
		<div class="mb-3 text-sm font-semibold">Entrevista</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label class="text-sm font-medium">Calificación (1..10)</label>
				<input v-model.number="entrevista.calificacion" type="number" min="1" max="10" class="mt-1 w-full rounded-lg border px-3 py-2" />
				<div class="mt-1 text-xs text-slate-500">Califique la entrevista de 1 a 10</div>
			</div>

			<div>
				<label class="text-sm font-medium">Concepto</label>
				<input v-model="entrevista.concepto" maxlength="100" class="mt-1 w-full rounded-lg border px-3 py-2" />
			</div>
		</div>

		<div class="mt-6 rounded-xl border p-4">
			<div class="mb-3 flex items-center justify-between gap-2">
				<div class="text-sm font-semibold">Preguntas</div>
				<button class="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white" type="button" @click="addPregunta">
					+ Agregar pregunta
				</button>
			</div>

			<div class="space-y-3">
				<div v-for="(p, i) in entrevista.preguntas" :key="i" class="rounded-lg border p-4">
					<div class="grid gap-3 md:grid-cols-2">
						<div class="md:col-span-2">
							<label class="text-xs font-semibold text-slate-600">Pregunta</label>
							<input v-model="p.pregunta" maxlength="100" class="mt-1 w-full rounded-lg border px-3 py-2" />
						</div>

						<div class="md:col-span-2">
							<label class="text-xs font-semibold text-slate-600">Respuesta</label>
							<textarea v-model="p.respuesta" maxlength="250" rows="3" class="mt-1 w-full rounded-lg border px-3 py-2" />
						</div>

						<div>
							<label class="text-xs font-semibold text-slate-600">Calificación (1..10)</label>
							<input v-model.number="p.calificacion" type="number" min="1" max="10" class="mt-1 w-full rounded-lg border px-3 py-2" />
							<div class="mt-1 text-xs text-slate-500">Califique la respuesta de 1 a 10</div>
						</div>

						<div>
							<label class="text-xs font-semibold text-slate-600">Concepto</label>
							<input v-model="p.concepto" maxlength="100" class="mt-1 w-full rounded-lg border px-3 py-2" />
						</div>
					</div>

					<div class="mt-3 flex justify-end">
						<button class="rounded-lg border px-3 py-2 text-sm" type="button" @click="removePregunta(i)">Eliminar</button>
					</div>
				</div>

				<div v-if="entrevista.preguntas.length === 0" class="text-sm text-slate-500">
					Aún no hay preguntas agregadas.
				</div>
			</div>
		</div>
	</div>
</template>
