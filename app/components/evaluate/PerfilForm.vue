<script setup lang="ts">
const props = defineProps<{
	perfil: any
	nivelProfesional: readonly string[]
	idiomas: readonly string[]
	modalidad: readonly string[]
	seniority: readonly string[]
}>()

const SUG_TECNICAS = [
	"IA Generativa",
	"Big Data/Machine Learning",
	"Desarrollo de Software",
	"Marketing Digital",
	"Gestión de Proyectos (Agile/Scrum)",
	"E-commerce",
	"CRM (Customer Relationship Management)",
	"Contaduría Pública / Finanzas",
	"UX/UI Design",
	"Excel avanzado/Power BI",
	"Ventas Consultivas B2B",
] as const

const SUG_CONDUCTUALES = [
	"Adaptabilidad y Flexibilidad",
	"Resiliencia y Tolerancia al Estrés",
	"Aprendizaje Activo",
	"Autonomía",
	"Gestión del Tiempo",
	"Inteligencia Emocional",
	"Comunicación Asertiva",
	"Trabajo en Equipo",
	"Empatía",
	"Resolución de Conflictos",
	"Networking",
	"Pensamiento Analítico",
	"Resolución de Problemas",
	"Creatividad e Innovación",
	"Toma de Decisiones Basada en Datos",
	"Liderazgo Inspirador",
	"Negociación",
	"Orientación al Cliente",
] as const

const NIVEL_COMP = ["Medio", "Medio-alto", "Alto", "Muy alto"] as const

function ensureCompetencias() {
	if (!props.perfil.competencias) {
		props.perfil.competencias = {
			tecnicas: [""],
			conductuales: [{ competencia: "", nivel: "Medio" }],
		}
	}
	if (!Array.isArray(props.perfil.competencias.tecnicas) || props.perfil.competencias.tecnicas.length === 0) {
		props.perfil.competencias.tecnicas = [""]
	}
	if (!Array.isArray(props.perfil.competencias.conductuales) || props.perfil.competencias.conductuales.length === 0) {
		props.perfil.competencias.conductuales = [{ competencia: "", nivel: "Medio" }]
	}
}
ensureCompetencias()

const funcionesFilled = computed(() =>
	(props.perfil.funciones ?? []).filter((x: string) => (x ?? "").trim().length > 0).length
)

const tecnicasFilled = computed(() =>
	(props.perfil.competencias?.tecnicas ?? []).filter((x: string) => (x ?? "").trim().length > 0).length
)

const conductualesFilled = computed(() =>
	(props.perfil.competencias?.conductuales ?? []).filter((x: any) => (x?.competencia ?? "").trim().length > 0).length
)

