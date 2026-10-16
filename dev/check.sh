#!/usr/bin/env bash
# 運用の型（operating-kit）の確かめ。リポジトリ直下で `bash dev/check.sh`。
# 1) スクリプトの構文  2) ひな形の 〈〉 が placeholders.md の表にあるか  3) モデル名が型の文書・スクリプトに無いか  4) 模擬の agent() で ideate.js・survey.js・consult.js を動かし、tools/ideas-table.mjs を通す  5) プラグインの形（版・workflows 欄・meta.name。claude があれば claude plugin validate）
set -u
K=skills/operating-kit
fail=0
# 使える python を探す（Windows の python3 はストアの別名で、何もしないことがある。Python 2 は選ばない）。py -3 は二語なので配列に入れる
PY=()
for c in python3 python 'py -3'; do
  if [ "$($c -c 'import sys; print(2 if sys.version_info[0] >= 3 else 0)' 2>/dev/null | tr -d '\r')" = 2 ]; then read -r -a PY <<< "$c"; break; fi
done
[ ${#PY[@]} -gt 0 ] || { echo 'python が無い'; exit 1; }
export PYTHONUTF8=1 # 標準入出力を UTF-8 で読み書きする（Windows の既定の cp932 で日本語を読み違えないため）
# node --check は Node 22 以降だと .js を ES モジュールとして読み、トップレベルの return で落ちるので、harness と同じ作りで構文だけ見る
echo '== 1. 構文'; node dev/syntax-check.mjs $K/scripts/*.js || fail=1
echo '== 2. 〈〉'; "${PY[@]}" - "$K" <<'PY' || fail=1
import re,glob,sys
K=sys.argv[1]
tab=set(re.findall(r'^\| (〈[^〉]*〉)',open(f'{K}/references/placeholders.md',encoding='utf-8').read(),re.M))
bad=set()
for f in glob.glob(f'{K}/assets/*.md')+[f'{K}/references/prompts.md',f'{K}/references/principles.md']+glob.glob(f'{K}/scripts/*.js'):
    for m in re.findall(r'〈[^〉]*〉',open(f,encoding='utf-8').read()):
        if m not in tab and m!='〈〉': bad.add((m,f))
print('表に無い 〈〉:', sorted(bad) or 'なし'); sys.exit(1 if bad else 0)
PY
echo '== 3. モデル名'; if grep -rn -i 'opus\|sonnet\|haiku\|fable' $K/assets $K/references/prompts.md $K/references/principles.md $K/scripts $K/tools; then fail=1; else echo 'なし'; fi
echo '== 4. 模擬'; T=$(mktemp -d)
# run <script> <case> <ok|ng> [体数]：体数を書いたときは、その数で動くことも見る
run() { echo "$2" > "$T/tc.json"; node dev/workflow-harness.mjs "$K/scripts/$1" "$T/tc.json" | "${PY[@]}" -c "import json,sys; d=json.load(sys.stdin); ok=d['ok']==('$3'=='ok') and ('${4:-}'=='' or d['agents']==int('${4:-0}')); print(('ok ' if ok else 'NG ')+'$1', d.get('error') or ('agents=%d'%d['agents'])+('（期待 ${4:-}）' if '${4:-}' else '')); sys.exit(0 if ok else 1)" || fail=1; }
run ideate.js '{"args":{"topic":"t","model":"m","lightModel":"s","background":"x","parts":["a","b"]}}' ok 12
run ideate.js '{"args":{"topic":"t","model":"m","lightModel":"s"},"ideasPerLens":8}' ok 18
run ideate.js '{"args":{"topic":"t","model":"m","lightModel":"s","lenses":["使う人の場面","逆にする","ほかから借りる","制約を一つ外す","極端にする","ほかの立場","組み合わせる"]}}' ng
run ideate.js '{"args":{"topic":"t","model":"m","lightModel":"s","doubt":false,"lenses":["使う人の場面","逆にする","ほかから借りる","制約を一つ外す","極端にする","ほかの立場","組み合わせる","時間をずらす"]},"ideasPerLens":8}' ok 16
run ideate.js '{"args":{"topic":"t","model":"m","lightModel":"s","lenses":["使う人の場面","逆にする","ほかから借りる"]}}' ok 7
run ideate.js '{"args":{"topic":"t","model":"m","lightModel":"s","round":2,"known":["R1-L1-1 案"],"lenses":["作らずに済ませる",{"key":"k","ask":"a","read":["map/constraints.md"]}]}}' ok
run ideate.js '{"args":{"topic":"t","model":"m"}}' ng
run ideate.js '{"args":{"topic":"t","model":"m","lightModel":"s","read":["map/constraints.md"]}}' ng
run ideate.js '{"args":{"topic":"t","model":"m","lightModel":"s","lenses":[{"key":"k","ask":"a","read":["map/constraints.md"]}]}}' ng
run survey.js '{"args":{"model":"m","topics":[{"key":"a","ask":"x","read":"/tmp/given.pdf"},{"key":"b","ask":"y","periphery":true}],"external":true,"externalScope":"公式だけ"}}' ok
run survey.js '{"args":{"model":"m","topics":[{"key":"a","ask":"x","periphery":true},{"key":"b","ask":"y","periphery":true}]}}' ng
run consult.js '{"args":{"topic":"t","model":"m","background":"x","blind":["別案"]}}' ok
# chk <script> <case> '<python の式>'：走りが ok で、式が真なら ok。式の中では d（出力の JSON）・out（返す値）・calls・
#   P(label)（指示文。showPrompts のとき）・S(label)（schema。showSchemas のとき）・M(label)（呼び出しの model）が使える
chk() { echo "$2" > "$T/tc.json"; node dev/workflow-harness.mjs "$K/scripts/$1" "$T/tc.json" > "$T/out.json"; printf '%s' "$3" > "$T/expr.txt"; "${PY[@]}" - "$T/out.json" "$T/expr.txt" "$1" <<'PY' || fail=1
import json,sys
d=json.load(open(sys.argv[1],encoding='utf-8')); e=open(sys.argv[2],encoding='utf-8').read()
out=d.get('out') or {}; calls=d.get('calls') or []; prompts=d.get('prompts') or []; schemas=d.get('schemas') or []
P=lambda label: [p for c,p in zip(calls,prompts) if c['label']==label][0]
S=lambda label: [x for c,x in zip(calls,schemas) if c['label']==label][0]
M=lambda label: [c['model'] for c in calls if c['label']==label][0]
try: ok=bool(d['ok'] and eval(e))
except Exception as x: ok=False; e+='　例外 '+repr(x)
print(('ok ' if ok else 'NG ')+sys.argv[3], (e[:90]+'…' if len(e)>90 else e) if ok else e+'　'+(d.get('error') or ''))
sys.exit(0 if ok else 1)
PY
}
I='"topic":"t","model":"m","lightModel":"s"'
# ideate.js：主担当の先出しの案（広げる 6 ＋ 照らす 4 ＋ 伸ばす 4。広げる相には見せない）
chk ideate.js '{"args":{'"$I"',"mainIdeas":[{"id":"R1-主-1","title":"主の案一","what":"何を","kind":"奇抜"},{"id":"R1-主-2","title":"主の案二","what":"何を","kind":"作らない","why":"主の筋道"}]},"showPrompts":true}' \
  "d['agents']==14 and out['counts']['main']=={'total':2,'unique':2} and out['counts']['raw']==26 and out['counts']['rawSpread']==24 and out['counts']['byLens']['主担当']==2 and out['asked']['mainIdeas']==['R1-主-1','R1-主-2'] and '主担当の案' in out['roles'] and all('主の案' not in P(c['label']) for c in calls if c['label'].startswith('広げる:')) and any('[R1-主-2] 主の案二' in P(c['label']) and '主担当の推し量り' in P(c['label']) for c in calls if c['label'].startswith('照らす:')) and [x['lens'] for x in out['ideas'] if x.get('main')]==['主担当','主担当']"
run ideate.js '{"args":{'"$I"',"mainIdeas":[{"id":"R2-主-1","title":"a","what":"b","kind":"奇抜"}]}}' ng
run ideate.js '{"args":{'"$I"',"mainIdeas":[{"id":"R1-主-1","title":"a","what":"b","kind":"奇抜"},{"id":"R1-主-1","title":"c","what":"d","kind":"奇抜"}]}}' ng
run ideate.js '{"args":{'"$I"',"mainIdeas":[{"id":"R1-主-1","what":"b","kind":"奇抜"}]}}' ng
run ideate.js '{"args":{'"$I"',"mainIdeas":[{"id":"R1-主-1","title":"a","what":"b","kind":"大きい"}]}}' ng
run ideate.js '{"args":{'"$I"',"mainIdeas":[{"id":"R1-主-1","title":"a","what":"b","kind":"奇抜","parts":["a"]}]}}' ng
run ideate.js '{"args":{'"$I"',"parts":["a"],"mainIdeas":[{"id":"R1-主-1","title":"a","what":"b","kind":"奇抜","parts":["z"]}]}}' ng
run ideate.js '{"args":{'"$I"',"only":["逆にする"],"mainIdeas":[{"id":"R1-主-1","title":"a","what":"b","kind":"奇抜"}]}}' ng
run ideate.js '{"args":{'"$I"',"known":["R1-主-1 a"],"mainIdeas":[{"id":"R1-主-1","title":"a","what":"b","kind":"奇抜"}]}}' ng
run ideate.js '{"args":{'"$I"',"mainIdeas":[{"id":"R1-主-01","title":"a","what":"b","kind":"奇抜"}]}}' ng
run ideate.js '{"args":{'"$I"',"mainIdeas":[{"id":"R1-主-0","title":"a","what":"b","kind":"奇抜"}]}}' ng
run ideate.js '{"args":{'"$I"',"parts":["a","b"],"mainIdeas":[{"id":"R1-主-1","title":"a","what":"b","kind":"奇抜","parts":["a","a"]}]}}' ng
# 広げる相が全部空なら、主担当の案の unique は数えない（total は数える）
chk ideate.js '{"args":{'"$I"',"mainIdeas":[{"id":"R1-主-1","title":"a","what":"b","kind":"奇抜"}]},"fail":["広げる:"]}' \
  "out['counts']['main']=={'total':1,'unique':None} and any('counts.main.unique は数えない' in l for l in d['logs'])"
# 広げた担当が答えに main を書いても、広げた案は main: false（fresh を数える）
chk ideate.js '{"args":{'"$I"',"round":2,"known":["R1-L1-1 案"]},"spreadExtra":{"main":true}}' \
  "isinstance(out['counts']['fresh'],int) and out['counts']['main'] is None and all(x['main'] is False for x in out['ideas'])"
# ideate.js：つなぐ一体（synth）
run ideate.js '{"args":{'"$I"',"synth":true}}' ok 13
run ideate.js '{"args":{'"$I"',"synth":true},"ideasPerLens":8}' ok 17
chk ideate.js '{"args":{'"$I"',"synth":true}}' \
  "M('つなぐ')=='m' and out['synth']['ideas'][0]['id']=='R1-X-1' and out['counts']['synth']==1 and out['synth']['gaps']==['空白'] and out['empty']['synth'] is False and out['asked']['synth'] is True and not any('-X-' in x['id'] for x in out['ideas'])"
chk ideate.js '{"args":{'"$I"',"synth":true},"fail":["広げる:"]}' "d['agents']==6 and out['synth'] is None and out['counts']['synth'] is None"
chk ideate.js '{"args":{'"$I"',"synth":true},"fail":["つなぐ"]}' "out['synth'] is None and out['empty']['synth'] is True"
# ideate.js：観点ごとのモデル（返す値・ログにはキーだけ）
chk ideate.js '{"args":{'"$I"',"lensModels":{"逆にする":"X"}}}' \
  "M('広げる:逆にする')=='X' and all(c['model']=='m' for c in calls if c['label'].startswith('広げる:') and c['label']!='広げる:逆にする') and M('照らす:塊1')=='s' and M('伸ばす・疑う:塊1')=='m' and out['asked']['lensModelKeys']==['逆にする'] and '\"X\"' not in json.dumps(out,ensure_ascii=False) and not any('X' in l for l in d['logs'])"
run ideate.js '{"args":{'"$I"',"lensModels":{"作らずに済ませる":"X"}}}' ng
run ideate.js '{"args":{'"$I"',"lensModels":{"逆にする":""}}}' ng
# ideate.js：観点の readOnly（共通の read を足さない）
chk ideate.js '{"args":{'"$I"',"read":["docs/common.md"],"lenses":["逆にする",{"key":"k","ask":"a","read":["docs/own.md"],"readOnly":true}]},"showPrompts":true}' \
  "'docs/common.md' not in P('広げる:k') and 'docs/own.md' in P('広げる:k') and 'docs/common.md' in P('広げる:逆にする') and [l['readOnly'] for l in out['asked']['lenses']]==[False,True]"
run ideate.js '{"args":{'"$I"',"lenses":["逆にする",{"key":"k","ask":"a","readOnly":true}]}}' ng
# ideate.js：deepen（選ばれた束の案を広げる相に見せる。fresh は数えない）
chk ideate.js '{"args":{'"$I"',"round":2,"known":["R1-L1-1 案","R1-L2-1 別"],"deepen":["R1-L1-1 案"]},"showPrompts":true}' \
  "out['counts']['fresh'] is None and out['asked']['deepen']==['R1-L1-1 案'] and '## 土台にする案' in P('広げる:逆にする') and '- R1-L1-1 案' in P('広げる:逆にする') and 'R1-L2-1 別' not in P('広げる:逆にする') and '前の周の案は、上に挙げた名前だけで見る' in P('広げる:逆にする')"
run ideate.js '{"args":{'"$I"',"known":["R1-L1-1 案"],"deepen":["R1-L1-1 案"]}}' ng
run ideate.js '{"args":{'"$I"',"round":2,"known":["R1-L1-1 案"],"deepen":["R1-L9-9 無い案"]}}' ng
run ideate.js '{"args":{'"$I"',"round":2,"known":["R1-L1-1 案"],"deepen":["R1-L1-1 案"],"knownToExpand":true}}' ng
run ideate.js '{"args":{'"$I"',"round":2,"known":["R1-L1-1 案"],"deepen":["R1-L1-1 案","R1-L1-1 案の別の書き方"]}}' ng
# known：同じ id で別の名前の二行
run ideate.js '{"args":{'"$I"',"round":2,"known":["R1-L1-1 案","R1-L1-1 別"]}}' ng
# 観点のオブジェクトの知らない名前
run ideate.js '{"args":{'"$I"',"lenses":["逆にする",{"key":"k","ask":"a","readonly":true}]}}' ng
# ideate.js：chain（広げる相を逐次に。体数は同じ）
run ideate.js '{"args":{'"$I"',"round":2,"known":["R1-L1-1 案"]}}' ok 12
run ideate.js '{"args":{'"$I"',"round":2,"known":["R1-L1-1 案"],"chain":true}}' ok 12
run ideate.js '{"args":{'"$I"',"chain":true}}' ng
run ideate.js '{"args":{'"$I"',"round":2,"chain":true,"only":["逆にする"]}}' ng
chk ideate.js '{"args":{'"$I"',"round":2,"lenses":["使う人の場面","逆にする"]}}' "d['maxActive']==2"
chk ideate.js '{"args":{'"$I"',"round":2,"lenses":["使う人の場面","逆にする"],"chain":true},"showPrompts":true}' \
  "d['maxActive']==1 and any('逐次' in l for l in d['logs']) and out['asked']['chain'] is True and '先の観点が出した案' not in P('広げる:使う人の場面') and '- 使う人の場面：使う人の場面の案1 — 使う人の場面 1' in P('広げる:逆にする') and 'この周の先の観点の案は、上に挙げた一覧だけで見る' in P('広げる:逆にする')"
chk ideate.js '{"args":{'"$I"',"round":2,"lenses":["使う人の場面","逆にする"],"chain":true},"throwFor":["広げる:使う人の場面"],"showPrompts":true}' \
  "out['empty']['spread']==['使う人の場面'] and out['counts']['rawSpread']==4 and '先の観点が出した案' not in P('広げる:逆にする')"
# chain：答えの ideas に null があっても落ちない
chk ideate.js '{"args":{'"$I"',"round":2,"lenses":["使う人の場面","逆にする"],"chain":true},"spreadNullIdea":true,"showPrompts":true}' \
  "out['asked']['chain'] is True and out['empty']['spread']==[] and '- 使う人の場面：使う人の場面の案1 — 使う人の場面 1' in P('広げる:逆にする')"
# ideate.js：fresh（広げる相が空だった観点があれば数えない）
chk ideate.js '{"args":{'"$I"',"round":2,"known":["R1-L1-1 案"]}}' "isinstance(out['counts']['fresh'],int)"
chk ideate.js '{"args":{'"$I"',"round":2,"known":["R1-L1-1 案"]},"fail":["広げる:"]}' "out['counts']['fresh'] is None and out['counts']['raw']==0"
chk ideate.js '{"args":{'"$I"',"round":2,"known":["R1-L1-1 案"]},"fail":["広げる:逆にする"]}' "out['counts']['fresh'] is None"
chk ideate.js '{"args":{'"$I"',"round":2,"known":["R1-L1-1 案"]},"ideasPerLens":0}' "d['agents']==6 and out['counts']['fresh'] is None and out['counts']['raw']==0"
# ideate.js：read に入れないもの（広げる相に見せない。sources/ の下だけ許す）
run ideate.js '{"args":{'"$I"',"read":["docs/wip/x/ideas/README.md"]}}' ng
run ideate.js '{"args":{'"$I"',"read":["HANDOFF.md"]}}' ng
run ideate.js '{"args":{'"$I"',"read":["docs/wip/x/ideas/notes.md"]}}' ng
run ideate.js '{"args":{'"$I"',"read":["raw-R1.json"]}}' ng
run ideate.js '{"args":{'"$I"',"read":["docs/ideas-inbox.md"]}}' ng
run ideate.js '{"args":{'"$I"',"read":["docs\\wip\\x\\ideas-y\\cards.md"]}}' ng
run ideate.js '{"args":{'"$I"',"lenses":[{"key":"k","ask":"a","read":["docs/wip/x/ideas/tries/try-a.md"]}]}}' ng
run ideate.js '{"args":{'"$I"',"read":["docs/wip/x/ideas/sources/a.md"]}}' ok
# 後ろの注を落とし、大文字と小文字を分けずに見る。ideas・tries・notes.md・cards.md は wip/ の下だけ。.. と wip のフォルダごとも止める
for r in 'docs/wip/x/ideas' 'docs/wip/x/ideas-ui' 'docs\\wip\\x\\ideas\\README.md' 'handoff.md' 'Docs/Wip/X/Ideas/README.md' 'docs/wip/x/map/notes.md（全部）' 'docs/ideas-inbox.md の上半分' 'docs/wip/' 'docs/wip/2026-10-01/' 'docs/wip/x/ideas/sources/../README.md'; do
  run ideate.js '{"args":{'"$I"',"read":["'"$r"'"]}}' ng
done
for r in 'docs/wip/x/ideas/sources/a.md' 'docs/wip/x/ideas/sources/' 'src/features/ideas/index.ts' 'lib/tries/trie.ts' 'docs/notes.md' 'docs/wip/x/map/README.md'; do
  chk ideate.js '{"args":{'"$I"',"read":["'"$r"'"]}}' "out['asked']['read']==['$r']"
done
# ideate.js：questions は三つまで・案は 12 まで・why・more・aside。伸ばす・疑う相に全部の案と照らした前提。HANDOFF.md を読む決まりはしない
chk ideate.js '{"args":{'"$I"'},"showPrompts":true,"showSchemas":true}' \
  "S('広げる:逆にする')['properties']['questions']['maxItems']==3 and S('広げる:逆にする')['properties']['ideas']['maxItems']==12 and 'why' in S('広げる:逆にする')['properties']['ideas']['items']['properties'] and out['more']==[] and out['asides']==[] and '## この周の全部の案（組み合わせ' in P('伸ばす・疑う:塊1') and '（奇抜）' in P('伸ばす・疑う:塊1') and '前提：前提' in P('伸ばす・疑う:塊1') and '筋道（広げた担当の推し量り。事実ではない）：筋道' in P('照らす:塊1') and all('HANDOFF.md を読む決まり' in P(c['label']) for c in calls if c['label'].startswith(('広げる:','照らす:')))"
# consult.js
chk consult.js '{"args":{"topic":"t","model":"m","form":"analysis","lenses":[{"key":"k","ask":"a"}]}}' "out['form']=='analysis' and out['answers'][0]['answer']['analysis']=='a'"
run consult.js '{"args":{"topic":"t","model":"m","form":"x"}}' ng
run consult.js '{"args":{"topic":"t","model":"m","blind":true}}' ng
run consult.js '{"args":{"topic":"t"}}' ng
run consult.js '{"args":{"topic":"t","model":"m","effort":"x"}}' ng
run consult.js '{"args":{"topic":"t","model":"m","lenses":[{"key":"k","ask":"a","blind":true}],"read":["HANDOFF.md §4"]}}' ng
chk consult.js '{"args":{"topic":"t","model":"m","lenses":[{"key":"k","ask":"a","blind":true},{"key":"j","ask":"b"}]},"showPrompts":true}' \
  "'HANDOFF' not in P('相談役:k').split('## 読むもの')[1].split('##')[0] and 'HANDOFF.md' in P('相談役:j').split('## 読むもの')[1].split('##')[0]"
run consult.js '{"args":{"topic":"t","model":"  "}}' ng
run consult.js '{"args":{"topic":" ","model":"m"}}' ng
run consult.js '{"args":{"topic":"t","model":"m","background":5}}' ng
chk consult.js '{"args":{"topic":"t","model":"m","form":"analysis","lenses":[{"key":"k","ask":"a","blind":true}]},"showPrompts":true}' \
  "'analysis は散文' in P('相談役:k') and 'claims だけ' in P('相談役:k') and 'alternatives' not in P('相談役:k')"
# survey.js
run survey.js '{"args":{"model":"m","topics":[{"key":"a/b","ask":"x"}]}}' ng
run survey.js '{"args":{"model":"m","scope":1,"topics":[{"key":"a","ask":"x"}]}}' ng
run survey.js '{"args":{"model":"  ","topics":[{"key":"a","ask":"x"}]}}' ng
chk survey.js '{"args":{"model":"m","topics":[{"key":"a","ask":"x"},{"key":"b","ask":"y"}]}}' "len(calls)==2 and all(c['agentType']=='general-purpose' for c in calls)"
# tools/ideas-table.mjs
TB=$K/tools/ideas-table.mjs
# tl <ok|ng> <説明> <引数...>：終了コードを見る（標準出力は $T/tl.out）
tl() { local want=$1 name=$2 got; shift 2; if node "$TB" "$@" > "$T/tl.out" 2> "$T/tl.err"; then got=ok; else got=ng; fi
  if [ "$got" = "$want" ]; then echo "ok ideas-table.mjs $name"; else echo "NG ideas-table.mjs $name（期待 $want）"; cat "$T/tl.err"; fail=1; fi; }
# tlchk <ファイル> <説明> '<python の式。s はファイルの中身>'
tlchk() { printf '%s' "$3" > "$T/expr.txt"; "${PY[@]}" - "$1" "$T/expr.txt" "$2" <<'PY' || fail=1
import json,sys
s=open(sys.argv[1],encoding='utf-8').read(); e=open(sys.argv[2],encoding='utf-8').read()
try: ok=bool(eval(e))
except Exception as x: ok=False; e+='　例外 '+repr(x)
print(('ok ' if ok else 'NG ')+'ideas-table.mjs '+sys.argv[3], '' if ok else e+'\n'+s)
sys.exit(0 if ok else 1)
PY
}
cat > "$T/wf-out.json" <<'JSON'
{"model":"m","runId":"r","result":{"round":1,"ideas":[{"id":"R1-L1-1","title":"案|一","what":"何を\n二行","lens":"使う人の場面","kind":"奇抜","parts":["a","b"]},{"id":"R1-主-1","title":"主の案","what":"何を","lens":"主担当","kind":"作らない","parts":[],"main":true}]}}
JSON
echo '{"result":"{\"round\":2,\"ideas\":[]}"}' > "$T/wf-str.json"
tl ok 'extract' extract "$T/wf-out.json" "$T/raw-R1.json"
tlchk "$T/raw-R1.json" 'extract は result だけを整形して書く' 'json.loads(s)["round"]==1 and "model" not in s and s.startswith("{\n  \"round\"") and s.endswith("}\n")'
tl ng 'extract は上書きしない' extract "$T/wf-out.json" "$T/raw-R1.json"
tl ok 'extract --force' extract "$T/wf-out.json" "$T/raw-R1.json" --force
tl ok 'extract（result が文字列）' extract "$T/wf-str.json" "$T/raw-R2.json"
tlchk "$T/raw-R2.json" 'result の文字列を JSON として読み直す' 'json.loads(s)=={"round":2,"ideas":[]}'
tl ng 'extract（result が無い）' extract "$T/raw-R1.json" "$T/raw-x.json"
tl ok 'table' table "$T/raw-R1.json" --run abc
tlchk "$T/tl.out" 'table の行' 'len(s.splitlines())==2 and s.splitlines()[0]=="| R1-L1-1 | 案\\|一 | 何を 二行 | 使う人の場面 | 奇抜 | a・b | R1・abc |" and s.splitlines()[1].endswith("| 主担当 | 作らない |  | 主担当 |")'
tl ok 'known' known "$T/raw-R1.json" "$T/raw-R2.json"
tlchk "$T/tl.out" 'known の形' 'json.loads(s)==["R1-L1-1 案|一","R1-主-1 主の案"]'
tl ng 'known（同じ id）' known "$T/raw-R1.json" "$T/raw-R1.json"
tl ng '引数が足りない' table
tl ng '知らないコマンド' foo
tl ok '--help' --help
# ideas に null がある raw・result が 0・--run が空（スタックトレースを出さずに失敗する）
cat > "$T/raw-null.json" <<'JSON'
{"round":1,"ideas":[{"id":"R1-L1-1","title":"a","what":"b","lens":"l","kind":"奇抜"},null]}
JSON
tl ng 'table（ideas に null）' table "$T/raw-null.json"
tlchk "$T/tl.err" 'table（ideas に null）のメッセージ' '"2 番目に id が無い" in s and "    at " not in s'
tl ng 'known（ideas に null）' known "$T/raw-null.json"
tlchk "$T/tl.err" 'known（ideas に null）のメッセージ' '"2 番目に id が無い" in s and "    at " not in s'
echo '{"result":0}' > "$T/wf-zero.json"
tl ng 'extract（result が 0）' extract "$T/wf-zero.json" "$T/raw-zero.json"
tlchk "$T/tl.err" 'extract（result が 0）のメッセージ' '"result がオブジェクトでない" in s and "    at " not in s'
tl ng 'table --run 空' table "$T/raw-R1.json" --run ''
tlchk "$T/tl.err" 'table --run 空のメッセージ' '"--run には run ID が要る" in s'
rm -rf "$T"
echo '== 5. プラグインの形'; "${PY[@]}" - "$K" <<'PY' || fail=1
import json,re,glob,os,sys
K=sys.argv[1]
p=json.load(open('.claude-plugin/plugin.json',encoding='utf-8'))
bad=[]
w=p.get('workflows')
if not w or not os.path.isdir(w): bad.append(f'plugin.json の workflows が無いか、フォルダが無い：{w}')
m=re.search(r'プラグインの版：([0-9.]+)',open('README.md',encoding='utf-8').read())
if not m or m.group(1)!=p.get('version'): bad.append(f'README の版 {m and m.group(1)} と plugin.json の版 {p.get("version")} が違う')
names={}
for f in sorted(glob.glob(f'{K}/scripts/*.js')):
    n=re.search(r"^export const meta = \{\s*name: '([^']+)'",open(f,encoding='utf-8').read(),re.M)
    stem=os.path.basename(f)[:-3]
    if not n or n.group(1)!=stem: bad.append(f'{f} の meta.name がファイル名と違う（/{p["name"]}:{stem} で呼べなくなる）')
    names[stem]=f
print('版', p.get('version'), '・workflows', w, '・', ' '.join(f'/{p["name"]}:{s}' for s in names))
print('問題：', bad or 'なし'); sys.exit(1 if bad else 0)
PY
if command -v claude >/dev/null 2>&1; then
  for x in .claude-plugin/plugin.json .; do claude plugin validate "$x" 2>&1 | tail -1 | grep -q 'Validation passed' && echo "ok claude plugin validate $x" || { echo "NG claude plugin validate $x"; fail=1; }; done
else echo 'claude が無いので claude plugin validate は飛ばす'; fi
echo; [ $fail = 0 ] && echo '全部とおった' || { echo 'とおらないものがある'; exit 1; }
