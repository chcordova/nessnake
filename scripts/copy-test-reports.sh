#!/bin/bash
# Copia los reportes de tests E2E y personalizados a public/

set -e

# Copiar el reporte original de Playwright si existe
if [ -f "playwright-report/index.html" ]; then
  cp playwright-report/index.html public/playwright-report.html
fi

# Copiar el reporte personalizado si existe
if [ -f "tests/test-report.html" ]; then
  cp tests/test-report.html public/test-report.html
fi

chmod +x /workspaces/nessnake/scripts/copy-test-reports.sh
