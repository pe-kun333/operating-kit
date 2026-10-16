// Workflow スクリプトを node で確かめるための模擬の仕組み。
// 使い方：node harness.mjs <script.js> <case.json>
// case.json：{ args, fail?: [label の部分文字列], throwFor?: [...] }
import { readFileSync } from 'node:fs'

const [, , scriptPath, casePath] = process.argv
const src = readFileSync(scriptPath, 'utf8')
const tc = JSON.parse(readFileSync(casePath, 'utf8'))

const body = src.replace(/^export const meta =/m, 'const meta =')
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

const calls = []
const logs = []
let active = 0, maxActive = 0

function fakeFor(prompt, opts) {
  const s = opts.schema
  const props = s && s.properties ? Object.keys(s.properties) : []
  if (props.includes('ideas') && !props.includes('items')) {
    // 広げる
    const lens = (opts.label || '').split(':')[1] || '?'
    const kinds = s.properties.ideas.items.properties.kind.enum
    return {
      ideas: [0, 1, 2, 3].map((i) => ({ title: `${lens}の案${i + 1}`, what: `${lens} ${i + 1}`, scene: '場面', touches: '面', kind: kinds[i % kinds.length], ...(s.properties.ideas.items.properties.parts ? { parts: [s.properties.ideas.items.properties.parts.items.enum[i % s.properties.ideas.items.properties.parts.items.enum.length]] } : {}) })),
      thin: lens === '問いを変える',
      questions: [`${lens}の問い`],
    }
  }
  if (props.includes('items')) {
    const itemsSchema = s.properties.items
    const ids = Object.keys(itemsSchema.properties || {})
    const sample = ids.length ? itemsSchema.properties[ids[0]].properties : {}
    const drop = (tc.dropIds || [])
    const keep = ids.filter((id) => !drop.includes(id))
    if (sample.found) return { items: Object.fromEntries(keep.map((id, i) => [id, { found: i % 2 === 0, entry: `src/x.ts:1（${id}）`, existing: 'なし', assumptions: ['前提'], overlaps: [], ...(sample.overlaps_known ? { overlaps_known: i === 0 ? [sample.overlaps_known.items.enum[0]] : [] } : {}) }])) }
    return { items: Object.fromEntries(keep.map((id) => [id, { weak: [`${id}の弱さ`], conditions: ['条件'], bolder: '大胆', combos: [], cheapest_check: '安い確かめ' }])), roots: [{ note: '共通の前提', ids: keep.slice(0, 2) }], on_background: prompt.includes('主担当の見立て') ? ['見立てへの疑い'] : [] }
  }
  if (props.includes('conclusion')) return { conclusion: 'ok', reasons: [{ claim: 'c', file: 'f' }] }
  if (props.includes('summary')) return { summary: 's', facts: [] }
  return 'text'
}

const agent = async (prompt, opts = {}) => {
  calls.push({ label: opts.label, phase: opts.phase, model: opts.model, effort: opts.effort, agentType: opts.agentType, prompt, schemaRequired: opts.schema && opts.schema.properties && opts.schema.properties.items ? opts.schema.properties.items.required : undefined })
  active++; maxActive = Math.max(maxActive, active)
  await new Promise((r) => setTimeout(r, 5))
  active--
  if ((tc.fail || []).some((f) => (opts.label || '').includes(f))) return null
  return fakeFor(prompt, opts)
}
const parallel = async (thunks) => Promise.all(thunks.map((t) => Promise.resolve().then(t).catch(() => null)))
const pipeline = async (items, ...stages) => Promise.all(items.map(async (item, i) => {
  let v = item
  for (const st of stages) {
    try { v = await st(v, item, i) } catch (e) { logs.push(`stage throw: ${e.message}`); return null }
  }
  return v
}))
const phase = (t) => logs.push(`[phase] ${t}`)
const log = (m) => logs.push(`[log] ${m}`)

try {
  const fn = new AsyncFunction('agent', 'parallel', 'pipeline', 'phase', 'log', 'args', body + '\n')
  const out = await fn(agent, parallel, pipeline, phase, log, tc.args)
  console.log(JSON.stringify({ ok: true, agents: calls.length, maxActive, logs, calls: calls.map(({ prompt, ...c }) => c), out, prompts: tc.showPrompts ? calls.map((c) => c.prompt) : undefined }, null, 2))
} catch (e) {
  console.log(JSON.stringify({ ok: false, error: e.message, agents: calls.length, logs }, null, 2))
}
