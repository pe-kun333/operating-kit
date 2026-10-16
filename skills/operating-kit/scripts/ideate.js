export const meta = {
  name: 'operating-kit-ideate',
  description: '一つの対象について、観点ごとに案を広げ、照らし、伸ばして疑う（検討担当・調査担当。判定しない）',
  whenToUse: '段階②-1（考察と発想）と、段階②-1・②-2 をまとめたときの広げる周で、案を観点ごとに広げるとき。二周目は round を上げ、観点を替え、known に前の周までの案と主担当が載せた案を「<id> <短い名前>」の形で渡す。検討担当を呼ばない段階①-1・段階③・段階の外では使わない',
  phases: [
    { title: '広げる', detail: '観点ごとに一体（検討担当）。主担当の見立ても前の周の案も見せない（目隠し）。判定しない' },
    { title: '照らす', detail: '案の塊ごとに一体（調査担当）。入れる場所を探し、今あるもの・前提・重なりを付ける。判定しない' },
    { title: '伸ばす・疑う', detail: '案の塊ごとに一体（検討担当）。成り立つ条件・大胆にした形・崩れうる前提・安い確かめ方。判定しない' },
  ],
}

// 運用の型（docs/operating-kit/README.md）の発想のひな形。段階②-1 の三つの相：広げる → 照らす → 伸ばす・疑う。
// Workflow ツールに scriptPath（このファイルの絶対パス）と args で渡す。モデル名はこのファイルに書かない。
//
// args（主担当が渡す。JSON の値で渡し、文字列にしない）：
//   topic          対象と、困っている場面だけ（必須）。案・おすすめ・見立ては書かない（それは background へ）
//   model          CLAUDE.md の役割の表の検討担当の指定（必須。広げる・伸ばす・疑う相。省くとセッションのモデルになるので、省かない）
//   lightModel     CLAUDE.md の役割の表の、照らす相の調査担当の指定（必須。照らすのは読み取りの下働きなので調査担当。モデルは、役割の表で照らす相だけ別に決めてある）
//   effort         広げる・伸ばす・疑う相の effort（任意。low・medium・high・xhigh・max。CLAUDE.md の役割の表に指定が無ければ省く）
//   lightEffort    照らす相の effort（任意。同じく、表に指定が無ければ省く）
//   round          周の番号（任意。既定 1）。案の id に入る
//   read           全員が読むもの（省くと、CLAUDE.md と、段階①-2 で整えた索引と地図。観点の read は、これに足す）。索引と地図はパスを名指しして渡す
//                  （HANDOFF.md は読ませないので、省くと担当が探すことになる）。
//                  次は入れない（広げる相・照らす相の指示文でも読ませない）：HANDOFF.md、案の一覧のフォルダの README.md・cards.md・raw-R*.json、
//                  思いつきの置き場、見送りの台帳、段階①-1 の索引の「思いつき」の節。案の一覧のフォルダの sources/ の材料は入れてよい
//   parts          対象の部分の一覧（任意。段階①-2 の地図の系統・面と、使う人の場面から選ぶ。地図に無い切り口は主担当が材料から立てる）。
//                  渡すと、案ごとにどの部分に効くかを必ず返させ、網羅を部分で測る
//   lenses         観点の一覧（10 まで）。文字列は下の LENSES の名前、{ key, ask, read? } はそのまま使う。省くと一周目の既定の六つ。
//                  一周目は、対象の部分を観点にしたもの（{ key, ask }）と発想の型を半分ずつほど混ぜるとよい。ask に答えの例を書かない
//   only           起こす観点の名前の一覧（任意）。空だった観点だけを頼み直すときと、観点を二回に分けるとき。
//                  lenses は元と同じ並びで、round・parts・known も元と同じに渡す（id が変わらない）。返す値は、同じ周の二回目からは raw-R<周>-2.json・-3.json と番号を上げて写す（二回に分けた一回目は raw-R<周>.json。上書きしない）
//   background     主担当の見立て。伸ばす・疑う相だけに見せる（広げる・照らす相には見せない＝目隠し）
//   known          前の周までに出た案と、思いつきの置き場・見送りの台帳から主担当が案の一覧に載せた案を、「<id> <短い名前>」の形で
//                  （例 R1-L2-3 下書きを残す）。照らす相に渡して重なりを見させ（overlaps_known もこの形で返る）、飽和の物差し（counts.fresh）にする。
//                  広げる相には見せない
//   knownToExpand  true なら known を広げる相にも見せる（任意。コードや対象が大きく変わったあとに、前の案と重ならない案だけを出し直すときだけ。
//                  同じ案の一覧で周を足すふつうの二周目には、セッションが替わっても、段階②-2 から戻っても使わない。
//                  true にするときは、known から置き場・台帳の案を外す。飽和で照らさないので fresh は null）
//   doubt          false なら伸ばす・疑う相を起こさない（任意。既定 true。false なら一度に起こせる観点が 8 まで増える）
//
// 体数：広げるは観点ごとに一体（一度に 6 観点まで。doubt が false なら 8）。照らす（と伸ばす・疑う）は、案を数で均等に分けた塊ごとに一体ずつ。
//   塊の数は、上限 10 体から広げるの体数を引いた残りに収まるだけ、かつ一塊 8 案ほど。ふつうは 6 観点で一周 10 体。小さな計画は 3 観点で 5〜9 体。
// 案の id：R<周>-L<観点の番号>-<案の番号>（観点の番号は lenses の並びの位置。例 R2-L1-3）。
//   主担当が足す案は R<周>-主-<番号>、関わり方 (B) の相談役の案は R<周>-B-<番号>、段階②-2 で足す案は 足-<番号>（docs/main-agent.md §4.1）。
//
// 返すもの：{ topic, round, lenses, parts, roles, ideas: [{ id, lens, title, what, scene, touches, parts, kind, light, grow }],
//            questions, roots, on_background, thin, counts: { raw, byLens, byPart, byKindSelf, fresh, unlit }, empty: { spread, light, grow }, missing: { light, grow },
//            asked: { lenses: [{ key, ask, read }], read, known, knownToExpand, doubt, only, background } }
// 判定はしない（箱に分けるのは段階②-2 の主担当）。counts は材料で、票ではない。
//   raw は重なりを除く前の数で、量の照らしにそのまま使わない。byKindSelf は広げた担当の自己申告。
//   fresh は、調査担当が known との重なりを見つけなかった案の数。known が無いとき、knownToExpand のとき、照らされなかった案（unlit）があるときは null。
//   終わりの目安（docs/main-agent.md §4.2）を照らすのは主担当。asked は頼んだ中身（あとで、どの known で測ったかなどを確かめるため）。
// 返す値は、要約する前に、通知が示す出力のファイルの JSON の result だけを、案の一覧のフォルダ（docs/wip/<②-1 を始めた日>/ideas/ か ideas-<短い名前>/）の raw-R<周>.json にコマンドで写してコミットする
//   （例 jq '.result' <出力のファイル> > <案の一覧のフォルダ>/raw-R1.json。ファイルを丸ごと写さない：ほかの欄にモデル名が入る。同じ周の二回目からは raw-R<周>-2.json・-3.json（上書きしない）。セッションが替わると読めない）。
// 返す値にモデル名は入れていない。写すときも、集め方は run ID と役割名で書く。
// 照らす・伸ばす・疑う相が空だった塊は、同じ args や only で頼み直さない（同じ id に別の案が入る）。docs/main-agent.md §4.2 のとおり主担当が補う。

