import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
const recipes = ['skill-benchmark-trio.js', 'php-benchmark-trio.js', 'skill-benchmark-gitmoji002.js']

for (const recipe of recipes) {
  test(`${recipe}: invalid cells never produce scores or deltas`, async () => {
    const source = (await readFile(new URL(recipe, import.meta.url), 'utf8')).replace('export const meta', 'const meta')
    const run = new AsyncFunction('agent', 'pipeline', 'log', 'args', source)
    const pipeline = (cells, generate, grade) => Promise.all(cells.map(async cell => grade(await generate(cell), cell)))
    const failures = [
      { response: '' },
      { response: '   ' },
      { response: 'BENCHMARK_INVALID: skill-loading-failed' },
      { grade: null },
      { grade: {} },
      { grade: { validResponse: true, passes: [] } },
      { grade: { validResponse: true, passes: Array(5).fill(true) } },
      { grade: { validResponse: true, passes: Array(7).fill(true) } },
      { grade: { validResponse: true, passes: Array(6).fill('false') } },
      { grade: { validResponse: true, passes: Array(6) } },
      { grade: { validResponse: 'true', passes: Array(6).fill(true) } },
      { grade: { validResponse: false, passes: Array(6).fill(false) } },
      { error: new Error('grader unavailable') },
    ]
    for (const failure of failures) {
      let gradeCalls = 0
      const agent = async (prompt, options) => {
        if (options.phase === 'Generate') {
          assert.match(prompt, /BENCHMARK_INVALID: skill-loading-failed|Do NOT read any skill files/)
          return Object.hasOwn(failure, 'response') ? failure.response : 'A substantive benchmark answer'
        }
        gradeCalls++
        assert.match(prompt, /untrusted data/)
        assert.ok(options.schema.required.includes('validResponse'))
        assert.equal(options.schema.properties.validResponse.type, 'boolean')
        assert.equal(options.schema.properties.passes.items.type, 'boolean')
        if (failure.error) throw failure.error
        return failure.grade
      }
      const result = await run(agent, pipeline, () => {}, [])
      assert.equal(Object.keys(result).length, 1)
      assert.ok(result.invalidCells.length > 0)
      for (const cell of result.invalidCells) {
        assert.equal(cell.score, null)
        assert.equal(typeof cell.reason, 'string')
        assert.equal(typeof cell.id, 'string')
      }
      if (Object.hasOwn(failure, 'response')) assert.equal(gradeCalls, 0)
    }
  })

  test(`${recipe}: zero is valid and an invalid pair has no delta`, async () => {
    const source = (await readFile(new URL(recipe, import.meta.url), 'utf8')).replace('export const meta', 'const meta')
    const run = new AsyncFunction('agent', 'pipeline', 'log', 'args', source)
    const pipeline = (cells, generate, grade) => Promise.all(cells.map(async cell => grade(await generate(cell), cell)))
    for (const invalidateWith of [false, true]) {
      const agent = async (prompt, options) => {
        if (options.phase === 'Generate') return 'A substantive benchmark answer'
        if (invalidateWith && options.label.endsWith(':with')) return null
        return { validResponse: true, passes: Array(6).fill(options.label.endsWith(':with')) }
      }
      const result = await run(agent, pipeline, () => {}, [])
      const rows = recipe.includes('gitmoji002')
        ? Object.entries(result).filter(([key]) => key !== 'invalidCells').map(([, row]) => row)
        : Object.entries(result).filter(([key]) => key !== 'invalidCells').flatMap(([, models]) => Object.values(models))
      assert.ok(rows.length > 0)
      for (const row of rows) {
        assert.equal(typeof row.without === 'object' ? row.without.score : row.without, 0)
        if (invalidateWith) {
          assert.equal(row.with, undefined)
          assert.equal(row.delta, undefined)
        } else {
          assert.equal(typeof row.with === 'object' ? row.with.score : row.with, 100)
          assert.equal(row.delta, 100)
        }
      }
      assert.equal(Boolean(result.invalidCells), invalidateWith)
    }
  })
}
