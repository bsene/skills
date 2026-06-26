export const meta = {
  name: 'skill-benchmark-trio',
  description: 'Benchmark the 3 weakest ungated skills (gitmoji, solid, golang-router) across 3 models x with/without, grade against criteria, return deltas',
  phases: [
    { title: 'Generate', detail: '18 cells: 3 scenarios x 3 models x 2 conditions, text-only responses' },
    { title: 'Grade', detail: 'strict per-criterion scoring of each response' },
  ],
}

const BASE = '/Users/birrame.sene/workspace/skills'

const SCENARIOS = [
  {
    id: 'gitmoji-001', skill: 'git-hero-gitmoji', path: `${BASE}/git-hero/gitmoji/SKILL.md`,
    prompt: `I just patched a bug where auth session tokens were being written to the application log file in plaintext. The change touches auth/logging.go.\n\n1. Give me the commit message for this change in gitmoji + Conventional Commits style.\n2. Then give me the exact same commit message again, but in plain Conventional Commits with no emoji at all — our CI commitlint config rejects non-ASCII in the subject line.`,
    criteria: [
      'Part 1 uses the security override lock emoji (:lock:), NOT the default fix bug emoji (:bug:), because the change patches a security/privacy leak',
      'Part 1 keeps the Conventional Commits structure intact: fix(...) type with a scope (e.g. fix(auth): ...) after the emoji',
      'Part 1 description is concrete about the change (stops logging/redacts session tokens), not generic',
      'Part 2 contains NO emoji and NO :shortcode: — a plain Conventional Commits subject only',
      'Part 2 preserves the same fix(auth): ... type and scope as part 1 (does not garble or drop the CC type)',
      'Does NOT claim emoji is mandatory or refuse the no-emoji request; honours the opt-out cleanly',
    ],
  },
  {
    id: 'solid-001', skill: 'oop-principles-solid', path: `${BASE}/oop-principles/solid/SKILL.md`,
    prompt: `Review this class with SOLID and refactor it.\n\nclass OrderService:\n    def __init__(self, db_conn, smtp_host):\n        self.db = db_conn\n        self.smtp_host = smtp_host\n    def place_order(self, cart, user):\n        if not cart.items:\n            raise ValueError("empty cart")\n        total = sum(i.price * i.qty for i in cart.items)\n        import stripe\n        stripe.api_key = "sk_live_xxx"\n        charge = stripe.Charge.create(amount=int(total * 100), source=user.card_token)\n        self.db.execute(f"INSERT INTO orders (user_id, total, charge_id) VALUES ({user.id}, {total}, '{charge.id}')")\n        import smtplib\n        s = smtplib.SMTP(self.smtp_host)\n        s.sendmail("noreply@shop.com", user.email, f"Order confirmed: \${total}")\n        s.quit()\n        return charge.id`,
    criteria: [
      'Identifies the SRP violation: place_order mixes validation, payment, persistence, and notification — multiple reasons to change',
      'Identifies the DIP violation: hard dependency on concrete Stripe and smtplib (instantiated/imported inside the method) rather than injected abstractions',
      'Proposes splitting along the genuine responsibilities (validator, payment gateway/port, order repository, notifier) — roughly one collaborator per real responsibility',
      'Proposes depending on injected abstractions (interfaces/ports for payment, persistence, email) so the gateway/transport can be swapped or faked in tests',
      'Does NOT over-split: no anemic one-method-per-class explosion, no interface introduced where there is only one implementation and no test/extension need',
      'Does NOT change observable behavior or invent unrelated requirements; the refactor preserves what place_order does',
    ],
  },
  {
    id: 'golang-router-001', skill: 'golang', path: `${BASE}/golang/SKILL.md`,
    prompt: `Write an idiomatic Go function readConfig(path string) (*Config, error) that opens a file, decodes JSON into a Config struct, and returns it. Keep it simple and idiomatic.`,
    criteria: [
      'Uses defer f.Close() for cleanup after opening the file',
      'Returns errors (wrapped with fmt.Errorf with %w); does NOT panic or ignore errors with _ on the open/decode path',
      'Checks each error immediately after the call that produced it (if err != nil { return nil, ... })',
      'Returns (*Config, error) with nil, err on failure — no naked returns, no sentinel-by-string',
      'Does NOT over-engineer: no needless interface/generic abstraction, no goroutines/channels, no DI framework for a straight-line file read',
      'Does NOT strip required idioms in the name of simplicity — error handling and defer close remain present',
    ],
  },
]

const MODELS = ['opus', 'sonnet', 'haiku']
const NOFILE = `Respond in TEXT ONLY. Do NOT create, edit, or delete any files. Do NOT run git or any shell/bash commands. Do NOT use any tools that modify the filesystem. Just write your answer as a chat reply.`

const GRADE_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    passes: { type: 'array', items: { type: 'boolean' }, description: 'one boolean per criterion, in order' },
  },
  required: ['passes'],
}

const cells = []
for (const s of SCENARIOS) for (const model of MODELS) for (const cond of ['without', 'with'])
  cells.push({ s, model, cond })

log(`Running ${cells.length} cells (${SCENARIOS.length} scenarios x ${MODELS.length} models x 2 conditions)`)

const graded = await pipeline(
  cells,
  (cell) => {
    const genPrompt = cell.cond === 'with'
      ? `You are an AI coding assistant. For guidance you MAY read ONLY this one file: ${cell.s.path} — read nothing else, and do NOT read anything under .benchmarks/. ${NOFILE}\n\nUser request:\n${cell.s.prompt}`
      : `You are an AI coding assistant. ${NOFILE} Do NOT read any skill files.\n\nUser request:\n${cell.s.prompt}`
    return agent(genPrompt, { model: cell.model, phase: 'Generate', label: `gen:${cell.s.id}:${cell.model}:${cell.cond}` })
  },
  (response, cell) => {
    if (!response) return { ...cell, score: null }
    const list = cell.s.criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')
    const gradePrompt = `You are a strict benchmark grader. Score the RESPONSE against each criterion. Mark a criterion pass=true ONLY if the response clearly and substantively satisfies it; if absent, vague, or wrong, mark false. Criteria that say "does NOT ..." pass only if the response avoids that mistake.\n\nCRITERIA (${cell.s.criteria.length}):\n${list}\n\nRESPONSE:\n"""\n${response}\n"""\n\nReturn passes[] aligned to criteria order.`
    return agent(gradePrompt, { model: 'sonnet', phase: 'Grade', label: `grade:${cell.s.id}:${cell.model}:${cell.cond}`, schema: GRADE_SCHEMA })
      .then((g) => {
        const passes = (g && g.passes) || []
        const n = cell.s.criteria.length
        const passed = passes.slice(0, n).filter(Boolean).length
        return { id: cell.s.id, model: cell.model, cond: cell.cond, score: Math.round((passed / n) * 100), passes: passes.slice(0, n) }
      })
  },
)

const results = {}
for (const g of graded.filter(Boolean)) {
  if (g.score === null) continue
  results[g.id] = results[g.id] || {}
  results[g.id][g.model] = results[g.id][g.model] || {}
  results[g.id][g.model][g.cond] = g.score
}
for (const id of Object.keys(results))
  for (const m of Object.keys(results[id])) {
    const r = results[id][m]
    if (r.with != null && r.without != null) r.delta = r.with - r.without
  }

return results
