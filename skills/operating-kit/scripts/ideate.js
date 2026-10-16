export const meta = {
  name: 'ideate',
  description: '一つの対象について、観点ごとに案を広げ、照らし、伸ばして疑う（主担当の先出しの案も通せる。つなぐ一体も選べる。検討担当・調査担当。判定しない）',
  whenToUse: '段階②-1（考察と発想）と、段階②-1・②-2 をまとめたときの広げる周で、案を観点ごとに広げるとき。二周目は round を上げ、観点を替え、known に前の周までの案と主担当が載せた案を「<id> <短い名前>」の形で渡す。主担当の先出しの案は mainIdeas で（広げる相には見せない）。観点・塊をまたいでつなぐなら synth、選ばれた束を土台にするなら deepen、観点を順に積むなら chain。検討担当を呼ばない段階①-1・段階③・段階の外では使わない',
  phases: [
    { title: '広げる', detail: '観点ごとに一体（検討担当）。主担当の見立ても前の周の案も見せない（目隠し）。判定しない' },
    { title: '照らす', detail: '案の塊ごとに一体（調査担当）。入れる場所を探し、今あるもの・前提・重なりを付ける。判定しない' },
    { title: '伸ばす・疑う', detail: '案の塊ごとに一体（検討担当）。成り立つ条件・大胆にした形・崩れうる前提・安い確かめ方。判定しない' },
    { title: 'つなぐ', detail: 'synth のときだけ一体（検討担当）。観点・塊をまたぐ根、組み合わせて生まれる案、観点の空白。判定しない・束にしない' },
  ],
}

