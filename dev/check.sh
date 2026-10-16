#!/usr/bin/env bash
# 運用の型（operating-kit）の確かめ。リポジトリ直下で `bash dev/check.sh`。
# 1) スクリプトの構文  2) ひな形の 〈〉 が placeholders.md の表にあるか  3) モデル名が型の文書・スクリプトに無いか  4) 模擬の agent() で ideate.js・survey.js・consult.js を動かす
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
echo; [ $fail = 0 ] && echo '全部とおった' || { echo 'とおらないものがある'; exit 1; }
