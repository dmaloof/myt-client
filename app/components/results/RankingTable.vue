<script setup lang="ts">
type RankingRow = {
	idCandidato?: string
	rankingGlobal?: number
	nombreCandidato?: string
	puntajeAjusteGlobal?: number
	nivelRecomendacion?: string
	shortlisted?: boolean
}

const props = defineProps<{
	rows: RankingRow[]
}>()

function recLabel(rec?: string) {
	if (!rec) return "—"
	return rec.toUpperCase()
}

function recPillClass(rec?: string) {
	const v = (rec || "").toUpperCase()
	if (v === "ALTO") return "bg-emerald-50 text-emerald-800 border-emerald-200"
	if (v === "MEDIO") return "bg-amber-50 text-amber-900 border-amber-200"
	if (v === "BAJO") return "bg-rose-50 text-rose-800 border-rose-200"
	return "bg-slate-50 text-slate-700 border-slate-200"
}

function scorePct(x: any) {
	const n = Number(x)
	if (Number.isFinite(n)) return Math.max(0, Math.min(100, n))
	return 0
}
</script>

<template>
	<div class="overflow-auto rounded-xl border">
		<table class="w-full text-sm">
			<thead class="bg-slate-50 text-slate-500">
			<tr class="border-b">
				<th class="text-left p-3 font-medium">#</th>
				<th class="text-left p-3 font-medium">Candidato</th>
				<th class="text-left p-3 font-medium">Score</th>
				<th class="text-left p-3 font-medium">Recomendación</th>
				<th class="text-left p-3 font-medium">Shortlist</th>
			</tr>
			</thead>

			<tbody>
			<tr v-for="(r, idx) in props.rows" :key="r.idCandidato ?? idx" class="border-b hover:bg-brand-gray/50">
				<td class="p-3 w-16">
            <span class="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white w-8 h-8">
              {{ r.rankingGlobal ?? idx + 1 }}
            </span>
				</td>

				<td class="p-3 font-medium">
					{{ r.nombreCandidato ?? "—" }}
				</td>

				<td class="p-3">
					<div class="flex items-center gap-3">
						<div class="h-2 w-40 bg-slate-100 rounded-full overflow-hidden">
							<div class="h-2 bg-slate-900" :style="{ width: scorePct(r.puntajeAjusteGlobal) + '%' }" />
						</div>
						<span class="tabular-nums text-slate-700">
                {{ r.puntajeAjusteGlobal ?? "—" }}
              </span>
					</div>
				</td>

				<td class="p-3">
            <span
	            class="inline-flex items-center rounded-full border px-2 py-1 text-xs"
	            :class="recPillClass(r.nivelRecomendacion)"
            >
              {{ recLabel(r.nivelRecomendacion) }}
            </span>
				</td>

				<td class="p-3">
            <span
	            class="inline-flex items-center rounded-full border px-2 py-1 text-xs"
	            :class="r.shortlisted ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'"
            >
              {{ r.shortlisted ? "Sí" : "No" }}
            </span>
				</td>
			</tr>

			<tr v-if="props.rows.length === 0">
				<td colspan="5" class="p-6 text-center text-slate-500">
					Sin datos de ranking.
				</td>
			</tr>
			</tbody>
		</table>
	</div>
</template>
