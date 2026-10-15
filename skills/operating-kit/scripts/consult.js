export const meta = {
  name: 'operating-kit-consult',
  description: '一つの論点を、観点ごとに読み取り専用で相談する（相談役・検討担当）',
  whenToUse: '相談の手続きの 2（段階③ で利用者が合図の語を送った論点）、関わり方 (B)(C)、検討担当に案を広げさせ疑わせるとき',
  phases: [{ title: '相談', detail: '観点ごとに一体。読み取り専用で、結論と根拠だけを返す' }],
}

// 運用の型（docs/operating-kit/README.md）の相談のひな形。
// Workflow ツールに scriptPath（このファイルの絶対パス）と args で渡す。モデル名はこのファイルに書かない。
//
// args（主担当が渡す）：
//   topic       論点（必須）
//   model       CLAUDE.md の役割の表の指定（必須。省くとセッションのモデルになるので、省かない）
//   effort      相談役なら "xhigh"（CLAUDE.md の「相談の手続き」の 2）。検討担当は表に指定が無ければ省く
//   role        '相談役' か '検討担当'（指示文と表示の名前。省くと '相談役'）
//   background  主担当の見立て（迷っている理由・案・おすすめ）
//   read        読むものの一覧（例：['CLAUDE.md の「段階」', 'HANDOFF.md §4', 'docs/plan-xxx.md §5']）
//   lenses      観点の一覧 [{ key, ask }]（省くと下の五つ。関わり方 (B) の観点と同じ）
//
// 返すもの：{ topic, role, model, answered, empty, answers: [{ lens, answer }] }
// 判定は主担当。票で決めない。journal.jsonl の全文を読んでから判定する（CLAUDE.md の「相談の手続き」の 3）。
// answer が null の観点は空。理由（利用枠の制限か、ほかの失敗か）は failures と journal.jsonl で確かめる。

const DEFAULT_LENSES = [
  { key: '方向', ask: '依頼の目的と、使う人の言葉に合っているか。ずれていれば、どこがどうずれているか。' },
  { key: '抜け', ask: '守る決まり（CLAUDE.md と、そこから案内されている文書）、止まって相談するものの一覧、既存の仕組みとの重なりで、落ちている点はないか。' },
  { key: '別案', ask: '今の案の形から外れた別案を一つ以上。今の案より良くなる場面と、悪くなる場面。' },
  { key: '危うさ', ask: '保存の形、戻すのが重い層、費用、外への送信、戻しにくさで、危ないところはないか。' },
  { key: '使う人の目', ask: '画面の流れ、手間、分かりやすさで、使う人が困るところはないか。' },
]

const SCHEMA = {
  type: 'object',
  properties: {
    conclusion: { type: 'string', description: '結論（三行まで）' },
    reasons: {
      type: 'array',
      description: '根拠。ファイルと行（見た時点の行）を付ける',
      items: {
        type: 'object',
        properties: {
          claim: { type: 'string' },
          file: { type: 'string' },
          line: { type: 'string' },
        },
        required: ['claim', 'file'],
      },
    },
    alternatives: { type: 'array', items: { type: 'string' }, description: '別案（あれば）' },
    risks: { type: 'array', items: { type: 'string' }, description: '危ないこと（あれば）' },
    questions_for_user: { type: 'array', items: { type: 'string' }, description: '使う人に聞くべきこと（三つまで）' },
    unverified: { type: 'array', items: { type: 'string' }, description: '確かめていないこと' },
  },
  required: ['conclusion', 'reasons'],
}

if (!args || typeof args !== 'object') throw new Error('args が要る（topic・model など。ファイルの頭の説明を見る）')
if (!args.topic) throw new Error('args.topic（論点）が要る')
if (!args.model) throw new Error('args.model が要る（CLAUDE.md の役割の表の指定。省かない）')

const lenses = Array.isArray(args.lenses) && args.lenses.length ? args.lenses : DEFAULT_LENSES
if (lenses.length > 10) throw new Error('一つのワークフローは 10 体以内（CLAUDE.md の「ultracode」の節）')
const role = args.role || '相談役'
const read = Array.isArray(args.read) ? args.read : []

const promptFor = (lens) => [
  `あなたは${role}です。読み取り専用です。ファイルを書かない・直さない・git の操作をしない。`,
  '判定はしません。結論と根拠だけを返してください（決めるのは主担当と利用者）。',
  '',
  '## 論点',
  String(args.topic),
  args.background ? `\n## 主担当の見立て（迷っている理由・案・おすすめ）\n${args.background}` : '',
  '',
  '## 読むもの',
  read.length ? read.map((r) => `- ${r}`).join('\n') : '- CLAUDE.md と HANDOFF.md（論点に関係する所だけ）',
  '',
  `## あなたの観点：${lens.key}`,
  String(lens.ask),
  '',
  '## 返し方',
  '- 根拠には、ファイルと行（見た時点の行）を付ける。根拠の無い主張は書かない。',
  '- 確かめていないことは unverified に書く。',
  '- 使う人に聞くべきことがあれば questions_for_user に（三つまで）。',
  '- 読むのは、このリポジトリの文書とコードだけ。リポジトリの外のフォルダ、環境変数、鍵は読まない。',
].join('\n')

const optsFor = (lens) => {
  const o = { label: `${role}:${lens.key}`, phase: '相談', model: args.model, agentType: 'general-purpose', schema: SCHEMA }
  if (args.effort) o.effort = args.effort
  return o
}

phase('相談')
log(`${role}・${lenses.length} 体で相談する（model は args の指定）`)
const results = await parallel(lenses.map((lens) => () => agent(promptFor(lens), optsFor(lens))))
const answers = lenses.map((lens, i) => ({ lens: lens.key, answer: results[i] || null }))
const empty = answers.filter((a) => !a.answer).map((a) => a.lens)
if (empty.length) log(`空の答え：${empty.join('・')}（理由は failures と journal.jsonl で確かめる）`)

return { topic: args.topic, role, model: args.model, answered: answers.length - empty.length, empty, answers }