// 運用の型（docs/operating-kit/README.md）の発想のひな形。段階②-1 の三つの相：広げる → 照らす → 伸ばす・疑う（synth なら、そのあとに つなぐ）。
// Workflow ツールに scriptPath（このファイルの絶対パス）と args で渡す。モデル名はこのファイルに書かない。
//
// args（主担当が渡す。JSON の値で渡し、文字列にしない）：
//   topic          対象と、困っている場面だけ（必須）。案・おすすめ・見立ては書かない（それは background へ）
//   model          CLAUDE.md の役割の表の検討担当の指定（必須。広げる・伸ばす・疑う・つなぐ相。省くとセッションのモデルになるので、省かない）
//   lightModel     CLAUDE.md の役割の表の、照らす相の調査担当の指定（必須。照らすのは読み取りの下働きなので調査担当。モデルは、役割の表で照らす相だけ別に決めてある）
//   effort         広げる・伸ばす・疑う・つなぐ相の effort（任意。low・medium・high・xhigh・max。CLAUDE.md の役割の表に指定が無ければ省く）
//   lightEffort    照らす相の effort（任意。同じく、表に指定が無ければ省く）
//   round          周の番号（任意。既定 1）。案の id に入る
//   read           全員が読むもの（省くと、CLAUDE.md と、段階①-2 の地図と一覧。観点の read は、これに足す）。地図と一覧（map/README.md と地図のファイル）はパスを名指しして渡す
//                  （HANDOFF.md は読ませないので、省くと担当が探すことになる）。
//                  次は入れない（共通の read にも観点の read にも。スクリプトが止める。パスは後ろの注（最初の空白・（・(・§・# から先）を落とし、
//                  大文字と小文字を分けずに見る）：HANDOFF.md、wip/ の下の案の一覧のフォルダ（ideas/・ideas-*/）の sources/ 以外のすべて
//                  （README.md・cards.md・notes.md・raw-R*.json・tries/ など）、wip/ の下の cards.md・notes.md（地図のフォルダの notes.md も）と tries/、raw-R*.json、
//                  思いつきの置き場・見送りの台帳（既定の名前 ideas-inbox.md・ideas-shelf.md）、.. を含むパス、wip のフォルダごと（docs/wip/・docs/wip/<日付>/。ファイルを名指しする）。
//                  段階①-1 の索引の「思いつき」の節も読ませない（指示文で伝える）。案の一覧のフォルダの sources/ の材料は入れてよい。
//                  段階①-2 の制約の一覧（map/constraints.md）は、read に入れない（どの周でも。スクリプトが止める）。二周目からは、制約を外す方向の観点の read にだけ入れてよい
//                  （一周目は観点の read にも入れない。制約は段階②-2 の判定で当てる。constraints.md を読ませない観点には、指示文でも読まないと伝える）
//   parts          対象の部分の一覧（任意。段階①-2 の地図と一覧の「部分の候補」から選ぶ。地図に無い切り口は主担当が材料から立てる）。
//                  渡すと、案ごとにどの部分に効くかを必ず返させ、網羅を部分で測る
//   lenses         観点の一覧（下の LENSES の数まで。今は 11）。段階①-2 の lenses.json の { key, ask } も、そのまま入れてよい。文字列は下の LENSES の名前、{ key, ask, read?, readOnly? } はそのまま使う。省くと一周目の既定の六つ。
//                  一周目は、対象の部分を観点にしたもの（{ key, ask }）と発想の型を半分ずつほど混ぜるとよい。ask に答えの例を書かない。
//                  readOnly が true の観点は、共通の read を足さず、その観点の read だけを読ませる（read が要る）
//   only           起こす観点の名前の一覧（任意）。空だった観点だけを頼み直すときと、観点を二回に分けるとき。
//                  lenses は元と同じ並びで、round・parts・known も元と同じに渡す（id が変わらない）。返す値は、同じ周の二回目からは raw-R<周>-2.json・-3.json と番号を上げて写す（二回に分けた一回目は raw-R<周>.json。上書きしない）
//   background     主担当の見立て。伸ばす・疑う相だけに見せる（広げる・照らす・つなぐ相には見せない＝目隠し）
//   known          前の周までに出た案と、思いつきの置き場・見送りの台帳から主担当が案の一覧に載せた案を、「<id> <短い名前>」の形で
//                  （例 R1-L2-3 下書きを残す）。照らす相に渡して重なりを見させ（overlaps_known もこの形で返る）、飽和の物差し（counts.fresh）にする。
//                  広げる相には見せない
//   knownToExpand  true なら known を広げる相にも見せる（任意。コードや対象が大きく変わったあとに、前の案と重ならない案だけを出し直すときだけ。
//                  同じ案の一覧で周を足すふつうの二周目には、セッションが替わっても、段階②-2 から戻っても使わない。
//                  true にするときは、known から置き場・台帳の案を外す。飽和で照らさないので fresh は null）
//   doubt          false なら伸ばす・疑う相を起こさない（任意。既定 true。false なら一度に起こせる観点が 8 まで増える）
//   mainIdeas      主担当の先出しの案 [{ id, title, what, scene?, touches?, kind, parts?, why? }]（任意。16 まで）。id は R<周>-主-<番号>、kind は下の KINDS のどれか、
//                  parts は args.parts の中から（args.parts が無ければ渡さない）。広げる相には見せず、広げた案のあとに足して、照らす・伸ばして疑う相に
//                  広げた案と同じに通す（lens は「主担当」、main は true）。only とは一緒に渡せない（頼み直しで同じ案を二度照らさないため）。known にある id は渡せない
//   synth          true なら、照らす・伸ばして疑うのあとに、つなぐ一体（検討担当。model・effort）を起こす（任意。既定 false）。観点・塊をまたぐ根、
//                  組み合わせて生まれる案、観点の空白を返させる。判定しない。広げた案が 0 件なら起こさない
//   lensModels     { "<観点の key>": "<モデル>" }（任意）。広げる相のその観点だけ、model の代わりに使う（照らす・伸ばして疑う・つなぐは今のまま）。
//                  キーは走らせる観点の key に限る。返す値にはキーだけを書く（モデル名は返さない）
//   deepen         土台にする案（任意。利用者が掘る方向に選んだ束の案を、known と同じ「<id> <短い名前>」の形で。二周目から。id は known にあるもの）。
//                  広げる相に見せ、これを伸ばす・組む・別の形にさせる。knownToExpand とは一緒に渡せない。この周の fresh は null（飽和に使わない）
//   chain          true なら、広げる相を並列でなく、観点の並びの順に一体ずつ起こし、先の観点がこの周に出した案（短い名前と何を）を後の観点に見せる
//                  （任意。二周目から。only とは一緒に渡せない。体数は変わらない）
//
// 体数：広げるは観点ごとに一体（一度に 6 観点まで。doubt が false なら 8）。照らす（と伸ばす・疑う）は、案（主担当の案も含む）を数で均等に分けた塊ごとに一体ずつ。
//   synth なら、つなぐ一体を足す。塊の数は一塊 8 案ほどで、上限 18 体から広げるの体数と、つなぐ一体を引いた残りに収まるだけ
//   （6 観点 × 8 案 = 48 案でも 6 塊で、1 体 8 案に収まる。synth なら 5 塊）。
//   ふつうは 6 観点で一周 12〜18 体（1 観点 4〜5 案ほどなら照らす相・伸ばす疑う相が 3〜4 体ずつ）を、二周以上回す。小さな計画は 3 観点で 5〜9 体。
// 案の id：R<周>-L<観点の番号>-<案の番号>（観点の番号は lenses の並びの位置。例 R2-L1-3）。
//   主担当が足す案は R<周>-主-<番号>（mainIdeas で通すときも同じ）、関わり方 (B) の相談役の案は R<周>-B-<番号>、段階②-2 で足す案は 足-<番号>（docs/main-agent.md §4.1）。
//   つなぐ一体が組み合わせて出した案は R<周>-X-<番号>（照らしも疑いも経ていないので ideas には入れず、synth.ideas に置く）。
//
// 返すもの：{ topic, round, lenses, parts, roles, ideas: [{ id, lens, title, what, why?, scene, touches, parts, kind, main, light, grow }],
//            questions, roots, on_background, thin, more, asides, synth: { roots, ideas: [{ id, title, what, from, kind }], gaps } か null,
//            counts: { raw, rawSpread, byLens, byPart, byKindSelf, fresh, unlit, main, synth }, empty: { spread, light, grow, synth? }, missing: { light, grow },
//            asked: { lenses: [{ key, ask, read, readOnly }], read, known, knownToExpand, doubt, only, background, mainIdeas, synth, lensModelKeys, deepen, chain } }
// 判定はしない（箱に分けるのは段階②-2 の主担当）。counts は材料で、票ではない。
//   raw は重なりを除く前の数（広げた案と主担当の案の全部）で、量の照らしにそのまま使わない。rawSpread は広げた案だけ。byKindSelf は広げた担当の自己申告（主担当の案も数える）。
//   byLens は走らせた観点ごと（主担当の案があれば「主担当」も）。
//   fresh は、広げた案（主担当の案は数えない）のうち、調査担当が known との重なりを見つけなかった案の数。known が無いとき、knownToExpand のとき、deepen のとき、
//   照らされなかった案（unlit）があるとき、広げる相が空だった観点があるとき、広げた案が 0 件のときは null。
//   main は、主担当の案があるとき { total, unique }（無ければ null）。unique は、照らす相の重なり（overlaps）で、広げた案とどちらの側からも重ならなかった主担当の案の数
//   （広げる相が空だった観点があるとき、広げた案が 0 件のとき、照らされなかった案（広げた案も主担当の案も）があるときは null）。
//   案の main は、主担当の案なら true、広げた案なら false（広げた担当の答えの欄では上書きしない）。synth は、つなぐ一体の案の数（起こさなかった・空だったときは null。空なら empty.synth が true）。
//   more は、12 案に届いてなお出せる案があると答えた観点の key（頼み直す目安）。asides は観点の外で浮かんだ考え [{ from, note }]（自由文。案ではない）。
//   案の why（筋道）は広げた担当の推し量りで、事実ではない。
//   終わりの目安（docs/main-agent.md §4.2）を照らすのは主担当。asked は頼んだ中身（あとで、どの known で測ったかなどを確かめるため）。
// 返す値は、要約する前に、通知が示す出力のファイルの JSON の result だけを、案の一覧のフォルダ（docs/wip/<②-1 を始めた日>/ideas/ か ideas-<短い名前>/）の raw-R<周>.json にコマンドで写してコミットする
//   （例 node docs/operating-kit/tools/ideas-table.mjs extract <出力のファイル> <案の一覧のフォルダ>/raw-R1.json、jq があれば jq '.result' <出力のファイル> > <案の一覧のフォルダ>/raw-R1.json。
//   ファイルを丸ごと写さない：ほかの欄にモデル名が入る。同じ周の二回目からは raw-R<周>-2.json・-3.json（上書きしない）。セッションが替わると読めない）。
// 返す値にモデル名は入れていない（lensModels もキーだけ）。写すときも、集め方は run ID と役割名で書く。
// 照らす・伸ばす・疑う相が空だった塊は、同じ args や only で頼み直さない（同じ id に別の案が入る）。docs/main-agent.md §4.2 のとおり主担当が補う。

