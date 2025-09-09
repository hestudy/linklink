# LinkLink 开发工作流程

本文档描述 LinkLink AI 书签管理器项目的开发工作流程和最佳实践。

## 项目结构

LinkLink 使用 Turborepo 作为 monorepo 管理工具，包含以下主要应用：

```
linklink/
├── apps/
│   ├── web/          # React 前端应用
│   ├── server/       # Hono + tRPC 后端
│   └── extension/    # WXT 浏览器扩展
├── packages/         # 共享包（如有）
└── docs/            # 文档
```

## 开发流程

### 1. 分支策略

我们使用 Git Flow 分支策略：

- **main**: 主分支，始终保持可部署状态
- **develop**: 开发分支，集成最新功能
- **feature/***: 功能分支，用于开发新功能
- **hotfix/***: 紧急修复分支，用于修复生产环境问题
- **release/***: 发布分支，用于准备新版本

### 2. 功能开发流程

#### 开始新功能

```bash
# 从最新的 develop 分支创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

#### 开发期间

- 频繁提交小的更改
- 编写有意义的提交信息
- 遵循代码规范和最佳实践

```bash
# 添加更改
git add .

# 提交更改（使用约定式提交格式）
git commit -m "feat: 添加用户认证功能"

# 推送到远程仓库
git push origin feature/your-feature-name
```

#### 提交信息格式

我们使用 [约定式提交](https://www.conventionalcommits.org/) 格式：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

类型包括：
- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档更改
- `style`: 代码格式（不影响代码运行的变动）
- `refactor`: 重构（既不是新增功能，也不是修改bug的代码变动）
- `perf`: 性能优化
- `test`: 增加测试
- `chore`: 构建过程或辅助工具的变动

示例：
```
feat(auth): 添加用户登录功能

- 实现基于邮箱的登录
- 添加 JWT 认证支持
- 集成 Better Auth

Closes #123
```

### 3. 代码审查

#### 创建 Pull Request

1. 在 GitHub 上创建从功能分支到 `develop` 分支的 PR
2. 填写 PR 描述，包括：
   - 功能概述
   - 实现细节
   - 测试方法
   - 相关问题编号
3. 添加适当的标签（如 `feature`, `bug`, `documentation`）
4. 请求至少一名团队成员审查

#### 代码审查清单

审查者应检查以下项目：

- [ ] 代码符合项目规范
- [ ] 功能按预期工作
- [ ] 测试覆盖充分
- [ ] 文档已更新（如需要）
- [ ] 提交信息格式正确
- [ ] 没有引入安全漏洞
- [ ] 性能影响可接受
- [ ] 没有引入回归问题

#### 处理审查反馈

- 及时回应审查意见
- 进行必要的更改并推送更新
- 如果不同意某个意见，提供合理的解释

### 4. 测试策略

#### 单元测试

- 每个应用都应有单元测试
- 使用 Vitest 作为测试框架
- 测试文件应与源代码文件位于同一目录下，命名为 `*.test.ts` 或 `*.spec.ts`

```bash
# 运行所有单元测试
bun run test

# 运行特定应用的测试
bun run test --filter="web"
```

#### 集成测试

- 测试应用间的交互
- 使用测试数据库
- 模拟外部服务

```bash
# 运行集成测试
bun run test:integration
```

#### 端到端测试

- 模拟真实用户操作
- 测试关键用户流程
- 在 CI/CD 管道中运行

```bash
# 运行端到端测试
bun run test:e2e
```

### 5. 持续集成/持续部署 (CI/CD)

我们的 CI/CD 流程使用 GitHub Actions：

#### 触发条件

- 推送到 `main` 或 `develop` 分支
- 创建或更新 Pull Request

#### CI/CD 流程

1. **代码检查**:
   - ESLint 检查代码风格
   - Prettier 格式化检查
   - TypeScript 类型检查

2. **测试**:
   - 运行单元测试
   - 运行集成测试
   - 生成测试覆盖率报告

3. **构建**:
   - 构建所有应用
   - 验证构建产物

4. **安全扫描**:
   - 依赖项安全检查
   - 代码安全漏洞扫描

5. **部署**（仅限 `main` 分支）:
   - 部署到生产环境
   - 通知部署状态

### 6. 发布流程

#### 准备发布

1. 更新版本号（遵循语义化版本）
2. 更新 CHANGELOG.md
3. 创建发布分支

```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0
```

#### 测试发布

1. 在预生产环境中测试
2. 进行最终验证
3. 修复发现的问题

#### 完成发布

1. 合并到 `main` 分支
2. 创建 Git 标签
3. 部署到生产环境
4. 合并回 `develop` 分支

```bash
# 合并到 main
git checkout main
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "版本 1.0.0"

# 合并回 develop
git checkout develop
git merge --no-ff release/v1.0.0

# 推送更改
git push origin main --tags
git push origin develop
```

## 开发最佳实践

### 代码质量

- 遵循 ESLint 和 Prettier 规则
- 编写有意义的变量和函数名
- 保持函数简短和专注
- 添加适当的注释

### 性能考虑

- 避免不必要的重新渲染
- 使用代码分割和懒加载
- 优化数据库查询
- 监控应用性能

### 安全实践

- 不要提交敏感信息（如 API 密钥）
- 使用环境变量存储配置
- 定期更新依赖项
- 进行安全审查

### 文档

- 为新功能编写文档
- 更新相关的 README 文件
- 添加代码注释解释复杂逻辑
- 保持 API 文档最新

## 工具和配置

### 代码编辑器

推荐使用 VS Code，并安装以下扩展：

- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- GitLens
- Turbo Console

### Git 钩子

我们使用 Husky 和 lint-staged 来确保代码质量：

```bash
# 提交前自动运行检查
bun run lint
bun run type-check
```

### 调试

- 使用浏览器开发工具调试前端应用
- 使用 VS Code 调试器调试后端应用
- 使用日志记录关键操作
- 使用 Turbo 的缓存功能加速构建

## 常见任务

### 添加新依赖

```bash
# 添加到特定应用
cd apps/web
bun add package-name

# 添加到所有应用
bun add -w package-name

# 添加开发依赖
bun add -D package-name
```

### 运行特定应用

```bash
# 只运行 Web 应用
bun run dev:web

# 只运行服务器应用
bun run dev:server

# 只运行扩展应用
bun run dev:extension
```

### 清理和重建

```bash
# 清理所有构建产物
bun run clean

# 重新安装依赖
rm -rf node_modules
bun install
```

## 获取帮助

如果您有任何问题或需要帮助，请：

1. 查看项目文档
2. 搜索现有的 GitHub Issues
3. 创建新的 Issue
4. 在团队沟通渠道中提问

## 资源链接

- [Turborepo 文档](https://turbo.build/repo/docs)
- [Bun 文档](https://bun.sh/docs)
- [React 文档](https://react.dev/)
- [Hono 文档](https://hono.dev/)
- [WXT 文档](https://wxt.dev/)
- [tRPC 文档](https://trpc.io/)
- [Better Auth 文档](https://better-auth.com/)