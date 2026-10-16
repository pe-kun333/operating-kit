export const meta = {
  name: 'kit-multi-account-research',
  description: '運用の型を、別のアカウントの多くのセッションへ当てはめやすくする道を、公式の資料と型の今の作りから調べる',
  phases: [
    { title: '調べる', detail: '観点ごとに一体。公式の資料（URL）と型のファイルから、事実と出どころを集める' },
    { title: '確かめ', detail: '要の主張を、公式の資料で確かめ直す' },
  ],
}

const REPO = '/home/user/operating-kit'
const CONTEXT = [
  '背景：利用者は、Claude Code 向けの「運用の型（operating-kit）」を作った。中身はプラグイン一つ（スキル一つ）：GitHub の pe-kun333/operating-kit（marketplace を兼ねる。.claude-plugin/marketplace.json と plugin.json、skills/operating-kit/ に SKILL.md・references/・assets/（CLAUDE.md などのひな形）・scripts/（Workflow ツールの script：consult.js・ideate.js・survey.js））。',
  'スキルの §1「入れる」で、対象のリポジトリに CLAUDE.md・docs/main-agent.md・HANDOFF.md・docs/operating-kit/（ひな形と workflows/*.js）を写し、〈〉（モデル名・作業枝・型検査など）を埋める。§2 で段階ごとの一言を出す。§4 で、リポジトリの無い一回きりの会話に「型だけ」を当てはめる。',
  '利用者のしたいこと：この型を、自分の別の claude.ai アカウントでも、多くのセッション（Claude Code on the web のクラウドのセッション、デスクトップ・CLI、claude.ai の会話や Cowork など）に当てはめやすくしたい。',
  '事実と推し量りを分ける。公式の資料の URL を付ける。資料で確かめられないことは unverified に書く。2026 年の今の仕様で答える（古い記憶で書かない）。',
].join('\n')

const FIND = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    facts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          fact: { type: 'string' },
          source: { type: 'string', description: 'URL か、ファイルと行' },
          relevance: { type: 'string', description: 'この型を別のアカウントの多くのセッションに当てはめることに、どう効くか' },
        },
        required: ['fact', 'source', 'relevance'],
      },
    },
    options: {
      type: 'array',
      description: '考えられる道（具体的に。どこで何を設定するか、手間、効く範囲、弱み）',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          how: { type: 'string' },
          scope: { type: 'string', description: 'どのセッションに効くか（クラウド・CLI・デスクトップ・claude.ai・Cowork）' },
          cost: { type: 'string', description: '手間・維持の重さ' },
          weak: { type: 'string' },
        },
        required: ['name', 'how', 'scope', 'weak'],
      },
    },
    unverified: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'facts', 'options'],
}

const LENSES = [
  { key: 'プラグインと marketplace', type: 'claude-code-guide', ask: 'Claude Code のプラグインと marketplace の配り方を調べる：ユーザー全体（user scope）とプロジェクト（project scope）での入れ方、.claude/settings.json の extraKnownMarketplaces と enabledPlugins でリポジトリを開いた人に入れさせる仕組み、~/.claude/settings.json での指定、自動更新、private な GitHub リポジトリの marketplace の認証、版の付け方と更新の受け取り方、プラグインのスキルの呼び名（/plugin:skill）。別のアカウント（別の GitHub アカウントや別の claude.ai アカウント）から使うときに要ること。' },
  { key: 'クラウドのセッション', type: 'claude-code-guide', ask: 'Claude Code on the web（claude.ai/code のクラウドのセッション）で、プラグイン・スキル・ユーザーの設定（~/.claude）・CLAUDE.md をどのセッションにも効かせる道を調べる：環境（environment）ごとの setup script、環境変数、ネットワークの設定、リポジトリの .claude/settings.json と SessionStart の hook、プロジェクトの設定、アカウントをまたいで環境を写せるか、Routines（決まった時に起こすセッション）や新しいセッションを作るときの初めの指示。クラウドのコンテナは片づくので、毎回入れる道が要るか。' },
  { key: 'claude.ai 側', type: 'claude-code-guide', ask: 'claude.ai の会話・Projects・Cowork・スキル（.skill の取り込み、アカウントのスキル、組織のスキルやプラグインの一覧）で、この型（とくに「型だけ使う」一言と、型の芯）をどのセッションにも効かせる道を調べる：アカウントのスキルの入れ方、Projects の指示、記憶（memory）、個人の好み（preferences / custom instructions）、組織での配り方。別のアカウントへ写す方法。Claude Code のプラグインと claude.ai のスキルの違い（Workflow ツールや git が使えるか）。' },
  { key: '型の今の入れ方の手間', type: 'general-purpose', ask: `${REPO} を読む（README.md、.claude-plugin/、skills/operating-kit/SKILL.md・references/placeholders.md・assets/kit-README.template.md）。多くのリポジトリ・多くのセッションに当てはめるときの手間と弱み を、ファイルと行を付けて挙げる：一つのリポジトリごとに要る作業（〈〉を埋める問い、CLAUDE.md の節を足す、ひな形を写す）、セッションごとに要る作業（一言を貼る、モデルと合図の語を設定する）、型を直したときに入れた先へ届く道（版、SKILL.md §3 の点検、正本と写しの関係、build.py）、別のアカウントで変わりうるもの（使えるモデル、〈上〉 が使えるか、GitHub の見え方）。既に入っているものを活かせる所（marketplace、.skill、zip）も。改善の案も出す。` },
]

const found = await parallel(LENSES.map((l) => () => agent([CONTEXT, '', `## あなたの観点：${l.key}`, l.ask].join('\n'), { label: `調べる:${l.key}`, phase: '調べる', schema: FIND, agentType: l.type })))

const claims = []
found.forEach((f, i) => { if (f && f.facts) f.facts.forEach((x) => { if (/^https?:/.test(x.source)) claims.push({ lens: LENSES[i].key, ...x }) }) })
log(`資料から集めた主張：${claims.length}`)

const VERIFY = {
  type: 'object',
  properties: {
    checks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          index: { type: 'integer' },
          status: { type: 'string', enum: ['確か', '一部', '違う', '確かめられない'] },
          note: { type: 'string', description: '何を見て、どう確かめたか。違うなら正しい中身' },
          source: { type: 'string' },
        },
        required: ['index', 'status', 'note'],
      },
    },
  },
  required: ['checks'],
}
let verified = null
if (claims.length) {
  verified = await agent([
    'あなたは確かめ役です。次の主張を、公式の資料（Claude Code・claude.ai の docs）を自分で開いて、一件ずつ確かめてください。疑ってかかる。資料で確かめられなければ「確かめられない」。',
    '',
    claims.map((c, i) => `${i}. [${c.lens}] ${c.fact}（出どころ：${c.source}）`).join('\n'),
  ].join('\n'), { label: '確かめ:資料の主張', phase: '確かめ', schema: VERIFY, agentType: 'claude-code-guide' })
}

return { lenses: LENSES.map((l, i) => ({ lens: l.key, result: found[i] })), claims, verified }
