# HANDOFF（再開用のメモ）

- 更新：2026-10-17。利用者の願い「段階②前後から Fable に主作業を任せ、Fable・Opus が自由に考察・発想・分析しやすいよう型の構成を直したい」について、次をした（作業枝 `claude/free-ideation-a-standard`。main には入れていない）。
  - 型をレビューした（観点 6 体と、Fable・Opus の通し演習 2 体）。結論：「席を (A) に替えるだけでは自由さは増えない」。主担当の考察の置き場と、自分で先に考える道が無かった。
  - 利用者が決めたこと（2026-10-17）：(1) Fable に任せる範囲は段階①-2〜②-2。(2) 段階②-1 と ②-2 は別セッションのまま。(A) でも別のモデルの疑いを一回は入れる。(3) 規則は「必ず」から「照らして書く」に下げる。(4) 改善案の 1〜4（食い違いの直し、主担当が考える道、ワークフローの力、事務の機械化）を入れる。
  - 入れたもの：工程 18（下の §1）。文書の三層化（P13）と、本番の走り（P14）はまだ。
- 前の更新（2026-10-16 18:00 UTC ごろ）。利用者の問い「この型を別の自分のアカウントでも多くのセッションに適用しやすくする方法」について、三つをした。
  - 調べものの主張を確かめ直した。
  - 答えを書いた：`dev/research/2026-10-16-multi-account-answer.md`。
  - 利用者が選んだ道 C（claude.ai のアカウントに marketplace を足す）と、足し算（scripts を workflows として呼べるように）を、作業枝に入れた。
- 利用者の指示（2026-10-16）で、PR #1 を main にマージした。HANDOFF.md と dev/ は残したまま。
- そのあと（2026-10-16 18:30 UTC ごろ）、利用者の案で、発想のワークフロー ideate.js の体数を変えた。利用者の指示で、main にも入れた（fast-forward）。
  - 上限を 18 体にした（consult.js・survey.js は 10 のまま）。
  - ふつうの計画は、どの周も 6 観点。既定の観点に「極端にする」「ほかの立場」を足した。
  - プラグインの版は 0.3.0。
- 次は、別のアカウントで claude.ai に marketplace を足し、0.3.0 が届くかを確かめること（§3 の 1）。
- リポジトリ：`pe-kun333/operating-kit`。作業枝：`claude/free-ideation-a-standard`（前の作業枝は `claude/amazing-goldberg-34ipb3`）。PR：https://github.com/pe-kun333/operating-kit/pull/1（2026-10-16 に main へマージ。merge コミットで入れたので、このメモにあるコミットの番号は main でも引ける）。
- これからの直しは、main から作業枝を作り直して進める。main に入れるのは、利用者の許しのあとだけ。main に入れるときは、plugin.json と README の版を上げる。
- このメモを最後に書いたセッション：https://claude.ai/code/session_01BigekiHYHBzGoW22RnwsDh。その前：https://claude.ai/code/session_01RPcGoX7kR34K2kB8TDGSKX、さらに前の引き継ぎ：https://claude.ai/code/session_01PQRoCf3cD7JN35oxnMjeqS
- このファイルと `dev/` は、引き継ぎのための作業用。プラグインの中身ではない（main にも残すと、2026-10-16 に利用者が決めた）。

## 0. 引き継ぐ人へ（最初にすること）

1. `git fetch origin main` → `git checkout main` → `git pull origin main`。`git status` が空であること。直すときは、main から作業枝を作る。
2. このファイルを読み、§3 の 1 から続ける。
3. 確かめの道具：`bash dev/check.sh`（§5）。node と python（3）だけで動く。Windows では python3 がストアの別名のことがあるので、check.sh が使える python を探す。Windows の作業フォルダのパスが長いと git が動かない（`'$GIT_DIR' too big`）ので、短いパスの一時フォルダに clone して作業する。
4. 前のセッションのコンテナ（/tmp・/root/.claude の下）は残らない見込み。要るものは `dev/` に写してある。

新しいセッションに貼る一言（例）：

> operating-kit の main を pull して、HANDOFF.md を読み、§3 の 1 から続けてください。直しは main から作った作業枝で行い、main には取り込まない。新しいワークフローは、§3 に書いた体数の範囲で起こしてよい。

## 1. 完了した工程

