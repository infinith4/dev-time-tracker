#!/usr/bin/env bash
set -euo pipefail

npm config set prefix "$HOME/.npm-global"
npm install -g eslint prettier @openai/codex
pip install --user ruff black
dotnet tool install -g dotnet-format

mkdir -p "$HOME/bin"

latest_all_deps_url=$(
  curl -fsSL https://api.github.com/repos/google/google-java-format/releases/latest |
    grep -o 'https://[^"]*all-deps\.jar' |
    head -1
)

curl -fsSL -L "$latest_all_deps_url" -o "$HOME/bin/google-java-format.jar"

printf '#!/usr/bin/env bash\nexec java -jar "%s" "$@"\n' "$HOME/bin/google-java-format.jar" >"$HOME/bin/google-java-format"
chmod +x "$HOME/bin/google-java-format"

echo 'export PATH="$PATH:$HOME/.npm-global/bin:$HOME/.local/bin:$HOME/.dotnet/tools:$HOME/bin"' >>"$HOME/.bashrc"
