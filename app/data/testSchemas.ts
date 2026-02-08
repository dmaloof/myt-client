// app/data/testSchemas.ts
export type FieldType = 'number' | 'string' | 'string[]' | 'object'

export type ScoresSchema =
	| { type: 'number' }
	| { type: 'string' }
	| { type: 'string[]' }
	| { type: 'object'; fields: Record<string, ScoresSchema> }

export type TestSchema = {
	name: string
	label: string
	scores: ScoresSchema
}

const num = (): ScoresSchema => ({ type: 'number' })
const str = (): ScoresSchema => ({ type: 'string' })
const arrStr = (): ScoresSchema => ({ type: 'string[]' })
const obj = (fields: Record<string, ScoresSchema>): ScoresSchema => ({ type: 'object', fields })

export const TEST_SCHEMAS: TestSchema[] = [
	{
		name: 'ventas',
		label: 'Ventas',
		scores: obj({
			dgv: num(), r: num(), i: num(), ii: num(), iii: num(), iv: num(), a: num(),
			v: num(), vi: num(), vii: num(), viii: num(), ix: num(),
		}),
	},
	{ name: 'excel', label: 'Excel', scores: obj({ score: num() }) },
	{ name: 'inglesGrammar', label: 'Inglés Grammar', scores: obj({ score: num() }) },
	{ name: 'inglesListening', label: 'Inglés Listening', scores: obj({ score: num() }) },
	{ name: 'inglesVocabulary', label: 'Inglés Vocabulary', scores: obj({ score: num() }) },
	{ name: 'inglesReading', label: 'Inglés Reading', scores: obj({ score: num() }) },

	{ name: 'comprension_textos', label: 'Comprensión de textos', scores: obj({ percentil: num() }) },
	{ name: 'comprension_verbal', label: 'Comprensión verbal', scores: obj({ percentil: num() }) },

	{
		name: 'disc',
		label: 'DISC',
		scores: obj({
			personal: obj({ D: num(), I: num(), S: num(), C: num() }),
			laboral: obj({ D: num(), I: num(), S: num(), C: num() }),
			publico: obj({ D: num(), I: num(), S: num(), C: num() }),
			consistencia: obj({
				'Dominancia (D)': str(),
				'Influencia (I)': str(),
				'Serenidad (S)': str(),
				'Cumplimiento (C)': str(),
			}),
			cualidades: obj({
				D: arrStr(),
				I: arrStr(),
				S: arrStr(),
				C: arrStr(),
			}),
			estilo_conductual: arrStr(),
			perfil_clasico: str(),
		}),
	},

	{
		name: 'inteligencia_emocional',
		label: 'Inteligencia emocional',
		scores: obj({ Global: str(), Percepcion: str(), Procesamiento: str(), Ejecucion: str() }),
	},

	{ name: 'interpretacion_selectiva', label: 'Interpretación selectiva', scores: obj({ percentil: num(), eficacia: num() }) },
	{ name: 'juicio_ventas', label: 'Juicio en ventas', scores: obj({ percentil: num() }) },
	{ name: 'metodo_orden', label: 'Método y orden', scores: obj({ percentil: num() }) },
	{ name: 'ortografia', label: 'Ortografía', scores: obj({ score: num() }) },

	{
		name: 'razonamiento',
		label: 'Razonamiento',
		scores: obj({ factor_g: num(), eficacia: num(), rapidez: num(), eficiencia: num() }),
	},

	{
		name: 'personalidad',
		label: 'Personalidad 16 factores',
		// This list is long; keep it flexible: allow JSON edit (we’ll render known keys, but accept others)
		scores: obj({
			Afabilidad: num(),
			Razonamiento: num(),
			'Estabilidad Emocional': num(),
			Dominancia: num(),
			// ... you can add the rest later if you want stricter UI
		}),
	},

	{
		name: 'personalidad_bf',
		label: 'Personalidad 5 factores',
		scores: obj({
			e: num(), di: num(), do: num(), a: num(), cp: num(), co: num(), t: num(),
			es: num(), pe: num(), ee: num(), ce: num(), ci: num(), am: num(), ac: num(), ae: num(),
		}),
	},

	{ name: 'rapidez_perceptiva', label: 'Rapidez perceptiva', scores: obj({ percentil: num() }) },

	{
		name: 'resiliencia',
		label: 'Resiliencia',
		scores: obj({ resiliencia: num(), confianza: num(), perseverancia: num(), ecuanimidad: num(), aceptacion: num() }),
	},

	{ name: 'tablas_graficos', label: 'Tablas y gráficos', scores: obj({ percentil: num() }) },

	{ name: 'valores', label: 'Valores', scores: obj({ intelectual: num(), rectitud: num(), emocional: num(), afectivo: num(), espiritual: num() }) },

	{
		name: 'ancla_carrera',
		label: 'Ancla de carrera',
		scores: obj({ dominant: arrStr(), experience: str() }),
	},

	{
		name: 'aprendizaje',
		label: 'Aprendizaje',
		scores: obj({ percentil: num(), informacion: num(), vocabulario: num(), verbal: num(), logico: num(), numerico: num() }),
	},

	{
		name: 'competencias',
		label: 'Competencias',
		scores: obj({
			intra: num(), est: num(), confi: num(), res: num(), inter: num(), com: num(), rel: num(), neg: num(),
			inf: num(), equi: num(), tarea: num(), ini: num(), orres: num(), anal: num(), deci: num(), entorno: num(),
			cono: num(), vis: num(), orcli: num(), aper: num(), iden: num(), gerencial: num(), dir: num(), lid: num(),
			org: num(), sin: num(),
		}),
	},
]

export const TEST_NAMES = TEST_SCHEMAS.map(t => t.name) as readonly string[]
export type TestName = (typeof TEST_SCHEMAS)[number]["name"]
export const getTestSchema = (name: string) => TEST_SCHEMAS.find(t => t.name === name)
