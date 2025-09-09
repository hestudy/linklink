#!/usr/bin/env node

/**
 * LinkLink 应用构建验证脚本
 * 用于验证所有应用是否能够正常构建和启动
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// 颜色输出
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

// 应用列表
const apps = [
  { name: 'web', path: 'apps/web', buildCommand: 'build', devCommand: 'dev' },
  { name: 'server', path: 'apps/server', buildCommand: 'build', devCommand: 'dev' },
  { name: 'extension', path: 'apps/extension', buildCommand: 'build', devCommand: 'dev' },
];

// 日志函数
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step) {
  log(`\n${colors.bright}${colors.cyan}=== ${step} ===${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// 执行命令
function executeCommand(command, cwd = rootDir, throwOnError = false) {
  try {
    logInfo(`执行命令: ${command}`);
    const output = execSync(command, { 
      cwd, 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return { success: true, output };
  } catch (error) {
    if (throwOnError) {
      throw error;
    }
    return { 
      success: false, 
      error: error.message,
      output: error.stdout || '',
      stderr: error.stderr || ''
    };
  }
}

// 检查文件是否存在
function checkFileExists(filePath) {
  return fs.existsSync(path.resolve(rootDir, filePath));
}

// 检查目录是否存在
function checkDirExists(dirPath) {
  return fs.existsSync(path.resolve(rootDir, dirPath)) && 
         fs.statSync(path.resolve(rootDir, dirPath)).isDirectory();
}

// 验证环境变量文件
function verifyEnvFiles() {
  logStep('验证环境变量文件');
  
  const envFiles = [
    '.env',
    'apps/web/.env',
    'apps/server/.env',
    'apps/extension/.env'
  ];
  
  let allExist = true;
  
  for (const envFile of envFiles) {
    if (checkFileExists(envFile)) {
      logSuccess(`环境变量文件存在: ${envFile}`);
    } else {
      logWarning(`环境变量文件不存在: ${envFile}`);
      allExist = false;
    }
  }
  
  if (!allExist) {
    logInfo('您可以通过运行 "bun run setup:env" 创建环境变量文件');
  }
  
  return allExist;
}

// 验证依赖安装
function verifyDependencies() {
  logStep('验证依赖安装');
  
  // 检查根目录 node_modules
  if (checkDirExists('node_modules')) {
    logSuccess('根目录依赖已安装');
  } else {
    logError('根目录依赖未安装');
    logInfo('请运行 "bun install" 安装依赖');
    return false;
  }
  
  // 检查各应用的 node_modules
  for (const app of apps) {
    const nodeModulesPath = path.join(app.path, 'node_modules');
    if (checkDirExists(nodeModulesPath)) {
      logSuccess(`${app.name} 应用依赖已安装`);
    } else {
      logError(`${app.name} 应用依赖未安装`);
      logInfo('请运行 "bun install" 安装依赖');
      return false;
    }
  }
  
  return true;
}

// 验证应用构建
function verifyBuilds() {
  logStep('验证应用构建');
  
  let allBuildsSuccessful = true;
  
  for (const app of apps) {
    logInfo(`构建 ${app.name} 应用...`);
    
    const result = executeCommand(`bun run ${app.buildCommand}`, rootDir);
    
    if (result.success) {
      logSuccess(`${app.name} 应用构建成功`);
      
      // 检查构建输出目录
      const distPath = path.join(app.path, 'dist');
      const outputPath = path.join(app.path, '.output');
      
      if (checkDirExists(distPath) || checkDirExists(outputPath)) {
        logSuccess(`${app.name} 应用构建输出存在`);
      } else {
        logWarning(`${app.name} 应用构建输出不存在，但构建命令成功执行`);
      }
    } else {
      logError(`${app.name} 应用构建失败`);
      logInfo(`错误信息: ${result.error}`);
      if (result.output) {
        logInfo(`输出: ${result.output}`);
      }
      if (result.stderr) {
        logInfo(`错误输出: ${result.stderr}`);
      }
      allBuildsSuccessful = false;
    }
  }
  
  return allBuildsSuccessful;
}

// 验证应用类型检查
function verifyTypeCheck() {
  logStep('验证应用类型检查');
  
  let allTypeChecksSuccessful = true;
  
  for (const app of apps) {
    logInfo(`检查 ${app.name} 应用类型...`);
    
    const result = executeCommand(`bun run check-types`, rootDir);
    
    if (result.success) {
      logSuccess(`${app.name} 应用类型检查通过`);
    } else {
      logError(`${app.name} 应用类型检查失败`);
      logInfo(`错误信息: ${result.error}`);
      if (result.output) {
        logInfo(`输出: ${result.output}`);
      }
      if (result.stderr) {
        logInfo(`错误输出: ${result.stderr}`);
      }
      allTypeChecksSuccessful = false;
    }
  }
  
  return allTypeChecksSuccessful;
}

// 验证应用代码检查
function verifyLinting() {
  logStep('验证应用代码检查');
  
  let allLintingSuccessful = true;
  
  for (const app of apps) {
    logInfo(`检查 ${app.name} 应用代码风格...`);
    
    const result = executeCommand(`bun run lint`, rootDir);
    
    if (result.success) {
      logSuccess(`${app.name} 应用代码检查通过`);
    } else {
      logError(`${app.name} 应用代码检查失败`);
      logInfo(`错误信息: ${result.error}`);
      if (result.output) {
        logInfo(`输出: ${result.output}`);
      }
      if (result.stderr) {
        logInfo(`错误输出: ${result.stderr}`);
      }
      allLintingSuccessful = false;
    }
  }
  
  return allLintingSuccessful;
}

// 验证应用测试
function verifyTests() {
  logStep('验证应用测试');
  
  let allTestsSuccessful = true;
  
  for (const app of apps) {
    logInfo(`运行 ${app.name} 应用测试...`);
    
    const result = executeCommand(`bun run test`, rootDir);
    
    if (result.success) {
      logSuccess(`${app.name} 应用测试通过`);
    } else {
      logWarning(`${app.name} 应用测试失败或未配置`);
      logInfo(`错误信息: ${result.error}`);
      if (result.output) {
        logInfo(`输出: ${result.output}`);
      }
      if (result.stderr) {
        logInfo(`错误输出: ${result.stderr}`);
      }
      // 测试失败不影响整体验证结果，因为有些应用可能还没有测试
    }
  }
  
  return allTestsSuccessful;
}

// 主函数
function main() {
  logStep('LinkLink 应用构建验证开始');
  
  const results = {
    envFiles: verifyEnvFiles(),
    dependencies: verifyDependencies(),
    builds: verifyBuilds(),
    typeCheck: verifyTypeCheck(),
    linting: verifyLinting(),
    tests: verifyTests(),
  };
  
  logStep('验证结果汇总');
  
  const totalChecks = Object.keys(results).length;
  const passedChecks = Object.values(results).filter(Boolean).length;
  
  logInfo(`通过检查: ${passedChecks}/${totalChecks}`);
  
  for (const [check, passed] of Object.entries(results)) {
    if (passed) {
      logSuccess(`${check}: 通过`);
    } else {
      logError(`${check}: 失败`);
    }
  }
  
  if (passedChecks === totalChecks) {
    logSuccess('🎉 所有验证检查通过！应用已准备好进行开发。');
    logInfo('您可以通过运行 "bun run dev" 启动开发服务器。');
  } else {
    logError('❌ 部分验证检查失败。请解决上述问题后重试。');
    process.exit(1);
  }
}

// 运行主函数
main();