const MAX_AGENTS = 10 // CLAUDE.md の上限（合図の語（ワークフロー）の節）。変えたら workflows/*.js の上限も直す（一度に起こせる観点の数は、ここから決まる）
const PER_CHUNK = 8 // 照らす・伸ばす・疑う一体あたりの案の数の目安
const KINDS = ['奇抜', 'やめる・減らす', '組み合わせる', '制約を外す', 'そのほか']
const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max']

// 広げる用の観点（発想の型）。前の六つが一周目の既定。後ろの四つは、二周目などに名前で選ぶ。
// consult.js の既定の五つ（方向・抜け・別案・危うさ・使う人の目）は、まとまった案を点検する絞る用。
const LENSES = [
  { key: '使う人の場面', ask: '使う人の具体的な場面（初めて使うとき、毎日使うとき、急いでいるとき、使わない人）を思い描き、そこで助かるものを考える。' },
  { key: '逆にする', ask: '足すのではなく、やめる・減らす・順を入れ替える・する人を替える方向で考える。' },
  { key: '極端にする', ask: '量・数・速さ・範囲を 10 倍・100 倍にする、または全部に広げると何が起きるかを考え、そこから見える案を出す。' },
  { key: 'ほかから借りる', ask: 'ほかの分野・ほかの道具の仕組みで、ここに持ち込めるものを考える。どの分野・どの道具の、どの仕組みかを名指しする（あなたの知っていることから。リポジトリの外は読みに行かない）。' },
  { key: '組み合わせる', ask: 'このリポジトリに今ある仕組み同士をつなぐと生まれるものを考える。どれとどれかを名指しする。' },
  { key: '制約を一つ外す', ask: 'CLAUDE.md の決まり・大きな決めごとの一覧・戻すのが重い層から、制約を一つ選んで外せるとしたら何ができるかを考える。どれを外したかを書く。' },
  { key: '時間をずらす', ask: '一日後・一か月後・一年後に、使う人と仕組みがどうなっているかを思い描き、そのときに要るものを考える。' },
  { key: '既知の欠陥から', ask: '既知の欠陥・危うい所・困りごとの記録を起点に、直すだけでなく、それをなくす・生かす案を考える。' },
  { key: 'ほかの立場', ask: '壊そうとする人・あとで直す人・初めての人のうち一つの立場を選び、その目で見て要るものを考える。選んだ立場を書く。' },
  { key: '問いを変える', ask: '今の問いを別の問いに言い換えると何が要るかを考える。言い換えた問いは questions にも書く。' },
]
const FIRST_ROUND = 6

