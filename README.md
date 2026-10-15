# operating-kit（運用の型）

段階・役割・相談の運用の型を、Claude Code のリポジトリに入れるためのプラグインです（スキル一つ）。判断は主担当一人が行い、下調べ → 整備 → 計画とデザイン → 実装を段階ごとの新しいセッションで進め、上位のモデルへの相談は利用者の合図の語のときだけ行います。

- プラグインの版：0.1.0　／　型の版：2026-10-15・コミット `6b9b542`
- 作者：hihumi　／　ライセンス：MIT（`LICENSE`）

## 入れ方

**Claude Code（marketplace から。おすすめ）**：シェルで

```
claude plugin marketplace add pe-kun333/operating-kit
claude plugin install operating-kit@operating-kit
```

セッションの中なら `/plugin install operating-kit --marketplace pe-kun333/operating-kit`。新しい版は `claude plugin update operating-kit@operating-kit` で受け取ります。

**Claude Code（zip で受け取ったとき）**：一回だけなら `claude --plugin-dir ./operating-kit-plugin.zip`。毎回使うなら、展開したフォルダ（`.claude-plugin/` がある所）を `~/.claude/skills/` の下に置きます。

**claude.ai・Cowork**：`operating-kit.skill` を、自分のアカウントのスキルとして入れます。会話の中では「型だけ使う」と、一言・型の芯を見せる使い方になります（リポジトリに入れる手順は Claude Code 向けです）。

## 使い方

Claude Code のセッションで `/operating-kit:operating-kit` と送るか、「このリポジトリに運用の型を入れて」「次の段階の一言を出して」のように頼みます。四つの使い方（入れる・一言を出す・点検する・型だけ使う）は `skills/operating-kit/SKILL.md` にあります。

- 入れる前に、作るファイルと埋める値を見せて止まります。既にある CLAUDE.md は丸ごと置き換えず、節を足します。
- ワークフローは合図の語で許されたときだけ起こし、セッションのモデルと effort は変えません。

## English (short)

A Claude Code plugin (one skill, written in Japanese) that installs and applies a staged operating model: one main agent decides; research, preparation, planning/design, and implementation run in separate sessions per stage; consulting a stronger model happens only when the user sends the agreed keyword. Install with `claude plugin marketplace add pe-kun333/operating-kit` then `claude plugin install operating-kit@operating-kit`, and invoke `/operating-kit:operating-kit`.
