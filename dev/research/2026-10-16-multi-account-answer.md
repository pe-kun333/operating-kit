# 別のアカウントの多くのセッションに、運用の型を当てはめる道（答え）

- 2026-10-16。利用者の問い：「この型を別の自分のアカウントでも、多くのセッションに適用しやすくする方法」。
- 根拠：`dev/research/2026-10-16-multi-account.json` にある。中身は三つ。
  - 調べ役 4 体の答え。
  - 主張 84 件の確かめ直し（確か 68・一部 16・違う 0。`verified.checks`）。
  - 主担当がこのクラウドのセッションで試したこと（`verified.main_checks`）。
- 記号：
  - ［資料］公式の資料の原文にある。
  - ［試し］このクラウドのセッション（Claude Code 2.1.301）で試した。試したあとは元に戻した。
  - ［見込み］どちらも無く、推し量り。

## 0. 結論

> **利用者の選び（2026-10-16）**：道 C。§5 の足し算は「scripts を workflows/ にも置く」だけ。
> 作業枝に、そのための直しを入れた。
> - plugin.json：version を 0.2.0 に上げ、`workflows` 欄（`./skills/operating-kit/scripts/` を指す。写しは作らない）を足した。
> - scripts の meta.name を consult・ideate・survey にした。
> - README：入れ方を C の手順に直し、クラウドに届かないときの setup script を足した。
> - SKILL.md：呼び名を書き足した。
> - dev/check.sh：プラグインの形の確かめを足した。
>
> 利用者の指示で、PR #1 を main にマージした（2026-10-16。HANDOFF.md と dev/ は残す）。下の「その前に要ること二つ」は、どちらも済んだ。

**おすすめ：claude.ai のアカウントに、プラグインとして足す（下の道 C）。**

- 別のアカウントごとに一度、claude.ai の Customize > Plugins > Add > Add marketplace に `pe-kun333/operating-kit` を入れ、Sync automatically を入れる。
- これで、チャット・Cowork・同じアカウントでサインインした CLI とデスクトップに、直しのたびに届く［資料］。
- 資料は同期先にクラウドのセッションを挙げない。ただし、このクラウドのセッションは起動時にアカウントのプラグインを同期しに行っていた（`plugins_sync`）［試し］ので、クラウドにも届く見込みが高い。足したら一度、§3.2 の 3 で確かめる。

その前に要ることが二つある（どちらも利用者が決めること。§6）。

1. **直しを main に入れる（PR #1）。**
   - claude.ai の Add marketplace には、枝を選ぶ欄が無い［資料］。
   - いまの main は最初の版（`ba8f04d`）なので、別のアカウントには最初の版しか届かない［試し］。
2. **plugin.json の version を、main に入れるたびに上げる。** 0.1.0 のままでは、更新が届かない［資料］。

次の二つのときは、道 D（環境の setup script）を足す。D は枝を選べる。

- クラウドに届かなかったとき。
- main に入れる前に、別のアカウントで使いたいとき。

## 1. 確かめて分かった、要のこと

