# HANDOFF（再開用のメモ）

- 更新：2026-10-16 17:30 UTC ごろ。利用者の問い「この型を別の自分のアカウントでも多くのセッションに適用しやすくする方法」について、調べものの主張を確かめ直し（§3 の旧 1）、答えを書いた（旧 2）。答え：`dev/research/2026-10-16-multi-account-answer.md`。いまは、利用者がどの道にするかを選ぶのを待っている（§4）。
- リポジトリ：`pe-kun333/operating-kit`。作業枝：`claude/amazing-goldberg-34ipb3`（main には取り込まない）。PR：https://github.com/pe-kun333/operating-kit/pull/1（開いたまま。マージは利用者が決める）
- このメモを最後に書いたセッション：https://claude.ai/code/session_01BigekiHYHBzGoW22RnwsDh。その前：https://claude.ai/code/session_01RPcGoX7kR34K2kB8TDGSKX、さらに前の引き継ぎ：https://claude.ai/code/session_01PQRoCf3cD7JN35oxnMjeqS
- このファイルと `dev/` は、引き継ぎのための作業用。プラグインの中身ではない（マージの前に外すかは、§4 の未決）。

## 0. 引き継ぐ人へ（最初にすること）

1. `git fetch origin claude/amazing-goldberg-34ipb3` → `git checkout claude/amazing-goldberg-34ipb3` → `git pull origin claude/amazing-goldberg-34ipb3`。`git status` が空であること。
2. このファイルを読み、§3 の 1 から続ける。
3. 確かめの道具：`bash dev/check.sh`（§5）。node と python3 だけで動く。
4. 前のセッションのコンテナ（/tmp・/root/.claude の下）は残らない見込み。要るものは `dev/` に写してある。

新しいセッションに貼る一言（例）：

> operating-kit の作業枝 `claude/amazing-goldberg-34ipb3` を pull して、HANDOFF.md を読み、§3 の 1 から続けてください。新しいワークフローは、§3 に書いた体数の範囲で起こしてよい。main には取り込まない。

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
| 12 | 調べものの主張 84 件を、公式の資料の原文（44 ページを落として）で確かめ直す。確かめ役 2 体（claude-code-guide）と、主担当の直接の照らしと、この VM での試し | 済み：確か 68・一部 16・違う 0。結果は `dev/research/2026-10-16-multi-account.json` の `verified` | このメモを直したコミット |
| 13 | 利用者への答え：別のアカウントの多くのセッションに当てはめる道を比べ、おすすめを一つ | 済み：`dev/research/2026-10-16-multi-account-answer.md`（おすすめは道 C） | このメモを直したコミット |

いまの型の段階と、最初の版（`ba8f04d`）からの違いは、前のセッションの最後の答えにまとめた（要点：段階が五つ、①-1 は 〈中〉、①-2 は map/、②-1 は手順・ideate.js・目隠し・測れる終わりの目安・二周・掘る方向、②-2 は判定の表と見送りの台帳、③ は前提の誤りを戻す、型の芯は 9 項）。

## 2. 作業中の工程と枝

| 工程 | 枝 | 状態 |
|---|---|---|
| 利用者の問い「この型を別の自分のアカウントでも、多くのセッションに適用しやすくする方法」 | 作業枝（文書の答えだけ。型のコードは変えていない） | 答えは書いた。利用者の選び（§4）を待っている |

- 答え：`dev/research/2026-10-16-multi-account-answer.md`。
  - おすすめは道 C：別のアカウントの claude.ai の Customize > Plugins に、marketplace `pe-kun333/operating-kit` を足す。
  - その前に、PR #1 を main に入れ、version を上げる。
  - クラウドに届かないときと、main に入れる前に使うときは、道 D：環境の setup script で `~/.claude/skills/operating-kit` に clone する。
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
| 1 | 利用者が選んだ道を形にする（答えの §3.1・§5）。どの道でも要る直しは二つ：README の入れ方（claude.ai の道、`claude plugin update` が効く条件、無い `.skill` を ZIP に直すか外す）と、version の扱い。道 B なら、ZIP を作る道具も要る。道 D なら、git clone が通らないときのために、一つのファイルで取れる形（raw.githubusercontent.com から取る）も要る。作業枝にコミット・push。main には入れない | 主担当（Opus 5.5）。小さな機械的な直しは実装担当でもよい |
| 2 | 別のアカウントで、答えの §4 の確かめ（C：クラウドのセッションで `claude plugin list` に `operating-kit@synced` が出るか。D：setup script の clone が通るか）。利用者がそのアカウントで行うか、そのアカウントのセッションで主担当が行う | 利用者、または主担当 |
| 3 | 本番の走り：実際のリポジトリで、段階①-1（survey.js）→ ①-2 → ②-1（ideate.js、4 観点・二周）→ ②-2 を通して回す（まだ一度もしていない） | 主担当（Opus 5.5）。段階①-1 と照らす相は 〈中〉（Sonnet 5.5）、検討担当は 〈主〉（Opus 5.5）、相談役は 〈上〉（Fable 5.1） |
| 4 | 正本（honeycomb-browser-grok の `docs/operating-kit/`）へ写す。利用者は「後で」と答えた。正本はこのセッションのリポジトリには無い（10/14 の zip だけ） | 利用者が時期と正本の場所を決めてから、主担当 |

モデルの呼び名は、この型を作った時点（2026-10）の例。型の文書の中では 〈小〉〈中〉〈主〉〈上〉 で書いてある。

## 4. 未決の判断事項（利用者が決める）

- **別のアカウントへの当てはめ方**：答え（`dev/research/2026-10-16-multi-account-answer.md`）の §6 の四つ。
  - どの道にするか。おすすめは C。main に入れる前に使うなら D。
  - PR #1 を main に入れるか、いつ入れるか。
  - version の扱い（上げる・省く）。
  - §5 の足し算のどれを入れるか。
- **プラグインの版**：plugin.json は 0.1.0 のまま。このままでは、入れた人に直しが届かない（資料。答えの §1 の 7）。道 C なら、main に入れるたびに上げる（例 0.2.0）。
- **このファイルと dev/ を、マージの前に外すか**：marketplace の source は `./` なので、残すとプラグインの中に入る。道 D で clone しても入る（読まれはしないが、場所を取る）。
- **正本へ写す時期と、正本の場所**（§3 の 4）。
- **PR #1 をマージするか**。道 C は、main に入るまで最初の版しか届かない。

決めたこと（参考）：ふつうの計画は一周 4 観点で二周以上（2026-10-16）。正本へは後で写す（2026-10-16）。段階①-1 は 〈中〉（2026-10-16。前の比べの試しでは差が小さかったが、利用者の決め）。

## 5. ビルドとテストのコマンド

ビルドは無い（文書とワークフローの script だけ）。確かめはリポジトリ直下で：

```
bash dev/check.sh
```

中身：(1) `node --check skills/operating-kit/scripts/*.js`、(2) ひな形の 〈〉 が `references/placeholders.md` の表にあるか、(3) 型の文書とスクリプトにモデル名が無いか、(4) 模擬の agent()（`dev/workflow-harness.mjs`）で ideate.js・survey.js・consult.js を 8 通り動かす（通るはずのものと、止まるはずのもの）。

模擬の仕組みを一つだけ使うとき：`node dev/workflow-harness.mjs skills/operating-kit/scripts/ideate.js <case.json>`（case.json は `{"args": {...}, "fail": ["ラベルの一部"], "showPrompts": true}`）。

## 6. 最後に通った確かめ

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