const MAX_AGENTS = 18 // ideate.js だけの上限（CLAUDE.md の合図の語（ワークフロー）の節。consult.js・survey.js は 10）。広げる 6 と、8 案ずつの塊 6 つを照らす 6・伸ばす疑う 6。変えたら CLAUDE.md も直す
const MAX_RUN = 6 // 一度に起こす観点の数（doubt が false なら MAX_RUN_NO_DOUBT）
const MAX_RUN_NO_DOUBT = 8
const PER_CHUNK = 8 // 照らす・伸ばす・疑う一体あたりの案の数の目安
const MAX_MAIN = 16 // 主担当の先出しの案の数の上限
const MAIN_LENS = '主担当' // 主担当の案の lens と、byLens の名前
const KINDS = ['奇抜', 'やめる・減らす', '組み合わせる', '制約を外す', '作らない', 'そのほか'] // 前の五つは、案の一覧で照らす種類（docs/main-agent.md §4.2 の 2）
const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max']

// 広げる用の観点（発想の型）。前の六つが一周目の既定（ふつうの計画は 6 観点で二周以上）。後ろの五つは、二周目などに名前で選ぶ。
// consult.js の既定の五つ（方向・抜け・別案・危うさ・使う人の目）は、まとまった案を点検する絞る用。
const LENSES = [
  { key: '使う人の場面', ask: '使う人の具体的な場面（初めて使うとき、毎日使うとき、急いでいるとき、使わない人）を思い描き、そこで助かるものを考える。' },
  { key: '逆にする', ask: '足すのではなく、やめる・減らす・順を入れ替える・する人を替える方向で考える。' },
  { key: 'ほかから借りる', ask: 'ほかの分野・ほかの道具の仕組みで、ここに持ち込めるものを考える。どの分野・どの道具の、どの仕組みかを名指しする（あなたの知っていることから。リポジトリの外は読みに行かない）。' },
  { key: '制約を一つ外す', ask: 'CLAUDE.md の決まり・大きな決めごとの一覧・戻すのが重い層から、制約を一つ選んで外せるとしたら何ができるかを考える。どれを外したかを書く。' },
  { key: '極端にする', ask: '量・数・速さ・範囲を 10 倍・100 倍にする、または全部に広げると何が起きるかを考え、そこから見える案を出す。' },
  { key: 'ほかの立場', ask: '壊そうとする人・あとで直す人・初めての人のうち一つの立場を選び、その目で見て要るものを考える。選んだ立場を書く。' },
  { key: '組み合わせる', ask: 'このリポジトリに今ある仕組み同士をつなぐと生まれるものを考える。どれとどれかを名指しする。' },
  { key: '時間をずらす', ask: '一日後・一か月後・一年後に、使う人と仕組みがどうなっているかを思い描き、そのときに要るものを考える。' },
  { key: '既知の欠陥から', ask: '既知の欠陥・危うい所・困りごとの記録を起点に、直すだけでなく、それをなくす・生かす案を考える。' },
  { key: '問いを変える', ask: '今の問いを別の問いに言い換えると何が要るかを考える。言い換えた問いは questions にも書く。' },
  { key: '作らずに済ませる', ask: '新しく作らずに、使う人が自分でやる・今ある道具や手順で済ませる・決まりや使い方を決めるだけで足りる、という方向で考える。' },
]
const FIRST_ROUND = 6

