# 弹弹play API 代理服务

为 Emby弹幕插件 提供的弹弹play API 代理服务，用于解决跨域请求问题。

## ✨ 特性

-  处理弹弹play API的签名认证
-  支持Vercel一键部署

## 🚀 快速开始

### Vercel部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ktl-dd)

1. 点击上方按钮一键部署到Vercel
2. 部署完成后，你将获得一个URL：`https://your-project.vercel.app`

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/yourusername/ktl-dd.git

# 2. 安装依赖
npm install

# 3. 启动服务
npm run dev
```

## 📝 使用示例

```javascript
// 搜索动画
fetch('https://your-project.vercel.app/api/v2/search/episodes?anime=进击的巨人')
  .then(res => res.json())
  .then(console.log);
```

## ⚙️ 环境变量配置

```env
DANDAN_APP_ID=你的弹弹play AppID
DANDAN_APP_SECRET=你的弹弹play AppSecret
PORT=3000 # 本地开发端口
```

## 🔍 API响应格式

| 字段 | 类型 | 说明 |
|------|------|------|
| success | boolean | 请求是否成功 |
| errorCode | number | 错误代码，0表示成功 |
| errorMessage | string | 错误信息 |

### 常见错误码

- `401`: 认证失败
- `404`: 资源不存在
- `400`: 参数错误

## 📦 项目依赖

- `express`: Web服务框架
- `axios`: HTTP客户端
- `cors`: 跨域资源共享中间件

## 🔧 技术要求

- Node.js >= 14
- npm 或 yarn

## 📄 许可证

MIT License

## 🔗 相关项目

- [Emby弹幕插件](https://github.com/kutongling/dd-danmaku)
- [弹弹play](https://www.dandanplay.com/)

## 💖 致谢

感谢 [弹弹play](https://www.dandanplay.com) 提供的API服务。
