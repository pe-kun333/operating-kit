export const meta = {
  name: 'consult',
  description: '一つの論点を、観点ごとに読み取り専用で相談する（相談役・検討担当）',
  whenToUse: '相談の手続きの 2（段階③ で利用者が合図の語を送った論点）、関わり方 (B)(C)、検討担当にまとまった案を疑わせる・絞る観点で見させるとき、段階②-1 の考察の観点（form: \'analysis\'。一周目の前は blind）（段階②-1 で案を広げるのは ideate.js。段階③ と段階の外で名指しの論点を広げるなら、相談役で観点を blind にする）',
  phases: [{ title: '相談', detail: '観点ごとに一体。読み取り専用で、結論と根拠（form: analysis なら考察と主張）だけを返す' }],
}

// 運用の型（docs/operating-kit/README.md）の相談のひな形。
// Workflow ツールに scriptPath（このファイルの絶対パス）と args で渡す。モデル名はこのファイルに書かない。
//
// args（主担当が渡す）：
//   topic       論点（必須。空でない文字列）
//   model       CLAUDE.md の役割の表の指定（必須。空でない文字列。省くとセッションのモデルになるので、省かない）
//   effort      相談役なら "xhigh"（CLAUDE.md の「相談の手続き」の 2）。検討担当は表に指定が無ければ省く（low・medium・high・xhigh・max）
//   role        '相談役' か '検討担当'（指示文と表示の名前。省くと '相談役'）
//   form        'answer'（既定。結論と根拠）か 'analysis'（考察。段階②-1 の考察の観点。散文の analysis と、根拠を示せる claims、
//               確からしさの印つきの hypotheses を返す。判定に使うのは claims だけ）
//   background  主担当の見立て（迷っている理由・案・おすすめ。文字列）
//   read        読むものの一覧（例：['CLAUDE.md の「段階」', 'HANDOFF.md §4', 'docs/plan-xxx.md §5']）。
//               省くと、blind の観点は CLAUDE.md（論点に関係する所だけ）、ほかの観点は CLAUDE.md と HANDOFF.md（論点に関係する所だけ）
//   lenses      観点の一覧 [{ key, ask, blind? }]（省くと下の五つ。関わり方 (B) の観点と同じ。まとまった案を点検する、絞る用の観点）。
//               名前だけでは渡せない（名前で渡せるのは ideate.js。ここは { key, ask }）
//   blind       background を見せない観点（目隠し）。true なら全部、観点の名前の一覧ならその観点だけ（観点に blind: true と書いてもよい）。
//               案を広げさせる観点には見せない（主担当の見立てに引きずられないように）。疑わせる観点には見せる。省くと全部に見せる。
//               lenses を省いたとき（既定の五つ）は true にできない（既定の五つは目隠しにしない。スクリプトが止める）。
//               目隠しの観点には、HANDOFF.md の §0 の 4・§4.1・§4.2、案の一覧、見送りの台帳、計画書の決めごとも読ませない（read は全部の観点に共通なので、
//               blind を使うときは、そこを read に入れない。HANDOFF.md・wip/ の下の案の一覧のフォルダ（sources/ 以外）・wip/ の下の cards.md・notes.md・tries/・
//               raw-R*.json・ideas-inbox.md・ideas-shelf.md・.. を含むパス・wip のフォルダごとはスクリプトが止める（ideate.js と同じ検査。後ろの注を落とし、
//               大文字と小文字を分けずに見る）。topic には論点だけを書き、案・おすすめは background に）
//
// 返すもの：{ topic, role, model, form, answered, empty, blind, answers: [{ lens, answer }] }
//   answer は form が 'answer' なら { conclusion, reasons, alternatives, risks, questions_for_user, unverified }、
//   'analysis' なら { analysis, claims, hypotheses, questions_for_user, unverified }
// model は記録とファイルに写さない（記録は役割名と、基本・代わりで書く）。
// 案を観点ごとに広げ、照らし、疑う三つの相が要るときは、ideate.js を使う（段階②-1）。
// 判定は主担当。票で決めない。journal.jsonl の全文を読んでから判定する（CLAUDE.md の「相談の手続き」の 3）。
// answer が null の観点は空。理由（利用枠の制限か、ほかの失敗か）は failures と journal.jsonl で確かめる。

const DEFAULT_LENSES = [
  { key: '方向', ask: '依頼の目的と、使う人の言葉に合っているか。ずれていれば、どこがどうずれているか。' },
  { key: '抜け', ask: '守る決まり（CLAUDE.md と、そこから案内されている文書）、止まって相談するものの一覧、既存の仕組みとの重なりで、落ちている点はないか。' },
  { key: '別案', ask: '今の案の形から外れた別案を一つ以上。今の案より良くなる場面と、悪くなる場面。' },
  { key: '危うさ', ask: '保存の形、戻すのが重い層、費用、外への送信、戻しにくさで、危ないところはないか。' },
  { key: '使う人の目', ask: '画面の流れ、手間、分かりやすさで、使う人が困るところはないか。' },
]
const FORMS = ['answer', 'analysis']
const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max']
const CERTAINTY = ['確かめた', '読んだだけ', '推し量り']

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

