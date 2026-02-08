<script setup lang="ts">
const props = defineProps<{
	cultura: any
	estiloTrabajo: readonly string[]
	ritmo: readonly string[]
	toleranciaError: readonly string[]
	estiloLiderazgo: readonly string[]
	nivelEstructura: readonly string[]
}>()

const SUG_VALORES = ["Integridad y Ética", "Orientación al Cliente", "Innovación", "Trabajo en Equipo", "Compromiso / Pasión", "Respeto", "Responsabilidad Social", "Excelencia", "Adaptabilidad", "Sostenibilidad", "Liderazgo", "Transparencia", "Diversidad e Inclusión", "Orientación a Resultados", "Agilidad",  "Aprendizaje constante"] as const

function ensureValores() {
	if (!props.cultura.valores) {
		props.cultura.valores = []
	}
}
ensureValores()

const valoresFilled = computed(() =>
	(props.cultura.valores ?? []).filter((x: string) => (x ?? "").trim().length > 0).length
)

const comportamientosDeseadosFilled = computed(() =>
	(props.cultura.comportamientosDeseados ?? []).filter((x: string) => (x ?? "").trim().length > 0).length
)

const comportamientosNoAceptadosFilled = computed(() =>
	(props.cultura.comportamientosNoAceptados ?? []).filter((x: string) => (x ?? "").trim().length > 0).length
)

function addValoresFromChip(label: string) {
	ensureValores()

	const arr: string[] = props.cultura.valores
	if (arr.some((x) => (x ?? "").trim() === label)) return

	// fill first empty slot
	const emptyIdx = arr.findIndex((x) => (x ?? "").trim() === "")
	if (emptyIdx !== -1) {
		arr[emptyIdx] = label
		return
	}

	if (arr.length >= 5) return
	arr.push(label)
}

function addvaloresRow() {
	ensureValores()
	if (props.cultura.valores.length >= 5) return
	props.cultura.valores.push("")
}
</script>