| # | 工程 | 結果 | コミット |
|---|---|---|---|
| 1 | 段階②を ②-1 考察と発想・②-2 計画とデザインに分け、広げる行程の終わりの目安を決める | 済み | `43dd1b5`・`d3ae278` |
| 2 | 発想のワークフロー ideate.js、consult.js の目隠し、広げる用の観点 | 済み | `b029fb7` |
| 3 | 案の一覧のひな形、生の案、見送りの台帳 | 済み | `ebf750c` |
| 4 | 全体の最終点検と直し、照らす相を 〈中〉 に（別のセッション） | 済み | `7ab4839`〜`1cb7d51` |
| 5 | 段階①-1 のセッションと調査担当を 〈中〉（例 Sonnet）に | 済み | `8044362` |
| 6 | B1・B2：①-1 の材料の種類（事例・場面・類推・引っかかり・周辺・外の資料の許し）、①-2 の地図と一覧（map/） | 済み | `41e284c` |
| 7 | B3〜B5：必ず入れる案の種類五つ、捨てる前提の試し（〈試しの枝〉）、③ の前提の誤り | 済み | `decef47` |
| 8 | E1・E3：掘る方向の問い、②-1 の関わり方の既定 (B) | 済み | `dc1d314` |
| 9 | 今回の直しの点検（8 体、本当 27 件）と直し | 済み | `200adda`・`85c228c` |
| 10 | ふつうの計画は一周 4 観点で二周以上（利用者の答え） | 済み | `646efe6` |
| 11 | 引き継ぎの用意（このファイル、dev/） | 済み | `3eb6dc3` |
| 12 | 調べものの主張 84 件を、公式の資料の原文（44 ページを落として）で確かめ直す。確かめ役 2 体（claude-code-guide）と、主担当の直接の照らしと、この VM での試し | 済み：確か 68・一部 16・違う 0。結果は `dev/research/2026-10-16-multi-account.json` の `verified` | `bdc8d30` |
| 13 | 利用者への答え：別のアカウントの多くのセッションに当てはめる道を比べ、おすすめを一つ | 済み：`dev/research/2026-10-16-multi-account-answer.md`（おすすめは道 C） | `bdc8d30` |
| 14 | 利用者が選んだ道 C と足し算「scripts を workflows として呼べるように」を形にする。中身は四つ。(1) plugin.json：version 0.2.0、`workflows` 欄（`./skills/operating-kit/scripts/`）。(2) scripts の meta.name を consult・ideate・survey に。(3) README の入れ方（claude.ai に足す手順、CLI と版、クラウドに届かないときの setup script、`.skill` の行を外す）。(4) SKILL.md の呼び名と版の注、dev/check.sh の 5（プラグインの形） | 済み。`claude plugin validate` が通る。`~/.claude/skills/operating-kit` に置くと 0.2.0 として loaded（試しのあと消した） | `b235a50` |
| 15 | PR #1 を main にマージする（利用者の指示。HANDOFF.md と dev/ は残す。merge コミット） | 済み | `4907ea5`・merge `d9a6fd9` |
| 16 | ideate.js の体数（利用者の案）。(1) 上限 18 体（`MAX_AGENTS`）。一度に起こす観点は 6 のまま（`MAX_RUN`。doubt が false なら 8）。照らす・伸ばす疑うは、8 案ずつの塊で 6 ずつまで。(2) 既定の観点を 6 つに（極端にする・ほかの立場 を足し、LENSES の並びを入れ替えた）。(3) CLAUDE.md のひな形・main-agent・prompts・principles・SKILL.md の書き方を直した（ふつうの計画は一周 6 観点で二周以上。consult.js・survey.js は 10 体のまま）。(4) プラグインの版 0.3.0。(5) dev/check.sh：模擬で体数も見る（既定 12 体、6 観点 × 8 案で 18 体、doubt なし 8 観点で 16 体、3 観点で 7 体、7 観点は止まる） | 済み | `2d10da9` |
| 17 | ideate.js の体数の直しを main に入れる（利用者の指示。PR は作らず、main を作業枝の先へ fast-forward） | 済み | このメモを直したコミット |
| 18 | 利用者の願い（上位のモデルが主担当で、自由に考察・発想・分析しやすく）に沿った直し（レビューの P1〜P12）。(1) 関わり方 (A) を段階①-2・②-1・②-2 の標準に（相談役の定義、①-2 の行、§1.5 を「止まった段階を続ける」一言に、止まったあとの扱い）。(2) 考察と判定の境（芯 9 に追記）、考察ノート（ideas/notes.md、map/notes.md）、主担当の先出し（ideate.js の `mainIdeas`）、規則を「必ず」から「照らして書く」に、広げる相に読ませないものを白名簿に。(3) ideate.js：`why`・`aside`・`more`・上限 12 案、`synth`（つなぐ一体）、`lensModels`・`readOnly`、`deepen`・`chain`、fresh を null にする条件、伸ばす・疑う相に全案を見せる。consult.js：`form: 'analysis'`、検査。survey.js：agentType・検査。(4) `tools/ideas-table.mjs`（extract・table・known）、push の間合い、試しの scratchpad。(5) dev/check.sh の持ち運び（Windows の python、`dev/syntax-check.mjs`）と、新しいケース。独立点検（opus・fable）で出た問題も直した | 済み。`bash dev/check.sh` 全部とおった（§6） | この作業枝（`git log main..`） |