// ---- args の検査（まちがった値を黙って既定に置き換えない） ----
if (typeof args === 'string') throw new Error('args は JSON の値で渡す（文字列にしない）')
if (!args || typeof args !== 'object') throw new Error('args が要る（topic・model・lightModel など。ファイルの頭の説明を見る）')
const KEYS = ['topic', 'model', 'lightModel', 'effort', 'lightEffort', 'round', 'read', 'parts', 'lenses', 'only', 'background', 'known', 'knownToExpand', 'doubt', 'mainIdeas', 'synth', 'lensModels', 'deepen', 'chain']
const unknownKeys = Object.keys(args).filter((k) => !KEYS.includes(k))
if (unknownKeys.length) throw new Error(`args に知らない名前がある：${unknownKeys.join('・')}（使える名前：${KEYS.join('・')}）`)
const nonEmpty = (v) => typeof v === 'string' && v.trim() !== ''
if (!nonEmpty(args.topic)) throw new Error('args.topic（対象と、困っている場面）が要る')
if (!nonEmpty(args.model)) throw new Error('args.model が要る（CLAUDE.md の役割の表の検討担当の指定。省かない）')
if (!nonEmpty(args.lightModel)) throw new Error('args.lightModel が要る（CLAUDE.md の役割の表の、照らす相の調査担当の指定。省かない）')
for (const k of ['effort', 'lightEffort']) {
  if (args[k] !== undefined && !EFFORTS.includes(args[k])) throw new Error(`args.${k} は ${EFFORTS.join('・')} のどれか`)
}
for (const k of ['knownToExpand', 'doubt', 'synth', 'chain']) {
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
const deepen = strList(args.deepen, 'deepen')
if (new Set(parts).size !== parts.length) throw new Error('args.parts に同じ名前がある')
if (new Set(known).size !== known.length) throw new Error('args.known に同じ名前がある（名前で重なりを返させるため。「<id> <短い名前>」の形で渡す）')
if (args.background !== undefined && typeof args.background !== 'string') throw new Error('args.background は文字列')
const knownToExpand = args.knownToExpand === true
const withGrow = args.doubt !== false
const synth = args.synth === true
const chain = args.chain === true
const maxRun = withGrow ? MAX_RUN : MAX_RUN_NO_DOUBT // 残りの体数（上限 − 観点）で、8 案ずつの塊を照らす（と伸ばして疑う）
const idOf = (line) => line.trim().split(/\s+/)[0] // 「<id> <短い名前>」の id（最初の空白まで）
const dupsOf = (list) => [...new Set(list.filter((x, i) => list.indexOf(x) !== i))] // 二つ以上ある値
const knownIds = known.map(idOf)
const knownDups = dupsOf(knownIds)
if (knownDups.length) throw new Error(`args.known に同じ id がある：${knownDups.join('・')}（一つの id に一行。「<id> <短い名前>」の形で渡す）`)

if (args.lenses !== undefined && (!Array.isArray(args.lenses) || !args.lenses.length)) throw new Error('args.lenses は観点の配列（省くと一周目の既定の六つ）')
const LENS_KEYS = ['key', 'ask', 'read', 'readOnly']
const lenses = (args.lenses || LENSES.slice(0, FIRST_ROUND)).map((l) => {
  if (typeof l === 'string') {
    const found = LENSES.find((x) => x.key === l)
    if (!found) throw new Error(`知らない観点の名前：${l}（使える名前：${LENSES.map((x) => x.key).join('・')}。ほかは { key, ask } で渡す）`)
    return { key: found.key, ask: found.ask, read: [], readOnly: false }
  }
  if (!l || !nonEmpty(l.key) || !nonEmpty(l.ask)) throw new Error('観点は名前か { key, ask, read?, readOnly? } で渡す（key と ask は空でない文字列）')
  const extraLensKeys = Object.keys(l).filter((k) => !LENS_KEYS.includes(k))
  if (extraLensKeys.length) throw new Error(`観点 ${l.key} に知らない名前がある：${extraLensKeys.join('・')}（使える名前：${LENS_KEYS.join('・')}）`)
  if (/[\\/:*?"<>|]/.test(l.key)) throw new Error(`観点の key に / \\ : * ? " < > | は使えない（ファイル名になる）：${l.key}`)
  if (l.readOnly !== undefined && typeof l.readOnly !== 'boolean') throw new Error(`観点 ${l.key} の readOnly は true か false`)
  const lensRead = strList(l.read, `lenses の ${l.key} の read`)
  if (l.readOnly === true && !lensRead.length) throw new Error(`観点 ${l.key} は readOnly なので read が要る（共通の read を足さず、観点の read だけを読ませるため）`)
  return { key: l.key, ask: l.ask, read: lensRead, readOnly: l.readOnly === true }
})
if (lenses.length > LENSES.length) throw new Error(`観点は ${LENSES.length} まで`)
const keys = lenses.map((l) => l.key)
if (new Set(keys).size !== keys.length) throw new Error(`観点の名前が重なっている：${keys.join('・')}`)
const unknownOnly = only.filter((k) => !keys.includes(k))
if (unknownOnly.length) throw new Error(`only に lenses に無い観点がある：${unknownOnly.join('・')}`)
const run = lenses.map((lens, i) => ({ lens, n: i + 1 })).filter(({ lens }) => !only.length || only.includes(lens.key))
const CONSTRAINTS = 'constraints.md'
if (read.some((r) => r.includes(CONSTRAINTS))) throw new Error('段階①-2 の制約の一覧（map/constraints.md）は、共通の read に入れない（二周目からは、制約を外す方向の観点の read にだけ。docs/main-agent.md §2.2）')
if (round === 1 && lenses.some((l) => l.read.some((r) => r.includes(CONSTRAINTS)))) throw new Error('一周目は、制約の一覧（map/constraints.md）を観点の read にも入れない（制約は段階②-2 の判定で当てる）')
// 広げる相に見せないもの（主担当の見立て・前の周の案が入る所）。consult.js にも同じ関数がある。
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
for (const list of [read, ...lenses.map((l) => l.read)]) {
  for (const r of list) {
    const why = readProblem(r)
    if (why) throw new Error(`read に入れない：${r}（${why}。広げる相に見せないため。案の一覧のフォルダは sources/ だけ読ませる。docs/main-agent.md §4.1）`)
  }
}
if (run.length > maxRun) throw new Error(`一度に起こす観点は ${maxRun} まで（照らす${withGrow ? '・伸ばす・疑う' : ''}と合わせて ${MAX_AGENTS} 体以内）。only で分けて二回にする`)

// 主担当の先出しの案（広げる相には見せない）
const MAIN_KEYS = ['id', 'title', 'what', 'scene', 'touches', 'kind', 'parts', 'why']
if (args.mainIdeas !== undefined && !Array.isArray(args.mainIdeas)) throw new Error('args.mainIdeas は案の配列（[{ id, title, what, scene?, touches?, kind, parts?, why? }]）')
const mainIdeas = args.mainIdeas || []
if (mainIdeas.length > MAX_MAIN) throw new Error(`mainIdeas は ${MAX_MAIN} まで`)
const mainIdRe = new RegExp(`^R${round}-主-[1-9][0-9]*$`)
mainIdeas.forEach((x) => {
  if (!x || typeof x !== 'object' || Array.isArray(x)) throw new Error('mainIdeas の案は { id, title, what, scene?, touches?, kind, parts?, why? } で渡す')
  const name = typeof x.id === 'string' ? x.id : JSON.stringify(x.id)
  const extra = Object.keys(x).filter((k) => !MAIN_KEYS.includes(k))
  if (extra.length) throw new Error(`mainIdeas の ${name} に知らない名前がある：${extra.join('・')}（使える名前：${MAIN_KEYS.join('・')}）`)
  if (typeof x.id !== 'string' || !mainIdRe.test(x.id)) throw new Error(`mainIdeas の id は R${round}-主-<番号>（この周の番号。番号は 1 からの整数で、前に 0 を付けない。docs/main-agent.md §4.1）：${name}`)
  if (!nonEmpty(x.title) || !nonEmpty(x.what)) throw new Error(`mainIdeas の ${x.id} の title と what は空でない文字列`)
  if (!KINDS.includes(x.kind)) throw new Error(`mainIdeas の ${x.id} の kind は ${KINDS.join('・')} のどれか`)
  for (const k of ['scene', 'touches', 'why']) {
    if (x[k] !== undefined && typeof x[k] !== 'string') throw new Error(`mainIdeas の ${x.id} の ${k} は文字列`)
  }
  if (x.parts !== undefined) {
    if (!parts.length) throw new Error(`mainIdeas の ${x.id} に parts がある（args.parts を渡したときだけ付ける）`)
    if (!Array.isArray(x.parts) || !x.parts.every((p) => parts.includes(p))) throw new Error(`mainIdeas の ${x.id} の parts は args.parts（${parts.join('・')}）から選んだ配列`)
    const partDups = dupsOf(x.parts)
    if (partDups.length) throw new Error(`mainIdeas の ${x.id} の parts に同じ部分がある：${partDups.join('・')}`)
  }
})
const mainIds = mainIdeas.map((x) => x.id)
if (new Set(mainIds).size !== mainIds.length) throw new Error(`mainIdeas に同じ id がある：${mainIds.join('・')}`)
if (mainIdeas.length && only.length) throw new Error('mainIdeas は only と一緒に渡せない（頼み直しで同じ案を二度照らさないため。主担当の案は一回目に渡す）')
const mainInKnown = mainIds.filter((id) => knownIds.includes(id))
if (mainInKnown.length) throw new Error(`mainIdeas の id が known にある：${mainInKnown.join('・')}（known に載せた案は、もう照らしてある）`)
if (mainIdeas.length && keys.includes(MAIN_LENS)) throw new Error(`mainIdeas を渡すときは、観点の key に「${MAIN_LENS}」を使わない（主担当の案の lens と重なる）`)

// 観点ごとのモデル（広げる相だけ）。返す値・ログにはキーだけを書く
if (args.lensModels !== undefined && (!args.lensModels || typeof args.lensModels !== 'object' || Array.isArray(args.lensModels))) throw new Error('args.lensModels は { "<観点の key>": "<モデル>" } のオブジェクト')
const lensModels = args.lensModels || {}
const lensModelKeys = Object.keys(lensModels)
const runKeys = run.map(({ lens }) => lens.key)
const unknownLensModels = lensModelKeys.filter((k) => !runKeys.includes(k))
if (unknownLensModels.length) throw new Error(`lensModels のキーが、走らせる観点に無い：${unknownLensModels.join('・')}（観点：${runKeys.join('・')}）`)
const badLensModels = lensModelKeys.filter((k) => !nonEmpty(lensModels[k]))
if (badLensModels.length) throw new Error(`lensModels の値は空でない文字列：${badLensModels.join('・')}`)
const spreadModel = (key) => (Object.prototype.hasOwnProperty.call(lensModels, key) ? lensModels[key] : args.model)

// 土台にする案（選ばれた束の案を、広げる相に見せる）
if (deepen.length) {
  if (round === 1) throw new Error('deepen は二周目から（一周目のあとに選ばれた束の案を、次の周の土台にする）')
  if (knownToExpand) throw new Error('deepen は knownToExpand と一緒に渡せない')
  const notKnown = deepen.map(idOf).filter((id) => !knownIds.includes(id))
  if (notKnown.length) throw new Error(`deepen の id が known に無い：${notKnown.join('・')}（known に「<id> <短い名前>」の形で入れてから渡す）`)
  const deepenDups = dupsOf(deepen.map(idOf))
  if (deepenDups.length) throw new Error(`deepen に同じ id がある：${deepenDups.join('・')}（一つの id に一行）`)
}

// 逐次に積む（広げる相を観点の並びの順に一体ずつ）
if (chain && round === 1) throw new Error('chain は二周目から（一周目は観点ごとに独立に広げる）')
if (chain && only.length) throw new Error('chain は only と一緒に渡せない（先の観点の案がそろわないため）')

// ---- 指示文 ----
const DEFAULT_READ = 'CLAUDE.md と、段階①-2 の地図と一覧（map/README.md と地図のファイル。constraints.md は除く。対象に関係する所だけ）'
const readList = (extra, own) => (own ? [] : read.length ? read : [DEFAULT_READ]).concat(extra || []).map((r) => `- ${r}`).join('\n')
const KEEP = '- あなたが守るのは、読み取り専用・このリポジトリの文書とコードだけを読む（リポジトリの外のフォルダ、環境変数、鍵は読まない）・判定しない（順位・点数・おすすめ・採否を付けない）の三つ。'
const PEEK = 'HANDOFF.md、案の一覧のフォルダ（docs/wip/ の ideas/・ideas-*/）の sources/ 以外のすべて（README.md・cards.md・notes.md・raw-R*.json・tries/ など）、地図のフォルダの notes.md、思いつきの置き場、見送りの台帳、段階①-1 の索引（docs/wip/<日付>/README.md）の「思いつき」の節'
const SOURCES = '案の一覧のフォルダの sources/ の材料は、読むものに挙がっていれば読んでよい。'
const NO_HANDOFF = 'HANDOFF.md を読む決まり（CLAUDE.md の「作業の始め方」など）は、この相では行わない。' // CLAUDE.md は subagent に自動で入るため
// seenPrev：前の周の案を名前で見せる相。seenChain：この周の先の観点の案を見せる相（chain）
const noPeek = (seenPrev, seenChain) => {
  const notes = [seenPrev ? '前の周の案は、上に挙げた名前だけで見る' : '', seenChain ? 'この周の先の観点の案は、上に挙げた一覧だけで見る' : ''].filter(Boolean)
  return `- これも守る：主担当の見立て${seenPrev ? '' : 'と前の周の案'}を見ないため、${PEEK}は読まない${notes.length ? `（${notes.join('。')}）` : ''}。${SOURCES}${NO_HANDOFF}`
}
const NO_PEEK = noPeek(false, false)
const NO_PEEK_KNOWN = noPeek(true, false) // 前の周の案の名前を見せる相
const ideaText = (x) => [
  `[${x.id}] ${x.title}（観点：${x.lens}・種類：${x.kind}${x.parts && x.parts.length ? `・部分：${x.parts.join('・')}` : ''}）`,
  `  何を：${x.what}`,
  x.scene ? `  場面：${x.scene}` : '',
  x.touches ? `  関わる所：${x.touches}` : '',
  x.why ? `  筋道（${x.main === true ? '主担当' : '広げた担当'}の推し量り。事実ではない）：${x.why}` : '',
].filter(Boolean).join('\n')
const showKnown = knownToExpand && known.length > 0

const spreadPrompt = (lens, prev) => [
  'あなたは検討担当です。読み取り専用です。ファイルを書かない・直さない・git の操作をしない。',
  '案を広げるだけです。良し悪しで捨てず、順位を付けずに出してください（考えること自体は自由です）。入れる場所は次の相の担当が探すので、コードを読みに行かなくてよい。',
  '',
  '## 対象',
  args.topic,
  '',
  '## 読むもの',
  readList(lens.read, lens.readOnly),
  '',
  `## あなたの観点：${lens.key}`,
  lens.ask,
  parts.length ? `\n## 対象の部分（案ごとに、効く部分を parts に。いくつでも。どれにも効かなければ空の配列）\n${parts.map((p) => `- ${p}`).join('\n')}` : '',
  showKnown ? `\n## 前の周までに出た案（これと重ならない案を出す）\n${known.map((k) => `- ${k}`).join('\n')}` : '',
  deepen.length ? `\n## 土台にする案（利用者が掘る方向に選んだ束の案。これを伸ばす・組む・別の形にする。同じ案は出さない）\n${deepen.map((d) => `- ${d}`).join('\n')}` : '',
  prev && prev.length ? `\n## この周で先の観点が出した案（重ねない。その先へ積む）\n${prev.map((p) => `- ${p.lens}：${p.title} — ${p.what}`).join('\n')}` : '',
  '',
  '## 返し方',
  '- 案は 4〜6 つを目安に、実りが多ければ 12 まで。12 に届いてなお出せる案があるときは more を true に（頼み直す目安になる）。ありきたりな案が先に浮かんだら、先に短く出してよい。そのあとは、それと違う方向に出す。',
  '- この観点に合う案が少なければ、少ないまま返し、thin を true にする（数を合わせるために出さない）。',
  '- できれば一つは、今ある面・保存の形・流れのどれかを変えないと入らない、大きく外れた案（kind は「奇抜」）にする。',
  '- 種類を散らすことより、観点に沿って掘ることを優先する。kind は案ごとに付ける（案の一覧で照らす種類は、奇抜・やめる・減らす・組み合わせる・制約を外す・作らない の五つ。観点に合うなら入れてよい）。',
  `- kind は ${KINDS.join('・')} から一つ。touches には、関わる面・流れ・部分を短く（ファイル名は要らない）。`,
  '- why には、どこから思いつき、何を変えると何が起きると見たかを二〜五文で（推し量りでよい。省いてもよい）。',
  '- 広げていて浮かんだ問い（そもそも何に困っているか、使う人に聞きたいこと、前提への問い）は questions に（三つまで。答えなくてよい）。',
  '- 観点の外で浮かんだ考え（そのまま案にしにくいもの）は aside に自由文で（順位・おすすめは書かない）。',
  KEEP,
  '- CLAUDE.md と決まりの文書の決まりは、この相では案を減らす理由にしない。決まりに反する案も出す（反するかどうかは書かなくてよい。次の段階で当てる）。',
  noPeek(showKnown || deepen.length > 0, Boolean(prev && prev.length)),
  lens.read.some((r) => r.includes(CONSTRAINTS)) ? '' : '- 段階①-2 の制約の一覧（map/constraints.md）は読まない（制約は段階②-2 の判定で当てる）。',
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
  '- 案の筋道は広げた担当・主担当の推し量り。事実と混ぜない。',
  KEEP,
  known.length ? NO_PEEK_KNOWN : NO_PEEK,
].join('\n')

// 照らした結果の一行（伸ばす・疑う相に渡す）
const lightLine = (l) => {
  if (!l) return '\n  照らした結果：なし'
  const bits = [l.found ? '場所あり' : '新しく作る所', l.entry]
  if (l.existing) bits.push(`今あるもの：${l.existing}`)
  if (Array.isArray(l.assumptions) && l.assumptions.length) bits.push(`前提：${l.assumptions.join('・')}`)
  if (Array.isArray(l.overlaps) && l.overlaps.length) bits.push(`重なり：${l.overlaps.join('・')}`)
  if (Array.isArray(l.overlaps_known) && l.overlaps_known.length) bits.push(`前の周までの案との重なり：${l.overlaps_known.join('・')}`)
  return `\n  照らした結果：${bits.join('／')}`
}

const growPrompt = (chunk, light, all) => [
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
  chunk.map((x) => ideaText(x) + lightLine(light && light.items && light.items[x.id])).join('\n\n'),
  '',
  '## この周の全部の案（組み合わせ・共通の根を探すため。伸ばして疑うのは上の案だけ）',
  all.map((x) => `- [${x.id}] ${x.title}（${x.kind}）`).join('\n'),
  '',
  '## 返し方',
  '- items に、案の id ごとに一つ。この順で考える：conditions（成り立つための条件）→ bolder（もっと大胆にした形）→ combos（組むと強くなるほかの案の id）→ weak（崩れうる前提。根拠があればファイルと行）→ cheapest_check（いちばん安い確かめ方）。',
  '- いくつもの案に共通する前提や、先に決めると以後の案が軽くなるものがあれば roots に（案の id 付き）。',
  KEEP,
].join('\n')

// つなぐ一体に渡す、案ごとの要点（照らした結果：入れる場所・前提・重なり／伸ばして疑った結果：条件・崩れうる前提・組み合わせ）
const synthIdeaText = (x) => {
  const lines = [`[${x.id}] ${x.title}（観点：${x.lens}・種類：${x.kind}）`, `  何を：${x.what}`]
  const l = x.light
  if (l) {
    const bits = [`入れる場所：${l.found ? '' : '新しく作る所／'}${l.entry}`]
    if (Array.isArray(l.assumptions) && l.assumptions.length) bits.push(`前提：${l.assumptions.join('・')}`)
    if (Array.isArray(l.overlaps) && l.overlaps.length) bits.push(`重なり：${l.overlaps.join('・')}`)
    lines.push(`  照らした結果：${bits.join('／')}`)
  }
  const g = x.grow
  if (g) {
    const bits = []
    if (Array.isArray(g.conditions) && g.conditions.length) bits.push(`条件：${g.conditions.join('・')}`)
    if (Array.isArray(g.weak) && g.weak.length) bits.push(`崩れうる前提：${g.weak.join('・')}`)
    if (Array.isArray(g.combos) && g.combos.length) bits.push(`組み合わせ：${g.combos.join('・')}`)
    if (bits.length) lines.push(`  伸ばして疑った結果：${bits.join('／')}`)
  }
  return lines.join('\n')
}

const synthPrompt = (all, chunkRoots) => [
  'あなたは検討担当（つなぐ役）です。読み取り専用です。ファイルを書かない・直さない・git の操作をしない。',
  `この周の全部の案を、${withGrow ? '照らした結果と伸ばして疑った結果の要点つきで' : '照らした結果の要点だけを付けて'}渡します。観点・塊をまたいで、つないでください。判定しない。案を束にしない。順位・おすすめ・採否を書かない。`,
  '',
  '## 対象',
  args.topic,
  '',
  '## 読むもの',
  readList([]),
  '',
  `## この周の全部の案（照らした結果${withGrow ? '・伸ばして疑った結果' : ''}の要点つき）`,
  all.map(synthIdeaText).join('\n\n'),
  chunkRoots.length ? `\n## 塊ごとの共通の根（伸ばす・疑う相の roots）\n${chunkRoots.map((r) => `- ${r.from}：${r.note}${Array.isArray(r.ids) && r.ids.length ? `（${r.ids.join('・')}）` : ''}`).join('\n')}` : '',
  '',
  '## 返し方',
  '- roots：観点・塊をまたぐ根（いくつもの案に共通する前提や、先に決めると以後の案が軽くなるもの）を、関わる案の id 付きで。',
  '- combos：案を組み合わせて生まれる新しい案を、title・what・from（組み合わせた案の id）・kind で。元の案の言い換えは出さない。',
  '- gaps：観点の空白（どの観点からも出ていない方向）を一行ずつ。',
  KEEP,
  NO_PEEK,
].join('\n')

// ---- schema（照らす・伸ばす・疑うは id ごとにプロパティを持たせ、抜けを型の検査で止める） ----
const spreadSchema = {
  type: 'object',
  properties: {
    ideas: {
      type: 'array',
      maxItems: 12,
      description: '案。順位を付けない',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: '短い名前（20 字ほど）' },
          what: { type: 'string', description: '何を（一〜二文）' },
          why: { type: 'string', description: 'どこから思いつき、何を変えると何が起きると見たか（二〜五文。推し量りでよい）' },
          scene: { type: 'string', description: 'どんな場面で効くか' },
          touches: { type: 'string', description: '関わる面・流れ・部分（ファイル名は要らない）' },
          kind: { type: 'string', enum: KINDS, description: '案の種類' },
          ...(parts.length ? { parts: { type: 'array', items: { type: 'string', enum: parts }, description: '効く部分（いくつでも）' } } : {}),
        },
        required: parts.length ? ['title', 'what', 'scene', 'kind', 'parts'] : ['title', 'what', 'scene', 'kind'],
      },
    },
    thin: { type: 'boolean', description: 'この観点に合う案が少なかったら true' },
    more: { type: 'boolean', description: '12 案に届いてなお出せる案があるとき true' },
    questions: { type: 'array', maxItems: 3, items: { type: 'string' }, description: '広げていて浮かんだ問い（三つまで）' },
    aside: { type: 'string', description: '観点の外で浮かんだ考え（自由文。順位・おすすめは書かない）' },
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
const synthSchema = (allIds) => ({
  type: 'object',
  properties: {
    roots: {
      type: 'array',
      description: '観点・塊をまたぐ根（いくつもの案に共通する前提や、先に決めると以後の案が軽くなるもの）',
      items: { type: 'object', properties: { note: { type: 'string' }, ids: { type: 'array', items: { type: 'string', enum: allIds } } }, required: ['note', 'ids'] },
    },
    combos: {
      type: 'array',
      description: '組み合わせて生まれる新しい案。順位を付けない',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: '短い名前（20 字ほど）' },
          what: { type: 'string', description: '何を（一〜二文）' },
          from: { type: 'array', items: { type: 'string', enum: allIds }, description: '組み合わせた案の id' },
          kind: { type: 'string', enum: KINDS, description: '案の種類' },
        },
        required: ['title', 'what', 'from', 'kind'],
      },
    },
    gaps: { type: 'array', items: { type: 'string' }, description: '観点の空白（どの観点からも出ていない方向）' },
  },
  required: ['roots', 'combos', 'gaps'],
})
const opts = (label, ph, model, schema, effort) => {
  const o = { label, phase: ph, model, agentType: 'general-purpose', schema }
  if (effort) o.effort = effort
  return o
}

