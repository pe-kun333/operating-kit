// 段階②-1 の案の一覧の事務を手伝う道具（運用の型。docs/operating-kit/README.md）。
// Workflow の script ではない。素の Node の ES モジュール（Node 18 以上）。読むのと書くのは、渡したファイルだけ。
//
// 使い方：
//   node ideas-table.mjs extract <出力のファイル> <書く先.json> [--force]
//       ワークフローの通知が示す出力のファイル（JSON）から result だけを取り出し、整形して（インデント 2、末尾に改行）書く。
//       result が文字列なら JSON として読み直す。result が無いか、（読み直したあと）配列でないオブジェクトでなければ失敗。ほかの欄（モデル名が入りうる）は書かない。
//       書く先が既にあれば失敗（上書きしない決まり。同じ周の二回目からは raw-R<周>-2.json と番号を上げる。--force で上書き）。
//   node ideas-table.mjs table <raw.json> [--run <run ID>]
//       ideate.js の返す値（raw-R<周>.json）の ideas を、案の一覧の「観点 × 案の表」の行にして標準出力へ（見出しの行は出さない）。
//       列：| id | 短い名前 | 何を（一文） | 観点 | 種類 | 部分 | 出どころ |
//       種類は広げた担当の自己申告（kind）。付け直しは主担当が手で（「（→ ）」は出さない）。部分は「・」でつなぐ。
//       出どころは R<周>（--run があれば R<周>・<run ID>）。主担当の案（main: true）は「主担当」。
//   node ideas-table.mjs known <raw.json>...
//       渡した全部の raw の案を「<id> <短い名前>」にして、JSON の配列で標準出力へ（ideate.js の known にそのまま渡せる）。
//       同じ id が二つあれば失敗。
//   node ideas-table.mjs --help
// table と known は、ideas の各案がオブジェクトで、id が空でない文字列であることを見る（違えば失敗）。
// 引数が足りない・知らないコマンドは、使い方を出して終了コード 1。
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const USAGE = [
  '使い方：',
  '  node ideas-table.mjs extract <出力のファイル> <書く先.json> [--force]',
  '      出力のファイル（JSON）の result だけを整形して書く。書く先が既にあれば失敗（--force で上書き）',
  '  node ideas-table.mjs table <raw.json> [--run <run ID>]',
  '      ideas を「観点 × 案の表」の行にして標準出力へ',
  '      列：| id | 短い名前 | 何を（一文） | 観点 | 種類 | 部分 | 出どころ |',
  '  node ideas-table.mjs known <raw.json>...',
  '      全部の案を「<id> <短い名前>」の JSON の配列にして標準出力へ（ideate.js の known に渡せる）',
].join('\n')

const usage = (msg) => {
  if (msg) console.error(msg)
  console.error(USAGE)
  process.exit(1)
}
const fail = (msg) => {
  console.error(msg)
  process.exit(1)
}
const readJson = (file) => {
  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch (e) {
    fail(`読めない：${file}（${e.code || e.message}）`)
  }
  try {
    return JSON.parse(text.replace(/^﻿/, ''))
  } catch (e) {
    fail(`JSON として読めない：${file}（${e.message}）`)
  }
}
const readIdeas = (file) => {
  const raw = readJson(file)
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.ideas)) fail(`${file} に ideas の配列が無い（ideate.js の返す値を写した raw-R<周>.json を渡す）`)
  raw.ideas.forEach((x, i) => {
    if (!x || typeof x !== 'object' || Array.isArray(x) || typeof x.id !== 'string' || !x.id.trim()) fail(`${file} の ideas の ${i + 1} 番目に id が無い`)
  })
  return raw
}

const extract = (rest) => {
  const force = rest.includes('--force')
  const pos = rest.filter((a) => a !== '--force')
  const flags = pos.filter((a) => a.startsWith('--'))
  if (flags.length) usage(`extract に知らない指定がある：${flags.join(' ')}`)
  if (pos.length !== 2) usage('extract には <出力のファイル> と <書く先.json> が要る')
  const [src, dest] = pos
  const data = readJson(src)
  if (!data || typeof data !== 'object' || Array.isArray(data) || data.result === undefined || data.result === null) fail(`${src} に result が無い`)
  let result = data.result
  if (typeof result === 'string') {
    try {
      result = JSON.parse(result)
    } catch (e) {
      fail(`${src} の result は文字列で、JSON として読めない（${e.message}）`)
    }
  }
  if (!result || typeof result !== 'object' || Array.isArray(result)) fail(`${src} の result がオブジェクトでない`)
  if (!force && existsSync(dest)) fail(`${dest} が既にある（上書きしない。同じ周の二回目からは raw-R<周>-2.json と番号を上げる。上書きするなら --force）`)
  try {
    writeFileSync(dest, JSON.stringify(result, null, 2) + '\n', { encoding: 'utf8', flag: force ? 'w' : 'wx' })
  } catch (e) {
    fail(`書けない：${dest}（${e.code || e.message}）`)
  }
  console.log(`書いた：${dest}`)
}

const cell = (v) => String(v === undefined || v === null ? '' : v).replace(/\r\n|\r|\n/g, ' ').replace(/\|/g, '\\|')

const table = (rest) => {
  let runId = null
  const pos = []
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--run') {
      if (i + 1 >= rest.length || rest[i + 1].startsWith('--') || rest[i + 1].trim() === '') usage('--run には run ID が要る')
      runId = rest[++i]
    } else if (rest[i].startsWith('--')) usage(`table に知らない指定がある：${rest[i]}`)
    else pos.push(rest[i])
  }
  if (pos.length !== 1) usage('table には <raw.json> を一つ渡す')
  const raw = readIdeas(pos[0])
  if (!Number.isInteger(raw.round)) fail(`${pos[0]} に round（周の番号）が無い`)
  const rows = raw.ideas.map((x) => {
    const source = x.main ? '主担当' : `R${raw.round}${runId ? `・${runId}` : ''}`
    const partsText = Array.isArray(x.parts) ? x.parts.join('・') : ''
    return `| ${[x.id, x.title, x.what, x.lens, x.kind, partsText, source].map(cell).join(' | ')} |`
  })
  if (rows.length) console.log(rows.join('\n'))
}

const known = (rest) => {
  const flags = rest.filter((a) => a.startsWith('--'))
  if (flags.length) usage(`known に知らない指定がある：${flags.join(' ')}`)
  if (!rest.length) usage('known には <raw.json> を一つ以上渡す')
  const seen = new Map()
  const out = []
  for (const file of rest) {
    const raw = readIdeas(file)
    for (const x of raw.ideas) {
      if (seen.has(x.id)) fail(`同じ id が二つある：${x.id}（${seen.get(x.id)} と ${file}）`)
      seen.set(x.id, file)
      out.push(`${x.id} ${String(x.title).replace(/\s*[\r\n]+\s*/g, ' ')}`)
    }
  }
  console.log(JSON.stringify(out, null, 2))
}

const [cmd, ...rest] = process.argv.slice(2)
if (cmd === '--help' || cmd === '-h' || cmd === 'help') {
  console.log(USAGE)
  process.exit(0)
}
if (cmd === 'extract') extract(rest)
else if (cmd === 'table') table(rest)
else if (cmd === 'known') known(rest)
else usage(cmd ? `知らないコマンド：${cmd}` : 'コマンドが要る')
