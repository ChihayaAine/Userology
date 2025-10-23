# Usercopy - 前后端分离版本

这是一个经过重构的前后端分离的 Usercopy 项目，解决了原有项目编译2000+组件的性能问题。

## 🏗️ 项目结构

```
usercopy-separated/
├── backend/                   # Express.js 后端API服务
│   ├── src/
│   │   ├── controllers/       # 控制器层
│   │   ├── services/          # 业务逻辑层
│   │   ├── routes/           # 路由定义
│   │   ├── middleware/       # 中间件
│   │   ├── config/           # 配置文件
│   │   ├── types/            # 类型定义
│   │   └── lib/              # 工具库
│   ├── package.json
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── env.example
├── frontend/                  # Next.js 前端应用
│   ├── src/
│   │   ├── app/              # Next.js 13+ App Router
│   │   ├── components/       # React 组件
│   │   ├── services/         # API 服务层
│   │   ├── contexts/         # React Context
│   │   ├── types/            # 类型定义
│   │   └── lib/              # 工具库
│   ├── package.json
│   ├── next.config.js
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── env.example
├── scripts/                   # 项目管理脚本
│   ├── dev.sh               # 开发环境启动
│   ├── build.sh             # 构建脚本
│   ├── setup.sh             # 项目初始化
│   └── clean.sh             # 清理脚本
├── docker-compose.yml         # 生产环境Docker编排
├── docker-compose.dev.yml     # 开发环境Docker编排
├── nginx.conf                # Nginx反向代理配置
├── package.json              # 根项目配置
└── README.md
```

## 🛠️ 技术栈

### 后端 (Express.js)
- **框架**: Express.js + TypeScript
- **数据库**: Supabase (PostgreSQL)
- **认证**: Clerk (服务端验证)
- **AI服务**: OpenAI GPT-4
- **语音服务**: Retell SDK
- **其他**: CORS, Helmet, Morgan

### 前端 (Next.js)
- **框架**: Next.js 14 + TypeScript
- **UI库**: Radix UI, Shadcn/ui, Tailwind CSS
- **状态管理**: React Context + TanStack Query
- **认证**: Clerk
- **HTTP客户端**: Axios

## 🚀 快速开始

### 方式一：使用脚本（推荐）

1. **项目初始化**
   ```bash
   cd usercopy-separated
   ./scripts/setup.sh
   ```

2. **配置环境变量**
   ```bash
   # 编辑后端环境变量
   nano backend/.env
   
   # 编辑前端环境变量
   nano frontend/.env
   ```

3. **启动开发环境**
   ```bash
   ./scripts/dev.sh
   ```

### 方式二：使用包管理器脚本

1. **安装依赖**
   ```bash
   # 使用 Yarn (推荐)
   yarn install:all
   
   # 或使用 npm
   npm run install:all
   ```

2. **启动开发服务器**
   ```bash
   # 使用 Yarn (推荐)
   yarn dev
   
   # 或使用 npm
   npm run dev
   ```

### 方式三：使用Docker

```bash
# 开发环境
docker-compose -f docker-compose.dev.yml up

# 生产环境
docker-compose up -d
```

## 📋 可用脚本

### 根目录脚本
```bash
# 使用 Yarn (推荐)
yarn dev              # 同时启动前后端开发服务器
yarn build            # 构建前后端项目
yarn start            # 启动生产环境服务器
yarn install:all      # 安装所有依赖
yarn clean            # 清理所有构建文件

# 或使用 npm
npm run dev           # 同时启动前后端开发服务器
npm run build         # 构建前后端项目
npm run start         # 启动生产环境服务器
npm run install:all   # 安装所有依赖
npm run clean         # 清理所有构建文件
```

### 项目管理脚本
```bash
./scripts/setup.sh       # 项目初始化和依赖安装
./scripts/dev.sh         # 启动开发环境（推荐）
./scripts/build.sh       # 构建项目
./scripts/clean.sh       # 清理项目文件
```

### Docker脚本
```bash
# 使用 Yarn
yarn docker:build     # 构建Docker镜像
yarn docker:up        # 启动Docker容器
yarn docker:down      # 停止Docker容器
yarn docker:logs      # 查看Docker日志

# 或使用 npm
npm run docker:build  # 构建Docker镜像
npm run docker:up     # 启动Docker容器
npm run docker:down   # 停止Docker容器
npm run docker:logs   # 查看Docker日志
```

