#!/usr/bin/env bash
# FROZEN DHARMA static preview server.
# Serves the built static directory in the foreground on PORT (default 3000)
# and records the deployment output for the controller.
set -euo pipefail
cd "$(dirname "$0")"
export PORT="${PORT:-3000}"
export PROJECT_ROOT="$(pwd)"
export BUILD_DIR="${BUILD_DIR:-$PROJECT_ROOT/dist}"
export WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
if /usr/bin/time -p test -f "$PROJECT_ROOT/package.json"; then
  /usr/bin/time -p npm install --no-audit --no-fund
  /usr/bin/time -p npm run build --if-present
fi
/usr/bin/time -p test -f "$BUILD_DIR/index.html"
/usr/bin/time -p mkdir -p "$WEB_DIR"
/usr/bin/time -p python3 -c "import json,os; open(os.path.join(os.environ['WEB_DIR'],'deployment-output.json'),'w').write(json.dumps({'project':os.environ['PROJECT_ROOT'],'directory':os.environ['BUILD_DIR']}))"
/usr/bin/time -p python3 -m http.server "$PORT" --directory "$BUILD_DIR" --bind 0.0.0.0
