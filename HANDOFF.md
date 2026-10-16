# HANDOFF（再開用のメモ）

- 更新：2026-10-16 17:00 UTC ごろ。利用制限が近いので止めた。型の直し（段階②の分け方、B1〜B5、E1・E3、ふつう 4 観点）は全部 push 済み。利用者の最後の問い「この型を別の自分のアカウントでも多くのセッションに適用しやすくする方法」への答えは、まだ書いていない（調べものの途中）。
- リポジトリ：`pe-kun333/operating-kit`。作業枝：`claude/amazing-goldberg-34ipb3`（main には取り込まない）。PR：https://github.com/pe-kun333/operating-kit/pull/1（開いたまま。マージは利用者が決める）
- 前のセッション：https://claude.ai/code/session_01RPcGoX7kR34K2kB8TDGSKX（このメモを書いたセッション）、その前の引き継ぎ：https://claude.ai/code/session_01PQRoCf3cD7JN35oxnMjeqS
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
| 11 | 引き継ぎの用意（このファイル、dev/） | 済み | このファイルを足したコミット |

いまの型の段階と、最初の版（`ba8f04d`）からの違いは、前のセッションの最後の答えにまとめた（要点：段階が五つ、①-1 は 〈中〉、①-2 は map/、②-1 は手順・ideate.js・目隠し・測れる終わりの目安・二周・掘る方向、②-2 は判定の表と見送りの台帳、③ は前提の誤りを戻す、型の芯は 9 項）。

## 2. 作業中の工程と枝

| 工程 | 枝 | 状態 |
|---|---|---|
| 利用者の問い「この型を別の自分のアカウントでも、多くのセッションに適用しやすくする方法」の考察 | （文書の答え。コードは変えない） | 調べものの途中。答えは未作成 |

調べもののワークフロー（止めるときに動いていたもの）：

- run ID：`wf_7722305f-e79`（task ID `w19huics6`）
- scriptPath（前のコンテナ。残らない見込み）：`/root/.claude/projects/-home-user/7bc31ff3-e406-5f77-8526-4dc7a552bd6d/workflows/scripts/kit-multi-account-research-wf_7722305f-e79.js`
- 写し：`dev/workflows/kit-multi-account-research.js`（同じ中身。新しいセッションでは resumeFromRunId は使えないので、要るならこれを scriptPath にして起こし直す）
- 終わった状態（2026-10-16 17:05 UTC ごろ）：調べる四体（プラグインと marketplace・クラウドのセッション・claude.ai 側・型の今の入れ方の手間）は答えが出た（事実 93・道の案 36）。確かめ役の一体は、利用制限で失敗（「You've hit your session limit · resets 7:30pm (UTC)」）。資料の主張 84 件は、まだ確かめ直していない。
- 答えの全文：`dev/research/2026-10-16-multi-account.json`（lenses に四体の答え、claims に確かめ直す主張の一覧。verified は null）
- 調べた範囲での要点（どれも確かめ直す前の主張。出どころの URL は上のファイルにある）：
  - クラウドのセッション（claude.ai/code）は、利用者のマシンに入れたプラグインも、リポジトリの `.claude/settings.json` で有効にしたプラグインも読まない、という主張。読まれるのは、リポジトリにコミットされた CLAUDE.md・`.claude/skills/` など、claude.ai アカウントで有効にしたスキル、と書かれている。もし確かなら、型の §1（リポジトリに写す）はクラウドに効く道のまま。
  - claude.ai の Customize > Plugins で、公開 GitHub の marketplace（pe-kun333/operating-kit）をアカウントに足せる。足したプラグインは、Cowork と、同じアカウントでサインインした Claude Code に同期される（API キーで動かすときは同期されない）、という主張。
  - スキルだけなら、ZIP（`<skill-name>/SKILL.md` の形）を claude.ai に上げて有効にできる。`${CLAUDE_SKILL_DIR}` の書き方の注意がある。
  - plugin.json に version があると、その文字列が変わらない限り更新が届かない。サードパーティの marketplace は、自動更新が既定で切られている。
  - リポジトリの `.claude/settings.json` の extraKnownMarketplaces・enabledPlugins は、信頼を承認したフォルダでだけ効く。

## 3. 次にやる工程（順番と担当）

