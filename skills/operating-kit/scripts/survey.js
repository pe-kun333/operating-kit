export const meta = {
  name: 'operating-kit-survey',
  description: '話題ごとに読んで、出どころ付きの事実と、印付きの事例・場面・類推、引っかかりを集める（調査担当。判定しない）',
  whenToUse: '段階①-1 の下調べ、段階①-2・②-1・②-2 で入口や事実を読み足すとき',
  phases: [{ title: '集める', detail: '話題ごとに一体。読み取り専用で、事実と出どころ、印付きの事例・場面・類推、引っかかりを返す' }],
}

// 運用の型（docs/operating-kit/README.md）の下調べのひな形。
// Workflow ツールに scriptPath（このファイルの絶対パス）と args で渡す。モデル名はこのファイルに書かない。
//
// args（渡す人：段階①-1 のセッション、または主担当。JSON の値で渡し、文字列にしない）：
//   topics    話題の一覧 [{ key, ask, read?, periphery? }]（必須。10 まで）
//             key は話題の短い名前（索引のファイル名にも使う）、ask は集めること、read は読む場所の手がかり（利用者が渡した資料のパスもここに）
//             periphery: true は、範囲の外の「周辺」の話題（一つまで。段階①-1 の索引の「周辺」の節に書く）
//   model     CLAUDE.md の役割の表の調査担当の指定（必須。段階①-1 では CLAUDE.md の「段階①-1 の決まり」の 6 の指定。ほかの段階で読み足すときは役割の表の調査担当の指定）
//   scope     範囲の説明（HANDOFF.md の §0 の「次の段階」に書いた範囲）
//   external  true なら、リポジトリの外の資料（Web など）も読んでよい（任意。既定 false。利用者が許したときだけ true にする。CLAUDE.md の「段階①-1 の決まり」の 4）
//   externalScope  external を true にするときの、利用者が許した範囲（任意。例：「公式ドキュメントだけ」）。指示文に入れる
//   利用者が渡した資料は、リポジトリの外のパスでも、話題の read に入れれば読める（許しは要らない）
//
// 返すもの：{ model, collected, empty, periphery, external, topics: [{ key, periphery, result }] }
//   result：{ summary, facts, others, snags, not_found, unverified }
//   facts は事実（出どころはファイルと行）。others は外の事例・使う人の場面・類推（出どころの種類と確からしさの印つき。事実と分けて置く）。
//   snags は引っかかり（食い違い・意外だったこと・浮かんだ問い。判定ではない）。
// ワークフローの中では書かない。返ってきたものを、セッションが docs/wip/<始めた日>/ に一話題一ファイルで書く（事実と、事例・場面・類推は節を分ける）
// （段階②-1 で読み足すときは、案の一覧のフォルダの sources/<話題>.md に書く。段階①-1 の索引は直さない）。
// model は記録とファイルに写さない（集め方は run ID と役割名で書く）。

const OTHER_KINDS = ['外の事例', '使う人の場面', '類推']
const SOURCE_TYPES = ['このリポジトリ', '利用者が渡した資料', '外の資料（許しあり）', '担当の知っていること']
const CERTAINTY = ['確かめた', '読んだだけ', '推し量り']
const SNAG_KINDS = ['食い違い', '意外だったこと', '浮かんだ問い']

const SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string', description: '集めたものの要約（三行まで。良し悪しは書かない）' },
    facts: {
      type: 'array',
      description: '事実。出どころ（ファイルと、見た時点の行）を付ける',
      items: {
        type: 'object',
        properties: {
          fact: { type: 'string' },
          file: { type: 'string' },
          line: { type: 'string' },
        },
        required: ['fact', 'file'],
      },
    },
    others: {
      type: 'array',
      description: '外の事例・使う人の場面・類推。事実とは分けて、出どころの種類と確からしさの印を付ける',
      items: {
        type: 'object',
        properties: {
          kind: { type: 'string', enum: OTHER_KINDS },
          note: { type: 'string', description: '一行' },
          source_type: { type: 'string', enum: SOURCE_TYPES },
          source: { type: 'string', description: '出どころ（ファイルと行、渡された資料のパス、URL。担当の知っていることなら空でよい）' },
          certainty: { type: 'string', enum: CERTAINTY },
        },
        required: ['kind', 'note', 'source_type', 'certainty'],
      },
    },
    snags: {
      type: 'array',
      description: '引っかかり（判定ではない）。食い違い・意外だったこと・浮かんだ問い',
      items: {
        type: 'object',
        properties: {
          kind: { type: 'string', enum: SNAG_KINDS },
          note: { type: 'string', description: '一行' },
          file: { type: 'string' },
          line: { type: 'string' },
        },
        required: ['kind', 'note'],
      },
    },
    not_found: { type: 'array', items: { type: 'string' }, description: '探したが見つからなかったこと' },
    unverified: { type: 'array', items: { type: 'string' }, description: '確かめていないこと（読んだだけ、食い違っていた、など）' },
  },
  required: ['summary', 'facts', 'others', 'snags'],
}

