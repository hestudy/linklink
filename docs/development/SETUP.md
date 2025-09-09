# LinkLink 开发环境设置指南

本文档介绍如何设置 LinkLink AI 书签管理器的开发环境。

## 前置要求

### 必需软件

- **Node.js**: 版本 20.x 或更高
- **Bun**: 最新版本（包管理器和运行时）
- **Git**: 用于版本控制

### 推荐工具

- **VS Code**: 推荐的代码编辑器
- **GitHub CLI**: 用于与 GitHub 交互
- **Docker**: 可选，用于容器化开发环境

## 安装步骤

### 1. 克隆仓库

```bash
git clone https://github.com/your-username/linklink.git
cd linklink
```

### 2. 安装 Bun

如果您尚未安装 Bun，请运行以下命令：

```bash
curl -fsSL https://bun.sh/install | bash
```

安装完成后，重启终端或运行：

```bash
source ~/.bashrc  # 或对应的 shell 配置文件
```

### 3. 安装依赖

```bash
bun install
```

### 4. 设置环境变量

复制环境变量模板：

```bash
bun run setup:env
```

然后根据需要编辑生成的 `.env` 文件：

```bash
# 根目录
vim .env

# Web 应用
vim apps/web/.env

# 服务器应用
vim apps/server/.env

# 扩展应用
vim apps/extension/.env
```

### 5. 初始化数据库

```bash
bun run setup:db
```

### 6. 启动开发环境

```bash
# 使用便捷脚本启动所有应用
bun run setup

# 或者手动启动各个应用
bun run dev
```

## 应用访问地址

启动成功后，您可以通过以下地址访问各个应用：

- **Web 应用**: http://localhost:3001
- **服务器 API**: http://localhost:3000
- **浏览器扩展**: 在浏览器中加载 `apps/extension` 目录作为未打包的扩展

## 开发工作流程

### 日常开发

1. **创建新分支**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **进行更改**:
   - 修改代码
   - 运行 `bun run lint` 检查代码风格
   - 运行 `bun run type-check` 检查类型
   - 运行 `bun run test` 运行测试

3. **提交更改**:
   ```bash
   git add .
   git commit -m "feat: 添加新功能"
   ```

4. **推送分支**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **创建 Pull Request**:
   - 在 GitHub 上创建 PR
   - 确保 CI/CD 检查通过
   - 请求代码审查

### 构建和测试

```bash
# 构建所有应用
bun run build

# 运行所有测试
bun run test

# 运行类型检查
bun run type-check

# 运行代码检查
bun run lint

# 格式化代码
bun run format
```

## 故障排除

### 常见问题

#### 1. 依赖安装失败

**问题**: `bun install` 失败

**解决方案**:
```bash
# 清除缓存
bun rm -rf node_modules
bun install --force

# 或者使用 npm 清除缓存
npm cache clean --force
bun install
```

#### 2. 端口冲突

**问题**: 应用启动时提示端口已被占用

**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :3000
lsof -i :3001

# 终止进程
kill -9 <PID>
```

或者修改 `.env` 文件中的端口配置。

#### 3. 数据库连接问题

**问题**: 无法连接到数据库

**解决方案**:
```bash
# 重新初始化数据库
cd apps/server
rm -f local.db
bun run db:local
bun run db:push
cd ../..
```

#### 4. TypeScript 错误

**问题**: 类型检查失败

**解决方案**:
```bash
# 清除 TypeScript 缓存
bun run clean
bun install
bun run type-check
```

### 获取帮助

如果您遇到文档中未涵盖的问题，请：

1. 检查项目的 [GitHub Issues](https://github.com/your-username/linklink/issues)
2. 创建新的 Issue 描述您的问题
3. 联系开发团队成员

## 贡献指南

我们欢迎所有形式的贡献！请参阅 [CONTRIBUTING.md](../CONTRIBUTING.md) 了解如何参与项目开发。

## 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](../LICENSE) 文件。