// ---- 広げる（全部の案がそろってから id を振り、数で塊に分けるので、ここだけ待ち合わせる） ----
phase('広げる')
log(`検討担当が観点 ${run.length}（${run.map(({ lens }) => lens.key).join('・')}）で広げる。周 ${round}${parts.length ? `、部分 ${parts.length}` : ''}。model は args の指定`)
if (deepen.length) log(`土台にする案 ${deepen.length} を広げる相に見せる（この周の fresh は数えない）`)
const spreadOpts = (lens) => opts(`広げる:${lens.key}`, '広げる', spreadModel(lens.key), spreadSchema, args.effort)
let outs
if (chain) {
  log('逐次に回す：観点の並びの順に一体ずつ起こし、先の観点がこの周に出した案を後の観点に見せる')
  outs = []
  const prev = []
  for (const { lens } of run) {
    let out = null
    try {
      out = await agent(spreadPrompt(lens, prev.slice()), spreadOpts(lens))
    } catch (e) {
      out = null
      log(`広げる:${lens.key} が失敗した（空として続ける）`)
    }
    outs.push(out)
    if (out && Array.isArray(out.ideas)) out.ideas.filter((x) => x && typeof x === 'object').forEach((x) => prev.push({ lens: lens.key, title: x.title, what: x.what }))
  }
} else {
  outs = await parallel(run.map(({ lens }) => () => agent(spreadPrompt(lens, null), spreadOpts(lens))))
}