| 順 | 工程 | 担当（モデル） |
|---|---|---|
| 1 | `dev/research/2026-10-16-multi-account.json` を読み、claims の要の主張（とくに上の §2 の要点：クラウドのセッションがプラグインを読むか、claude.ai のアカウントのプラグインの同期、スキルの ZIP、版と自動更新、.claude/settings.json の効く範囲、クラウドの環境の setup script・SessionStart の hook）を公式の資料で確かめ直す。利用制限が戻ってから（19:30 UTC 以降）。ワークフローなら確かめ役 1〜2 体（agentType は claude-code-guide。claims を半分ずつ） | 主担当（Opus 5.5）。確かめ役は claude-code-guide（主担当のモデルのまま） |
| 2 | 利用者への答えを書く：別のアカウントの多くのセッションに当てはめやすくする道（例：marketplace を public にして user scope で入れる／リポジトリの .claude/settings.json で入れさせる／クラウドの環境の setup script で毎回入れる／claude.ai に .skill を入れて「型だけ」を使う／型の入れ方を一言で済む形に縮める など）を、効く範囲・手間・弱みで比べ、おすすめを一つ | 主担当（Opus 5.5） |
| 3 | 利用者が選んだ道を形にする（例：README の入れ方、setup script の例、型を一度に入れる手順の短縮）。作業枝にコミット・push | 主担当（Opus 5.5）。小さな機械的な直しは実装担当でもよい |
| 4 | 本番の走り：実際のリポジトリで、段階①-1（survey.js）→ ①-2 → ②-1（ideate.js、4 観点・二周）→ ②-2 を通して回す（まだ一度もしていない） | 主担当（Opus 5.5）。段階①-1 と照らす相は 〈中〉（Sonnet 5.5）、検討担当は 〈主〉（Opus 5.5）、相談役は 〈上〉（Fable 5.1） |
| 5 | 正本（honeycomb-browser-grok の `docs/operating-kit/`）へ写す。利用者は「後で」と答えた。正本はこのセッションのリポジトリには無い（10/14 の zip だけ） | 利用者が時期と正本の場所を決めてから、主担当 |

モデルの呼び名は、この型を作った時点（2026-10）の例。型の文書の中では 〈小〉〈中〉〈主〉〈上〉 で書いてある。

## 4. 未決の判断事項（利用者が決める）

- **別のアカウントへの当てはめ方**：§3 の 2 の答えを見て選ぶ。
- **プラグインの版**：plugin.json は 0.1.0 のまま。マージの前に上げるか（例 0.2.0）。
- **このファイルと dev/ を、マージの前に外すか**：marketplace の source は `./` なので、残すとプラグインの中に入る。
- **正本へ写す時期と、正本の場所**（§3 の 5）。
- **PR #1 をマージするか**。

決めたこと（参考）：ふつうの計画は一周 4 観点で二周以上（2026-10-16）。正本へは後で写す（2026-10-16）。段階①-1 は 〈中〉（2026-10-16。前の比べの試しでは差が小さかったが、利用者の決め）。

## 5. ビルドとテストのコマンド

ビルドは無い（文書とワークフローの script だけ）。確かめはリポジトリ直下で：

```
bash dev/check.sh
```

中身：(1) `node --check skills/operating-kit/scripts/*.js`、(2) ひな形の 〈〉 が `references/placeholders.md` の表にあるか、(3) 型の文書とスクリプトにモデル名が無いか、(4) 模擬の agent()（`dev/workflow-harness.mjs`）で ideate.js・survey.js・consult.js を 8 通り動かす（通るはずのものと、止まるはずのもの）。

模擬の仕組みを一つだけ使うとき：`node dev/workflow-harness.mjs skills/operating-kit/scripts/ideate.js <case.json>`（case.json は `{"args": {...}, "fail": ["ラベルの一部"], "showPrompts": true}`）。

## 6. 最後に通った確かめ

- 2026-10-16 16:57 UTC ごろ、HEAD `646efe6` の上で `bash dev/check.sh`：全部とおった。
  - 構文：3 本とも通る。〈〉：表に無いものは無い。モデル名：無い。
  - 模擬：ideate.js（既定の 4 観点で 8 体、二周目に known と観点ごとの constraints.md で 4 体、lightModel が無い・共通の read に constraints.md・一周目の観点の read に constraints.md の三つは止まる）、survey.js（周辺・external・externalScope・外のパスの read で通る、周辺が二つで止まる）、consult.js（blind で通る）。
- 確かめていないこと：実際の Workflow での本番の走り（今回足した survey.js の欄、ideate.js の 4 観点の既定、制約の一覧の止め方）。実際のリポジトリで段階を通して回すこと。§2 の調べものの主張（確かめ役が利用制限で失敗）。
