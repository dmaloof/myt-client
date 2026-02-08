import { computed } from "vue"
import { checkPromptInjection } from "~/utils/promptGuard"
import type { TestName } from "~/data/testSchemas"

type GuardIssue = { path: string; hits: ReturnType<typeof checkPromptInjection> }

type Args = {
	form: any
	scanFreeText: () => GuardIssue[]
	setGuardIssues: (issues: GuardIssue[]) => void
	setSubmitError: (msg: string) => void
}

export function useJsonTemplateImporter(args: Args) {
	const { form, scanFreeText, setGuardIssues, setSubmitError } = args

	const candidateLimit = computed(() => (form.config?.service === "FULL_REPORT" ? 5 : 10))

	function isNonEmptyValue(v: any) {
		if (v == null) return false
		if (typeof v === "string") return v.trim().length > 0
		if (Array.isArray(v)) return v.some(isNonEmptyValue)
		if (typeof v === "object") return Object.values(v).some(isNonEmptyValue)
		if (typeof v === "number") return true
		if (typeof v === "boolean") return true
		return false
	}

	function parseYearsToNumber(input: any): number {
		if (typeof input === "number") return input
		if (typeof input !== "string") return 0
		const m = input.match(/(\d+([.,]\d+)?)/)
		if (!m) return 0
		return Number(m[1]?.replace(",", "."))
	}

	function replaceArray<T>(target: T[], next: T[]) {
		target.splice(0, target.length, ...next)
	}

	function safeStringArray(arr: any): string[] {
		if (!Array.isArray(arr)) return []
		return arr
			.filter((x) => typeof x === "string")
			.map((x) => x.trim())
			.filter(Boolean)
	}

	function ddmmyyyyToIsoDate(v: any): string {
		if (typeof v !== "string") return ""
		const s = v.trim()
		if (!s) return ""

		// already ISO?
		if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

		const m = s.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/)
		if (!m) return ""

		const dd = m[1]
		const mm = m[2]
		const yyyy = m[3]
		return `${yyyy}-${mm}-${dd}`
	}

	function applyTemplate(template: any) {
		if (!template || typeof template !== "object") {
			throw new Error("Invalid JSON: expected an object")
		}

		// ---- CONFIG FIRST (so candidate limit is correct) ----
		if (template.config && typeof template.config === "object") {
			if (template.config.service) {
				form.config.service = String(template.config.service) as "FULL_REPORT" | "CANDIDATE" | "RANKING"
			}

			if (form.config.service !== "RANKING" && template.config.reportMode) {
				form.config.reportMode = String(template.config.reportMode) as "EXECUTIVE" | "LIGHT"
			}

			const p = template.config.ponderaciones ?? {}
			form.config.ponderaciones.cv = Number(p.cv ?? form.config.ponderaciones.cv)
			form.config.ponderaciones.pruebas = Number(p.pruebas ?? form.config.ponderaciones.pruebas)
			form.config.ponderaciones.entrevista = Number(p.entrevista ?? form.config.ponderaciones.entrevista)
		}

		// ---- PERFIL ----
		if (template.perfil) {
			form.perfil.cargo = String(template.perfil.cargo ?? "")
			form.perfil.descripcion = String(template.perfil.descripcion ?? "")

			replaceArray(form.perfil.funciones, safeStringArray(template.perfil.funciones))
			if (form.perfil.funciones.length === 0) form.perfil.funciones.push("")

			const f = template.perfil.requisitos?.formacion ?? {}
			form.perfil.requisitos.formacion.nivelProfesional = String(f.nivelProfesional ?? "No aplica")
			form.perfil.requisitos.formacion.carrerasAfines = String(f.carrerasAfines ?? "")
			replaceArray(form.perfil.requisitos.formacion.idiomas, safeStringArray(f.idiomas))
			form.perfil.requisitos.formacion.conocimientosEspecificos = String(f.conocimientosEspecificos ?? "")

			const ex = template.perfil.requisitos?.experienciaLaboral ?? {}
			form.perfil.requisitos.experienciaLaboral.tiempo = parseYearsToNumber(ex.tiempo)
			form.perfil.requisitos.experienciaLaboral.areas = String(ex.areas ?? "")

			// competencias
			const comp = template.perfil.competencias ?? {}
			replaceArray(form.perfil.competencias.tecnicas, safeStringArray(comp.tecnicas))
			if (form.perfil.competencias.tecnicas.length === 0) form.perfil.competencias.tecnicas.push("")

			const cond = Array.isArray(comp.conductuales) ? comp.conductuales : []
			form.perfil.competencias.conductuales.splice(0, form.perfil.competencias.conductuales.length)
			for (const c of cond.slice(0, 5)) {
				form.perfil.competencias.conductuales.push({
					competencia: String(c?.competencia ?? ""),
					nivel: String(c?.nivel ?? "Medio"),
				})
			}
			if (form.perfil.competencias.conductuales.length === 0) {
				form.perfil.competencias.conductuales.push({ competencia: "", nivel: "Medio" })
			}

			const id = template.perfil.identificacionDelCargo ?? {}
			form.perfil.identificacionDelCargo.personalACargo = Boolean(id.personalACargo)
			form.perfil.identificacionDelCargo.modalidad = String(id.modalidad ?? "Presencial")
			form.perfil.identificacionDelCargo.disponibilidadViajes = Boolean(id.disponibilidadViajes)

			form.perfil.nivelSeniority = template.perfil.nivelSeniority ?? null
		}

		// ---- CULTURA (optional) ----
		if (template.cultura && typeof template.cultura === "object") {
			form.cultura.enabled = isNonEmptyValue(template.cultura)

			replaceArray(form.cultura.valores, safeStringArray(template.cultura.valores))
			if (form.cultura.valores.length === 0) form.cultura.valores.push("")

			form.cultura.estiloTrabajo = String(template.cultura.estiloTrabajo ?? form.cultura.estiloTrabajo)
			form.cultura.ritmo = String(template.cultura.ritmo ?? form.cultura.ritmo)
			form.cultura.toleranciaAlError = String(template.cultura.toleranciaAlError ?? form.cultura.toleranciaAlError)

			replaceArray(form.cultura.comportamientosDeseados, safeStringArray(template.cultura.comportamientosDeseados))
			if (form.cultura.comportamientosDeseados.length === 0) form.cultura.comportamientosDeseados.push("")

			replaceArray(form.cultura.comportamientosNoAceptados, safeStringArray(template.cultura.comportamientosNoAceptados))
			if (form.cultura.comportamientosNoAceptados.length === 0) form.cultura.comportamientosNoAceptados.push("")

			form.cultura.estiloLiderazgo = String(template.cultura.estiloLiderazgo ?? form.cultura.estiloLiderazgo)
			form.cultura.nivelEstructura = String(template.cultura.nivelEstructura ?? form.cultura.nivelEstructura)
		} else {
			// if not provided, keep current culture state
		}

		// ---- CANDIDATOS ----
		if (Array.isArray(template.candidatos)) {
			form.candidatos.splice(0, form.candidatos.length)

			const sliced = template.candidatos.slice(0, candidateLimit.value)

			for (const c of sliced) {
				const cvObj = c?.cv
				const entrevistaObj = c?.resultadoEntrevista

				const candidate = {
					nombre: String(c?.nombre ?? ""),

					cvEnabled: Boolean(cvObj && typeof cvObj === "object" && isNonEmptyValue(cvObj)),
					cv: {
						perfil: String(cvObj?.perfil ?? ""),
						aspiracionSalarial: Number(cvObj?.aspiracionSalarial ?? 0),
						profesion: String(cvObj?.profesion ?? ""),
						nivelEducativo: String(cvObj?.nivelEducativo ?? "No aplica"),

						experienciaLaboral: Array.isArray(cvObj?.experienciaLaboral)
							? cvObj.experienciaLaboral.slice(0, 5).map((e: any) => ({
								empresa: String(e?.empresa ?? ""),
								cargo: String(e?.cargo ?? ""),
								area: String(e?.area ?? ""),
								funciones: String(e?.funciones ?? ""),
								fechaInicio: ddmmyyyyToIsoDate(e?.fechaInicio ?? ""),
								fechaFin: ddmmyyyyToIsoDate(e?.fechaFin ?? ""),
							}))
							: [{ empresa: "", cargo: "", area: "", funciones: "", fechaInicio: "", fechaFin: "" }],

						formacionAcademica: Array.isArray(cvObj?.formacionAcademica)
							? cvObj.formacionAcademica.slice(0, 5).map((f: any) => ({
								institucion: String(f?.institucion ?? ""),
								carrera: String(f?.carrera ?? ""),
								nivel: String(f?.nivel ?? "Bachiller"),
								estado: String(f?.estado ?? "Terminado"),
								fechaInicio: ddmmyyyyToIsoDate(f?.fechaInicio ?? ""),
							}))
							: [{ institucion: "", carrera: "", nivel: "Bachiller", estado: "Terminado", fechaInicio: "" }],

						idiomas: Array.isArray(cvObj?.idiomas)
							? cvObj.idiomas.slice(0, 3).map((i: any) => ({
								idioma: String(i?.idioma ?? ""),
								nivelEscritura: String(i?.nivelEscritura ?? "MEDIA"),
								nivelLectura: String(i?.nivelLectura ?? "MEDIA"),
								nivelConversacion: String(i?.nivelConversacion ?? "MEDIA"),
							}))
							: [],
					},

					resultadosPruebas: Array.isArray(c?.resultadosPruebas)
						? c.resultadosPruebas.map((rp: any) => ({
							name: String(rp?.name ?? "") as TestName,
							scores: (rp?.scores && typeof rp.scores === "object") ? rp.scores : {},
						}))
						: [{ name: "" as TestName, scores: {} }],

					entrevistaEnabled: Boolean(entrevistaObj && typeof entrevistaObj === "object" && isNonEmptyValue(entrevistaObj)),
					resultadoEntrevista: {
						preguntas: Array.isArray(entrevistaObj?.preguntas)
							? entrevistaObj.preguntas.map((p: any) => ({
								pregunta: String(p?.pregunta ?? ""),
								respuesta: String(p?.respuesta ?? ""),
								calificacion: Number(p?.calificacion ?? 5),
								concepto: String(p?.concepto ?? ""),
							}))
							: [{ pregunta: "", respuesta: "", calificacion: 5, concepto: "" }],

						calificacion: Number(entrevistaObj?.calificacion ?? 5),
						concepto: String(entrevistaObj?.concepto ?? ""),
					},
				}

				// Ensure tests list not empty
				if (!candidate.resultadosPruebas.length) candidate.resultadosPruebas = [{ name: "" as TestName, scores: {} }]

				form.candidatos.push(candidate)
			}

			// Ensure at least 1 candidate exists
			if (form.candidatos.length === 0) {
				form.candidatos.push(JSON.parse(JSON.stringify(form.candidatos[0] ?? { nombre: "" })))
			}


		}

		// Prompt injection safety (reuse your existing scanner)
		const issues = scanFreeText()
		setGuardIssues(issues)
		if (issues.length) {
			throw new Error("Template contains unsafe text (possible prompt injection). Fix flagged fields and re-import.")
		}
	}

	async function onImportFile(e: Event) {
		const input = e.target as HTMLInputElement
		const file = input.files?.[0]
		input.value = "" // allow selecting same file again

		if (!file) return

		try {
			setSubmitError("")
			const text = await file.text()
			const json = JSON.parse(text)
			applyTemplate(json)
		} catch (err: any) {
			setSubmitError(err?.message ?? "Failed to import JSON template.")
		}
	}

	return { onImportFile, applyTemplate, candidateLimit }
}