const ideas = []
const questions = []
const thin = []
const more = []
const asides = []
const empty = { spread: [], light: [], grow: [] }
if (synth) empty.synth = false
run.forEach(({ lens, n }, i) => {
  const out = outs[i]
  if (!out || !Array.isArray(out.ideas)) { empty.spread.push(lens.key); return }
  if (out.thin || !out.ideas.length) thin.push(lens.key)
  if (out.more === true) more.push(lens.key)
  if (nonEmpty(out.aside)) asides.push({ from: lens.key, note: out.aside })
  out.ideas.forEach((idea, j) => ideas.push({ ...idea, id: `R${round}-L${n}-${j + 1}`, lens: lens.key, main: false })) // 振った id・観点・main を後ろに置き、答えの欄で上書きさせない
  ;(out.questions || []).forEach((q) => questions.push({ from: lens.key, q }))
})
if (empty.spread.length) log(`答えの無かった観点：${empty.spread.join('・')}（理由は failures と journal.jsonl で確かめ、only で頼み直す）`)
if (thin.length) log(`案が乏しかった観点：${thin.join('・')}`)
if (more.length) log(`12 案に届いてなお出せると答えた観点：${more.join('・')}`)
const spreadCount = ideas.length
// 主担当の案は、広げた案のあとに足す（広げる相には見せていない）。以降は広げた案と同じに通す
mainIdeas.forEach((x) => ideas.push({ ...x, scene: x.scene || '', touches: x.touches || '', parts: x.parts || [], lens: MAIN_LENS, main: true }))
if (mainIdeas.length) log(`主担当の案 ${mainIdeas.length} を、広げた案 ${spreadCount} のあとに足して照らす${withGrow ? '・伸ばして疑う' : ''}（広げる相には見せていない）`)

