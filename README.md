# operating-kit（運用の型）

段階・役割・相談の運用の型を、Claude Code のリポジトリに入れるためのプラグインです（スキル一つ）。判断は主担当一人が行い、下調べ → 整備 → 考察と発想 → 計画とデザイン → 実装を段階ごとの新しいセッションで進めます。考える段階（整備・考察と発想・計画とデザイン）の主担当は、標準では上位のモデル（関わり方 (A)）。上位のモデルへの相談（(B)(C)）は利用者の合図の語のときだけ行います。

- プラグインの版：0.3.0　／　型の版：2026-10-15・コミット `6b9b542`（このブランチでは、段階②の分け方などの直しと、2026-10-17 の「上位のモデルが自由に考察・発想しやすい構成」への直し（(A) を標準に、考察ノート、主担当の先出し）を足した下書き。正本へは未反映）
- 作者：hihumi　／　ライセンス：MIT（`LICENSE`）

## 入れ方

**claude.ai のアカウントに足す（おすすめ。別のアカウントでも、アカウントごとに一度だけ）**

1. claude.ai の Customize → Plugins → Add → Add marketplace に `pe-kun333/operating-kit` を入れ、operating-kit を足す。
2. この marketplace の Sync automatically を on にする（github.com から足したときに出る）。main に入った直しが、自動で届く（plugin.json の版を上げたとき。下の「版」の行）。

足したプラグインは、次の面に届きます。

- claude.ai のチャット：スキルだけ。リポジトリに入れる手順は使えないので、「型だけ使う」と、一言・型の芯を見せる使い方になる。
- Cowork。
- 同じアカウントでサインインした Claude Code（CLI・デスクトップ。v2.1.273 以降）：`operating-kit@synced` として、次に起動したときに届く。

クラウドのセッション（claude.ai/code）に届くかは、資料に書かれていません。足したあと、新しいクラウドのセッションで「`claude plugin list` を走らせて」と頼み、`operating-kit@synced` が出るかを確かめてください。

claude.ai が読むのは、このリポジトリの既定の枝（main）と見られます（枝を選ぶ欄が無い）。

**Claude Code に、マシンごとに入れる**：シェルで

```
claude plugin marketplace add pe-kun333/operating-kit
claude plugin install operating-kit@operating-kit
```

- 枝を選ぶなら `pe-kun333/operating-kit#<枝>` で足す。
- 新しい版は `claude plugin update operating-kit@operating-kit` で受け取る。この marketplace の自動更新は既定で off なので、`/plugin` の Marketplaces で on にもできる。
- 版を決めるのは plugin.json の `version`。直しを main に入れるときは、版を上げる（上げないと、入れた人に届かない）。

**クラウドのセッションに届かないとき**：claude.ai/code の環境の設定の Setup script に、次を入れます。

```bash
#!/bin/bash
REF=main
DIR=/root/.claude/skills/operating-kit
rm -rf "$DIR"
git clone --depth 1 --branch "$REF" https://github.com/pe-kun333/operating-kit.git "$DIR" || echo "operating-kit を取れなかった"
exit 0
```

- `~/.claude/skills/` の下に `.claude-plugin/plugin.json` を持つフォルダは、install なしでプラグイン（`operating-kit@skills-dir`）として読まれます。
- その環境を使う、クラウドのセッションに効きます。環境の写しは約 7 日ごとに作り直されるので、そのときに新しい版が入ります。

**zip で受け取ったとき（Claude Code）**：展開したフォルダ（`.claude-plugin/` がある所）を、`~/.claude/skills/` の下に置きます。次に起動したときから、`operating-kit@skills-dir` として読まれます。

## 使い方

Claude Code のセッションで `/operating-kit:operating-kit` と送るか、「このリポジトリに運用の型を入れて」「次の段階の一言を出して」のように頼みます。四つの使い方（入れる・一言を出す・点検する・型だけ使う）は `skills/operating-kit/SKILL.md` にあります。相談・発想・下調べのワークフローは、`/operating-kit:consult`・`/operating-kit:ideate`・`/operating-kit:survey` の名前でも呼べます（args の中身は `skills/operating-kit/references/prompts.md`）。ワークフローの出力を案の一覧に写す道具は `skills/operating-kit/tools/ideas-table.mjs`（Node 18 以上）です。

- 入れる前に、作るファイルと埋める値を見せて止まります。既にある CLAUDE.md は丸ごと置き換えず、節を足します。
- ワークフローは合図の語で許されたときだけ起こし、セッションのモデルと effort は変えません。

## English (short)

A Claude Code plugin (one skill, written in Japanese) that installs and applies a staged operating model: one main agent decides; research, preparation, ideation, planning/design, and implementation run in separate sessions per stage; consulting a stronger model happens only when the user sends the agreed keyword. Add `pe-kun333/operating-kit` as a marketplace in claude.ai (Customize > Plugins > Add marketplace) to reach chat, Cowork, and signed-in Claude Code, or install with `claude plugin marketplace add pe-kun333/operating-kit` then `claude plugin install operating-kit@operating-kit`, and invoke `/operating-kit:operating-kit`. The workflows run as `/operating-kit:consult`, `/operating-kit:ideate`, and `/operating-kit:survey`.