いまの型の段階と、最初の版（`ba8f04d`）からの違いは、前のセッションの最後の答えにまとめた（要点：段階が五つ、①-1 は 〈中〉、①-2 は map/、②-1 は手順・ideate.js・目隠し・測れる終わりの目安・二周・掘る方向、②-2 は判定の表と見送りの台帳、③ は前提の誤りを戻す、型の芯は 9 項）。

## 2. 作業中の工程と枝

| 工程 | 枝 | 状態 |
|---|---|---|
| 利用者の問い「この型を別の自分のアカウントでも、多くのセッションに適用しやすくする方法」 | main（PR #1 でマージ済み） | 答えを書き、利用者の選び（道 C と workflows）を形にし、main に入れた。残りは、別のアカウントでの確かめ（§3 の 1） |
| ideate.js の体数（上限 18 体、どの周も 6 観点。利用者の案） | main（fast-forward） | 直して main に入れた。`bash dev/check.sh` が通る。本物の Workflow での 18 体の走りはまだ（§3 の 2） |

- 答え：`dev/research/2026-10-16-multi-account-answer.md`。
  - おすすめは道 C：別のアカウントの claude.ai の Customize > Plugins に、marketplace `pe-kun333/operating-kit` を足す。
  - PR #1 を main に入れ、version を 0.2.0 に上げた（済み）。
  - クラウドに届かないときは、道 D：環境の setup script で `~/.claude/skills/operating-kit` に clone する。
- 根拠：`dev/research/2026-10-16-multi-account.json` に四つある。
  - `lenses`：調べ役 4 体の答え。
  - `claims`：主張 84 件。
  - `verified.checks`：一件ずつの確かめ。原文の引用つき。
  - `verified.main_checks`：主担当がこの VM で試したこと。
- 確かめのワークフロー：`wf_14116f9d-bf7`。script の写しは `dev/workflows/kit-multi-account-verify.js`。資料の原文と claims.json は、前のコンテナの scratchpad に置いていた。この写しの中のパスは、新しいコンテナには無い。起こし直すなら、資料を落とし直してパスを直す。答えは、上の JSON に全部写した。
- 試しで分かった、資料に無いこと。
  - このクラウドのセッションは、起動時にアカウントのプラグインを同期しに行く（`plugins_sync`）。
  - VM の `~/.claude/skills/` に置いたスキルは、実行中のセッションで読まれる。
  - `~/.claude/skills/<名>/.claude-plugin/plugin.json` は、install なしで `<名>@skills-dir` として読まれる。
  - main から入れると、最初の版（`ba8f04d`）が入る。
- 試しのあとは、`~/.claude` を元に戻した。

## 3. 次にやる工程（順番と担当）

| 順 | 工程 | 担当（モデル） |
|---|---|---|
| 1 | 別のアカウントで、答えの §3.2 と §4 を確かめる。(a) claude.ai に marketplace を足す。`workflows` 欄（Claude Code だけの欄）があっても断られないか。資料の部品の表に workflows は無い。断られる部品として挙がっているのは `bin/` だけ。(b) 新しいクラウドのセッションで `claude plugin list` を見て、`operating-kit@synced` が出るか。(c) `/operating-kit:consult` などの名前で呼べるか。(d) 出なければ、README の setup script を入れ、`operating-kit@skills-dir` が出るか。(e) clone が通るか。足す・確かめるのは、利用者がそのアカウントで行うか、そのアカウントのセッションで主担当が行う | 利用者、または主担当 |
| 2 | 本番の走り：実際のリポジトリで、段階①-1（survey.js）→ ①-2 → ②-1（ideate.js、6 観点・二周以上）→ ②-2 を通して回す（まだ一度もしていない）。今度は関わり方 (A) ＋ 工程 18 の直しで。物差し：(1) `counts.main.unique`（先出しの案のうち、広げた案と重ならなかった数）、(2) 主担当の時間のうち、事務と考察の割合、(3) 摩擦のメモ、(4) 先出しありと、ワークフローだけの案の一覧を、利用者が目隠しで読み比べる | 主担当（Fable 5.1。段階①-2〜②-2）。段階①-1 と照らす相は 〈中〉（Sonnet 5.5）、検討担当・(A) の相談役は 〈主〉（Opus 5.5） |
| 3 | 正本（honeycomb-browser-grok の `docs/operating-kit/`）へ写す。利用者は「後で」と答えた。正本はこのセッションのリポジトリには無い（10/14 の zip だけ）。写すときは、正本の build.py が組み立てる plugin.json にも、三つを入れる：version、`workflows` 欄、scripts の meta.name（consult・ideate・survey）。入れないと、組み立て直したときに消える。工程 18 で足した `tools/ideas-table.mjs`（入れる先の `docs/operating-kit/tools/` に写る）も、build.py に足す | 利用者が時期と正本の場所を決めてから、主担当 |
| 4 | 作業枝 `claude/free-ideation-a-standard` を main に入れる（利用者の許しのあと。入れるときに plugin.json と README の版を上げる。0.4.0 が目安。PR の要否は利用者に聞く） | 利用者、主担当 |
| 5 | 文書の三層化（核・段階の手引き・参照）と、HANDOFF を「今」と「履歴」に分けること（レビューの P13。芯 1・6 に触れうる）。本番の走りのあとで決める | 利用者が決めてから、主担当 |

