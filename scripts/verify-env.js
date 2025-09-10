#!/usr/bin/env node

/**
 * LinkLink 开发环境自动化验证脚本
 * 目标：按 QA 建议对环境进行一致性、可重复性检查
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}
function logStep(step) { log(`\n${colors.bright}${colors.cyan}=== ${step} ===${colors.reset}`); }
function logSuccess(msg) { log(`✅ ${msg}`, 'green'); }
function logError(msg) { log(`❌ ${msg}`, 'red'); }
function logWarn(msg) { log(`⚠️  ${msg}`, 'yellow'); }
function logInfo(msg) { log(`ℹ️  ${msg}`, 'blue'); }

function execCmd(cmd) {
  try {
    const out = execSync(cmd, { cwd: rootDir, encoding: 'utf8', stdio: 'pipe' });
    return { ok: true, out: (out || '').trim() };
  } catch (e) {
    return { ok: false, err: e.message, out: e.stdout?.toString?.() ?? '', stderr: e.stderr?.toString?.() ?? '' };
  }
}

function checkFile(p) { return fs.existsSync(path.resolve(rootDir, p)); }
function checkDir(p) { const full = path.resolve(rootDir, p); return fs.existsSync(full) && fs.statSync(full).isDirectory(); }

function parseSemver(v) {
  const m = /([0-9]+)\.([0-9]+)\.([0-9]+)/.exec(v);
  return m ? { major: +m[1], minor: +m[2], patch: +m[3] } : null;
}

function gte(v, min) {
  if (v.major !== min.major) return v.major > min.major;
  if (v.minor !== min.minor) return v.minor > min.minor;
  return v.patch >= min.patch;
}

function verifyToolchain() {
  logStep('验证基础工具链');
  let pass = true;

  // Bun
  const bun = execCmd('bun --version');
  if (!bun.ok) {
    logError('未检测到 Bun，请安装 https://bun.sh/');
    pass = false;
  } else {
    const v = parseSemver(bun.out);
    if (!v) {
      logWarn(`无法解析 Bun 版本: ${bun.out}`);
    } else {
      const min = { major: 1, minor: 2, patch: 18 };
      if (gte(v, min)) logSuccess(`Bun 版本满足要求: ${bun.out} (>= 1.2.18)`);
      else {
        logError(`Bun 版本过低: ${bun.out}，需要 >= 1.2.18`);
        pass = false;
      }
    }
  }

  // Node (可选但建议)
  const node = execCmd('node -v');
  if (node.ok) {
    const v = parseSemver(node.out.replace(/^v/, ''));
    if (v && v.major === 20) logSuccess(`Node 版本建议满足: ${node.out} (建议 20.x)`);
    else logWarn(`Node 版本为 ${node.out}，建议使用 20.x`);
  } else {
    logWarn('未检测到 Node（非强制，仅用于部分工具链）');
  }

  // Git
  const git = execCmd('git --version');
  if (git.ok) logSuccess(`Git 可用: ${git.out}`);
  else { logWarn('未检测到 Git'); pass = false; }

  return pass;
}

function verifyEnvFiles() {
  logStep('验证环境变量文件');
  const files = ['.env', 'apps/web/.env', 'apps/server/.env', 'apps/extension/.env'];
  let pass = true;
  for (const f of files) {
    if (checkFile(f)) logSuccess(`存在: ${f}`);
    else { logWarn(`缺失: ${f} （可运行 bun run setup:env 生成）`); pass = false; }
  }
  return pass;
}

function verifyDependencies() {
  logStep('验证依赖与锁定');
  let pass = true;
  if (checkFile('bun.lock')) logSuccess('bun.lock 存在（版本锁定有效）');
  else { logWarn('缺少 bun.lock，建议提交锁定文件'); pass = false; }

  if (checkDir('node_modules')) logSuccess('根目录依赖已安装');
  else { logWarn('根目录依赖未安装（请运行 bun install）'); pass = false; }

  for (const app of ['apps/web', 'apps/server', 'apps/extension']) {
    if (checkDir(path.join(app, 'node_modules'))) logSuccess(`${app} 依赖已安装`);
    else { logWarn(`${app} 依赖未安装（请运行 bun install）`); pass = false; }
  }
  return pass;
}

function verifyPackageScripts() {
  logStep('验证关键脚本存在性');
  const pkgPath = path.resolve(rootDir, 'package.json');
  if (!fs.existsSync(pkgPath)) { logError('缺少 package.json'); return false; }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const required = ['dev','build','type-check','lint','test','setup','setup:env','setup:db','verify','verify:build','verify:types','verify:lint','verify:test','verify:env'];
  let pass = true;
  for (const s of required) {
    if (pkg.scripts?.[s]) logSuccess(`脚本存在: ${s} -> ${pkg.scripts[s]}`);
    else { logWarn(`缺少脚本: ${s}`); pass = false; }
  }
  return pass;
}

function main() {
  logStep('LinkLink 环境验证开始');
  const results = {
    toolchain: verifyToolchain(),
    envFiles: verifyEnvFiles(),
    dependencies: verifyDependencies(),
    pkgScripts: verifyPackageScripts(),
  };

  logStep('验证结果汇总');
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(Boolean).length;
  logInfo(`通过检查: ${passed}/${total}`);
  for (const [k,v] of Object.entries(results)) {
    if (v) logSuccess(`${k}: 通过`); else logError(`${k}: 失败`);
  }

  if (passed === total) {
    logSuccess('🎉 环境验证通过，可继续开发。');
  } else {
    logError('❌ 环境验证未通过，请根据提示修复后重试。');
    process.exit(1);
  }
}

main();
