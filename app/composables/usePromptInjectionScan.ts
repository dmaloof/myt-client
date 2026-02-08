import { checkPromptInjection } from "~/utils/promptGuard"

type GuardIssue = { path: string; hits: ReturnType<typeof checkPromptInjection> }

export function usePromptInjectionScan(form: any) {
	function scanValue(value: any, path: string, out: GuardIssue[]) {
		if (typeof value === "string") {
			const hits = checkPromptInjection(value)
			if (hits.length) out.push({ path, hits })
			return
		}

		if (Array.isArray(value)) {
			value.forEach((v, i) => scanValue(v, `${path}[${i}]`, out))
			return
		}

		if (value && typeof value === "object") {
			for (const [k, v] of Object.entries(value)) {
				scanValue(v, `${path}.${k}`, out)
			}
		}
	}

	function scanFreeText(): GuardIssue[] {
		const issues: GuardIssue[] = []
		scanValue(form.perfil?.cargo ?? "", "perfil.cargo", issues)
		scanValue(form.perfil?.descripcion ?? "", "perfil.descripcion", issues)
		scanValue(form.perfil?.funciones ?? [], "perfil.funciones", issues)
		scanValue(form.perfil?.requisitos?.formacion?.carrerasAfines ?? "", "perfil.requisitos.formacion.carrerasAfines", issues)
		scanValue(form.perfil?.requisitos?.formacion?.conocimientosEspecificos ?? "", "perfil.requisitos.formacion.conocimientosEspecificos", issues)
		scanValue(form.perfil?.requisitos?.experienciaLaboral?.areas ?? "", "perfil.requisitos.experienciaLaboral.areas", issues)

		scanValue(form.perfil?.competencias?.tecnicas ?? [], "perfil.competencias.tecnicas", issues)
		scanValue(form.perfil?.competencias?.conductuales ?? [], "perfil.competencias.conductuales", issues)

		if (form.cultura?.enabled) {
			scanValue(form.cultura?.valores ?? [], "cultura.valores", issues)
			scanValue(form.cultura?.comportamientosDeseados ?? [], "cultura.comportamientosDeseados", issues)
			scanValue(form.cultura?.comportamientosNoAceptados ?? [], "cultura.comportamientosNoAceptados", issues)
		}

		;(form.candidatos ?? []).forEach((c: any, ci: number) => {
			scanValue(c?.nombre ?? "", `candidatos[${ci}].nombre`, issues)

			if (c?.cvEnabled && c?.cv) {
				scanValue(c.cv?.perfil ?? "", `candidatos[${ci}].cv.perfil`, issues)
				scanValue(c.cv?.profesion ?? "", `candidatos[${ci}].cv.profesion`, issues)

				;(c.cv?.experienciaLaboral ?? []).forEach((e: any, ei: number) => {
					scanValue(e?.empresa ?? "", `candidatos[${ci}].cv.experienciaLaboral[${ei}].empresa`, issues)
					scanValue(e?.cargo ?? "", `candidatos[${ci}].cv.experienciaLaboral[${ei}].cargo`, issues)
					scanValue(e?.area ?? "", `candidatos[${ci}].cv.experienciaLaboral[${ei}].area`, issues)
					scanValue(e?.funciones ?? "", `candidatos[${ci}].cv.experienciaLaboral[${ei}].funciones`, issues)
				})

				;(c.cv?.formacionAcademica ?? []).forEach((f: any, fi: number) => {
					scanValue(f?.institucion ?? "", `candidatos[${ci}].cv.formacionAcademica[${fi}].institucion`, issues)
					scanValue(f?.carrera ?? "", `candidatos[${ci}].cv.formacionAcademica[${fi}].carrera`, issues)
				})

				;(c.cv?.idiomas ?? []).forEach((iobj: any, ii: number) => {
					scanValue(iobj?.idioma ?? "", `candidatos[${ci}].cv.idiomas[${ii}].idioma`, issues)
				})
			}

			if (c?.entrevistaEnabled && c?.resultadoEntrevista) {
				scanValue(c.resultadoEntrevista?.concepto ?? "", `candidatos[${ci}].resultadoEntrevista.concepto`, issues)

				;(c.resultadoEntrevista?.preguntas ?? []).forEach((p: any, pi: number) => {
					scanValue(p?.pregunta ?? "", `candidatos[${ci}].resultadoEntrevista.preguntas[${pi}].pregunta`, issues)
					scanValue(p?.respuesta ?? "", `candidatos[${ci}].resultadoEntrevista.preguntas[${pi}].respuesta`, issues)
					scanValue(p?.concepto ?? "", `candidatos[${ci}].resultadoEntrevista.preguntas[${pi}].concepto`, issues)
				})
			}
		})

		return issues
	}

	return { scanFreeText }
}
