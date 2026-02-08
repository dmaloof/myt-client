type AnyObj = Record<string, any>

function escapeRegex(s: string) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function useCandidateIdText(result: AnyObj) {
	const idToName = new Map<string, string>()

	// Prefer resultadosRanking because it's usually consistent across report modes
	const ranking = Array.isArray(result?.resultadosRanking) ? result.resultadosRanking : []
	for (const r of ranking) {
		const id = String(r?.idCandidato ?? "").trim()
		const name = String(r?.nombreCandidato ?? r?.name ?? "").trim()
		if (id && name) idToName.set(id, name)
	}

	// Fallback: some modes might not have nombreCandidato in ranking
	const detalles = Array.isArray(result?.resultados) ? result.resultados : []
	for (const d of detalles) {
		const id = String(d?.idCandidato ?? d?.candidato?.idCandidato ?? "").trim()
		const name = String(d?.nombreCandidato ?? d?.candidato?.nombre ?? d?.nombre ?? "").trim()
		if (id && name && !idToName.has(id)) idToName.set(id, name)
	}

	// Build one regex that matches any known id, as a token.
	// We avoid lookbehind for compatibility: keep prefix in group 1.
	const ids = Array.from(idToName.keys()).sort((a, b) => b.length - a.length)
	const re =
		ids.length
			? new RegExp(`(^|[^\\w])(${ids.map(escapeRegex).join("|")})(?=[^\\w]|$)`, "g")
			: null

	/**
	 * Replace ids in arbitrary text:
	 * "C5/C4: ..." -> "Juan/Ana: ..."
	 * Keeps unknown ids unchanged.
	 */
	function replaceIdsInText(text: any) {
		if (typeof text !== "string") return text
		if (!re) return text

		return text.replace(re, (full, prefix, id) => {
			const name = idToName.get(id)
			return prefix + (name ?? id)
		})
	}

	/**
	 * Useful for arrays of bullet strings.
	 */
	function replaceIdsInArray(arr: any) {
		if (!Array.isArray(arr)) return arr
		return arr.map((x) => (typeof x === "string" ? replaceIdsInText(x) : x))
	}

	return { replaceIdsInText, replaceIdsInArray, idToName }
}
