export const meta = {
  name: 'kit-multi-account-verify',
  description: '調べものの主張 84 件と要の問いを、公式の資料（手元に落とした原文）で確かめ直す。確かめ役 2 体',
  phases: [
    { title: '確かめ', detail: '主張を半分ずつ。原文の引用を付ける' },
  ],
}

const SP = '/tmp/claude-0/-home-user-operating-kit/ca612e26-6529-5674-9859-b2a463a08f55/scratchpad'
const DOCS = `${SP}/docs`
const CLAIMS = `${SP}/claims.json`
const REPO = '/home/user/operating-kit'

const COMMON = [
  'あなたは確かめ役です。利用者は Claude Code 向けの「運用の型（operating-kit）」（GitHub の pe-kun333/operating-kit。marketplace を兼ねるプラグイン一つ、スキル一つ、Workflow ツールの script 三本）を、自分の別の claude.ai アカウントでも、多くのセッション（claude.ai/code のクラウドのセッション、デスクトップ・CLI、claude.ai のチャット、Cowork）に当てはめやすくしたい。前のセッションの調べ役が集めた主張を、公式の資料で一件ずつ確かめ直してください。',
  '',
  '## 資料',
  `- 公式の資料の原文を ${DOCS}/ に落としてある（2026-10-16 に取得）。ファイル名の対応：code_<path>.md = https://code.claude.com/docs/en/<path>（/ は _）、claudecom_<path>.md = https://claude.com/docs/<path>、support_<id>.txt = https://support.claude.com/en/articles/<id>（HTML を文字にしたもの）。索引は code_llms.txt と claudecom_llms.txt。`,
  '- まず Grep と Read でこの原文を読む。要るページが無いときだけ WebFetch で開く（索引の .md の URL が使える）。',
  `- 型のファイルは ${REPO} にある（README.md、.claude-plugin/、skills/operating-kit/）。型について述べる主張は、ファイルを読んで確かめる。`,
  '',
  '## 主担当がこのクラウドのセッション（claude.ai/code、Claude Code 2.1.301）で見たこと（資料ではない。資料と食い違うときは、その旨を書く）',
  '- 環境変数に CLAUDE_CODE_REMOTE=true、CLAUDE_CODE_SYNC_PLUGINS=1、CLAUDE_CODE_SYNC_SKILLS=1 がある。',
  '- ~/.claude/plugins/synced/<org>_<account>/ がある（中は空。このアカウントは claude.ai でプラグインを足していないと見られる）。~/.claude/skills/synced/<org>_<account>/ に、アカウントで有効なスキル（docx・pdf など。manifest.json の source は anthropic-example）がある。',
  '- ~/.claude/skills/session-start-hook/SKILL.md（基盤が置いたもの）が、このセッションのスキルの一覧に出ている。つまり VM の ~/.claude/skills/ に置かれたものは読まれている。',
  '- このセッションでは Workflow ツールが使える（いまこの確かめもそれで動いている）。~/.claude/settings.json は無い。',
  '',
  '## やり方',
  '- 疑ってかかる。主張を細かく分け、どの部分が原文にあり、どの部分が無いかを見る。言い過ぎ・取り違え（例：「読まれない」と「届かない（持ち越されない）」の違い、プランの条件、版の番号）に気をつける。',
  '- status：確か（原文どおり）／一部（一部が違う・言い過ぎ・条件が抜けている）／違う／確かめられない（原文に無い）。',
  '- quote には、根拠の原文を英語のまま短く引く（一文〜三文）。file には上のファイル名か URL と、見出し。note には日本語で、何を見てどう判断したか、違うなら正しい中身を書く。',
  '- 問い（questions）には、原文で言えることと、言えないこと（推し量り）を分けて答える。',
  '- 確かめの途中で見つけた、この型を別のアカウントの多くのセッションに当てはめることに効く新しい事実があれば newFacts に（原文の引用つきで）。',
].join('\n')