### PM2 生产环境脚本
```bash
# PM2 进程管理
pm2 list              # 查看所有进程状态
pm2 logs              # 查看实时日志
pm2 logs backend      # 查看后端日志
pm2 logs frontend     # 查看前端日志
pm2 restart all       # 重启所有服务
pm2 restart backend   # 重启后端
pm2 restart frontend  # 重启前端
pm2 stop all          # 停止所有服务
pm2 delete all        # 删除所有进程
pm2 save              # 保存当前进程列表（开机自启）
pm2 monit             # 实时资源监控
pm2 startup           # 设置开机自启动
```

## 🔗 访问地址

- **前端应用**: http://localhost:8089
- **后端API**: http://localhost:8090
- **API健康检查**: http://localhost:8090/health

## 📝 主要改进

### 1. 解决编译性能问题
- **原问题**: 前后端耦合导致编译时需要处理2000+组件
- **解决方案**: 彻底分离前后端，前端只编译UI组件，后端只处理API逻辑

### 2. 项目结构优化
- **统一管理**: 所有代码在一个主目录下
- **清晰分离**: 前后端代码完全独立
- **脚本自动化**: 提供完整的开发和部署脚本

### 3. 开发体验提升
- **一键启动**: 使用脚本一键启动整个开发环境
- **热重载**: 前后端都支持代码热重载
- **类型安全**: 保持TypeScript类型检查
- **Docker支持**: 完整的容器化开发和部署方案

## 🔧 API接口

### 主要端点

- **面试管理**: `/api/interviews`
- **面试官管理**: `/api/interviewers` 
- **通话管理**: `/api/call`
- **回应管理**: `/api/responses`
- **数据分析**: `/api/analytics`

### 示例请求

```typescript
// 获取所有面试
GET /api/interviews?userId=xxx&organizationId=xxx

// 创建面试
POST /api/interviews
{
  "interviewData": { ... },
  "organizationName": "company"
}

// 注册通话
POST /api/call/register
{
  "interviewer_id": "123",
  "dynamic_data": { ... }
}
```

## 🛡️ 环境变量

### 后端必需变量 (backend/.env)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
RETELL_API_KEY=your_retell_key
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 前端必需变量 (frontend/.env)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
PORT=3000
```

## 📦 部署

### 生产环境部署

1. **使用Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **手动部署**
   ```bash
   # 构建项目
   npm run build
   
   # 启动服务
   npm run start
   ```

3. **使用 PM2 部署（推荐生产环境）**
   ```bash
   # 步骤 1：构建后端
   cd backend
   yarn build
   
   # 步骤 2：构建前端
   cd ../frontend
   yarn build
   
   # 步骤 3：回到根目录
   cd ..
   
   # 步骤 4：停止旧的 PM2 进程（如果有）
   pm2 delete backend frontend 2>/dev/null || true
   
   # 步骤 5：启动后端
   cd backend
   pm2 start yarn --name "backend" -- start
   
   # 步骤 6：启动前端
   cd ../frontend
   pm2 start yarn --name "frontend" -- start
   
   # 步骤 7：保存 PM2 配置（开机自启）
   pm2 save
   
   # 步骤 8：查看服务状态
   pm2 list
   
   # 常用 PM2 命令
   pm2 logs              # 查看日志
   pm2 restart all       # 重启所有服务
   pm2 stop all          # 停止所有服务
   pm2 monit             # 实时监控
   ```

### 部署到云服务

项目已配置好Dockerfile，可以直接部署到：
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- Heroku
- Vercel (前端) + Railway (后端)

### 4. 配置 HTTPS（使用 Caddy + 免费域名）

为了解决浏览器 Cookie 策略问题（部分浏览器在 HTTP 环境下无法正常使用 Clerk 认证），建议配置 HTTPS。

#### 步骤 1：获取免费域名

使用 DuckDNS 申请免费二级域名（或购买付费域名）：

1. 访问 https://www.duckdns.org/，用 GitHub/Google 登录
2. 创建子域名，例如 `your-app.duckdns.org`
3. 将域名指向服务器 IP：`47.93.101.73`
4. 验证：`dig +short your-app.duckdns.org`（应返回服务器 IP）

#### 步骤 2：安装 Caddy

```bash
# 添加 Caddy 官方仓库
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list

