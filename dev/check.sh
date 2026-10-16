#!/usr/bin/env bash
# 運用の型（operating-kit）の確かめ。リポジトリ直下で `bash dev/check.sh`。
# 1) スクリプトの構文  2) ひな形の 〈〉 が placeholders.md の表にあるか  3) モデル名が型の文書・スクリプトに無いか  4) 模擬の agent() で ideate.js・survey.js・consult.js を動かす  5) プラグインの形（版・workflows 欄・meta.name。claude があれば claude plugin validate）
set -u
K=skills/operating-kit
fail=0
echo '== 1. 構文'; for f in $K/scripts/*.js; do node --check "$f" || fail=1; done
echo '== 2. 〈〉'; python3 - "$K" <<'PY' || fail=1
import re,glob,sys
K=sys.argv[1]
tab=set(re.findall(r'^\| (〈[^〉]*〉)',open(f'{K}/references/placeholders.md',encoding='utf-8').read(),re.M))
bad=set()
for f in glob.glob(f'{K}/assets/*.md')+[f'{K}/references/prompts.md',f'{K}/references/principles.md']+glob.glob(f'{K}/scripts/*.js'):
    for m in re.findall(r'〈[^〉]*〉',open(f,encoding='utf-8').read()):
        if m not in tab and m!='〈〉': bad.add((m,f))
print('表に無い 〈〉:', sorted(bad) or 'なし'); sys.exit(1 if bad else 0)
PY
echo '== 3. モデル名'; if grep -rn -i 'opus\|sonnet\|haiku\|fable' $K/assets $K/references/prompts.md $K/references/principles.md $K/scripts; then fail=1; else echo 'なし'; fi
echo '== 4. 模擬'; T=$(mktemp -d)
run() { echo "$2" > "$T/tc.json"; node dev/workflow-harness.mjs "$K/scripts/$1" "$T/tc.json" | python3 -c "import json,sys; d=json.load(sys.stdin); ok=d['ok']==('$3'=='ok'); print(('ok ' if ok else 'NG ')+'$1', d.get('error') or ('agents=%d'%d['agents'])); sys.exit(0 if ok else 1)" || fail=1; }
run ideate.js '{"args":{"topic":"t","model":"m","lightModel":"s","background":"x","parts":["a","b"]}}' ok
run ideate.js '{"args":{"topic":"t","model":"m","lightModel":"s","round":2,"known":["R1-L1-1 案"],"lenses":["作らずに済ませる",{"key":"k","ask":"a","read":["map/constraints.md"]}]}}' ok
run ideate.js '{"args":{"topic":"t","model":"m"}}' ng
run ideate.js '{"args":{"topic":"t","model":"m","lightModel":"s","read":["map/constraints.md"]}}' ng
run ideate.js '{"args":{"topic":"t","model":"m","lightModel":"s","lenses":[{"key":"k","ask":"a","read":["map/constraints.md"]}]}}' ng
run survey.js '{"args":{"model":"m","topics":[{"key":"a","ask":"x","read":"/tmp/given.pdf"},{"key":"b","ask":"y","periphery":true}],"external":true,"externalScope":"公式だけ"}}' ok
run survey.js '{"args":{"model":"m","topics":[{"key":"a","ask":"x","periphery":true},{"key":"b","ask":"y","periphery":true}]}}' ng
run consult.js '{"args":{"topic":"t","model":"m","background":"x","blind":["別案"]}}' ok
rm -rf "$T"
echo '== 5. プラグインの形'; python3 - "$K" <<'PY' || fail=1
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
