# DreamazeBook Frontend

## 项目概述
DreamazeBook是一个基于Next.js的现代化前端应用，提供多语言支持、支付系统和实时通信功能。

## 技术栈
- **框架**: Next.js 15.3.0 (with Turbopack)
- **UI组件库**: 
  - Material-UI (MUI) 6.4.6
  - Ant Design 5.24.0
- **状态管理**: Zustand 5.0.3
- **国际化**: next-intl 3.26.3
- **支付系统**: Stripe
- **实时通信**: Pusher/Socket.io
- **动画**: Framer Motion 12.4.3
- **样式**: TailwindCSS + PostCSS
- **类型检查**: TypeScript

## 核心功能
- 多语言国际化支持
- Stripe支付集成
- 实时通信功能
- 管理后台系统
- 响应式UI设计

## 目录结构
```
├── app/                  # Next.js App Router
│   ├── [locale]/         # 国际化路由
│   ├── api/              # API路由
│   ├── components/       # 公共组件
│   └── config/           # 应用配置
├── constants/            # 常量定义
├── i18n/                 # 国际化配置
├── messages/             # 翻译文件
├── public/               # 静态资源
└── ...

## 开发指南

### 环境准备
1. Node.js 18+
2. Yarn或npm

### 安装依赖
```bash
npm install
# 或
yarn
```

### 运行开发服务器
```bash
npm run dev
# 或
yarn dev
```

### 构建生产版本
```bash
npm run build
# 或
yarn build
```

### 代码检查
```bash
npm run lint
# 或
yarn lint
```

## 部署指南
项目支持Vercel等Next.js兼容平台部署。确保配置以下环境变量：
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`: Stripe公钥
- `STRIPE_SECRET_KEY`: Stripe私钥
- `PUSHER_APP_KEY`: Pusher应用密钥
- `NEXT_PUBLIC_LOCALES`: 支持的语言列表

## 贡献指南
1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request