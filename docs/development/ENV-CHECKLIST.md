# 开发环境配置检查清单

本清单用于确保 LinkLink 开发环境配置一致、可重复、可验证。建议在首次配置与每次依赖更新后执行。

## 基础工具

- [ ] 操作系统：macOS/Linux/Windows（已知可用版本）
- [ ] 包管理器：Bun 已安装，版本 >= 1.2.18（`bun --version`）
- [ ] Node 运行时：版本 20.x（用于部分工具链，`node -v`）
- [ ] Git 已安装（`git --version`）

## 仓库与依赖

- [ ] 已正确克隆仓库并拉取子模块（如有）
- [ ] 运行 `bun install --frozen-lockfile` 成功
- [ ] 根目录与各 app 均存在 `node_modules/`

## 环境变量

- [ ] 根目录 `.env` 存在（由 `.env.example` 复制并按需修改）
- [ ] `apps/web/.env` 存在
- [ ] `apps/server/.env` 存在
- [ ] `apps/extension/.env` 存在

## 脚本与构建

- [ ] `bun run type-check` 通过
- [ ] `bun run lint` 通过
- [ ] `bun run test` 通过（允许部分未配置模块跳过）
- [ ] `bun run build` 所有应用构建成功

## 本地开发

- [ ] 数据库初始化成功（`bun run setup:db`）
- [ ] 本地开发可启动（`bun run dev` 或 `bun run setup`）
- [ ] 服务器健康检查可访问：`http://localhost:3000/health`
- [ ] Web 可访问：`http://localhost:3001`

## 兼容性与平台

- [ ] macOS 下验证通过
- [ ] Linux 下验证通过
- [ ] Windows（WSL 建议）下验证通过

## 自动化验证

- [ ] 运行 `bun run verify:env` 通过
- [ ] 运行 `bun run verify` 通过

---

提示：如遇问题，请参考 `docs/development/TROUBLESHOOTING.md` 并在 PR 中附带失败项及修复说明。