| # | こと | 根拠 |
|---|---|---|
| 1 | クラウドのセッションは、自分のマシンに入れたプラグインを読まない。リポジトリの `.claude/settings.json`（`enabledPlugins`・`extraKnownMarketplaces`）で入れたプラグインも読まない。`/plugin` も無い。 | ［資料］plugins/install の Cloud session、cloud-environments の What carries over |
| 2 | クラウドのセッションが読むのは、次のもの：リポジトリの CLAUDE.md・`.claude/rules`・`.claude/skills`・agents・commands、一つのリポジトリなら `.claude/settings.json` の hooks と許し、claude.ai のアカウントで有効にしたスキル（起動時に同期）。 | ［資料］同上、skills |
| 3 | 資料の「`~/.claude/CLAUDE.md`・`~/.claude/skills/` は読まれない」は、自分のマシンのファイルが持ち越されない、という意味。VM の `~/.claude` に置いたものは読まれる。setup script で `~/.claude/CLAUDE.md` を書く例が、公式にある。VM の `~/.claude/skills/` に置いたスキルは、実行中のセッションのスキルの一覧に数秒で出た。 | ［資料］cloud-environments の Add personal preferences、［試し］ |
| 4 | `~/.claude/skills/<名>/` の下に `.claude-plugin/plugin.json` があると、install なしでプラグイン `<名>@skills-dir` として読まれる。VM で `claude plugin list` が loaded と出た。リポジトリの `.claude/skills/` に置く形は、シェルの `claude` から見ると「信頼されていない」として飛ばされた。 | ［資料］plugins/loading・plugins/create、［試し］ |
| 5 | claude.ai の Customize > Plugins で足したプラグインは、アカウントに付く。届くのは、チャット・Cowork・同じアカウントでサインインした Claude Code（v2.1.273 以降）。資料は同期先にクラウドを挙げない。このクラウドのセッションは、起動時に `plugins_sync_starting → plugins_sync_no_changes（count 0）` を走らせていた。このアカウントにはプラグインが無いので、届いたものが読まれるところまでは見ていない。 | ［資料］claude.com の plugins/overview・platform-support、code の plugins/loading、［試し］起動の記録 |
| 6 | claude.ai のアカウントのスキル（ZIP を Customize > Skills に上げる）は、チャット・Cowork・クラウド・サインインした端末に届く。claude.ai の上で直すか上げ直さない限り、更新されない。ZIP の先頭は `operating-kit/SKILL.md`。frontmatter に書けるのは六つの欄だけ。description は 1,024 字まで（型の SKILL.md は 474 字で通る）。README が案内する `operating-kit.skill` は、リポジトリに無い。 | ［資料］skills、claude.com の skills/how-to、support の Using skills |
| 7 | 版：plugin.json に version があると、その文字列が変わるまで更新は届かない。version を省けば、commit で追う。Claude Code の自動更新は、claude.ai から足した marketplace では既定で on、CLI で足した自前の marketplace では既定で off。claude.ai 側には、Check for updates と Sync automatically（github.com から足したとき）がある。 | ［資料］plugins/host-marketplace・loading・install、claude.com の plugins/overview |
| 8 | claude.ai の Add marketplace に入れるのは、owner/repo か URL だけで、枝を選ぶ欄は無い。CLI は `owner/repo#ref` で枝を選べる。いまの main から入れると、最初の版（`ba8f04d`、ひな形 5 つ）になる。 | ［資料］、［試し］ |
| 9 | 環境の setup script は、Claude Code の起動の前に root で走り、0 で終わる要がある。約 5 分以内に終われば、ファイルの写しを約 7 日使い回す。script を変えたときは作り直す。環境はアカウントごと（共有は Team・Enterprise だけ）。許しの一覧（Trusted）に、github.com と raw.githubusercontent.com がある。GitHub の proxy は、API と archive を、セッションに付いたリポジトリの分しか通さない（公開のリポジトリでも）。 | ［資料］cloud-environments |
| 10 | Projects（Pro・Max の公開ベータ、順に展開）：Project settings > Plugins に足したプラグインが、新しい cloud thread で読まれる。project instructions も、毎回届く。 | ［資料］claude-projects |
| 11 | Workflow：プラグインの `workflows/` に置くと、`/<プラグイン>:<meta.name>` で走る。いまの型の script は `skills/operating-kit/scripts/` にあり、この形ではない（scriptPath で渡す）。面の一覧は CLI・デスクトップ・IDE・`-p`・SDK。クラウドは、結果を残すとだけ書かれている（このクラウドのセッションでは Workflow ツールが使えている）。チャットと Cowork は記載が無い。Pro は Dynamic workflows を入れる要があり、規模の既定は small（5 体未満）。 | ［資料］workflows、［試し］ |
| 12 | 合図の語（ultracode）が効くのは、自分で打った発言（対話・IDE・Remote Control・SDK）だけ。`-p`・予定・webhook では効かない。claude.ai/code への発言は、一覧に無い。 | ［資料］workflows |