<template>
	<div class="space-y-6">
		<div class="rounded-2xl border p-5">
			<label class="flex items-center gap-2 text-sm font-medium">
				<input type="checkbox" v-model="props.cultura.enabled" />
				Incluir cultura
			</label>

			<div v-if="props.cultura.enabled" class="mt-4 grid gap-4 md:grid-cols-2 rounded-2xl border border-slate-900 p-5">
				<div class="md:col-span-2">
					<div class="text-sm font-medium">
						Valores organizacionales
						<span class="ml-2 rounded-full border px-2 py-0.5 text-xs text-slate-600">
							{{ valoresFilled }}/5
						</span>
					</div>
					<div class="mt-2 space-y-2">
						<div v-for="(_, i) in props.cultura.valores" :key="i" class="flex gap-2">
							<input v-model="props.cultura.valores[i]" maxlength="50" class="flex-1 rounded-lg border px-3 py-2" />
							<button class="rounded-lg border px-3 py-2" type="button" :disabled="props.cultura.valores.length <= 1" @click="props.cultura.valores.splice(i, 1)">Eliminar</button>
						</div>
						<button class="rounded-lg bg-slate-900 px-3 py-2 text-white disabled:opacity-60" type="button" :disabled="props.cultura.valores.length >= 5" @click="addvaloresRow">+ Agregar</button>
					</div>

					<!--chips suggestions-->
					<details>
						<summary class="text-sm font-medium">Sugerencias</summary>
						<div class="mt-3 flex flex-wrap gap-2 rounded-lg bg-slate-400 px-3 py-2 text-white disabled:opacity-60">
							<button
								v-for="chip in SUG_VALORES"
								:key="chip"
								type="button"
								class="rounded-full border px-3 py-1 text-sm hover:bg-brand-gray hover:text-slate-900"
								:disabled="props.cultura.valores.includes(chip) || props.cultura.valores.length >= 5"
								@click="addValoresFromChip(chip)"
							>
								{{ chip }}
							</button>
						</div>
					</details>
				</div>

				<div>
					<label class="text-sm font-medium">Estilo de trabajo</label>
					<select v-model="props.cultura.estiloTrabajo" class="mt-1 w-full rounded-lg border px-3 py-2">
						<option v-for="v in estiloTrabajo" :key="v" :value="v">{{ v }}</option>
					</select>
				</div>

				<div>
					<label class="text-sm font-medium">Ritmo de trabajo</label>
					<select v-model="props.cultura.ritmo" class="mt-1 w-full rounded-lg border px-3 py-2">
						<option v-for="v in ritmo" :key="v" :value="v">{{ v }}</option>
					</select>
				</div>

				<div>
					<label class="text-sm font-medium">Tolerancia al error</label>
					<select v-model="props.cultura.toleranciaAlError" class="mt-1 w-full rounded-lg border px-3 py-2">
						<option v-for="v in toleranciaError" :key="v" :value="v">{{ v }}</option>
					</select>
				</div>

				<div>
					<label class="text-sm font-medium">Estilo de liderazgo</label>
					<select v-model="props.cultura.estiloLiderazgo" class="mt-1 w-full rounded-lg border px-3 py-2">
						<option v-for="v in estiloLiderazgo" :key="v" :value="v">{{ v }}</option>
					</select>
				</div>

				<div class="md:col-span-2">
					<div class="text-sm font-medium">
						Comportamientos deseados
						<span class="ml-2 rounded-full border px-2 py-0.5 text-xs text-slate-600">
							{{ comportamientosDeseadosFilled }}/5
						</span>
					</div>
					<div class="mt-2 space-y-2">
						<div v-for="(_, i) in props.cultura.comportamientosDeseados" :key="i" class="flex gap-2">
							<input v-model="props.cultura.comportamientosDeseados[i]" maxlength="100" class="flex-1 rounded-lg border px-3 py-2" />
							<button class="rounded-lg border px-3 py-2" type="button" :disabled="props.cultura.comportamientosDeseados.length <= 1" @click="props.cultura.comportamientosDeseados.splice(i, 1)">Eliminar</button>
						</div>
						<button class="rounded-lg bg-slate-900 px-3 py-2 text-white disabled:opacity-60" type="button" :disabled="props.cultura.comportamientosDeseados.length >= 5" @click="props.cultura.comportamientosDeseados.push('')">+ Agregar</button>
					</div>
				</div>

				<div class="md:col-span-2">
					<div class="text-sm font-medium">
						Comportamiento no aceptados/no negociables
						<span class="ml-2 rounded-full border px-2 py-0.5 text-xs text-slate-600">
							{{ comportamientosNoAceptadosFilled }}/5
						</span>
					</div>
					<div class="mt-2 space-y-2">
						<div v-for="(_, i) in props.cultura.comportamientosNoAceptados" :key="i" class="flex gap-2">
							<input v-model="props.cultura.comportamientosNoAceptados[i]" maxlength="100" class="flex-1 rounded-lg border px-3 py-2" />
							<button class="rounded-lg border px-3 py-2" type="button" :disabled="props.cultura.comportamientosNoAceptados.length <= 1" @click="props.cultura.comportamientosNoAceptados.splice(i, 1)">Eliminar</button>
						</div>
						<button class="rounded-lg bg-slate-900 px-3 py-2 text-white disabled:opacity-60" type="button" :disabled="props.cultura.comportamientosNoAceptados.length >= 5" @click="props.cultura.comportamientosNoAceptados.push('')">+ Agregar</button>
					</div>
				</div>


				<div>
					<label class="text-sm font-medium">Nivel profundidad estructura organizacional</label>
					<select v-model="props.cultura.nivelEstructura" class="mt-1 w-full rounded-lg border px-3 py-2">
						<option v-for="v in nivelEstructura" :key="v" :value="v">{{ v }}</option>
					</select>
				</div>

			</div>
		</div>
	</div>
</template>

