export const meta = {
  name: 'skill-benchmark-gitmoji002',
  description: 'Harder gitmoji disambiguation scenario across 3 models x with/without, grade against criteria, return deltas',
  phases: [
    { title: 'Generate', detail: '6 cells: 1 scenario x 3 models x 2 conditions, text-only' },
    { title: 'Grade', detail: 'strict per-criterion scoring' },
  ],
}

const BASE = '/Users/birrame.sene/workspace/skills'

const S = {
  id: 'gitmoji-002', skill: 'git-hero-gitmoji', path: `${BASE}/git-hero/gitmoji/SKILL.md`,
  prompt: `Give me the single most precise gitmoji + Conventional Commits subject line for EACH of these four changes. One line each, and use the most specific emoji, not a generic default.\n\n1. I deleted a block of code that was unreachable after an earlier refactor — pure dead-code removal.\n2. I reformatted a file (indentation, import ordering, whitespace) with zero behavior change.\n3. I rewrote the internal logic of a function to be cleaner — same inputs/outputs, behavior unchanged.\n4. I added the lodash package as a new dependency to package.json.`,
  criteria: [
    'Change 1 (dead code) uses the coffin emoji :coffin: (dead-code specific), NOT the generic fire emoji :fire:',
    'Change 2 (pure formatting) uses the art/palette emoji :art:, NOT the recycle emoji :recycle:',
    'Change 3 (logic rewrite, same behavior) uses the recycle emoji :recycle: (behavioral refactor), NOT the art emoji :art:',
    'Change 4 (add dependency) uses the heavy-plus-sign emoji :heavy_plus_sign:, NOT the sparkles emoji :sparkles:',
    'Each line keeps a valid Conventional Commits type+scope after the emoji (e.g. refactor:, style:, chore(deps):)',
    'Does NOT collapse all four to the same generic emoji or mislabel the art-vs-recycle pair',
  ],
}

const MODELS = ['opus', 'sonnet', 'haiku']
const NOFILE = `Respond in TEXT ONLY. Do NOT create, edit, or delete any files. Do NOT run git or any shell/bash commands. Do NOT use any tools that modify the filesystem. Just write your answer as a chat reply.`

const GRADE_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: { passes: { type: 'array', items: { type: 'boolean' } } },
  required: ['passes'],
}

const cells = []
for (const model of MODELS) for (const cond of ['without', 'with']) cells.push({ model, cond })

const graded = await pipeline(
  cells,
  (cell) => {
    const genPrompt = cell.cond === 'with'
      ? `You are an AI coding assistant. For guidance you MAY read ONLY this one file: ${S.path} — read nothing else, and do NOT read anything under .benchmarks/. ${NOFILE}\n\nUser request:\n${S.prompt}`
      : `You are an AI coding assistant. ${NOFILE} Do NOT read any skill files.\n\nUser request:\n${S.prompt}`
    return agent(genPrompt, { model: cell.model, phase: 'Generate', label: `gen:${S.id}:${cell.model}:${cell.cond}` })
  },
  (response, cell) => {
    if (!response) return { ...cell, score: null }
    const list = S.criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')
    const gradePrompt = `You are a strict benchmark grader. Score the RESPONSE against each criterion. Mark a criterion pass=true ONLY if the response clearly and substantively satisfies it; if absent, vague, or wrong, mark false. Criteria that say "does NOT ..." pass only if the response avoids that mistake.\n\nCRITERIA (${S.criteria.length}):\n${list}\n\nRESPONSE:\n"""\n${response}\n"""\n\nReturn passes[] aligned to criteria order.`
    return agent(gradePrompt, { model: 'sonnet', phase: 'Grade', label: `grade:${S.id}:${cell.model}:${cell.cond}`, schema: GRADE_SCHEMA })
      .then((g) => {
        const passes = (g && g.passes) || []
        const n = S.criteria.length
        const passed = passes.slice(0, n).filter(Boolean).length
        return { model: cell.model, cond: cell.cond, score: Math.round((passed / n) * 100), passes: passes.slice(0, n) }
      })
  },
)

const out = {}
for (const g of graded.filter(Boolean)) {
  if (g.score === null) continue
  out[g.model] = out[g.model] || {}
  out[g.model][g.cond] = g.score
  out[g.model][cond_key(g.cond)] = g.passes
}
function cond_key(c){ return c + '_passes' }
for (const m of Object.keys(out)) if (out[m].with != null && out[m].without != null) out[m].delta = out[m].with - out[m].without

return out