// ---- 照らす → 伸ばす・疑う（塊ごとに流す。広げた案は塊の外に持っておくので、後の相が空でも案は返る） ----
const allIds = ideas.map((x) => x.id)
const perChunkAgents = withGrow ? 2 : 1
const room = Math.floor((MAX_AGENTS - run.length - (synth ? 1 : 0)) / perChunkAgents)
const chunkCount = ideas.length ? Math.max(1, Math.min(room, Math.ceil(ideas.length / PER_CHUNK))) : 0
const chunks = []
for (let c = 0; c < chunkCount; c++) {
  chunks.push(ideas.slice(Math.floor((ideas.length * c) / chunkCount), Math.floor((ideas.length * (c + 1)) / chunkCount)))
}
if (chunks.some((ch) => ch.length > PER_CHUNK * 2)) log(`一体あたりの案が ${Math.max(...chunks.map((ch) => ch.length))} と多い（上限 ${MAX_AGENTS} 体のため。削ってはいない）`)
const synthAgents = synth && spreadCount ? 1 : 0
log(`調査担当が照らし${withGrow ? '、検討担当が伸ばして疑う' : ''}${synthAgents ? '。そのあと検討担当が一体でつなぐ' : ''}：案 ${ideas.length}、塊 ${chunkCount}（体数 ${run.length + chunkCount * perChunkAgents + synthAgents}）`)