// ---- args の検査（まちがった値を黙って既定に置き換えない） ----
if (typeof args === 'string') throw new Error('args は JSON の値で渡す（文字列にしない）')
if (!args || typeof args !== 'object') throw new Error('args が要る（topic・model・lightModel など。ファイルの頭の説明を見る）')
const KEYS = ['topic', 'model', 'lightModel', 'effort', 'lightEffort', 'round', 'read', 'parts', 'lenses', 'only', 'background', 'known', 'knownToExpand', 'doubt']
const unknownKeys = Object.keys(args).filter((k) => !KEYS.includes(k))
if (unknownKeys.length) throw new Error(`args に知らない名前がある：${unknownKeys.join('・')}（使える名前：${KEYS.join('・')}）`)
const nonEmpty = (v) => typeof v === 'string' && v.trim() !== ''
if (!nonEmpty(args.topic)) throw new Error('args.topic（対象と、困っている場面）が要る')
if (!nonEmpty(args.model)) throw new Error('args.model が要る（CLAUDE.md の役割の表の検討担当の指定。省かない）')
if (!nonEmpty(args.lightModel)) throw new Error('args.lightModel が要る（CLAUDE.md の役割の表の、照らす相の調査担当の指定。省かない）')
for (const k of ['effort', 'lightEffort']) {
  if (args[k] !== undefined && !EFFORTS.includes(args[k])) throw new Error(`args.${k} は ${EFFORTS.join('・')} のどれか`)
}
for (const k of ['knownToExpand', 'doubt']) {
  if (args[k] !== undefined && typeof args[k] !== 'boolean') throw new Error(`args.${k} は true か false`)
}
const round = args.round === undefined ? 1 : args.round
if (!Number.isInteger(round) || round < 1) throw new Error('args.round は 1 以上の整数')
const strList = (v, name) => {
  if (v === undefined) return []
  const list = typeof v === 'string' ? [v] : v
  if (!Array.isArray(list) || !list.every(nonEmpty)) throw new Error(`args.${name} は文字列の配列`)
  return list
}
const read = strList(args.read, 'read')
const parts = strList(args.parts, 'parts')
const known = strList(args.known, 'known')
const only = strList(args.only, 'only')
if (new Set(parts).size !== parts.length) throw new Error('args.parts に同じ名前がある')
if (new Set(known).size !== known.length) throw new Error('args.known に同じ名前がある（名前で重なりを返させるため。「<id> <短い名前>」の形で渡す）')
if (args.background !== undefined && typeof args.background !== 'string') throw new Error('args.background は文字列')
const knownToExpand = args.knownToExpand === true
const withGrow = args.doubt !== false
const maxRun = MAX_AGENTS - (withGrow ? 4 : 2) // 照らす（と伸ばす・疑う）に二塊ぶんを残す（上限 10 なら 6・8）