## 2. 道の比べ

| 道 | 何をするか | 効く範囲 | 一度の手間 | 直しが届くか | 弱み | 確かさ |
|---|---|---|---|---|---|---|
| A. リポジトリに写す（今の §1） | リポジトリごとに §1 を回す | そのリポジトリの、全部のセッション（クラウド・CLI・デスクトップ。そのリポジトリに入れるアカウントなら、どのアカウントでも） | リポジトリごとに 1 回（〈〉を埋め、止まって許し、写す） | 届かない（写しを §3 の点検で手で直す） | リポジトリが増えるほど、手間と写しのずれが増える。新しいリポジトリに入れるには、プラグインかスキルが要る | ［資料］ |
| B. アカウントのスキル | ZIP を Customize > Skills に上げる | チャット・Cowork・クラウド・サインインした端末 | アカウントごとに 1 回（ZIP を作る道具が要る。チャットでは Code execution を on） | 届かない（直すたびに、アカウントごとに上げ直す） | 手作業の上げ直し。型は、いま直しが多い | ［資料］ |
| **C. アカウントのプラグイン（おすすめ）** | Customize > Plugins > Add marketplace に `pe-kun333/operating-kit`。Sync automatically を on | チャット・Cowork・サインインした CLI とデスクトップ［資料］。クラウド［見込み高い。§3.2 の 3 で確かめる］ | アカウントごとに 1 回（1 分ほど） | 届く（version を上げれば） | 既定の枝（main）しか読めない見込み。クラウドは要確かめ | ［資料］＋［試し］ |
| D. 環境の setup script | claude.ai/code の環境の Setup script に数行（§3.3） | その環境を使う、そのアカウントのクラウドのセッション（どのリポジトリでも） | アカウントごと・環境ごとに 1 回 | 届く（約 7 日ごとの作り直しのとき。すぐ届けるなら script を少し変える） | クラウドだけ。セッションに付いていないリポジトリを git clone できるかは、未確かめ（raw なら届く）。その環境を選ばないと入らない | ［資料］＋［試し］（setup script そのものは試していない） |
| E. Projects | Project settings > Plugins に足し、project instructions に型の芯を書く | その project の、新しい cloud thread | project ごとに 1 回 | C と同じ | ベータで、まだ出ていないアカウントがある。Team・Enterprise には無い | ［資料］ |
| F. 組織の配り方 | Owner が Required・Installed by default にする。server-managed settings を使う | 組織の全員の、全部の面（クラウドにも届く） | 組織で 1 回 | 届く | Team・Enterprise だけ。個人のアカウントでは使えない | ［資料］ |

外したもの：

- リポジトリの `.claude/settings.json` で入れさせる道。クラウドで読まれない［資料］。
- リポジトリの `.claude/skills/` に、プラグインとして置く道。信頼の確かめで飛ばされうる［試し］。

## 3. おすすめの手順

### 3.1 先に、このリポジトリで（一度だけ）

1. PR #1 を main に入れる。
2. plugin.json の version を上げる（例 0.2.0）。以後、main に入れるたびに上げる。
3. README の入れ方を直す。直す所は三つ。
   - claude.ai の道を書く。
   - `claude plugin update` が効く条件を書く。
   - `.skill` を ZIP に直すか、外す。

### 3.2 別のアカウントで（アカウントごとに 1 回）

1. claude.ai → Customize → Plugins → Add → Add marketplace → `pe-kun333/operating-kit`。operating-kit を足し、Sync automatically を on にする。
2. Pro のアカウントなら、Dynamic workflows を入れる。型の相談・発想のワークフローに要る。
   - CLI・デスクトップでは `/config` で入れる。
   - クラウドでは、`/config` は claude.ai の設定の Claude Code の節を開く［資料］。そこに同じ行があるかは、まだ確かめていない。
