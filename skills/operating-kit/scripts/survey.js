export const meta = {
  name: 'operating-kit-survey',
  description: '話題ごとに読んで、出どころ付きの事実を集める（調査担当。判定しない）',
  whenToUse: '段階①-1 の下調べ、段階①-2・②-1・②-2 で入口や事実を読み足すとき',
  phases: [{ title: '集める', detail: '話題ごとに一体。読み取り専用で、事実と出どころだけを返す' }],
}

// 運用の型（docs/operating-kit/README.md）の下調べのひな形。
// Workflow ツールに scriptPath（このファイルの絶対パス）と args で渡す。モデル名はこのファイルに書かない。
//
// args（渡す人：段階①-1 のセッション、または主担当）：
//   topics  話題の一覧 [{ key, ask, read? }]（必須。10 まで）
//           key は話題の短い名前（索引のファイル名にも使う）、ask は集めること、read は読む場所の手がかり
//   model   CLAUDE.md の役割の表の調査担当の指定（必須。段階①-1 では CLAUDE.md の「段階①-1 の決まり」の 6）
//   scope   範囲の説明（HANDOFF.md の §0 の「次の段階」に書いた範囲）
//
// 返すもの：{ model, collected, empty, topics: [{ key, result }] }
// ワークフローの中では書かない。返ってきたものを、セッションが docs/wip/<始めた日>/ に一話題一ファイルで書く
// （段階②-1 で読み足すときは、案の一覧のフォルダの sources/<話題>.md に書く。段階①-1 の索引は直さない）。
// model は記録とファイルに写さない（集め方は run ID と役割名で書く）。

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
    not_found: { type: 'array', items: { type: 'string' }, description: '探したが見つからなかったこと' },
    unverified: { type: 'array', items: { type: 'string' }, description: '確かめていないこと（読んだだけ、食い違っていた、など）' },
  },
  required: ['summary', 'facts'],
}

if (!args || typeof args !== 'object') throw new Error('args が要る（topics・model。ファイルの頭の説明を見る）')
if (!args.model) throw new Error('args.model が要る（CLAUDE.md の役割の表の調査担当の指定。省かない）')
if (!Array.isArray(args.topics) || !args.topics.length) throw new Error('args.topics（話題の一覧）が要る')
if (args.topics.length > 10) throw new Error('一つのワークフローは 10 体以内（CLAUDE.md の合図の語（ワークフロー）の節）')

const promptFor = (t) => [
  'あなたは調査担当です。読み取り専用です。ファイルを書かない・直さない・git の操作をしない。',
  '読んで集めるだけです。決めない、判定しない、計画しない、良し悪しを書かない。',
  '',
  args.scope ? `## 範囲\n${args.scope}\n` : '',
  `## 話題：${t.key}`,
  String(t.ask),
  Array.isArray(t.read) && t.read.length ? `\n## 読む場所の手がかり\n${t.read.map((r) => `- ${r}`).join('\n')}` : '',
  '',
  '## 返し方',
  '- 事実には、出どころ（ファイルと、見た時点の行）を付ける。出どころの無いことは書かない。',
  '- 探して見つからなかったことは not_found に、確かめていないことは unverified に書く。',
  '- 読むのは、このリポジトリの文書とコードだけ。リポジトリの外のフォルダ、環境変数、鍵は読まない。',
].join('\n')

phase('集める')
log(`調査担当・${args.topics.length} 体で集める（model は args の指定）`)
const results = await parallel(args.topics.map((t) => () => agent(promptFor(t), {
  label: `調査:${t.key}`,
  phase: '集める',
  model: args.model,
  schema: SCHEMA,
})))
const topics = args.topics.map((t, i) => ({ key: t.key, result: results[i] || null }))
const empty = topics.filter((t) => !t.result).map((t) => t.key)
if (empty.length) log(`空の話題：${empty.join('・')}（理由は failures と journal.jsonl で確かめる）`)

return { model: args.model, collected: topics.length - empty.length, empty, topics }
