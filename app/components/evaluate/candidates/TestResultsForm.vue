<script setup lang="ts">
import ScoresEditor from "~/components/ScoresEditor.vue"
import type { TestName } from "~/data/testSchemas"

const props = defineProps<{
	resultadosPruebas: any[]
	testSchemas: readonly { name: string; label?: string }[]
	schemaFor: (name: TestName) => any
	candidateIndex: number
}>()

const emit = defineEmits<{
	(e: "addTest", candidateIdx: number): void
	(e: "removeTest", candidateIdx: number, testIdx: number): void
}>()

function onChangeTestName(testIdx: number, next: string) {
	props.resultadosPruebas[testIdx].name = next
	if (!props.resultadosPruebas[testIdx].scores || typeof props.resultadosPruebas[testIdx].scores !== "object") {
		props.resultadosPruebas[testIdx].scores = {}
	}
}

function testLabel(name: string) {
	const found = props.testSchemas.find((t) => t.name === name)
	return found?.label ?? name
}
</script>

<template>
	<div class="rounded-2xl border p-5">
		<div class="mb-3 flex items-center justify-between">
			<div class="text-sm font-semibold">Resultados de pruebas</div>
			<button class="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white" type="button" @click="emit('addTest', candidateIndex)">
				+ Agregar test
			</button>
		</div>

		<div class="space-y-3">
			<details v-for="(rp, ti) in resultadosPruebas" :key="ti" class="rounded-xl border p-4" open>
				<summary class="cursor-pointer select-none">
					<div class="flex flex-wrap items-center justify-between gap-2">
						<div class="text-sm font-semibold">
							{{ rp.name ? testLabel(rp.name) : "Test (sin seleccionar)" }}
						</div>

						<button class="rounded-lg border px-3 py-2 text-sm" type="button" @click.prevent="emit('removeTest', candidateIndex, ti)">
							Eliminar
						</button>
					</div>
				</summary>

				<div class="mt-4">
					<div class="w-full md:w-[320px]">
						<label class="text-xs font-semibold text-slate-600">Test</label>
						<select
							class="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
							:value="rp.name"
							@change="onChangeTestName(ti, ($event.target as HTMLSelectElement).value)"
						>
							<option disabled value="">Seleccione…</option>
							<option v-for="t in testSchemas" :key="t.name" :value="t.name">
								{{ t.label ?? t.name }}
							</option>
						</select>
					</div>

					<div class="mt-4">
						<ScoresEditor v-if="rp.name" :schema="schemaFor(rp.name as TestName).scores" v-model="rp.scores" />
						<div v-else class="text-sm text-slate-500">Seleccione un test para llenar sus puntajes.</div>
					</div>
				</div>
			</details>

			<div v-if="resultadosPruebas.length === 0" class="text-sm text-slate-500">
				Aún no hay tests agregados.
			</div>
		</div>
	</div>
</template>
