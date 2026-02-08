<script setup lang="ts">
const props = defineProps<{
	cv: any
}>()

const NIVEL_EDUCATIVO = ["No aplica", "Bachiller", "Técnico", "Tecnólogo", "Profesional", "Especialista", "Doctorado"] as const
const NIVEL_IDIOMA = ["ALTA", "MEDIA", "BAJA"] as const

function ensureArrays() {
	if (!Array.isArray(props.cv.experienciaLaboral)) props.cv.experienciaLaboral = []
	if (!Array.isArray(props.cv.formacionAcademica)) props.cv.formacionAcademica = []
	if (!Array.isArray(props.cv.idiomas)) props.cv.idiomas = []
}
ensureArrays()

function addExp() {
	ensureArrays()
	if (props.cv.experienciaLaboral.length >= 5) return
	props.cv.experienciaLaboral.push({
		empresa: "",
		cargo: "",
		area: "",
		funciones: "",
		fechaInicio: "",
		fechaFin: "",
	})
}
function removeExp(i: number) {
	props.cv.experienciaLaboral.splice(i, 1)
}

function addEdu() {
	ensureArrays()
	if (props.cv.formacionAcademica.length >= 5) return
	props.cv.formacionAcademica.push({
		institucion: "",
		carrera: "",
		nivel: "Bachiller",
		estado: "Terminado",
		fechaInicio: "",
	})
}
function removeEdu(i: number) {
	props.cv.formacionAcademica.splice(i, 1)
}

function addIdioma() {
	ensureArrays()
	if (props.cv.idiomas.length >= 3) return
	props.cv.idiomas.push({
		idioma: "",
		nivelEscritura: "MEDIA",
		nivelLectura: "MEDIA",
		nivelConversacion: "MEDIA",
	})
}
function removeIdioma(i: number) {
	props.cv.idiomas.splice(i, 1)
}
</script>

