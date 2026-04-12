#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20
npx -y create-next-app@latest ../vollu-tmp --ts --tailwind --eslint --app --src-dir --import-alias '@/*' --use-npm
cp -R ../vollu-tmp/* .
cp -R ../vollu-tmp/.* . 2>/dev/null || true
rm -rf ../vollu-tmp
