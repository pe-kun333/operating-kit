// Workflow スクリプトの構文だけを確かめる（実行はしない）。
// 使い方：node dev/syntax-check.mjs <script.js>...
// node --check は Node 22 以降だと .js を ES モジュールとして読み、トップレベルの return で落ちるので、
// workflow-harness.mjs と同じ作り（export const meta = を const meta = に替え、AsyncFunction に本体を渡す）で読む。
import { readFileSync } from 'node:fs'

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
const files = process.argv.slice(2)
if (!files.length) { console.log('使い方：node dev/syntax-check.mjs <script.js>...'); process.exit(1) }
let fail = 0
for (const f of files) {
  try {
    // 読めないファイルも NG にする（スタックトレースを出さない）
    const body = readFileSync(f, 'utf8').replace(/^export const meta =/m, 'const meta =')
    // 作るだけで呼ばない（構文の誤りは作るときに SyntaxError になる）
    new AsyncFunction('agent', 'parallel', 'pipeline', 'phase', 'log', 'args', body + '\n')
    console.log(`ok ${f}`)
  } catch (e) {
    console.log(`NG ${f}：${e.name}: ${e.message}`)
    fail = 1
  }
}
process.exit(fail)