// form: 'analysis'（考察）。判定に使うのは claims だけ
const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    analysis: { type: 'string', description: '考察（散文。長さは自由。問いの捉え直し・仕組みの見立て・引き合う力）' },
    claims: {
      type: 'array',
      description: '根拠を示せる主張。ファイルと行（見た時点の行）を付ける',
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
    hypotheses: {
      type: 'array',
      description: '根拠をまだ示せない見立て。確からしさの印を付ける',
      items: {
        type: 'object',
        properties: {
          note: { type: 'string' },
          certainty: { type: 'string', enum: CERTAINTY },
        },
        required: ['note', 'certainty'],
      },
    },
    questions_for_user: { type: 'array', items: { type: 'string' }, description: '使う人に聞くべきこと（三つまで）' },
    unverified: { type: 'array', items: { type: 'string' }, description: '確かめていないこと' },
  },
  required: ['analysis'],
}

// ---- args の検査（まちがった値を黙って既定に置き換えない） ----
if (typeof args === 'string') throw new Error('args は JSON の値で渡す（文字列にしない）')
if (!args || typeof args !== 'object') throw new Error('args が要る（topic・model など。ファイルの頭の説明を見る）')
const KEYS = ['topic', 'model', 'effort', 'role', 'form', 'background', 'read', 'lenses', 'blind']
const unknownKeys = Object.keys(args).filter((k) => !KEYS.includes(k))
if (unknownKeys.length) throw new Error(`args に知らない名前がある：${unknownKeys.join('・')}（使える名前：${KEYS.join('・')}）`)
const nonEmpty = (v) => typeof v === 'string' && v.trim() !== ''
if (!nonEmpty(args.topic)) throw new Error('args.topic（論点）が要る（空でない文字列）')
if (!nonEmpty(args.model)) throw new Error('args.model が要る（CLAUDE.md の役割の表の指定。空でない文字列。省かない）')
if (args.effort !== undefined && !EFFORTS.includes(args.effort)) throw new Error(`args.effort は ${EFFORTS.join('・')} のどれか`)
if (args.role !== undefined && !['相談役', '検討担当'].includes(args.role)) throw new Error("args.role は '相談役' か '検討担当'")
if (args.form !== undefined && !FORMS.includes(args.form)) throw new Error("args.form は 'answer'（既定）か 'analysis'")
if (args.background !== undefined && typeof args.background !== 'string') throw new Error('args.background は文字列')
const form = args.form || 'answer'