if (args.lenses !== undefined && (!Array.isArray(args.lenses) || !args.lenses.length)) throw new Error('args.lenses は観点の配列（省くと一周目の既定の六つ）')
const lenses = (args.lenses || LENSES.slice(0, FIRST_ROUND)).map((l) => {
  if (typeof l === 'string') {
    const found = LENSES.find((x) => x.key === l)
    if (!found) throw new Error(`知らない観点の名前：${l}（使える名前：${LENSES.map((x) => x.key).join('・')}。ほかは { key, ask } で渡す）`)
    return { key: found.key, ask: found.ask, read: [] }
  }
  if (!l || !nonEmpty(l.key) || !nonEmpty(l.ask)) throw new Error('観点は名前か { key, ask, read? } で渡す（key と ask は空でない文字列）')
  if (/[\\/:*?"<>|]/.test(l.key)) throw new Error(`観点の key に / \\ : * ? " < > | は使えない（ファイル名になる）：${l.key}`)
  return { key: l.key, ask: l.ask, read: strList(l.read, `lenses の ${l.key} の read`) }
})
if (lenses.length > LENSES.length) throw new Error(`観点は ${LENSES.length} まで`)
const keys = lenses.map((l) => l.key)
if (new Set(keys).size !== keys.length) throw new Error(`観点の名前が重なっている：${keys.join('・')}`)
const unknownOnly = only.filter((k) => !keys.includes(k))
if (unknownOnly.length) throw new Error(`only に lenses に無い観点がある：${unknownOnly.join('・')}`)
const run = lenses.map((lens, i) => ({ lens, n: i + 1 })).filter(({ lens }) => !only.length || only.includes(lens.key))
if (run.length > maxRun) throw new Error(`一度に起こす観点は ${maxRun} まで（照らす${withGrow ? '・伸ばす・疑う' : ''}と合わせて ${MAX_AGENTS} 体以内）。only で分けて二回にする`)

// ---- 指示文 ----
const readList = (extra) => (read.length ? read : ['CLAUDE.md と、段階①-2 で整えた索引と地図（対象に関係する所だけ）']).concat(extra || []).map((r) => `- ${r}`).join('\n')
const KEEP = '- あなたが守るのは、読み取り専用・このリポジトリの文書とコードだけを読む（リポジトリの外のフォルダ、環境変数、鍵は読まない）・判定しない（順位・点数・おすすめ・採否を付けない）の三つ。'
const PEEK = 'HANDOFF.md、案の一覧のフォルダ（docs/wip/ の ideas/・ideas-*/）の README.md・cards.md・raw-R*.json、思いつきの置き場、見送りの台帳、段階①-1 の索引（docs/wip/<日付>/README.md）の「思いつき」の節'
const SOURCES = '案の一覧のフォルダの sources/ の材料は、読むものに挙がっていれば読んでよい。'
const NO_PEEK = `- これも守る：主担当の見立てと前の周の案を見ないため、${PEEK}は読まない。${SOURCES}`
const NO_PEEK_KNOWN = `- これも守る：主担当の見立てを見ないため、${PEEK}は読まない（前の周の案は、上に挙げた名前だけで見る）。${SOURCES}` // 前の周の案の名前を見せる相
const ideaText = (x) => [
  `[${x.id}] ${x.title}（観点：${x.lens}・種類：${x.kind}${x.parts && x.parts.length ? `・部分：${x.parts.join('・')}` : ''}）`,
  `  何を：${x.what}`,
  x.scene ? `  場面：${x.scene}` : '',
  x.touches ? `  関わる所：${x.touches}` : '',
].filter(Boolean).join('\n')

const spreadPrompt = (lens) => [
  'あなたは検討担当です。読み取り専用です。ファイルを書かない・直さない・git の操作をしない。',
  '案を広げるだけです。良し悪しを考えずに出してください。入れる場所は次の相の担当が探すので、コードを読みに行かなくてよい。',
  '',
  '## 対象',
  args.topic,
  '',
  '## 読むもの',
  readList(lens.read),
  '',
  `## あなたの観点：${lens.key}`,
  lens.ask,
  parts.length ? `\n## 対象の部分（案ごとに、効く部分を parts に。いくつでも。どれにも効かなければ空の配列）\n${parts.map((p) => `- ${p}`).join('\n')}` : '',
  knownToExpand && known.length ? `\n## 前の周までに出た案（これと重ならない案を出す）\n${known.map((k) => `- ${k}`).join('\n')}` : '',
  '',
  '## 返し方',
  '- 案は 4〜6 つを目安に、実りが多ければ 8 まで。はじめの二つはありきたりでよい。そのあとは、はじめの二つと違う方向に出す。',
  '- この観点に合う案が少なければ、少ないまま返し、thin を true にする（数を合わせるために出さない）。',
  '- できれば一つは、今ある面・保存の形・流れのどれかを変えないと入らない、大きく外れた案（kind は「奇抜」）にする。',
  `- kind は ${KINDS.join('・')} から一つ。touches には、関わる面・流れ・部分を短く（ファイル名は要らない）。`,
  '- 広げていて浮かんだ問い（そもそも何に困っているか、使う人に聞きたいこと、前提への問い）は questions に（三つまで。答えなくてよい）。',
  KEEP,
  '- CLAUDE.md と決まりの文書の決まりは、この相では案を減らす理由にしない。決まりに反する案も出す（反するかどうかは書かなくてよい。次の段階で当てる）。',
  knownToExpand && known.length ? NO_PEEK_KNOWN : NO_PEEK,
].join('\n')

const lightPrompt = (chunk, all) => [
  'あなたは調査担当です。読み取り専用です。ファイルを書かない・直さない・git の操作をしない。',
  '次の案それぞれについて、このリポジトリのコードと文書から、入れる場所を探し、事実を付けてください。良し悪し、要る・要らないは書かない。',
  '',
  '## 対象',
  args.topic,
  '',
  '## 読むもの',
  readList([]),
  '',
  '## 照らす案',
  chunk.map(ideaText).join('\n\n'),
  '',
  '## この周の全部の案（重なりを探すため。照らすのは上の案だけ）',
  all.map((x) => `- [${x.id}] ${x.title}`).join('\n'),
  known.length ? `\n## 前の周までの案と、主担当が載せた案（重なりを探すため）\n${known.map((k) => `- ${k}`).join('\n')}` : '',
  '',
  '## 返し方',
  '- items に、照らす案の id ごとに一つ。',
  '- found と entry：入れる場所（ファイルと関数、見た時点の行）。見つからなければ found を false にし、entry に「新しく作る所」と、探した所を書く。見つからないことは欠点として書かない。',
  '- existing（今あるもので使えるもの・重なるもの。ファイルと行）、assumptions（この案が置いている前提）、overlaps（重なる・組み合わさる、この周のほかの案の id）'
    + (known.length ? '、overlaps_known（重なる、前の周までの案と主担当が載せた案。上の一覧の書き方のまま。無ければ空）。' : '。'),
  '- 重なりは、どこに何があるかの事実だけを書く。出どころの無いことは書かない。',
  KEEP,
  known.length ? NO_PEEK_KNOWN : NO_PEEK,
].join('\n')

const growPrompt = (chunk, light) => [
  'あなたは検討担当（伸ばす・疑う役）です。読み取り専用です。ファイルを書かない・直さない・git の操作をしない。',
  '次の案それぞれを、伸ばしてから疑ってください。案を捨てる・選ぶことはしない。弱いところだけで終えない。',
  '',
  '## 対象',
  args.topic,
  args.background ? `\n## 主担当の見立て（これも疑ってよい。on_background に）\n${args.background}` : '',
  '',
  '## 読むもの',
  readList([]),
  '',
  '## 案（照らした結果つき）',
  chunk.map((x) => {
    const l = light && light.items && light.items[x.id]
    return ideaText(x) + (l ? `\n  照らした結果：${l.found ? '場所あり' : '新しく作る所'}／${l.entry}${l.existing ? `／今あるもの：${l.existing}` : ''}` : '\n  照らした結果：なし')
  }).join('\n\n'),
  '',
  '## 返し方',
  '- items に、案の id ごとに一つ。この順で考える：conditions（成り立つための条件）→ bolder（もっと大胆にした形）→ combos（組むと強くなるほかの案の id）→ weak（崩れうる前提。根拠があればファイルと行）→ cheapest_check（いちばん安い確かめ方）。',
  '- いくつもの案に共通する前提や、先に決めると以後の案が軽くなるものがあれば roots に（案の id 付き）。',
  KEEP,
].join('\n')

// ---- schema（照らす・伸ばす・疑うは id ごとにプロパティを持たせ、抜けを型の検査で止める） ----
const spreadSchema = {
  type: 'object',
  properties: {
    ideas: {
      type: 'array',
      maxItems: 8,
      description: '案。順位を付けない',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: '短い名前（20 字ほど）' },
          what: { type: 'string', description: '何を（一文）' },
          scene: { type: 'string', description: 'どんな場面で効くか' },
          touches: { type: 'string', description: '関わる面・流れ・部分（ファイル名は要らない）' },
          kind: { type: 'string', enum: KINDS, description: '案の種類' },
          ...(parts.length ? { parts: { type: 'array', items: { type: 'string', enum: parts }, description: '効く部分（いくつでも）' } } : {}),
        },
        required: parts.length ? ['title', 'what', 'scene', 'kind', 'parts'] : ['title', 'what', 'scene', 'kind'],
      },
    },
    thin: { type: 'boolean', description: 'この観点に合う案が少なかったら true' },
    questions: { type: 'array', items: { type: 'string' }, description: '広げていて浮かんだ問い（三つまで）' },
  },
  required: ['ideas'],
}
const keyed = (ids, item) => ({
  type: 'object',
  properties: Object.fromEntries(ids.map((id) => [id, item])),
  required: ids,
})
const lightSchema = (chunk, allIds) => ({
  type: 'object',
  properties: {
    items: keyed(chunk.map((x) => x.id), {
      type: 'object',
      properties: {
        found: { type: 'boolean', description: '入れる場所が見つかったか（見つからなければ新しく作る所）' },
        entry: { type: 'string', description: '入れる場所（ファイルと関数、見た時点の行）。見つからなければ「新しく作る所」と、探した所' },
        existing: { type: 'string', description: '今あるもので、使えるもの・重なるもの（ファイルと行）' },
        assumptions: { type: 'array', items: { type: 'string' }, description: 'この案が置いている前提' },
        overlaps: { type: 'array', items: { type: 'string', enum: allIds }, description: '重なる、または組み合わさる、この周のほかの案の id' },
        ...(known.length ? { overlaps_known: { type: 'array', items: { type: 'string', enum: known }, description: '重なる、前の周までの案と主担当が載せた案' } } : {}),
      },
      required: known.length ? ['found', 'entry', 'overlaps_known'] : ['found', 'entry'],
    }),
  },
  required: ['items'],
})
const growSchema = (chunk, allIds) => ({
  type: 'object',
  properties: {
    items: keyed(chunk.map((x) => x.id), {
      type: 'object',
      properties: {
        conditions: { type: 'array', items: { type: 'string' }, description: 'この案が成り立つための条件' },
        bolder: { type: 'string', description: 'もっと大胆にした形' },
        combos: { type: 'array', items: { type: 'string', enum: allIds }, description: '組むと強くなるほかの案の id' },
        weak: { type: 'array', items: { type: 'string' }, description: '崩れうる前提（根拠があればファイルと行）' },
        cheapest_check: { type: 'string', description: 'いちばん安い確かめ方' },
      },
      required: ['conditions', 'cheapest_check'],
    }),
    roots: {
      type: 'array',
      description: 'いくつもの案に共通する前提や、先に決めると以後の案が軽くなるもの',
      items: { type: 'object', properties: { note: { type: 'string' }, ids: { type: 'array', items: { type: 'string', enum: allIds } } }, required: ['note'] },
    },
    on_background: { type: 'array', items: { type: 'string' }, description: '主担当の見立てへの疑い（渡されたときだけ）' },
  },
  required: ['items'],
})
const opts = (label, ph, model, schema, effort) => {
  const o = { label, phase: ph, model, agentType: 'general-purpose', schema }
  if (effort) o.effort = effort
  return o
}