モデルの呼び名は、この型を作った時点（2026-10）の例。型の文書の中では 〈小〉〈中〉〈主〉〈上〉 で書いてある。

## 4. 未決の判断事項（利用者が決める）

- **クラウドのセッションの、同時に動く体数**：同時の数は CPU の数で減る（資料）。この VM は 4 CPU なので、同時に動くのは 2 体ほどと見込まれる。そうなら、18 体の周は待ち時間が長くなる。
  - 環境の変数 `CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS`（1〜256）で上げられると、資料にある。
  - 試していない。上げるかどうかと、いくつにするかは、利用者が決める。
- **プラグインの版**：0.3.0 で main に入れた。この先、main に入れるたびに上げるか、version を省いて commit で追わせるか。いまは「上げる」。claude.ai 側の版の見方は資料に無い。
- **正本へ写す時期と、正本の場所**（§3 の 3）。
- **consult.js・survey.js の返す値の `model`**：いまは返す（ideate.js は返さない）。そろえるか。そろえるなら、prompts.md の『返す値の model は記録に写さない』の一文も直す。
- **途中に空白を含むパスと、一段深い案の一覧のフォルダ**：ideate.js・consult.js の read の検査は、最初の空白で切って見るので、`docs/my folder/HANDOFF.md` のようなパスは止まらない。案の一覧のフォルダの型は `wip/<一段>/ideas` に限る。止めるには、パスの書き方（引用符つき）の決めが要る。

決めたこと（参考）：PR #1 を main にマージする。HANDOFF.md と dev/ は残す（2026-10-16。marketplace の source が `./` なので、プラグインの中にも入るが、読まれはしない）。別のアカウントへは道 C（claude.ai のアカウントに marketplace を足す）。足し算は scripts を workflows として呼べるようにすることだけ（2026-10-16）。ふつうの計画は、どの周も 6 観点で二周以上。ideate.js だけ上限 18 体、既定の観点に 極端にする・ほかの立場 を足す（2026-10-16。前の「一周 4 観点」を替えた。同じ日に main へ入れた）。正本へは後で写す（2026-10-16）。段階①-1 は 〈中〉（2026-10-16。前の比べの試しでは差が小さかったが、利用者の決め）。

## 5. ビルドとテストのコマンド

ビルドは無い（文書とワークフローの script だけ）。確かめはリポジトリ直下で：

```
bash dev/check.sh
```

中身：(1) 構文（`dev/syntax-check.mjs`。Node 22 以降では `node --check` が `.js` の top-level return で落ちるため、harness と同じ作りで実行せずに構文だけ見る）、(2) ひな形の 〈〉 が `references/placeholders.md` の表にあるか、(3) 型の文書とスクリプトにモデル名が無いか、(4) 模擬の agent()（`dev/workflow-harness.mjs`）で ideate.js・survey.js・consult.js と `tools/ideas-table.mjs` を 120 通りほど動かす（通るはずのものと、止まるはずのもの。ideate.js は体数も見る。case.json の `ideasPerLens` で、広げる一体が返す案の数を変えられる。`spreadExtra`・`spreadNullIdea`・`showPrompts`・`showSchemas`・`throwFor` もある）、(5) プラグインの形（plugin.json の版と README の版が同じ、`workflows` 欄のフォルダがある、scripts の meta.name がファイル名と同じ。`claude` があれば `claude plugin validate` を plugin.json と marketplace に）。

