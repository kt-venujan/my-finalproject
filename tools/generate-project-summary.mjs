import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const BACKEND_DIR = path.join(ROOT, "Backend");
const FRONTEND_DIR = path.join(ROOT, "frontend");
const OUTPUT_MD = path.join(ROOT, "PROJECT_SUMMARY.md");
const OUTPUT_PDF = path.join(ROOT, "PROJECT_SUMMARY.pdf");

const SOURCE_EXTS = new Set([".js", ".ts", ".tsx", ".mjs", ".cjs"]);

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function listFilesRecursive(dir, filterFn = () => true) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const stack = [dir];
  const ignoredDirs = new Set(["node_modules", ".git", ".next", "dist", "build", "coverage", "out"]);
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      if (ignoredDirs.has(entry.name) || entry.name.startsWith(".")) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (filterFn(full)) {
        out.push(full);
      }
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function relative(p) {
  return path.relative(ROOT, p).replace(/\\/g, "/");
}

function uniqueSorted(arr) {
  return [...new Set(arr)].sort((a, b) => a.localeCompare(b));
}

function parseServerRouteMounts(serverJsPath) {
  const text = safeRead(serverJsPath);
  const importMap = new Map();
  const mounts = new Map();

  const importRegex = /import\s+([A-Za-z_$][\w$]*)\s+from\s+["']\.\/routes\/([^"']+)["'];/g;
  let m;
  while ((m = importRegex.exec(text))) {
    importMap.set(m[1], `Backend/routes/${m[2].replace(/\.js$/, "")}.js`);
  }

  const useRegex = /app\.use\(\s*["']([^"']+)["']\s*,\s*([A-Za-z_$][\w$]*)\s*\)/g;
  while ((m = useRegex.exec(text))) {
    const prefix = m[1];
    const variable = m[2];
    const routeFile = importMap.get(variable);
    if (routeFile) mounts.set(routeFile, prefix);
  }

  return mounts;
}

function splitTopLevelArgs(argText) {
  const args = [];
  let current = "";
  let depthParen = 0;
  let depthBrace = 0;
  let depthBracket = 0;
  let inString = false;
  let stringChar = "";
  let escaped = false;

  for (let i = 0; i < argText.length; i += 1) {
    const ch = argText[i];

    if (inString) {
      current += ch;
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === stringChar) {
        inString = false;
        stringChar = "";
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      inString = true;
      stringChar = ch;
      current += ch;
      continue;
    }

    if (ch === "(") depthParen += 1;
    if (ch === ")") depthParen -= 1;
    if (ch === "{") depthBrace += 1;
    if (ch === "}") depthBrace -= 1;
    if (ch === "[") depthBracket += 1;
    if (ch === "]") depthBracket -= 1;

    if (ch === "," && depthParen === 0 && depthBrace === 0 && depthBracket === 0) {
      if (current.trim()) args.push(current.trim());
      current = "";
      continue;
    }

    current += ch;
  }

  if (current.trim()) args.push(current.trim());
  return args;
}