// ---- 広げる（全部の案がそろってから id を振り、数で塊に分けるので、ここだけ待ち合わせる） ----
phase('広げる')
log(`検討担当が観点 ${run.length}（${run.map(({ lens }) => lens.key).join('・')}）で広げる。周 ${round}${parts.length ? `、部分 ${parts.length}` : ''}。model は args の指定`)
const outs = await parallel(run.map(({ lens }) => () => agent(spreadPrompt(lens), opts(`広げる:${lens.key}`, '広げる', args.model, spreadSchema, args.effort))))

const ideas = []
const questions = []
const thin = []
const empty = { spread: [], light: [], grow: [] }
run.forEach(({ lens, n }, i) => {
  const out = outs[i]
  if (!out || !Array.isArray(out.ideas)) { empty.spread.push(lens.key); return }
  if (out.thin || !out.ideas.length) thin.push(lens.key)
  out.ideas.forEach((idea, j) => ideas.push({ ...idea, id: `R${round}-L${n}-${j + 1}`, lens: lens.key })) // 振った id と観点を後ろに置き、答えの欄で上書きさせない
  ;(out.questions || []).forEach((q) => questions.push({ from: lens.key, q }))
})
if (empty.spread.length) log(`答えの無かった観点：${empty.spread.join('・')}（理由は failures と journal.jsonl で確かめ、only で頼み直す）`)
if (thin.length) log(`案が乏しかった観点：${thin.join('・')}`)

