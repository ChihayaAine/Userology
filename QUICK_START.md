# 🚀 快速启动指南

## 最快速的启动方式

1. **进入项目目录**
   ```bash
   cd usercopy-separated
   ```

2. **一键启动** (推荐)
   ```bash
   ./scripts/dev.sh
   ```
   这个脚本会自动：
   - 检测并使用 Yarn 或 npm
   - 安装所有依赖
   - 创建环境变量文件模板
   - 启动前后端服务器

## 使用 Yarn (您的偏好)

```bash
# 安装依赖
yarn install:all

# 启动开发环境
yarn dev
```

## 使用 npm

```bash
# 安装依赖  
npm run install:all

# 启动开发环境
npm run dev
```

## 访问地址

- **前端**: http://localhost:8089
- **后端API**: http://localhost:8090
- **健康检查**: http://localhost:8090/health

## 环境配置

第一次运行时，请编辑以下文件：

1. **后端配置** (`backend/.env`)
   ```bash
   nano backend/.env
   ```

2. **前端配置** (`frontend/.env`)
   ```bash
   nano frontend/.env
   ```

## 停止服务

按 `Ctrl+C` 停止所有服务器

---

✅ **您现在可以继续使用熟悉的 `yarn dev` 命令启动项目！**
