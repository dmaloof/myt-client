<script setup lang="ts">
import type { ScoresSchema } from '~/data/testSchemas'

const props = defineProps<{
	schema: ScoresSchema
	modelValue: any
	path?: string
}>()

const emit = defineEmits<{
	(e: 'update:modelValue', v: any): void
}>()

const path = computed(() => props.path ?? 'scores')

function update(v: any) {
	emit('update:modelValue', v)
}

function ensureObject(v: any) {
	return v && typeof v === 'object' && !Array.isArray(v) ? v : {}
}
function ensureArray(v: any) {
	return Array.isArray(v) ? v : []
}
</script>

<template>
	<div class="space-y-3">
		<template v-if="schema.type === 'number'">
			<input
				class="w-full rounded-lg border px-3 py-2"
				type="number"
				:value="modelValue ?? ''"
				@input="update(($event.target as HTMLInputElement).value === '' ? null : Number(($event.target as HTMLInputElement).value))"
			/>
		</template>

		<template v-else-if="schema.type === 'string'">
			<input
				class="w-full rounded-lg border px-3 py-2"
				type="text"
				:value="modelValue ?? ''"
				@input="update(($event.target as HTMLInputElement).value)"
			/>
		</template>

		<template v-else-if="schema.type === 'string[]'">
			<div class="space-y-2">
				<div v-for="(item, idx) in ensureArray(modelValue)" :key="idx" class="flex gap-2">
					<input
						class="flex-1 rounded-lg border px-3 py-2"
						type="text"
						:value="item"
						@input="() => {
              const next = [...ensureArray(modelValue)]
              next[idx] = ($event.target as HTMLInputElement).value
              update(next)
            }"
					/>
					<button
						class="rounded-lg border px-3 py-2"
						type="button"
						@click="() => {
              const next = [...ensureArray(modelValue)]
              next.splice(idx, 1)
              update(next)
            }"
					>
						Remove
					</button>
				</div>
				<button
					class="rounded-lg bg-slate-900 px-3 py-2 text-white"
					type="button"
					@click="update([...ensureArray(modelValue), ''])"
				>
					+ Add
				</button>
			</div>
		</template>

		<template v-else-if="schema.type === 'object'">
			<div class="space-y-3">
				<div
					v-for="(childSchema, key) in schema.fields"
					:key="key"
					class="rounded-xl border p-3"
				>
					<div class="mb-2 text-sm font-medium text-slate-700">
						{{ key }}
					</div>

					<ScoresEditor
						:schema="childSchema"
						:path="`${path}.${key}`"
						:model-value="ensureObject(modelValue)[key]"
						@update:model-value="(v) => {
              const next = { ...ensureObject(modelValue), [key]: v }
              update(next)
            }"
					/>
				</div>
			</div>
		</template>
	</div>
</template>