// ---- 照らす → 伸ばす・疑う（塊ごとに流す。広げた案は塊の外に持っておくので、後の相が空でも案は返る） ----
const allIds = ideas.map((x) => x.id)
const perChunkAgents = withGrow ? 2 : 1
const room = Math.floor((MAX_AGENTS - run.length) / perChunkAgents)
const chunkCount = ideas.length ? Math.max(1, Math.min(room, Math.ceil(ideas.length / PER_CHUNK))) : 0
const chunks = []
for (let c = 0; c < chunkCount; c++) {
  chunks.push(ideas.slice(Math.floor((ideas.length * c) / chunkCount), Math.floor((ideas.length * (c + 1)) / chunkCount)))
}
if (chunks.some((ch) => ch.length > PER_CHUNK * 2)) log(`一体あたりの案が ${Math.max(...chunks.map((ch) => ch.length))} と多い（上限 ${MAX_AGENTS} 体のため。削ってはいない）`)
log(`調査担当が照らし${withGrow ? '、検討担当が伸ばして疑う' : ''}：案 ${ideas.length}、塊 ${chunkCount}（体数 ${run.length + chunkCount * perChunkAgents}）`)

const stages = [
  (chunk, _, ci) => agent(lightPrompt(chunk, ideas), opts(`照らす:塊${ci + 1}`, '照らす', args.lightModel, lightSchema(chunk, allIds), args.lightEffort))
    .then((light) => ({ light })),
]
if (withGrow) {
  stages.push((acc, chunk, ci) => agent(growPrompt(chunk, acc.light), opts(`伸ばす・疑う:塊${ci + 1}`, '伸ばす・疑う', args.model, growSchema(chunk, allIds), args.effort))
    .then((grow) => ({ ...acc, grow })))
}
const lit = await pipeline(chunks, ...stages)