<template>
	<div class="rounded-2xl border p-5">
		<div class="mb-3 text-sm font-semibold">CV</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="md:col-span-2">
				<label class="text-sm font-medium">Perfil</label>
				<textarea v-model="cv.perfil" maxlength="150" class="mt-1 w-full rounded-lg border px-3 py-2" rows="2" />
			</div>

			<div>
				<label class="text-sm font-medium">Aspiración salarial</label>
				<input v-model.number="cv.aspiracionSalarial" type="number" min="0" class="mt-1 w-full rounded-lg border px-3 py-2" />
			</div>


			<div>
				<label class="text-sm font-medium">Profesión</label>
				<input v-model="cv.profesion" maxlength="50" class="mt-1 w-full rounded-lg border px-3 py-2" />
			</div>

			<div>
				<label class="text-sm font-medium">Nivel educativo</label>
				<select v-model="cv.nivelEducativo" class="mt-1 w-full rounded-lg border px-3 py-2">
					<option v-for="n in NIVEL_EDUCATIVO" :key="n" :value="n">{{ n }}</option>
				</select>
			</div>
		</div>

		<!-- Experiencia laboral -->
		<div class="mt-6 rounded-xl border p-4">
			<div class="mb-3 flex items-center justify-between gap-2">
				<div class="text-sm font-semibold">Experiencia laboral <span class="text-slate-500 text-xs">({{ cv.experienciaLaboral?.length ?? 0 }}/5)</span></div>
				<button class="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-60" type="button" :disabled="(cv.experienciaLaboral?.length ?? 0) >= 5" @click="addExp">
					+ Agregar
				</button>
			</div>

			<div class="space-y-3">
				<div v-for="(e, i) in cv.experienciaLaboral" :key="i" class="rounded-lg border p-4">
					<div class="grid gap-3 md:grid-cols-2">
						<div>
							<label class="text-xs font-semibold text-slate-600">Empresa</label>
							<input v-model="e.empresa" maxlength="50" class="mt-1 w-full rounded-lg border px-3 py-2" />
						</div>
						<div>
							<label class="text-xs font-semibold text-slate-600">Cargo</label>
							<input v-model="e.cargo" maxlength="50" class="mt-1 w-full rounded-lg border px-3 py-2" />
						</div>
						<div>
							<label class="text-xs font-semibold text-slate-600">Área</label>
							<input v-model="e.area" maxlength="50" class="mt-1 w-full rounded-lg border px-3 py-2" />
						</div>
						<div>
							<label class="text-xs font-semibold text-slate-600">Funciones</label>
							<input v-model="e.funciones" maxlength="150" class="mt-1 w-full rounded-lg border px-3 py-2" />
						</div>
						<div>
							<label class="text-xs font-semibold text-slate-600">Fecha inicio (DD/MM/YYYY)</label>
							<input v-model="e.fechaInicio" type="date" placeholder="DD/MM/YYYY" class="mt-1 w-full rounded-lg border px-3 py-2" />
						</div>
						<div>
							<label class="text-xs font-semibold text-slate-600">Fecha fin (DD/MM/YYYY, optional)</label>
							<input v-model="e.fechaFin" type="date" placeholder="DD/MM/YYYY" class="mt-1 w-full rounded-lg border px-3 py-2" />
						</div>
					</div>

					<div class="mt-3 flex justify-end">
						<button class="rounded-lg border px-3 py-2 text-sm" type="button" @click="removeExp(i)">Eliminar</button>
					</div>
				</div>

				<div v-if="(cv.experienciaLaboral?.length ?? 0) === 0" class="text-sm text-slate-500">
					Sin experiencia registrada.
				</div>
			</div>
		</div>

		<!-- Formación académica -->
		<div class="mt-4 rounded-xl border p-4">
			<div class="mb-3 flex items-center justify-between gap-2">
				<div class="text-sm font-semibold">Formación académica <span class="text-slate-500 text-xs">({{ cv.formacionAcademica?.length ?? 0 }}/5)</span></div>
				<button class="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-60" type="button" :disabled="(cv.formacionAcademica?.length ?? 0) >= 5" @click="addEdu">
					+ Agregar
				</button>
			</div>

			<div class="space-y-3">
				<div v-for="(f, i) in cv.formacionAcademica" :key="i" class="rounded-lg border p-4">
					<div class="grid gap-3 md:grid-cols-2">
						<div>
							<label class="text-xs font-semibold text-slate-600">Institución</label>
							<input v-model="f.institucion" maxlength="50" class="mt-1 w-full rounded-lg border px-3 py-2" />
						</div>
						<div>
							<label class="text-xs font-semibold text-slate-600">Carrera</label>
							<input v-model="f.carrera" maxlength="50" class="mt-1 w-full rounded-lg border px-3 py-2" />
						</div>

						<div>
							<label class="text-xs font-semibold text-slate-600">Nivel</label>
							<select v-model="f.nivel" class="mt-1 w-full rounded-lg border px-3 py-2">
								<option value="Bachiller">Bachiller</option>
								<option value="Técnico">Técnico</option>
								<option value="Tecnólogo">Tecnólogo</option>
								<option value="Profesional">Profesional</option>
								<option value="Especialista">Especialista</option>
								<option value="Doctorado">Doctorado</option>
								<option value="No formal (diplomado, curso, taller, ...)">No formal (diplomado, curso, taller, ...)</option>
							</select>
						</div>

						<div>
							<label class="text-xs font-semibold text-slate-600">Estado</label>
							<select v-model="f.estado" class="mt-1 w-full rounded-lg border px-3 py-2">
								<option value="Terminado">Terminado</option>
								<option value="En proceso">En proceso</option>
								<option value="Sin terminar">Sin terminar</option>
							</select>
						</div>

						<div>
							<label class="text-xs font-semibold text-slate-600">Fecha inicio (DD/MM/YYYY)</label>
							<input v-model="f.fechaInicio" type="date" placeholder="DD/MM/YYYY" class="mt-1 w-full rounded-lg border px-3 py-2" />
						</div>
					</div>

					<div class="mt-3 flex justify-end">
						<button class="rounded-lg border px-3 py-2 text-sm" type="button" @click="removeEdu(i)">Eliminar</button>
					</div>
				</div>

				<div v-if="(cv.formacionAcademica?.length ?? 0) === 0" class="text-sm text-slate-500">
					Sin formación registrada.
				</div>
			</div>
		</div>

		<!-- Idiomas -->
		<div class="mt-4 rounded-xl border p-4">
			<div class="mb-3 flex items-center justify-between gap-2">
				<div class="text-sm font-semibold">Idiomas
					<span class="text-slate-500 text-xs">
						({{ cv.idiomas?.length ?? 0 }}/3)
					</span>
				</div>
				<button class="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-60" type="button" :disabled="(cv.idiomas?.length ?? 0) >= 3" @click="addIdioma">
					+ Agregar
				</button>
			</div>

			<div class="space-y-3">
				<div v-for="(iobj, i) in cv.idiomas" :key="i" class="rounded-lg border p-4">
					<div class="grid gap-3 md:grid-cols-4">
						<div class="md:col-span-1">
							<label class="text-xs font-semibold text-slate-600">Idioma</label>
							<input v-model="iobj.idioma" maxlength="50" class="mt-1 w-full rounded-lg border px-3 py-2" />
						</div>

						<div>
							<label class="text-xs font-semibold text-slate-600">Escritura</label>
							<select v-model="iobj.nivelEscritura" class="mt-1 w-full rounded-lg border px-3 py-2">
								<option v-for="n in NIVEL_IDIOMA" :key="n" :value="n">{{ n }}</option>
							</select>
						</div>

						<div>
							<label class="text-xs font-semibold text-slate-600">Lectura</label>
							<select v-model="iobj.nivelLectura" class="mt-1 w-full rounded-lg border px-3 py-2">
								<option v-for="n in NIVEL_IDIOMA" :key="n" :value="n">{{ n }}</option>
							</select>
						</div>

						<div>
							<label class="text-xs font-semibold text-slate-600">Conversación</label>
							<select v-model="iobj.nivelConversacion" class="mt-1 w-full rounded-lg border px-3 py-2">
								<option v-for="n in NIVEL_IDIOMA" :key="n" :value="n">{{ n }}</option>
							</select>
						</div>
					</div>

					<div class="mt-3 flex justify-end">
						<button class="rounded-lg border px-3 py-2 text-sm" type="button" @click="removeIdioma(i)">Eliminar</button>
					</div>
				</div>

				<div v-if="(cv.idiomas?.length ?? 0) === 0" class="text-sm text-slate-500">
					Sin idiomas registrados.
				</div>
			</div>
		</div>
	</div>
</template>
