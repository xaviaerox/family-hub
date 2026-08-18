const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");

function checkVersionConsistency() {
  let hasError = false;

  // 1. Canonical source: package.json
  const pkgPath = path.join(rootDir, "package.json");
  if (!fs.existsSync(pkgPath)) {
    console.error("❌ ERROR: package.json no existe.");
    process.exit(1);
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const canonicalVersion = pkg.version;
  console.log(`📌 Versión canónica (package.json): v${canonicalVersion}`);

  // 2. Secondary source: PROJECT_CONTEXT.md
  const ctxPath = path.join(rootDir, "PROJECT_CONTEXT.md");
  if (fs.existsSync(ctxPath)) {
    const ctxContent = fs.readFileSync(ctxPath, "utf8");
    const match = ctxContent.match(/-\s+\*\*Versión actual\*\*:\s*([0-9]+\.[0-9]+\.[0-9]+)/i);
    if (match) {
      const ctxVersion = match[1];
      if (ctxVersion !== canonicalVersion) {
        console.error(
          `❌ ERROR DE INTEGRIDAD DE VERSIONADO: PROJECT_CONTEXT.md (v${ctxVersion}) != package.json (v${canonicalVersion})`
        );
        hasError = true;
      } else {
        console.log(`✓ PROJECT_CONTEXT.md sincronizado (v${ctxVersion})`);
      }
    } else {
      console.warn('⚠️ ADVERTENCIA: No se encontró "- **Versión actual**:" en PROJECT_CONTEXT.md');
    }
  }

  // 3. Secondary source: CHANGELOG.md
  const changelogPath = path.join(rootDir, "CHANGELOG.md");
  if (fs.existsSync(changelogPath)) {
    const changelogContent = fs.readFileSync(changelogPath, "utf8");
    const match = changelogContent.match(/##\s+\[([0-9]+\.[0-9]+\.[0-9]+)\]/);
    if (match) {
      const changelogVersion = match[1];
      if (changelogVersion !== canonicalVersion) {
        console.error(
          `❌ ERROR DE INTEGRIDAD DE VERSIONADO: CHANGELOG.md última versión (v${changelogVersion}) != package.json (v${canonicalVersion})`
        );
        hasError = true;
      } else {
        console.log(`✓ CHANGELOG.md sincronizado (v${changelogVersion})`);
      }
    } else {
      console.warn("⚠️ ADVERTENCIA: No se encontraron entradas de versión SemVer en CHANGELOG.md");
    }
  }

  if (hasError) {
    console.error("\n💥 COMPROBACIÓN DE CONSISTENCIA FALLIDA. Corrige las inconsistencias antes de continuar.");
    process.exit(1);
  } else {
    console.log("\n✅ TODAS LAS FUENTES DE VERSIÓN ESTÁN SINCRONIZADAS Y VERIFICADAS.");
  }
}

checkVersionConsistency();