const missing = { light: [], grow: [] }
const roots = []
const onBackground = []
chunks.forEach((chunk, ci) => {
  const r = lit[ci] || {}
  if (!r.light) empty.light.push(`塊${ci + 1}`)
  if (withGrow && !r.grow) empty.grow.push(`塊${ci + 1}`)
  chunk.forEach((x) => {
    x.light = (r.light && r.light.items && r.light.items[x.id]) || null
    x.grow = (r.grow && r.grow.items && r.grow.items[x.id]) || null
    if (r.light && !x.light) missing.light.push(x.id)
    if (r.grow && !x.grow) missing.grow.push(x.id)
  })
  if (r.grow && Array.isArray(r.grow.roots)) r.grow.roots.forEach((root) => roots.push({ from: `塊${ci + 1}`, ...root }))
  if (r.grow && Array.isArray(r.grow.on_background)) r.grow.on_background.forEach((d) => onBackground.push({ from: `塊${ci + 1}`, doubt: d }))
})
if (empty.light.length || empty.grow.length) log(`答えの無かった塊：照らす ${empty.light.join('・') || 'なし'}${withGrow ? `／伸ばす・疑う ${empty.grow.join('・') || 'なし'}` : ''}（理由は failures と journal.jsonl で確かめる）`)
if (missing.light.length || missing.grow.length) log(`答えの抜けた案：照らす ${missing.light.join('・') || 'なし'}${withGrow ? `／伸ばす・疑う ${missing.grow.join('・') || 'なし'}` : ''}`)