if (typeof args === 'string') throw new Error('args は JSON の値で渡す（文字列にしない）')
if (!args || typeof args !== 'object') throw new Error('args が要る（topics・model。ファイルの頭の説明を見る）')
const KEYS = ['topics', 'model', 'scope', 'external', 'externalScope']
const unknownKeys = Object.keys(args).filter((k) => !KEYS.includes(k))
if (unknownKeys.length) throw new Error(`args に知らない名前がある：${unknownKeys.join('・')}（使える名前：${KEYS.join('・')}）`)
if (!args.model) throw new Error('args.model が要る（CLAUDE.md の役割の表の調査担当の指定。省かない）')
if (!Array.isArray(args.topics) || !args.topics.length) throw new Error('args.topics（話題の一覧）が要る')
if (args.topics.length > 10) throw new Error('一つのワークフローは 10 体以内（CLAUDE.md の合図の語（ワークフロー）の節）')
if (args.external !== undefined && typeof args.external !== 'boolean') throw new Error('args.external は true か false（利用者が外の資料を許したときだけ true）')
const TOPIC_KEYS = ['key', 'ask', 'read', 'periphery']
const topics0 = args.topics.map((t) => {
  if (!t || typeof t.key !== 'string' || !t.key.trim() || typeof t.ask !== 'string' || !t.ask.trim()) throw new Error('話題は { key, ask, read?, periphery? } で渡す（key と ask は空でない文字列）')
  const unknownTopicKeys = Object.keys(t).filter((k) => !TOPIC_KEYS.includes(k))
  if (unknownTopicKeys.length) throw new Error(`話題 ${t.key} に知らない名前がある：${unknownTopicKeys.join('・')}（使える名前：${TOPIC_KEYS.join('・')}）`)
  if (t.periphery !== undefined && typeof t.periphery !== 'boolean') throw new Error(`話題 ${t.key} の periphery は true か false`)
  const readT = t.read === undefined ? [] : (typeof t.read === 'string' ? [t.read] : t.read)
  if (!Array.isArray(readT) || !readT.every((r) => typeof r === 'string' && r.trim())) throw new Error(`話題 ${t.key} の read は文字列の配列`)
  return { key: t.key, ask: t.ask, read: readT, periphery: t.periphery === true }
})
if (new Set(topics0.map((t) => t.key)).size !== topics0.length) throw new Error('話題の key が重なっている（ファイル名になる）')
const periphery = topics0.filter((t) => t.periphery).map((t) => t.key)
if (periphery.length > 1) throw new Error(`周辺の話題は一つまで：${periphery.join('・')}`)
const external = args.external === true
if (args.externalScope !== undefined && (typeof args.externalScope !== 'string' || !external)) throw new Error('args.externalScope は、external を true にしたときだけ、許した範囲の文字列で渡す')

const promptFor = (t) => [
  'あなたは調査担当です。読み取り専用です。ファイルを書かない・直さない・git の操作をしない。',
  '読んで集めるだけです。決めない、判定しない、計画しない、良し悪しを書かない。',
  '',
  args.scope ? `## 範囲\n${args.scope}\n` : '',
  t.periphery ? '## この話題は「周辺」です\n範囲の外から一つだけ足した話題です。範囲の外であることを summary に書く。\n' : '',
  `## 話題：${t.key}`,
  String(t.ask),
  t.read.length ? `\n## 読む場所の手がかり（利用者が渡した資料を含む）\n${t.read.map((r) => `- ${r}`).join('\n')}` : '',
  '',
  '## 返し方',
  '- facts：事実には、出どころ（ファイルと、見た時点の行）を付ける。出どころの無いことは facts に書かない。',
  '- others：外の事例（ほかの道具・ほかの分野でのやり方）、使う人の場面（使う人がどんな場面で困る・助かるか）、類推（似た形の別の話）を、事実と分けて書く。出どころの種類と確からしさ（確かめた・読んだだけ・推し量り）を必ず付ける。あなたの知っていることから書くなら、出どころの種類は「担当の知っていること」、確からしさは「推し量り」。',
  '- snags：引っかかり（食い違い・意外だったこと・浮かんだ問い）を一行ずつ。判定ではないので、良し悪しは書かない。',
  '- 探して見つからなかったことは not_found に、確かめていないことは unverified に書く。',
  external
    ? `- 読むのは、このリポジトリの文書とコード、読む場所の手がかりにある資料（利用者が渡したもの。リポジトリの外のパスでもよい）、それに利用者が許した外の資料（Web など${args.externalScope ? `。許した範囲：${args.externalScope}` : ''}）。外の資料から書いたものは、出どころの種類を「外の資料（許しあり）」にし、URL を書く。環境変数・鍵・個人の情報は読まない。`
    : '- 読むのは、このリポジトリの文書とコードと、読む場所の手がかりにある資料（利用者が渡したもの。リポジトリの外のパスでもよい）だけ。そのほかのリポジトリの外のフォルダ、Web、環境変数、鍵は読まない。',
].join('\n')

phase('集める')
log(`調査担当・${args.topics.length} 体で集める（model は args の指定${periphery.length ? `。周辺：${periphery[0]}` : ''}${external ? '。外の資料：許しあり' : ''}）`)
const results = await parallel(topics0.map((t) => () => agent(promptFor(t), {
  label: `調査:${t.key}`,
  phase: '集める',
  model: args.model,
  schema: SCHEMA,
})))
const topics = topics0.map((t, i) => ({ key: t.key, periphery: t.periphery, result: results[i] || null }))
const empty = topics.filter((t) => !t.result).map((t) => t.key)
if (empty.length) log(`空の話題：${empty.join('・')}（理由は failures と journal.jsonl で確かめる）`)

return { model: args.model, collected: topics.length - empty.length, empty, periphery, external, topics }