const stages = [
  (chunk, _, ci) => agent(lightPrompt(chunk, ideas), opts(`照らす:塊${ci + 1}`, '照らす', args.lightModel, lightSchema(chunk, allIds), args.lightEffort))
    .then((light) => ({ light })),
]
if (withGrow) {
  stages.push((acc, chunk, ci) => agent(growPrompt(chunk, acc.light, ideas), opts(`伸ばす・疑う:塊${ci + 1}`, '伸ばす・疑う', args.model, growSchema(chunk, allIds), args.effort))
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

// ---- つなぐ（synth のときだけ一体。照らす・伸ばして疑うが終わってから） ----
let synthOut = null
if (synth) {
  if (!spreadCount) log('つなぐ一体は起こさない（広げた案が 0 件のため）')
  else {
    phase('つなぐ')
    let s = null
    try {
      s = await agent(synthPrompt(ideas, roots), opts('つなぐ', 'つなぐ', args.model, synthSchema(allIds), args.effort))
    } catch (e) {
      s = null
    }
    if (!s) {
      empty.synth = true
      log('つなぐ一体の答えが無かった（理由は failures と journal.jsonl で確かめる）')
    } else {
      synthOut = {
        roots: Array.isArray(s.roots) ? s.roots : [],
        ideas: (Array.isArray(s.combos) ? s.combos : []).map((c, i) => {
          const { id: _ignored, ...rest } = c || {}
          return { id: `R${round}-X-${i + 1}`, ...rest } // 振った id で上書きされないように、答えの id は落とす
        }),
        gaps: Array.isArray(s.gaps) ? s.gaps : [],
      }
    }
  }
}

// ---- 数え（材料。票ではない。照らすのは主担当） ----
const byLens = Object.fromEntries(run.map(({ lens }) => [lens.key, 0]))
if (mainIdeas.length) byLens[MAIN_LENS] = 0
const byKindSelf = Object.fromEntries(KINDS.map((k) => [k, 0]))
const byPart = parts.length ? Object.fromEntries(parts.map((p) => [p, 0])) : null
ideas.forEach((x) => {
  byLens[x.lens] += 1
  if (byKindSelf[x.kind] !== undefined) byKindSelf[x.kind] += 1
  if (byPart) (x.parts || []).forEach((p) => { if (byPart[p] !== undefined) byPart[p] += 1 })
})
const spreadIdeas = ideas.filter((x) => x.main !== true)
const unlit = ideas.filter((x) => !x.light).length
// fresh と counts.main.unique を数えない理由（同じ並び。広げた案と主担当の案の両方にかかるもの）
const spreadWhy = empty.spread.length ? `広げる相が空だった観点 ${empty.spread.join('・')} があるため`
  : !spreadIdeas.length ? '広げた案が 0 件のため'
  : unlit ? `照らされなかった案が ${unlit}`
  : ''
const freshWhy = !known.length ? 'known が無い'
  : knownToExpand ? 'knownToExpand のため'
  : deepen.length ? 'deepen のため'
  : spreadWhy
const fresh = freshWhy ? null : spreadIdeas.filter((x) => !(x.light.overlaps_known || []).length).length
if (known.length && fresh === null) log(`fresh は数えない（${freshWhy}）。飽和は主担当が照らす`)
let mainCount = null
if (mainIdeas.length) {
  const mains = ideas.filter((x) => x.main === true)
  const spreadIdSet = new Set(spreadIdeas.map((x) => x.id))
  const unique = spreadWhy ? null : mains.filter((m) =>
    !(m.light.overlaps || []).some((id) => spreadIdSet.has(id))
    && !spreadIdeas.some((s) => (s.light.overlaps || []).includes(m.id))).length
  if (spreadWhy) log(`counts.main.unique は数えない：${spreadWhy}`)
  mainCount = { total: mains.length, unique }
}

const roles = withGrow ? { 広げる: '検討担当', 照らす: '調査担当', '伸ばす・疑う': '検討担当' } : { 広げる: '検討担当', 照らす: '調査担当' }
if (synthAgents) roles['つなぐ'] = '検討担当'
if (mainIdeas.length) roles['主担当の案'] = '広げる相には見せず、照らす・伸ばして疑うに通す'

return {
  topic: args.topic,
  round,
  lenses: run.map(({ lens }) => lens.key),
  parts,
  roles,
  ideas,
  questions,
  roots,
  on_background: onBackground,
  thin,
  more,
  asides,
  synth: synthOut,
  counts: { raw: ideas.length, rawSpread: spreadCount, byLens, byPart, byKindSelf, fresh, unlit, main: mainCount, synth: synthOut ? synthOut.ideas.length : null },
  empty,
  missing,
  asked: {
    lenses: run.map(({ lens }) => ({ key: lens.key, ask: lens.ask, read: lens.read, readOnly: lens.readOnly })),
    read,
    known,
    knownToExpand,
    doubt: withGrow,
    only,
    background: args.background || '',
    mainIdeas: mainIds,
    synth,
    lensModelKeys,
    deepen,
    chain,
  },
}