if (args.lenses !== undefined && (!Array.isArray(args.lenses) || !args.lenses.length)) throw new Error('args.lenses は観点 { key, ask } の配列（省くと既定の五つ）')
const lenses = args.lenses || DEFAULT_LENSES
if (lenses.length > 10) throw new Error('一つのワークフローは 10 体以内（CLAUDE.md の合図の語（ワークフロー）の節）')
if (!lenses.every((l) => l && typeof l === 'object' && nonEmpty(l.key) && nonEmpty(l.ask))) throw new Error('観点は { key, ask } で渡す（key と ask は空でない文字列。名前だけで渡せるのは ideate.js）')
const badLens = lenses.filter((l) => Object.keys(l).some((k) => !['key', 'ask', 'blind'].includes(k)) || (l.blind !== undefined && typeof l.blind !== 'boolean'))
if (badLens.length) throw new Error(`観点に使えるのは key・ask・blind（true か false）だけ：${badLens.map((l) => l.key).join('・')}（読むものは args.read に。観点ごとの read は ideate.js だけ）`)
const keys = lenses.map((l) => l.key)
if (new Set(keys).size !== keys.length) throw new Error(`観点の名前が重なっている：${keys.join('・')}`)
if (!(args.blind === undefined || typeof args.blind === 'boolean' || (Array.isArray(args.blind) && args.blind.every(nonEmpty)))) throw new Error('args.blind は true か、観点の名前の配列（文字列一つでも配列にする）')
if (args.blind === true && args.lenses === undefined) throw new Error('lenses を省いたとき（既定の五つ）は blind を true にできない（既定の五つは、まとまった案を点検する観点なので目隠しにしない。目隠しにするなら観点を渡す）')
const unknownBlind = Array.isArray(args.blind) ? args.blind.filter((k) => !keys.includes(k)) : []
if (unknownBlind.length) throw new Error(`blind に lenses に無い観点がある：${unknownBlind.join('・')}（観点の名前：${keys.join('・')}）`)
const role = args.role || '相談役'
const read = args.read === undefined ? [] : typeof args.read === 'string' ? [args.read] : args.read
if (!Array.isArray(read) || !read.every(nonEmpty)) throw new Error('args.read は文字列の配列')
const isBlind = (lens) => args.blind === true || (Array.isArray(args.blind) && args.blind.includes(lens.key)) || lens.blind === true
const blind = lenses.filter(isBlind).map((l) => l.key)
// 目隠しの観点に見せないもの（主担当の見立て・案が入る所）。ideate.js と同じ関数。
// パスは \ を / にし、後ろの注（最初の空白・（・(・§・# から先）を落とし、小文字にして見る。ideas・tries・notes.md・cards.md は wip/ の下に限る
const READ_BANS = [
  [/(^|\/)handoff\.md$/, 'HANDOFF.md'],
  [/(^|\/)ideas-(inbox|shelf)\.md$/, '思いつきの置き場・見送りの台帳（既定の名前）'],
  [/(^|\/)raw-r[^/]*\.json$/, '生の案（raw-R*.json）'],
  [/(^|\/)wip\/[^/]+\/ideas(-[^/]*)?(\/(?!sources(\/|$))|$)/, '案の一覧のフォルダ（sources/ 以外）'],
  [/(^|\/)wip\/(.*\/)?tries(\/|$)/, '試しの結果（tries/）'],
  [/(^|\/)wip\/(.*\/)?(cards|notes)\.md$/, '考察ノート・カード'],
  [/(^|\/)wip(\/[^/]+)?\/?$/, 'wip のフォルダごと（ファイルを名指しする）'],
]
// 理由を返す（問題なしなら空）。頭の空白は先に落とす（落とさないと、切ったときに空になって素通りする）
const readProblem = (r) => {
  const p = String(r).replace(/\\/g, '/')
  const q = p.trimStart().split(/[\s　（(§#]/)[0].trim().toLowerCase()
  if (/(^|\/)\.\.(\/|$)/.test(q)) return 'パスに .. を含む'
  const hit = READ_BANS.find(([re]) => re.test(q))
  return hit ? hit[1] : ''
}
if (blind.length) {
  for (const r of read) {
    const why = readProblem(r)
    if (why) throw new Error(`read に入れない：${r}（${why}。目隠しの観点（${blind.join('・')}）に見せないため。read は全部の観点に共通。案の一覧のフォルダは sources/ だけ読ませる。docs/main-agent.md §4.1）`)
  }
}
const BLIND_KEEP = [
  '- 主担当の見立てを見ないため、HANDOFF.md の §0 の 4・§4.1・§4.2、案の一覧、見送りの台帳、計画書の決めごとは読まない（読むものに挙がっていても）。',
  '- 別案は alternatives に。案そのものには根拠が無くてよい（入れる所が分かれば、ファイルと行を付ける）。主張には根拠を付ける。',
]

const promptFor = (lens) => [
  `あなたは${role}です。読み取り専用です。ファイルを書かない・直さない・git の操作をしない。`,
  form === 'analysis' ? '判定はしません（決めるのは主担当と利用者）。' : '判定はしません。結論と根拠だけを返してください（決めるのは主担当と利用者）。',
  '',
  '## 論点',
  String(args.topic),
  args.background && !isBlind(lens) ? `\n## 主担当の見立て（迷っている理由・案・おすすめ）\n${args.background}` : '',
  '',
  '## 読むもの',
  read.length ? read.map((r) => `- ${r}`).join('\n') : isBlind(lens) ? '- CLAUDE.md（論点に関係する所だけ）' : '- CLAUDE.md と HANDOFF.md（論点に関係する所だけ）',
  '',
  `## あなたの観点：${lens.key}`,
  String(lens.ask),
  '',
  '## 返し方',
  ...(form === 'analysis'
    ? ['- analysis は散文で、長さは自由。', '- 根拠を示せる主張は claims に（ファイルと行）、示せない見立ては hypotheses に確からしさの印をつけて書く。判定に使われるのは claims だけ。']
    : ['- 根拠には、ファイルと行（見た時点の行）を付ける。根拠の無い主張は書かない。']),
  '- 確かめていないことは unverified に書く。',
  '- 使う人に聞くべきことがあれば questions_for_user に（三つまで）。',
  '- 読むのは、このリポジトリの文書とコードだけ。リポジトリの外のフォルダ、環境変数、鍵は読まない。',
  ...(isBlind(lens) ? (form === 'analysis' ? BLIND_KEEP.slice(0, 1) : BLIND_KEEP) : []), // analysis には alternatives の欄が無い
].join('\n')

const optsFor = (lens) => {
  const o = { label: `${role}:${lens.key}`, phase: '相談', model: args.model, agentType: 'general-purpose', schema: form === 'analysis' ? ANALYSIS_SCHEMA : SCHEMA }
  if (args.effort) o.effort = args.effort
  return o
}

phase('相談')
log(`${role}・${lenses.length} 体で相談する（model は args の指定${form === 'analysis' ? '。form は analysis（考察）' : ''}）`)
if (args.background && blind.length) log(`主担当の見立てを見せない観点：${blind.join('・')}`)
const results = await parallel(lenses.map((lens) => () => agent(promptFor(lens), optsFor(lens))))
const answers = lenses.map((lens, i) => ({ lens: lens.key, answer: results[i] || null }))
const empty = answers.filter((a) => !a.answer).map((a) => a.lens)
if (empty.length) log(`空の答え：${empty.join('・')}（理由は failures と journal.jsonl で確かめる）`)

return { topic: args.topic, role, model: args.model, form, answered: answers.length - empty.length, empty, blind, answers }