模擬の仕組みを一つだけ使うとき：`node dev/workflow-harness.mjs skills/operating-kit/scripts/ideate.js <case.json>`（case.json は `{"args": {...}, "fail": ["ラベルの一部"], "showPrompts": true}`）。

## 6. 最後に通った確かめ

- 2026-10-17、作業枝 `claude/free-ideation-a-standard` の上で、`bash dev/check.sh`：全部とおった（Windows 11 の Git Bash、Node 24、Python 3.10。ok 121・NG 0）。
  - 4 の模擬は大きく増えた：mainIdeas・synth・lensModels・readOnly・deepen・chain、read の検査（後ろの注・フォルダ・大文字小文字・..・誤検出）、fresh と `counts.main.unique` の null、consult の `form`、survey、`tools/ideas-table.mjs`。わざと壊すと NG になることも、いくつか確かめた。
  - 独立点検（opus と fable）で出た問題のうち、read の検査の取りこぼし、unique の null、id・重複の検査、chain の null、文言のずれ、ツールの検査などを直した。残した穴は §4。
- まだ見ていないこと：`claude plugin validate`（この機械に claude が無い）、本物の Workflow での mainIdeas・synth・chain・deepen の走り、Linux・mac での check.sh、関わり方 (A) での本番の走り（§3 の 2）。

- 2026-10-16 18:30 UTC ごろ、ideate.js の体数の直しの上で（このメモを直したコミットと同じ中身）、`bash dev/check.sh`：全部とおった。
  - 4 の模擬は 12 通り。ideate.js の体数は、既定 6 観点で 12 体、6 観点 × 8 案で 18 体（広げる 6・照らす 6・伸ばす疑う 6。48 案が 8 案ずつの 6 塊に入り、照らされない案は 0）、doubt なし 8 観点 × 8 案で 16 体、3 観点で 7 体。7 観点は止まる。
  - 5：版 0.3.0。
- 本物の Workflow での走りは、まだ（§3 の 2）。

- 2026-10-16 17:50 UTC ごろ、道 C の直しの上で（このメモを直したコミットと同じ中身）、`bash dev/check.sh`：全部とおった。
  - 1〜4 は下と同じ。
  - 5：版 0.2.0、workflows あり、`/operating-kit:consult`・`ideate`・`survey`。`claude plugin validate` は、plugin.json と marketplace の両方で通る。
  - 5 が止まるはずの形（README の版の食い違い、meta.name の食い違い）を写しに作って走らせ、止まることも見た。
- 同じころ、作業木を `~/.claude/skills/operating-kit` に置いて `claude plugin list` を見た。`operating-kit@skills-dir`、Version 0.2.0、loaded。`workflows` 欄の誤ったパスでは「loaded with errors」になることも、試しで見た。試しのあとは消した。
- まだ見ていないこと：`/operating-kit:consult` などの名前で、実際にワークフローが起きるか。`/reload-plugins` か新しいセッションが要る（§3 の 2）。

- 2026-10-16 17:30 UTC ごろ、HEAD `3eb6dc3`（型の中身は 16:57 と同じ。今回は dev/ と HANDOFF.md だけを変えた）の上で、`bash dev/check.sh`：全部とおった（下と同じ 8 通り）。
- 同じころ、答えの §3.3 の setup script の例を試した。
  - `bash -n` が通る。
  - 置き場所を scratchpad にして、作業枝で clone できた。`.claude-plugin/plugin.json` と、ひな形 8 つがそろう。
  - 無い枝のときも、0 で終わる。
  - 本物の環境の setup script としては、まだ走らせていない（§3 の 2）。
- 2026-10-16 16:57 UTC ごろ、HEAD `646efe6` の上で `bash dev/check.sh`：全部とおった。
  - 構文：3 本とも通る。〈〉：表に無いものは無い。モデル名：無い。
  - 模擬：ideate.js（既定の 4 観点で 8 体、二周目に known と観点ごとの constraints.md で 4 体、lightModel が無い・共通の read に constraints.md・一周目の観点の read に constraints.md の三つは止まる）、survey.js（周辺・external・externalScope・外のパスの read で通る、周辺が二つで止まる）、consult.js（blind で通る）。
- 確かめていないこと：実際の Workflow での本番の走り（今回足した survey.js の欄、ideate.js の 4 観点の既定、制約の一覧の止め方）。実際のリポジトリで段階を通して回すこと。答えの §4 の五つ（別のアカウントでの確かめ）。
