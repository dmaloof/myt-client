// app/utils/promptGuard.ts
export type PromptGuardHit = {
	reason: string
	pattern: string
}

const PATTERNS: Array<{ reason: string; re: RegExp }> = [
	{ reason: 'Attempts to override instructions', re: /\b(ignore|bypass|override)\b.*\b(instruction|rules|system|policy)\b/i },
	{ reason: 'Mentions system prompt / developer prompt', re: /\b(system prompt|developer message|hidden instructions)\b/i },
	{ reason: 'Code block / prompt formatting injection', re: /```|<\s*script\b|<\/\s*script\s*>/i },
	{ reason: 'Tool / function call bait', re: /\b(call|invoke|execute)\b.*\b(tool|function|browser|web)\b/i },
	{ reason: 'Credential / secret harvesting', re: /\b(api key|clientKey|password|secret|token)\b/i },
]

export function checkPromptInjection(text: string): PromptGuardHit[] {
	const t = (text ?? '').trim()
	if (!t) return []
	const hits: PromptGuardHit[] = []
	for (const p of PATTERNS) {
		if (p.re.test(t)) hits.push({ reason: p.reason, pattern: String(p.re) })
	}
	return hits
}

export function isSafeText(text: string): boolean {
	return checkPromptInjection(text).length === 0
}
