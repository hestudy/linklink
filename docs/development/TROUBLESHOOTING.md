# LinkLink 故障排除指南

本文档提供 LinkLink AI 书签管理器开发过程中可能遇到的常见问题及其解决方案。

## 目录

- [环境设置问题](#环境设置问题)
- [依赖和构建问题](#依赖和构建问题)
- [数据库问题](#数据库问题)
- [应用特定问题](#应用特定问题)
- [CI/CD 问题](#cicd-问题)
- [性能问题](#性能问题)
- [调试技巧](#调试技巧)

## 环境设置问题

### Bun 安装失败

**症状**: 运行 `curl -fsSL https://bun.sh/install | bash` 后，Bun 未正确安装。

**解决方案**:

1. 检查系统要求：
   ```bash
   uname -m  # 应为 x86_64, arm64, 或 aarch64
   cat /etc/os-release  # 检查 Linux 发行版
   ```

2. 手动安装：
   ```bash
   # 下载最新版本
   curl -fsSL https://bun.sh/install | bash
   
   # 添加到 PATH
   echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
   source ~/.bashrc
   ```

3. 验证安装：
   ```bash
   bun --version
   ```

### 端口冲突

**症状**: 启动应用时出现 "端口已被占用" 错误。

**解决方案**:

1. 查找占用端口的进程：
   ```bash
   # macOS/Linux
   lsof -i :3000  # 服务器端口
   lsof -i :3001  # Web 应用端口
   
   # Windows
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   ```

2. 终止占用端口的进程：
   ```bash
   # macOS/Linux
   kill -9 <PID>
   
   # Windows
   taskkill /PID <PID> /F
   ```

3. 修改端口配置：
   编辑 `.env` 文件中的端口设置：
   ```bash
   # 根目录 .env
   SERVER_PORT="3001"
   WEB_PORT="3002"
   
   # apps/web/.env
   VITE_WEB_PORT="3002"
   
   # apps/server/.env
   SERVER_PORT="3001"
   ```

### 环境变量问题

**症状**: 应用无法读取环境变量，或使用默认值。

**解决方案**:

1. 检查环境变量文件是否存在：
   ```bash
   ls -la .env
   ls -la apps/web/.env
   ls -la apps/server/.env
   ls -la apps/extension/.env
   ```

2. 如果不存在，从模板创建：
   ```bash
   bun run setup:env
   ```

3. 验证环境变量格式：
   - 确保没有引号嵌套
   - 确保没有多余的空格
   - 确保注释以 `#` 开头

4. 重新启动应用：
   ```bash
   bun run dev
   ```

## 依赖和构建问题

### 依赖安装失败

**症状**: `bun install` 失败，出现网络或权限错误。

**解决方案**:

1. 清除缓存并重试：
   ```bash
   rm -rf node_modules
   bun install --force
   ```

2. 检查网络连接：
   ```bash
   ping registry.npmjs.org
   ```

3. 使用镜像源：
   ```bash
   bun config set registry https://registry.npmmirror.com
   bun install
   ```

4. 检查文件权限：
   ```bash
   # macOS/Linux
   chown -R $(whoami) .
   
   # Windows
   # 以管理员身份运行终端
   ```

### TypeScript 错误

**症状**: 类型检查失败，出现 "Cannot find module" 或类型不匹配错误。

**解决方案**:

1. 清除 TypeScript 缓存：
   ```bash
   bun run clean
   bun install
   ```

2. 检查 TypeScript 配置：
   ```bash
   # 检查 tsconfig.json
   cat tsconfig.json
   
   # 检查各应用的 tsconfig.json
   cat apps/web/tsconfig.json
   cat apps/server/tsconfig.json
   cat apps/extension/tsconfig.json
   ```

3. 更新类型定义：
   ```bash
   bun add -D @types/node
   bun add -D @types/react
   bun add -D @types/react-dom
   ```

4. 检查导入路径：
   - 确保相对路径正确（以 `./` 或 `../` 开头）
   - 确保绝对路径在 `tsconfig.json` 的 `paths` 中定义

### 构建失败

**症状**: `bun run build` 失败，出现编译错误或资源缺失。

**解决方案**:

1. 检查构建日志中的具体错误：
   ```bash
   bun run build 2>&1 | tee build.log
   cat build.log
   ```

2. 清除构建产物并重试：
   ```bash
   bun run clean
   bun run build
   ```

3. 检查资源文件：
   - 确保所有引用的资源文件存在
   - 检查文件名大小写（特别是在 Linux 上）

4. 检查环境变量：
   ```bash
   # 确保生产环境变量已设置
   cat .env.production
   ```

## 数据库问题

### 数据库连接失败

**症状**: 应用无法连接到数据库，出现连接超时或认证失败错误。

**解决方案**:

1. 检查数据库服务状态：
   ```bash
   # 对于 SQLite/Turso
   ls -la apps/server/local.db
   
   # 如果使用远程 Turso
   turso db list
   ```

2. 验证数据库连接字符串：
   ```bash
   # 检查 .env 文件中的 DATABASE_URL
   cat apps/server/.env | grep DATABASE_URL
   ```

3. 重新初始化数据库：
   ```bash
   cd apps/server
   rm -f local.db
   bun run db:local
   bun run db:push
   cd ../..
   ```

4. 检查数据库权限：
   ```bash
   # 确保应用有读写数据库文件的权限
   chmod 644 apps/server/local.db
   ```

### 数据库迁移失败

**症状**: 运行 `bun run db:migrate` 或 `bun run db:push` 失败。

**解决方案**:

1. 检查迁移文件：
   ```bash
   ls -la apps/server/drizzle/
   cat apps/server/drizzle/meta/_journal.json
   ```

2. 验证 Drizzle 配置：
   ```bash
   cat apps/server/drizzle.config.ts
   ```

3. 手动执行 SQL：
   ```bash
   # 使用 drizzle-kit studio 检查数据库状态
   bun run db:studio
   ```

4. 重置数据库（谨慎使用）：
   ```bash
   cd apps/server
   rm -f local.db
   bun run db:local
   bun run db:generate
   bun run db:push
   cd ../..
   ```

## 应用特定问题

### Web 应用问题

#### React 组件未渲染

**症状**: React 组件不显示或显示空白页面。

**解决方案**:

1. 检查浏览器控制台错误：
   - 打开开发者工具 (F12)
   - 查看 Console 标签页的错误信息

2. 验证组件导入：
   ```bash
   # 检查导入路径是否正确
   cat apps/web/src/App.tsx | grep import
   ```

3. 检查路由配置：
   ```bash
   cat apps/web/src/main.tsx | grep Router
   cat apps/web/src/App.tsx | grep Route
   ```

4. 检查组件导出：
   ```bash
   # 确保组件使用 export default 导出
   grep -r "export default" apps/web/src/components/
   ```

#### API 调用失败

**症状**: 前端无法连接到后端 API，出现 CORS 或网络错误。

**解决方案**:

1. 检查服务器状态：
   ```bash
   curl http://localhost:3000/health
   ```

2. 验证 API 端点：
   ```bash
   cat apps/server/src/index.ts | grep route
   ```

3. 检查 CORS 配置：
   ```bash
   cat apps/server/src/index.ts | grep cors
   ```

4. 检查前端 API 配置：
   ```bash
   cat apps/web/.env | grep VITE_SERVER_URL
   ```

### 服务器应用问题

#### tRPC 路由不工作

**症状**: tRPC 路由返回 404 或 500 错误。

**解决方案**:

1. 检查路由定义：
   ```bash
   cat apps/server/src/router/index.ts | grep router
   ```

2. 验证路由实现：
   ```bash
   cat apps/server/src/router/*.ts
   ```

3. 检查中间件：
   ```bash
   cat apps/server/src/middleware/*.ts
   ```

4. 查看服务器日志：
   ```bash
   bun run dev:server
   ```

#### 认证问题

**症状**: 用户无法登录，或认证中间件失败。

**解决方案**:

1. 检查 Better Auth 配置：
   ```bash
   cat apps/server/src/auth.ts
   ```

2. 验证环境变量：
   ```bash
   cat apps/server/.env | grep BETTER_AUTH
   ```

3. 检查认证路由：
   ```bash
   cat apps/server/src/router/auth.ts
   ```

4. 检查前端认证集成：
   ```bash
   cat apps/web/src/lib/auth.ts
   ```

### 扩展应用问题

#### 扩展无法加载

**症状**: 浏览器无法加载扩展，或扩展图标变灰。

**解决方案**:

1. 检查 manifest.json：
   ```bash
   cat apps/extension/manifest.json
   ```

2. 验证扩展构建：
   ```bash
   bun run build:extension
   ls -la apps/extension/.output/
   ```

3. 检查扩展权限：
   - 确保在 manifest.json 中声明了所需权限
   - 检查浏览器是否阻止了某些权限

4. 以开发者模式加载扩展：
   - 打开浏览器扩展管理页面
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 `apps/extension` 目录

#### 内容脚本不工作

**症状**: 扩展的内容脚本未在网页上执行。

**解决方案**:

1. 检查内容脚本配置：
   ```bash
   cat apps/extension/manifest.json | grep content_scripts
   ```

2. 验证内容脚本匹配模式：
   - 确保 `matches` 数组包含目标网站
   - 检查 URL 模式是否正确

3. 检查内容脚本代码：
   ```bash
   cat apps/extension/src/content.ts
   ```

4. 查看扩展错误：
   - 打开扩展管理页面
   - 点击"服务工作线程"或"背景页"
   - 查看控制台错误

## CI/CD 问题

### GitHub Actions 失败

**症状**: GitHub Actions 工作流失败，出现测试或构建错误。

**解决方案**:

1. 检查工作流日志：
   - 在 GitHub 仓库的 Actions 标签页查看详细日志
   - 识别失败的具体步骤

2. 检查工作流配置：
   ```bash
   cat .github/workflows/ci.yml
   ```

3. 本地复现问题：
   ```bash
   # 运行与 CI 相同的命令
   bun run ci
   ```

4. 检查环境变量：
   - 确保所有必需的环境变量在 GitHub Secrets 中设置
   - 检查变量名称是否正确

### 测试覆盖率不足

**症状**: 测试覆盖率报告显示覆盖率低于要求。

**解决方案**:

1. 运行测试覆盖率检查：
   ```bash
   bun run test:coverage
   ```

2. 识别未覆盖的代码：
   - 查看覆盖率报告中的未覆盖行
   - 重点关注关键业务逻辑

3. 添加缺失的测试：
   ```bash
   # 为未覆盖的函数添加测试
   # 示例：测试 utils 函数
   cat apps/web/src/utils/__tests__/index.test.ts
   ```

4. 设置覆盖率阈值：
   ```bash
   # 在 vitest.config.ts 中设置覆盖率阈值
   cat apps/web/vitest.config.ts | grep coverage
   ```

## 性能问题

### 应用启动缓慢

**症状**: 应用启动时间过长，影响开发体验。

**解决方案**:

1. 检查依赖项：
   ```bash
   # 分析依赖项大小
   bun pm ls
   ```

2. 优化导入：
   - 使用动态导入 (`import()`) 加载非关键资源
   - 避免循环依赖

3. 检查初始化代码：
   ```bash
   # 检查应用入口文件
   cat apps/web/src/main.tsx
   cat apps/server/src/index.ts
   ```

4. 使用 Turbo 缓存：
   ```bash
   # 清除 Turbo 缓存
   rm -rf .turbo
   bun run dev
   ```

### 构建时间长

**症状**: `bun run build` 执行时间过长。

**解决方案**:

1. 启用并行构建：
   ```bash
   # Turbo 默认并行构建，确保配置正确
   cat turbo.json | grep pipeline
   ```

2. 优化构建配置：
   ```bash
   # 检查 Vite 配置
   cat apps/web/vite.config.ts
   
   # 检查 tsdown 配置
   cat apps/server/tsconfig.json
   ```

3. 减少构建产物：
   - 使用代码分割
   - 移除未使用的依赖

4. 使用缓存：
   ```bash
   # 清除并重建以利用缓存
   bun run clean
   bun run build
   ```

## 调试技巧

### 使用控制台日志

1. 在关键位置添加日志：
   ```typescript
   console.log('调试信息:', variable);
   console.error('错误信息:', error);
   ```

2. 使用条件日志：
   ```typescript
   if (process.env.NODE_ENV === 'development') {
     console.log('开发模式日志:', data);
   }
   ```

3. 使用分组日志：
   ```typescript
   console.group('API 请求');
   console.log('请求参数:', params);
   console.log('响应数据:', response);
   console.groupEnd();
   ```

### 使用断点调试

1. 在 VS Code 中设置断点：
   - 在代码行号左侧点击添加断点
   - 使用 `debugger;` 语句在代码中添加断点

2. 配置 VS Code 调试器：
   ```json
   // .vscode/launch.json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Debug Web",
         "type": "chrome",
         "request": "launch",
         "url": "http://localhost:3001",
         "webRoot": "${workspaceFolder}/apps/web/src"
       },
       {
         "name": "Debug Server",
         "type": "node",
         "request": "launch",
         "program": "${workspaceFolder}/apps/server/src/index.ts",
         "console": "integratedTerminal",
         "runtimeExecutable": "bun"
       }
     ]
   }
   ```

3. 启动调试会话：
   - 按 F5 或点击调试面板中的绿色播放按钮
   - 使用调试控制面板控制执行流程

### 使用网络分析工具

1. 浏览器开发者工具：
   - 打开 Network 标签页
   - 检查 API 请求和响应
   - 分析请求时间和大小

2. 服务器日志：
   ```typescript
   // 在服务器中间件中添加请求日志
   app.use('*', (c, next) => {
     console.log(`${c.req.method} ${c.req.url}`);
     return next();
   });
   ```

### 使用性能分析工具

1. React DevTools Profiler：
   - 安装 React Developer Tools 扩展
   - 使用 Profiler 标签页分析组件渲染性能

2. Chrome Performance Tab：
   - 打开开发者工具的 Performance 标签页
   - 记录和分析运行时性能

3. Lighthouse：
   ```bash
   # 使用 Lighthouse CLI 分析 Web 应用
   npm install -g lighthouse
   lighthouse http://localhost:3001 --view
   ```

## 获取更多帮助

如果以上解决方案无法解决您的问题，请：

1. 搜索现有的 GitHub Issues
2. 创建新的 Issue，包含：
   - 问题的详细描述
   - 复现步骤
   - 错误日志和截图
   - 您的操作系统和浏览器版本
3. 在团队沟通渠道中提问
4. 查看相关技术的官方文档：
   - [Turborepo 文档](https://turbo.build/repo/docs)
   - [Bun 文档](https://bun.sh/docs)
   - [React 文档](https://react.dev/)
   - [Hono 文档](https://hono.dev/)
   - [WXT 文档](https://wxt.dev/)
   - [tRPC 文档](https://trpc.io/)
   - [Better Auth 文档](https://better-auth.com/)