const SCHEMA = {
  type: 'object',
  properties: {
    checks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          index: { type: 'integer' },
          status: { type: 'string', enum: ['確か', '一部', '違う', '確かめられない'] },
          quote: { type: 'string' },
          file: { type: 'string' },
          note: { type: 'string' },
        },
        required: ['index', 'status', 'note'],
      },
    },
    answers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          answer: { type: 'string' },
          status: { type: 'string', enum: ['資料で言える', '一部言える', '資料に無い'] },
          quote: { type: 'string' },
          file: { type: 'string' },
        },
        required: ['q', 'answer', 'status'],
      },
    },
    newFacts: {
      type: 'array',
      items: {
        type: 'object',
        properties: { fact: { type: 'string' }, quote: { type: 'string' }, file: { type: 'string' }, relevance: { type: 'string' } },
        required: ['fact', 'file'],
      },
    },
  },
  required: ['checks', 'answers'],
}

const HALVES = [
  {
    key: 'A',
    from: 0, to: 41,
    questions: [
      'QA1. claude.ai のアカウントで足したプラグイン（Customize > Plugins）は、claude.ai/code のクラウドのセッションに読まれるか（スキルだけか、プラグインとしてか）。',
      'QA2. クラウドの環境の setup script（または SessionStart hook）で claude plugin marketplace add と claude plugin install（user scope）をしたプラグインは、そのクラウドのセッションで読まれるか。setup script と Claude Code の起動の順、--yes などの要るフラグ、キャッシュとの関係。',
      'QA3. claude.ai 側のプラグインの更新（Sync automatically、Check for updates など）は、plugin.json の version をどう見るか。CLI の自動更新は、サードパーティの marketplace でどう入れるか。',
      'QA4. 個人プラン（Pro・Max）で、公開 GitHub のリポジトリ pe-kun333/operating-kit を claude.ai の marketplace として足す条件（marketplace.json・plugin.json の要件、source が "./" で良いか、上限）。リポジトリの .claude-plugin/ を読んで、満たすかも見る。',
    ],
  },
  {
    key: 'B',
    from: 42, to: 83,
    questions: [
      'QB1. クラウドの環境の setup script で ~/.claude/CLAUDE.md・~/.claude/skills/<name>/SKILL.md・~/.claude/settings.json を書いたら、クラウドのセッションで読まれるか（資料の「持ち越されない」は、利用者のマシンのファイルの話か、VM の ~/.claude を読まない話か）。',
      'QB2. claude.ai にスキルを上げるとき：.skill の拡張子を受けるか（ZIP だけか）、frontmatter で許される欄、description の上限が字かバイトか。リポジトリの skills/operating-kit/SKILL.md の frontmatter が条件を満たすか。',
      'QB3. Workflow ツール（dynamic workflows）は、クラウドのセッション・claude.ai のチャット・Cowork で使えるか。リポジトリの .claude/workflows/ と、プラグインの workflows/ は、クラウドのセッションで読まれるか。個人プランで要る設定（/config、規模の目安）。',
      'QB4. setup script の中で、環境の環境変数は見えるか。setup script の作業ディレクトリと、リポジトリが clone された後に走るか。',
      'QB5. claude.ai/code の prefill URL（prompt・prompt_url・repositories・environment）で、モデル・枝・effort を入れられるか。prompt_url の条件。',
    ],
  },
]

const results = await parallel(HALVES.map((h) => () => agent([
  COMMON,
  '',
  `## あなたの受け持ち`,
  `- ${CLAIMS} を Read し、i が ${h.from}〜${h.to} の主張（${h.to - h.from + 1} 件）を、一件も飛ばさずに確かめる。checks の index は i。`,
  '- 次の問いに答える：',
  ...h.questions.map((q) => `  - ${q}`),
].join('\n'), { label: `確かめ:${h.key}（${h.from}〜${h.to}）`, phase: '確かめ', schema: SCHEMA, agentType: 'claude-code-guide' })))

const out = HALVES.map((h, i) => ({ half: h.key, range: [h.from, h.to], result: results[i] }))
const missing = []
out.forEach((o) => {
  if (!o.result) { missing.push(`${o.half}: 全部`); return }
  const got = new Set(o.result.checks.map((c) => c.index))
  for (let k = o.range[0]; k <= o.range[1]; k++) if (!got.has(k)) missing.push(`${o.half}:${k}`)
})
log(`確かめの抜け：${missing.length ? missing.join(', ') : 'なし'}`)
return { out, missing }