// ---- 数え（材料。票ではない。照らすのは主担当） ----
const byLens = Object.fromEntries(run.map(({ lens }) => [lens.key, 0]))
const byKindSelf = Object.fromEntries(KINDS.map((k) => [k, 0]))
const byPart = parts.length ? Object.fromEntries(parts.map((p) => [p, 0])) : null
ideas.forEach((x) => {
  byLens[x.lens] += 1
  if (byKindSelf[x.kind] !== undefined) byKindSelf[x.kind] += 1
  if (byPart) (x.parts || []).forEach((p) => { if (byPart[p] !== undefined) byPart[p] += 1 })
})
const unlit = ideas.filter((x) => !x.light).length
const fresh = known.length && !knownToExpand && !unlit ? ideas.filter((x) => !(x.light.overlaps_known || []).length).length : null
if (known.length && fresh === null) log(`fresh は数えない（${knownToExpand ? 'knownToExpand のため' : `照らされなかった案が ${unlit}`}）。飽和は主担当が照らす`)

return {
  topic: args.topic,
  round,
  lenses: run.map(({ lens }) => lens.key),
  parts,
  roles: withGrow ? { 広げる: '検討担当', 照らす: '調査担当', '伸ばす・疑う': '検討担当' } : { 広げる: '検討担当', 照らす: '調査担当' },
  ideas,
  questions,
  roots,
  on_background: onBackground,
  thin,
  counts: { raw: ideas.length, byLens, byPart, byKindSelf, fresh, unlit },
  empty,
  missing,
  asked: {
    lenses: run.map(({ lens }) => ({ key: lens.key, ask: lens.ask, read: lens.read })),
    read,
    known,
    knownToExpand,
    doubt: withGrow,
    only,
    background: args.background || '',
  },
}
