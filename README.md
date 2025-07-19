# DreamazeBook - 多语言电子书平台

## 项目概述
DreamazeBook 是一个基于 Next.js 的多语言电子书平台，提供书籍浏览、购买、个性化阅读体验等功能。支持国际化、实时通信和支付集成。

## 技术栈
- **框架**: Next.js 15.3 + React 19
- **UI组件库**: 
  - Material-UI (MUI)
  - Ant Design
  - Heroicons
- **状态管理**: Zustand
- **国际化**: next-intl
- **支付**: Stripe
- **实时通信**: 
  - Pusher
  - Socket.io
- **动画**: Framer Motion
- **日期处理**: 
  - date-fns
  - MUI Date Pickers
- **样式**: 
  - TailwindCSS
  - Emotion
- **工具库**: 
  - Axios
  - React Hot Toast

## 项目结构
```
dreamazebook-frontend/
├── app/                  # Next.js 应用路由
│   ├── [locale]/         # 国际化路由
│   │   ├── (marketing)/  # 营销页面
│   │   ├── (website)/    # 主站功能
│   │   │   ├── books/    # 书籍相关
│   │   │   ├── checkout/ # 结账流程
│   │   │   ├── shopping-cart/ # 购物车
│   │   │   └── ...       # 其他功能模块
│   ├── api/              # API路由
│   └── config/          # 应用配置
├── components/           # 公共组件(当前为空)
├── stores/               # 状态管理
│   └── userStore.ts      # 用户状态管理
├── utils/                # 工具函数
│   ├── api.js            # API请求
│   ├── auth.js           # 认证工具
│   └── ...               # 其他工具
├── public/               # 静态资源
└── ...                   # 其他配置文件
```

## 核心功能
1. **多语言支持** - 通过[locale]路由和next-intl实现
2. **用户认证** - 登录/注册/密码重置功能
3. **电商功能**:
   - 书籍浏览与选择
   - 购物车管理
   - 结账流程
   - 订单摘要
4. **个性化阅读**:
   - 书籍内容选择
   - 阅读偏好设置
5. **实时通信** - 通过Pusher和Socket.io实现
6. **分析与追踪** - 用户行为追踪

## 如何运行
1. 安装依赖:
```bash
npm install
```

2. 配置环境变量:
复制`.env.example`为`.env`并填写必要配置

3. 开发模式:
```bash
npm run dev
```

4. 生产构建:
```bash
npm run build
npm start
```

## 贡献指南
欢迎提交Pull Request。请确保代码风格一致并通过所有测试。