function extractIdentifier(expr) {
  const trimmed = expr.trim();
  if (!trimmed) return "";

  if (/^(async\s+)?\(?.*=>/.test(trimmed) || /^function\b/.test(trimmed)) {
    return "<inline-handler>";
  }

  const direct = trimmed.match(/^([A-Za-z_$][\w$]*)$/);
  if (direct) return direct[1];

  const call = trimmed.match(/^([A-Za-z_$][\w$]*)\s*\(/);
  if (call) return call[1];

  const member = trimmed.match(/^([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+)$/);
  if (member) return member[1];

  return trimmed.slice(0, 80);
}

function extractRouterEndpoints(routeFilePath, routePrefix) {
  const text = safeRead(routeFilePath);
  const endpoints = [];

  const directRegex = /router\.(get|post|put|patch|delete)\s*\(\s*(["'`])([^"'`]+)\2\s*,([\s\S]*?)\);/g;
  let m;
  while ((m = directRegex.exec(text))) {
    const method = m[1].toUpperCase();
    const routePath = m[3];
    const args = splitTopLevelArgs(m[4]);
    const handlerExpr = args.length ? args[args.length - 1] : "";
    const middlewareExprs = args.slice(0, -1);

    endpoints.push({
      method,
      routePath,
      fullPath: buildFullPath(routePrefix, routePath),
      middlewares: middlewareExprs.map(extractIdentifier).filter(Boolean),
      handler: extractIdentifier(handlerExpr),
    });
  }

  const routeChainRegex = /router\.route\(\s*(["'`])([^"'`]+)\1\s*\)([\s\S]*?);/g;
  while ((m = routeChainRegex.exec(text))) {
    const routePath = m[2];
    const chain = m[3];
    const callRegex = /\.(get|post|put|patch|delete)\s*\(([^)]*)\)/g;
    let call;
    while ((call = callRegex.exec(chain))) {
      const method = call[1].toUpperCase();
      const args = splitTopLevelArgs(call[2]);
      const handlerExpr = args.length ? args[args.length - 1] : "";
      const middlewareExprs = args.slice(0, -1);
      endpoints.push({
        method,
        routePath,
        fullPath: buildFullPath(routePrefix, routePath),
        middlewares: middlewareExprs.map(extractIdentifier).filter(Boolean),
        handler: extractIdentifier(handlerExpr),
      });
    }
  }

  return endpoints;
}

function buildFullPath(prefix, routePath) {
  if (!prefix) return routePath;
  if (routePath === "/") return prefix;
  if (prefix.endsWith("/") && routePath.startsWith("/")) return prefix + routePath.slice(1);
  if (!prefix.endsWith("/") && !routePath.startsWith("/")) return `${prefix}/${routePath}`;
  return `${prefix}${routePath}`;
}

function extractExportedFunctions(filePath) {
  const text = safeRead(filePath);
  const names = [];

  const regexes = [
    /export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(/g,
    /export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?[A-Za-z_$][\w$]*\s*=>/g,
    /export\s+async\s+function\s+([A-Za-z_$][\w$]*)\s*\(/g,
    /export\s+function\s+([A-Za-z_$][\w$]*)\s*\(/g,
    /export\s+default\s+function\s+([A-Za-z_$][\w$]*)\s*\(/g,
  ];

  for (const re of regexes) {
    let m;
    while ((m = re.exec(text))) names.push(m[1]);
  }

  const exportListRegex = /export\s*\{([^}]+)\}/g;
  let m;
  while ((m = exportListRegex.exec(text))) {
    const parts = m[1].split(",").map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      const asMatch = part.match(/^([A-Za-z_$][\w$]*)(\s+as\s+[A-Za-z_$][\w$]*)?$/);
      if (asMatch) names.push(asMatch[1]);
    }
  }

  return uniqueSorted(names);
}

function extractAllFunctionLikeNames(filePath) {
  const text = safeRead(filePath);
  const names = [];

  const regexes = [
    /export\s+default\s+function\s+([A-Za-z_$][\w$]*)\s*\(/g,
    /export\s+function\s+([A-Za-z_$][\w$]*)\s*\(/g,
    /export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(/g,
    /const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g,
    /function\s+([A-Za-z_$][\w$]*)\s*\(/g,
  ];

  for (const re of regexes) {
    let m;
    while ((m = re.exec(text))) names.push(m[1]);
  }

  return uniqueSorted(names);
}

function extractModelName(filePath) {
  const text = safeRead(filePath);
  const modelMatch = text.match(/mongoose\.model\(\s*["']([^"']+)["']/);
  return modelMatch ? modelMatch[1] : path.basename(filePath, ".js");
}

function extractSchemaTopLevelFields(filePath) {
  const text = safeRead(filePath);
  const start = text.indexOf("new mongoose.Schema(");
  if (start < 0) return [];

  const firstBrace = text.indexOf("{", start);
  if (firstBrace < 0) return [];

  let depth = 0;
  let inString = false;
  let stringChar = "";
  let escaped = false;
  let endBrace = -1;

  for (let i = firstBrace; i < text.length; i += 1) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === stringChar) {
        inString = false;
        stringChar = "";
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      inString = true;
      stringChar = ch;
      continue;
    }

    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        endBrace = i;
        break;
      }
    }
  }

  if (endBrace < 0) return [];

  const schemaObject = text.slice(firstBrace + 1, endBrace);
  const fields = [];
  let localDepth = 0;
  let token = "";
  let lineStart = true;
  let readingKey = false;

  for (let i = 0; i < schemaObject.length; i += 1) {
    const ch = schemaObject[i];

    if (ch === "{") localDepth += 1;
    if (ch === "}") localDepth -= 1;

    if (ch === "\n") {
      lineStart = true;
      token = "";
      readingKey = false;
      continue;
    }

    if (lineStart && localDepth === 0 && /[A-Za-z_$]/.test(ch)) {
      readingKey = true;
      token = ch;
      lineStart = false;
      continue;
    }

    if (readingKey) {
      if (/[A-Za-z0-9_$]/.test(ch)) {
        token += ch;
      } else if (ch === ":") {
        if (token) fields.push(token);
        readingKey = false;
      } else if (!/\s/.test(ch)) {
        readingKey = false;
      }
    }

    if (!/\s/.test(ch)) lineStart = false;
  }

  return uniqueSorted(fields);
}

function convertAppPathToRoute(appPagePath) {
  const rel = relative(appPagePath);
  const prefix = "frontend/app";
  let routePart = rel.slice(prefix.length);
  routePart = routePart.replace(/\\/g, "/");
  routePart = routePart.replace(/\/page\.tsx$/, "");
  if (!routePart) return "/";
  return routePart;
}

function groupByFirstSegment(filePaths, baseDirName) {
  const map = new Map();
  for (const abs of filePaths) {
    const rel = relative(abs);
    const parts = rel.split("/");
    const idx = parts.indexOf(baseDirName);
    const key = idx >= 0 && parts[idx + 1] ? parts[idx + 1] : "(root)";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(rel);
  }
  for (const [k, v] of map) {
    map.set(k, v.sort((a, b) => a.localeCompare(b)));
  }
  return new Map([...map.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

function buildMarkdownReport(data) {
  const lines = [];
  const now = new Date().toISOString();

  lines.push("# SmartDiet Project Full Technical Summary");
  lines.push("");
  lines.push(`Generated at: ${now}`);
  lines.push("");

  lines.push("## 1. Project Snapshot");
  lines.push("");
  lines.push(`- Workspace root: ${data.root}`);
  lines.push(`- Backend path: Backend`);
  lines.push(`- Frontend path: frontend`);
  lines.push(`- Backend source files analyzed: ${data.backendSourceFiles.length}`);
  lines.push(`- Frontend source files analyzed: ${data.frontendSourceFiles.length}`);
  lines.push(`- Backend API endpoints discovered: ${data.apiEndpoints.length}`);
  lines.push(`- Backend models discovered: ${data.models.length}`);
  lines.push(`- Backend controllers discovered: ${data.controllerFunctions.length}`);
  lines.push(`- Frontend app routes discovered: ${data.frontendRoutes.length}`);
  lines.push("");

  lines.push("## 2. Dependencies and Runtime");
  lines.push("");

  function addPkg(title, pkg) {
    if (!pkg) return;
    lines.push(`### ${title}`);
    lines.push("");
    lines.push(`- Name: ${pkg.name || "(unknown)"}`);
    lines.push(`- Version: ${pkg.version || "(unknown)"}`);
    lines.push(`- Type: ${pkg.type || "(not specified)"}`);
    const scripts = pkg.scripts ? Object.keys(pkg.scripts) : [];
    lines.push(`- Scripts (${scripts.length}): ${scripts.join(", ") || "none"}`);
    const deps = pkg.dependencies ? Object.keys(pkg.dependencies) : [];
    const devDeps = pkg.devDependencies ? Object.keys(pkg.devDependencies) : [];
    lines.push(`- Dependencies (${deps.length}): ${deps.join(", ") || "none"}`);
    lines.push(`- Dev Dependencies (${devDeps.length}): ${devDeps.join(", ") || "none"}`);
    lines.push("");
  }

  addPkg("Backend Package (Backend/package.json)", data.backendPackage);
  addPkg("Frontend Package (frontend/package.json)", data.frontendPackage);
  addPkg("Root Package (package.json)", data.rootPackage);

  lines.push("## 3. Backend API Inventory");
  lines.push("");
  lines.push("### Endpoint Table");
  lines.push("");
  lines.push("| Method | Full Path | Route File | Handler | Middlewares |",);
  lines.push("|---|---|---|---|---|");
  for (const ep of data.apiEndpoints) {
    lines.push(`| ${ep.method} | ${ep.fullPath} | ${ep.routeFile} | ${ep.handler || "(unknown)"} | ${(ep.middlewares && ep.middlewares.length ? ep.middlewares.join(", ") : "none")} |`);
  }
  lines.push("");

  lines.push("### Endpoints Grouped by Route Module");
  lines.push("");
  for (const [routeFile, eps] of data.endpointsByRouteFile) {
    lines.push(`#### ${routeFile}`);
    lines.push("");
    for (const ep of eps) {
      lines.push(`- ${ep.method} ${ep.fullPath} -> ${ep.handler || "(unknown)"}`);
    }
    lines.push("");
  }

  lines.push("## 4. Backend Function Inventory");
  lines.push("");
  lines.push("### Controllers (Exported Functions)");
  lines.push("");
  for (const item of data.controllerFunctions) {
    lines.push(`- ${item.file}: ${item.functions.length ? item.functions.join(", ") : "(no exported functions detected)"}`);
  }
  lines.push("");

  lines.push("### Middlewares (Exported Functions)");
  lines.push("");
  for (const item of data.middlewareFunctions) {
    lines.push(`- ${item.file}: ${item.functions.length ? item.functions.join(", ") : "(no exported functions detected)"}`);
  }
  lines.push("");

  lines.push("### Services and Utils (Exported Functions)");
  lines.push("");
  for (const item of data.serviceAndUtilFunctions) {
    lines.push(`- ${item.file}: ${item.functions.length ? item.functions.join(", ") : "(no exported functions detected)"}`);
  }
  lines.push("");

  lines.push("## 5. Database Models (Mongoose)");
  lines.push("");
  for (const model of data.models) {
    lines.push(`### ${model.modelName} (${model.file})`);
    lines.push("");
    lines.push(`- Top-level schema fields (${model.fields.length}): ${model.fields.join(", ") || "(not detected)"}`);
    lines.push("");
  }

  lines.push("## 6. Frontend Route and UI Inventory");
  lines.push("");
  lines.push("### App Router Pages (frontend/app/**/page.tsx)");
  lines.push("");
  for (const route of data.frontendRoutes) {
    lines.push(`- ${route.routePath} (${route.file})`);
  }
  lines.push("");

  lines.push("### Shared Components (frontend/components)");
  lines.push("");
  for (const comp of data.frontendComponents) {
    lines.push(`- ${comp}`);
  }
  lines.push("");

  lines.push("### Context / Lib / Types Files");
  lines.push("");
  for (const f of data.frontendSupportFiles) {
    lines.push(`- ${f}`);
  }
  lines.push("");

  lines.push("## 7. Function Index (All Source Files)");
  lines.push("");
  for (const group of data.functionIndexGroups) {
    lines.push(`### ${group.groupName}`);
    lines.push("");
    for (const item of group.items) {
      lines.push(`- ${item.file}: ${item.functions.length ? item.functions.join(", ") : "(none detected)"}`);
    }
    lines.push("");
  }

  lines.push("## 8. Project Structure Summary");
  lines.push("");
  lines.push("### Backend High-Level Modules");
  lines.push("");
  for (const [moduleName, files] of data.backendGrouped) {
    lines.push(`- ${moduleName} (${files.length} files)`);
  }
  lines.push("");

  lines.push("### Frontend High-Level Modules");
  lines.push("");
  for (const [moduleName, files] of data.frontendGrouped) {
    lines.push(`- ${moduleName} (${files.length} files)`);
  }
  lines.push("");

  lines.push("## 9. Notes");
  lines.push("");
  lines.push("- This summary is generated by static analysis and regex parsing.");
  lines.push("- If route/function declarations use unusual dynamic patterns, some entries may appear as unknown or inline handlers.");
  lines.push("- PDF is generated from this markdown snapshot.");
  lines.push("");

  return lines.join("\n");
}

async function renderPdfFromMarkdown(markdownText, outputPdfPath) {
  let PDFDocument;
  try {
    PDFDocument = (await import("pdfkit")).default;
  } catch (err) {
    throw new Error("pdfkit package is required to create PDF. Install with npm i --no-save --no-package-lock pdfkit");
  }

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const stream = fs.createWriteStream(outputPdfPath);
  doc.pipe(stream);

  const lines = markdownText.split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith("# ")) {
      doc.font("Helvetica-Bold").fontSize(18).text(line.slice(2));
      doc.moveDown(0.4);
      continue;
    }
    if (line.startsWith("## ")) {
      doc.moveDown(0.2);
      doc.font("Helvetica-Bold").fontSize(14).text(line.slice(3));
      doc.moveDown(0.2);
      continue;
    }
    if (line.startsWith("### ")) {
      doc.font("Helvetica-Bold").fontSize(12).text(line.slice(4));
      continue;
    }
    if (line.startsWith("|")) {
      doc.font("Courier").fontSize(8).text(line, { lineGap: 1 });
      continue;
    }
    if (line.startsWith("- ")) {
      doc.font("Helvetica").fontSize(10).text(line, { indent: 10 });
      continue;
    }
    doc.font("Helvetica").fontSize(10).text(line);
  }

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

async function main() {
  const backendPackage = readJson(path.join(BACKEND_DIR, "package.json"));
  const frontendPackage = readJson(path.join(FRONTEND_DIR, "package.json"));
  const rootPackage = readJson(path.join(ROOT, "package.json"));

  const backendSourceFiles = listFilesRecursive(BACKEND_DIR, (f) => SOURCE_EXTS.has(path.extname(f)));
  const frontendSourceFiles = listFilesRecursive(FRONTEND_DIR, (f) => SOURCE_EXTS.has(path.extname(f)));

  const routeMounts = parseServerRouteMounts(path.join(BACKEND_DIR, "server.js"));
  const routeFiles = listFilesRecursive(path.join(BACKEND_DIR, "routes"), (f) => f.endsWith(".js"));

  const apiEndpoints = [];
  for (const routeFile of routeFiles) {
    const rel = relative(routeFile);
    const prefix = routeMounts.get(rel) || "";
    const endpoints = extractRouterEndpoints(routeFile, prefix).map((ep) => ({
      ...ep,
      routeFile: rel,
    }));
    apiEndpoints.push(...endpoints);
  }

  apiEndpoints.sort((a, b) => {
    const p = a.fullPath.localeCompare(b.fullPath);
    if (p !== 0) return p;
    return a.method.localeCompare(b.method);
  });

  const endpointsByRouteMap = new Map();
  for (const ep of apiEndpoints) {
    if (!endpointsByRouteMap.has(ep.routeFile)) endpointsByRouteMap.set(ep.routeFile, []);
    endpointsByRouteMap.get(ep.routeFile).push(ep);
  }
  const endpointsByRouteFile = new Map([...endpointsByRouteMap.entries()].sort((a, b) => a[0].localeCompare(b[0])));

  const controllerFiles = listFilesRecursive(path.join(BACKEND_DIR, "controllers"), (f) => f.endsWith(".js"));
  const controllerFunctions = controllerFiles.map((f) => ({
    file: relative(f),
    functions: extractExportedFunctions(f),
  }));

  const middlewareFiles = listFilesRecursive(path.join(BACKEND_DIR, "middlewares"), (f) => f.endsWith(".js"));
  const middlewareFunctions = middlewareFiles.map((f) => ({
    file: relative(f),
    functions: extractExportedFunctions(f),
  }));

  const serviceAndUtilFiles = [
    ...listFilesRecursive(path.join(BACKEND_DIR, "services"), (f) => f.endsWith(".js")),
    ...listFilesRecursive(path.join(BACKEND_DIR, "utils"), (f) => f.endsWith(".js")),
    ...listFilesRecursive(path.join(BACKEND_DIR, "config"), (f) => f.endsWith(".js")),
  ].sort((a, b) => a.localeCompare(b));

  const serviceAndUtilFunctions = serviceAndUtilFiles.map((f) => ({
    file: relative(f),
    functions: extractExportedFunctions(f),
  }));

  const modelFiles = listFilesRecursive(path.join(BACKEND_DIR, "models"), (f) => f.endsWith(".js"));
  const models = modelFiles.map((f) => ({
    file: relative(f),
    modelName: extractModelName(f),
    fields: extractSchemaTopLevelFields(f),
  }));

  const frontendPageFiles = listFilesRecursive(path.join(FRONTEND_DIR, "app"), (f) => f.endsWith("/page.tsx") || f.endsWith("\\page.tsx"));
  const frontendRoutes = frontendPageFiles.map((f) => ({
    file: relative(f),
    routePath: convertAppPathToRoute(f),
  })).sort((a, b) => a.routePath.localeCompare(b.routePath));

  const frontendComponents = listFilesRecursive(path.join(FRONTEND_DIR, "components"), (f) => f.endsWith(".tsx") || f.endsWith(".ts")).map(relative);

  const frontendSupportFiles = [
    ...listFilesRecursive(path.join(FRONTEND_DIR, "context"), (f) => f.endsWith(".tsx") || f.endsWith(".ts")),
    ...listFilesRecursive(path.join(FRONTEND_DIR, "lib"), (f) => f.endsWith(".tsx") || f.endsWith(".ts") || f.endsWith(".js")),
    ...listFilesRecursive(path.join(FRONTEND_DIR, "types"), (f) => f.endsWith(".tsx") || f.endsWith(".ts") || f.endsWith(".d.ts")),
  ].map(relative).sort((a, b) => a.localeCompare(b));

  const functionIndexFiles = [
    ...backendSourceFiles,
    ...frontendSourceFiles,
  ];

  const functionIndex = functionIndexFiles.map((f) => ({
    file: relative(f),
    functions: extractAllFunctionLikeNames(f),
  }));

  const byBackend = functionIndex.filter((x) => x.file.startsWith("Backend/"));
  const byFrontend = functionIndex.filter((x) => x.file.startsWith("frontend/"));

  const functionIndexGroups = [
    { groupName: "Backend Files", items: byBackend },
    { groupName: "Frontend Files", items: byFrontend },
  ];

  const backendGrouped = groupByFirstSegment(backendSourceFiles, "Backend");
  const frontendGrouped = groupByFirstSegment(frontendSourceFiles, "frontend");

  const data = {
    root: ROOT,
    backendPackage,
    frontendPackage,
    rootPackage,
    backendSourceFiles: backendSourceFiles.map(relative),
    frontendSourceFiles: frontendSourceFiles.map(relative),
    apiEndpoints,
    endpointsByRouteFile,
    controllerFunctions,
    middlewareFunctions,
    serviceAndUtilFunctions,
    models,
    frontendRoutes,
    frontendComponents,
    frontendSupportFiles,
    functionIndexGroups,
    backendGrouped,
    frontendGrouped,
  };

  const markdown = buildMarkdownReport(data);
  fs.writeFileSync(OUTPUT_MD, markdown, "utf8");

  await renderPdfFromMarkdown(markdown, OUTPUT_PDF);

  console.log(`Summary generated:`);
  console.log(`- ${relative(OUTPUT_MD)}`);
  console.log(`- ${relative(OUTPUT_PDF)}`);
}

main().catch((err) => {
  console.error("Failed to generate summary:", err.message);
  process.exit(1);
});