function addTecnicaFromChip(label: string) {
	ensureCompetencias()

	const arr: string[] = props.perfil.competencias.tecnicas
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

function addConductualFromChip(label: string) {
	ensureCompetencias()

	const arr: any[] = props.perfil.competencias.conductuales
	if (arr.some((x) => (x?.competencia ?? "").trim() === label)) return

	// fill first empty slot
	const emptyIdx = arr.findIndex((x) => (x?.competencia ?? "").trim() === "")
	if (emptyIdx !== -1) {
		arr[emptyIdx].competencia = label
		if (!arr[emptyIdx].nivel) arr[emptyIdx].nivel = "Medio"
		return
	}

	if (arr.length >= 5) return
	arr.push({ competencia: label, nivel: "Medio" })
}

function addTecnicaRow() {
	ensureCompetencias()
	if (props.perfil.competencias.tecnicas.length >= 5) return
	props.perfil.competencias.tecnicas.push("")
}

function addConductualRow() {
	ensureCompetencias()
	if (props.perfil.competencias.conductuales.length >= 5) return
	props.perfil.competencias.conductuales.push({ competencia: "", nivel: "Medio" })
}
</script>

<template>
	<div class="space-y-3">
		<!-- Basic -->
		<div class="rounded-2xl border border-slate-900 p-5">
			<div>
				<div>
					<label class="text-sm font-medium">Cargo</label>
					<input v-model="props.perfil.cargo" maxlength="100"
					       class="mt-1 w-full rounded-lg border px-3 py-2"/>
				</div>

				<div class="mt-3">
					<label class="text-sm font-medium">Descripción</label>
					<textarea v-model="props.perfil.descripcion" maxlength="400"
					          class="mt-1 w-full rounded-lg border px-3 py-2" rows="3"/>
				</div>
			</div>
		</div>

		<!-- Funciones -->
		<div class="rounded-2xl border border-slate-900 p-5">
			<div class="text-sm font-medium">
				Funciones del cargo
				<span class="ml-2 rounded-full border px-2 py-0.5 text-xs text-slate-600">
					{{ funcionesFilled }}/5
				</span>
			</div>

			<div class="space-y-2">
				<div v-for="(f, i) in props.perfil.funciones" :key="i" class="flex gap-2">
					<input v-model="props.perfil.funciones[i]" maxlength="150"
					       class="flex-1 rounded-lg border px-3 py-2"/>
					<button class="rounded-lg border px-3 py-2" type="button"
					        :disabled="props.perfil.funciones.length <= 1" @click="props.perfil.funciones.splice(i, 1)">
						Eliminar
					</button>
				</div>

				<button class="rounded-lg bg-slate-900 px-3 py-2 text-white disabled:opacity-60" type="button"
				        :disabled="props.perfil.funciones.length >= 5" @click="props.perfil.funciones.push('')">
					+ Agregar
				</button>
			</div>
		</div>

		<!-- Requisitos -->
		<div class="rounded-2xl border border-slate-900 p-5">
			<div class="mb-3 text-sm font-semibold">Requisitos</div>

			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<label class="text-sm font-medium">Nivel profesional</label>
					<select v-model="props.perfil.requisitos.formacion.nivelProfesional"
					        class="mt-1 w-full rounded-lg border px-3 py-2">
						<option v-for="n in nivelProfesional" :key="n" :value="n">{{ n }}</option>
					</select>
				</div>

				<div>
					<label class="text-sm font-medium">Experiencia (años)</label>
					<input v-model.number="props.perfil.requisitos.experienciaLaboral.tiempo" type="number" min="0"
					       class="mt-1 w-full rounded-lg border px-3 py-2"/>
					<div class="mt-1 text-xs text-slate-500">Escriba la experiencia laboral total en años</div>
				</div>

				<div class="md:col-span-2">
					<label class="text-sm font-medium">Carreras afines</label>
					<input v-model="props.perfil.requisitos.formacion.carrerasAfines" maxlength="100"
					       class="mt-1 w-full rounded-lg border px-3 py-2"/>
				</div>

				<div class="md:col-span-2">
					<label class="text-sm font-medium">Conocimientos específicos</label>
					<textarea v-model="props.perfil.requisitos.formacion.conocimientosEspecificos" maxlength="200"
					          class="mt-1 w-full rounded-lg border px-3 py-2" rows="2"/>
				</div>

				<div class="md:col-span-2">
					<label class="text-sm font-medium">Áreas afines</label>
					<input v-model="props.perfil.requisitos.experienciaLaboral.areas" maxlength="150"
					       class="mt-1 w-full rounded-lg border px-3 py-2"/>
					<div class="mt-1 text-xs text-slate-500">Ej: Administración, Ingeniería Industrial, Economía…</div>
				</div>

				<div class="md:col-span-2">
					<label class="text-sm font-medium">Idiomas</label>
					<div class="mt-2 flex flex-wrap gap-2">
						<label v-for="idioma in idiomas" :key="idioma"
						       class="flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
							<input type="checkbox" :value="idioma" v-model="props.perfil.requisitos.formacion.idiomas"/>
							{{ idioma }}
						</label>
					</div>
				</div>






			</div>
		</div>

		<!-- Competencias -->
		<div class="rounded-2xl border border-slate-900 p-5">
			<div class="mb-4 text-sm font-semibold">Competencias</div>

			<!-- Técnicas -->
			<div>
				<div class="flex items-center justify-between gap-3">
					<div class="text-sm font-medium">
						Técnicas
						<span class="ml-2 rounded-full border px-2 py-0.5 text-xs text-slate-600">
							{{ tecnicasFilled }}/5
						</span>
					</div>
					<button
						class="rounded-lg bg-slate-900 px-3 py-2 text-white disabled:opacity-60"
						type="button"
						:disabled="props.perfil.competencias.tecnicas.length >= 5"
						@click="addTecnicaRow"
					>
						+ Agregar
					</button>
				</div>

				<div class="mt-3 space-y-2">
					<div v-for="(_, i) in props.perfil.competencias.tecnicas" :key="i" class="flex gap-2">
						<input
							v-model="props.perfil.competencias.tecnicas[i]"
							maxlength="50"
							class="flex-1 rounded-lg border px-3 py-2"
							placeholder="Ej: Desarrollo de Software"
						/>
						<button
							class="rounded-lg border px-3 py-2"
							type="button"
							:disabled="props.perfil.competencias.tecnicas.length <= 1"
							@click="props.perfil.competencias.tecnicas.splice(i, 1)"
						>
							Eliminar
						</button>
					</div>
				</div>

				<div class="mt-2 text-xs text-slate-500">
					Máximo 50 caracteres por item.
				</div>

				<!--chips suggestions-->
				<details>
					<summary class="text-sm font-medium">Sugerencias</summary>
				<div class="mt-3 flex flex-wrap gap-2 rounded-lg bg-slate-400 px-3 py-2 text-white disabled:opacity-60">
					<button
						v-for="chip in SUG_TECNICAS"
						:key="chip"
						type="button"
						class="rounded-full border px-3 py-1 text-sm hover:bg-brand-gray hover:text-slate-900"
						:disabled="props.perfil.competencias.tecnicas.includes(chip) || props.perfil.competencias.tecnicas.length >= 5"
						@click="addTecnicaFromChip(chip)"
					>
						{{ chip }}
					</button>
				</div>
				</details>
			</div>

			<!-- Conductuales -->
			<div class="mt-5">
				<div class="flex items-center justify-between gap-3">
					<div class="text-sm font-medium">
						Conductuales
						<span class="ml-2 rounded-full border px-2 py-0.5 text-xs text-slate-600">
							{{ conductualesFilled }}/5
						</span>
					</div>
					<button
						class="rounded-lg bg-slate-900 px-3 py-2 text-white disabled:opacity-60"
						type="button"
						:disabled="props.perfil.competencias.conductuales.length >= 5"
						@click="addConductualRow"
					>
						+ Agregar
					</button>
				</div>

				<div class="mt-3 space-y-2">
					<div
						v-for="(c, i) in props.perfil.competencias.conductuales"
						:key="i"
						class="rounded-xl border"
					>
						<div class="grid gap-3 md:grid-cols-3">
							<div class="md:col-span-2">
								<label class="text-xs font-semibold text-slate-600">Competencia</label>
								<input
									v-model="props.perfil.competencias.conductuales[i].competencia"
									maxlength="50"
									class="mt-1 w-full rounded-lg border px-3 py-2"
									placeholder="Ej: Trabajo en Equipo"
								/>
							</div>

							<div class="grid md:grid-cols-3 gap-2">
								<div class="md:col-span-2">
									<label class="text-xs font-semibold text-slate-600">Nivel</label>
									<select
										v-model="props.perfil.competencias.conductuales[i].nivel"
										class="mt-1 w-full rounded-lg border px-3 py-2"
									>
										<option v-for="n in NIVEL_COMP" :key="n" :value="n">{{ n }}</option>
									</select>
								</div>
								<div class="mt-3 flex flex-wrap gap-2">
									<button
										class="rounded-lg border px-3 py-3"
										type="button"
										:disabled="props.perfil.competencias.conductuales.length <= 1"
										@click="props.perfil.competencias.conductuales.splice(i, 1)"
									>
										Eliminar
									</button>
								</div>
							</div>

						</div>

					</div>
				</div>

				<div class="mt-2 text-xs text-slate-500">
					Máximo 50 caracteres por competencia.
				</div>
			</div>

			<!--chips suggestions-->
			<details>
				<summary class="text-sm font-medium">Sugerencias</summary>
				<div class="mt-3 flex flex-wrap gap-2 rounded-lg bg-slate-400 px-3 py-2 text-white disabled:opacity-60">
					<button
						v-for="chip in SUG_CONDUCTUALES"
						:key="chip"
						type="button"
						class="rounded-full border border-slate-400 px-3 py-1 text-sm hover:bg-white hover:text-slate-900"
						:disabled="props.perfil.competencias.conductuales.some((x:any) => (x?.competencia ?? '').trim() === chip) || props.perfil.competencias.conductuales.length >= 5"
						@click="addConductualFromChip(chip)"
					>
						{{ chip }}
					</button>
				</div>
			</details>

		</div>

		<!-- Identificación del cargo -->
		<div class="rounded-2xl border border-slate-900 p-5">
			<div class="mb-3 text-sm font-semibold">Identificación del cargo</div>

			<div class="grid gap-4 md:grid-cols-3">

				<div>
					<label class="text-sm font-medium">Nivel seniority (opcional)</label>
					<select v-model="props.perfil.nivelSeniority" class="mt-1 w-full rounded-lg border px-3 py-2">
						<option :value="null">—</option>
						<option v-for="s in seniority" :key="s" :value="s">{{ s }}</option>
					</select>
				</div>


				<div>
					<label class="text-sm font-medium">Modalidad</label>
					<select v-model="props.perfil.identificacionDelCargo.modalidad"
					        class="mt-1 w-full rounded-lg border px-3 py-2">
						<option v-for="m in modalidad" :key="m" :value="m">{{ m }}</option>
					</select>
				</div>

				<div class="flex flex-col gap-2 items-baseline pt-6">
					<label class="flex items-center gap-2 text-sm">
						<input type="checkbox" v-model="props.perfil.identificacionDelCargo.personalACargo"/>
						Personal a cargo
					</label>

					<label class="flex items-center gap-2 text-sm">
						<input type="checkbox" v-model="props.perfil.identificacionDelCargo.disponibilidadViajes"/>
						Disponibilidad viajes
					</label>
				</div>
			</div>
		</div>
	</div>
</template>