3. 確かめ（2 分ほど）：新しいクラウドのセッションを開き、「`claude plugin list` を走らせて」と頼む。
   - `operating-kit@synced` が出れば、クラウドにも届いている。
   - 出なければ、3.3 を足す。
   - 端末では、`/plugin` の Installed に `operating-kit@synced` が出る。

### 3.3 クラウドに届かないとき、または main に入れる前に使いたいとき（道 D）

claude.ai/code の新しいセッションの画面で、環境の選び具から、使う環境の設定を開き（無ければ New environment で作る）、Setup script に次を入れる。

```bash
#!/bin/bash
# 運用の型（operating-kit）を、この環境のクラウドのセッションに入れる
REF=main   # main に入れる前なら claude/amazing-goldberg-34ipb3
DIR=/root/.claude/skills/operating-kit
rm -rf "$DIR"
git clone --depth 1 --branch "$REF" https://github.com/pe-kun333/operating-kit.git "$DIR" \
  || echo "operating-kit を取れなかった（セッションは続ける）"
exit 0
```

- `~/.claude/skills/operating-kit/.claude-plugin/plugin.json` ができるので、`operating-kit@skills-dir` として読まれる（§1 の 4）。
- 確かめは、3.2 の 3 と同じ（`operating-kit@skills-dir` が出るか）。
- git clone が通らないことがある。セッションに付いていないリポジトリを、GitHub の proxy が通さないときがそれに当たる。そのときは、raw.githubusercontent.com から一つのファイルで取る形が要る。型を一つに固めたファイルを置く作業で、HANDOFF の §3 の 3 に当たる。

## 4. まだ確かめていないこと（別のアカウントで確かめる）

- C：claude.ai で足したプラグインが、クラウドのセッションで読まれるか（3.2 の 3）。
- C：claude.ai の Add marketplace が読む枝（既定の枝と見ている）。version を上げないとき、claude.ai 側で更新が届くか。plugin.json の `workflows` 欄（Claude Code だけの欄）があっても、claude.ai が断らないか。資料で「入れられない」とされるのは `bin/` だけ。
- D：setup script での git clone が、セッションに付いていないリポジトリで通るか。setup script で置いたプラグインが読まれるか（置き場所は試しと同じなので、読まれる見込み）。
- 型の Workflow（`scripts/*.js`）が、synced や skills-dir のプラグインの中から、scriptPath で走るか。置き場所が `~/.claude/plugins/…` か `~/.claude/skills/…` に変わるので、SKILL.md の書き方で足りるかを見る。
- 合図の語が、claude.ai/code のクラウドのセッションへの発言で効くか（資料の一覧に無い）。

## 5. どの道でも効く、手間を減らす足し算（利用者が選ぶ）

- **アカウントで決まる値を一度だけ置く**：〈小〉〈中〉〈主〉〈上〉〈主の effort〉〈合図の語〉 を、アカウントに一度だけ置く。§1 で毎回聞かずに済む。置き場所の例は二つ。
  - setup script で `~/.claude/CLAUDE.md` に書く（クラウド）。
  - claude.ai の Instructions for Claude に書く（チャット）。
- **scripts を `workflows/` にも置く**：型の scripts を、プラグインの `workflows/` にも置く。`/operating-kit:<名>` で呼べる。
- **SessionStart hook で段階と一言を出す**：リポジトリの SessionStart hook で、HANDOFF.md §0 の「今の段階」と、次の一言を出す。効くのは、一つのリポジトリのクラウドのセッションと、CLI・デスクトップ。
- **段階ごとの開始リンク**：claude.ai/code の `?prompt=…&repositories=…&environment=…` の形で作る。モデルと枝は入れられない（欄の表に無い）。

## 6. 利用者が決めること

1. どの道にするか。おすすめは C。main に入れる前に使うなら D。
2. PR #1 を main に入れるか、いつ入れるか。
3. version の扱い（上げる・省く）。
4. §5 の足し算のどれを入れるか。