# 安装 Caddy
sudo apt update
sudo apt install -y caddy

# 验证安装
caddy version
```

#### 步骤 3：配置 Caddyfile

编辑 `/etc/caddy/Caddyfile`：

```bash
sudo nano /etc/caddy/Caddyfile
```

内容如下（替换 `your-app.duckdns.org` 为你的域名）：

```caddyfile
# ================= your-app.duckdns.org =================
your-app.duckdns.org {

    # ---------- 前端 ----------
    @frontend {
        path /
        path /sign-*
        path /dashboard*
        path /call*
        path /interview*
    }
    reverse_proxy @frontend 127.0.0.1:8089

    # ---------- 后端 API ----------
    @api path /api/*
    reverse_proxy @api 127.0.0.1:8090

    # ---------- 安全头 ----------
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    }

    # ---------- WebSocket 支持 ----------
    @ws {
        header Connection *Upgrade*
        header Upgrade websocket
    }
}
```

#### 步骤 4：启动 Caddy

```bash
# 验证配置
sudo caddy validate --config /etc/caddy/Caddyfile

# 重启 Caddy（会自动申请 Let's Encrypt 证书）
sudo systemctl restart caddy

# 查看状态
sudo systemctl status caddy

# 查看证书申请日志
sudo journalctl -u caddy -n 50 --no-pager | grep "certificate obtained"
```

#### 步骤 5：更新 .env 文件

将项目根目录的 `.env` 文件中的 URL 更新为 HTTPS：

```env
NEXT_PUBLIC_LIVE_URL=https://your-app.duckdns.org
FRONTEND_URL=https://your-app.duckdns.org
NEXT_PUBLIC_API_URL=https://your-app.duckdns.org/api
```

#### 步骤 6：重启服务

```bash
cd /home/ecs-user/usercopy-separated
pm2 restart all --update-env
```

#### 步骤 7：验证

```bash
# 检查 HTTPS
curl -I https://your-app.duckdns.org

# 检查 API
curl -I https://your-app.duckdns.org/api/interviewers
```

浏览器访问 `https://your-app.duckdns.org`，所有浏览器（包括 360、Safari、Chrome）都应该可以正常登录。

#### 注意事项

- Caddy 会自动申请和续期 Let's Encrypt 证书（90天有效期）
- 确保服务器防火墙已开放 80 和 443 端口
- 如果之前使用 Nginx，需要停止：`sudo systemctl stop nginx && sudo systemctl disable nginx`
- 证书存储在 `/var/lib/caddy/`，无需手动管理

## 🐛 故障排除

### 常见问题

1. **端口冲突**
   - 确保3000和3001端口未被占用
   - 修改环境变量中的PORT配置

2. **环境变量问题**
   - 检查.env文件是否存在并配置正确
   - 确认所有必需的API密钥已填写

3. **依赖安装失败**
   - 清理项目：`./scripts/clean.sh`
   - 重新安装：`./scripts/setup.sh`

4. **Docker问题**
   - 清理Docker资源：`docker system prune -a`
   - 重新构建：`docker-compose build --no-cache`

### 查看日志

```bash
# 开发环境日志
./scripts/dev.sh

# Docker环境日志
docker-compose logs -f

# 单独查看后端日志
cd backend && npm run dev

# 单独查看前端日志
cd frontend && npm run dev
```

## 🤝 贡献

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目使用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

---

## 🔄 从原项目迁移

如果您是从原来的耦合项目迁移，请按以下步骤操作：

1. **备份原项目数据**
2. **运行初始化脚本**: `./scripts/setup.sh`
3. **复制环境变量**: 从原项目复制相关配置到新的.env文件
4. **测试功能**: 使用 `./scripts/dev.sh` 启动并测试所有功能
5. **部署**: 确认无误后进行生产环境部署

项目已完全解耦，性能大幅提升，开发体验显著改善！
