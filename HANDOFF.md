# HANDOFF（再開用のメモ）

- 更新：2026-10-16 18:00 UTC ごろ。利用者の問い「この型を別の自分のアカウントでも多くのセッションに適用しやすくする方法」について、三つをした。
  - 調べものの主張を確かめ直した。
  - 答えを書いた：`dev/research/2026-10-16-multi-account-answer.md`。
  - 利用者が選んだ道 C（claude.ai のアカウントに marketplace を足す）と、足し算（scripts を workflows として呼べるように）を、作業枝に入れた。
- 利用者の指示（2026-10-16）で、PR #1 を main にマージした。HANDOFF.md と dev/ は残したまま。
- 次は、別のアカウントで claude.ai に marketplace を足し、届くかを確かめること（§3 の 1）。
- リポジトリ：`pe-kun333/operating-kit`。作業枝：`claude/amazing-goldberg-34ipb3`。PR：https://github.com/pe-kun333/operating-kit/pull/1（2026-10-16 に main へマージ。merge コミットで入れたので、このメモにあるコミットの番号は main でも引ける）。
- これからの直しは、main から作業枝を作り直して進める。main に入れるのは、利用者の許しのあとだけ。main に入れるときは、plugin.json と README の版を上げる。
- このメモを最後に書いたセッション：https://claude.ai/code/session_01BigekiHYHBzGoW22RnwsDh。その前：https://claude.ai/code/session_01RPcGoX7kR34K2kB8TDGSKX、さらに前の引き継ぎ：https://claude.ai/code/session_01PQRoCf3cD7JN35oxnMjeqS
- このファイルと `dev/` は、引き継ぎのための作業用。プラグインの中身ではない（main にも残すと、2026-10-16 に利用者が決めた）。

## 0. 引き継ぐ人へ（最初にすること）

1. `git fetch origin main` → `git checkout main` → `git pull origin main`。`git status` が空であること。直すときは、main から作業枝を作る。
2. このファイルを読み、§3 の 1 から続ける。
3. 確かめの道具：`bash dev/check.sh`（§5）。node と python3 だけで動く。
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
| 15 | PR #1 を main にマージする（利用者の指示。HANDOFF.md と dev/ は残す。merge コミット） | 済み | このメモを直したコミットと、その merge コミット |

いまの型の段階と、最初の版（`ba8f04d`）からの違いは、前のセッションの最後の答えにまとめた（要点：段階が五つ、①-1 は 〈中〉、①-2 は map/、②-1 は手順・ideate.js・目隠し・測れる終わりの目安・二周・掘る方向、②-2 は判定の表と見送りの台帳、③ は前提の誤りを戻す、型の芯は 9 項）。

## 2. 作業中の工程と枝

| 工程 | 枝 | 状態 |
|---|---|---|
| 利用者の問い「この型を別の自分のアカウントでも、多くのセッションに適用しやすくする方法」 | main（PR #1 でマージ済み） | 答えを書き、利用者の選び（道 C と workflows）を形にし、main に入れた。残りは、別のアカウントでの確かめ（§3 の 1） |

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
| 2 | 本番の走り：実際のリポジトリで、段階①-1（survey.js）→ ①-2 → ②-1（ideate.js、4 観点・二周）→ ②-2 を通して回す（まだ一度もしていない） | 主担当（Opus 5.5）。段階①-1 と照らす相は 〈中〉（Sonnet 5.5）、検討担当は 〈主〉（Opus 5.5）、相談役は 〈上〉（Fable 5.1） |
| 3 | 正本（honeycomb-browser-grok の `docs/operating-kit/`）へ写す。利用者は「後で」と答えた。正本はこのセッションのリポジトリには無い（10/14 の zip だけ）。写すときは、正本の build.py が組み立てる plugin.json にも、今回の三つを入れる：version、`workflows` 欄、scripts の meta.name（consult・ideate・survey）。入れないと、組み立て直したときに消える | 利用者が時期と正本の場所を決めてから、主担当 |

モデルの呼び名は、この型を作った時点（2026-10）の例。型の文書の中では 〈小〉〈中〉〈主〉〈上〉 で書いてある。

## 4. 未決の判断事項（利用者が決める）

- **プラグインの版**：0.2.0 で main に入れた。この先、main に入れるたびに上げるか、version を省いて commit で追わせるか。いまは「上げる」。claude.ai 側の版の見方は資料に無い。
- **正本へ写す時期と、正本の場所**（§3 の 3）。

決めたこと（参考）：PR #1 を main にマージする。HANDOFF.md と dev/ は残す（2026-10-16。marketplace の source が `./` なので、プラグインの中にも入るが、読まれはしない）。別のアカウントへは道 C（claude.ai のアカウントに marketplace を足す）。足し算は scripts を workflows として呼べるようにすることだけ（2026-10-16）。ふつうの計画は一周 4 観点で二周以上（2026-10-16）。正本へは後で写す（2026-10-16）。段階①-1 は 〈中〉（2026-10-16。前の比べの試しでは差が小さかったが、利用者の決め）。

## 5. ビルドとテストのコマンド

ビルドは無い（文書とワークフローの script だけ）。確かめはリポジトリ直下で：

```
bash dev/check.sh
```

中身：(1) `node --check skills/operating-kit/scripts/*.js`、(2) ひな形の 〈〉 が `references/placeholders.md` の表にあるか、(3) 型の文書とスクリプトにモデル名が無いか、(4) 模擬の agent()（`dev/workflow-harness.mjs`）で ideate.js・survey.js・consult.js を 8 通り動かす（通るはずのものと、止まるはずのもの）、(5) プラグインの形（plugin.json の版と README の版が同じ、`workflows` 欄のフォルダがある、scripts の meta.name がファイル名と同じ。`claude` があれば `claude plugin validate` を plugin.json と marketplace に）。

模擬の仕組みを一つだけ使うとき：`node dev/workflow-harness.mjs skills/operating-kit/scripts/ideate.js <case.json>`（case.json は `{"args": {...}, "fail": ["ラベルの一部"], "showPrompts": true}`）。

## 6. 最後に通った確かめ

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
