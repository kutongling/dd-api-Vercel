# 弹弹play API 代理服务

为 Emby弹幕插件 提供的弹弹play API 代理服务，用于解决跨域请求问题。

## ✨ 特性

- 处理弹弹play API的签名认证
- 支持Vercel一键部署
- 轻量级实现，低资源占用
- 完全兼容弹弹play官方API规范

## 🚀 快速开始

### Vercel部署 (推荐)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kutongling/dd-api-Vercel)

1. 点击上方按钮一键部署到Vercel
2. 部署过程中可以配置环境变量 (详见下方环境变量配置)
3. 部署完成后，你将获得一个URL：`https://your-project.vercel.app`
4. 将此URL配置到Emby弹幕插件中

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/kutongling/dd-api-Vercel.git

# 2. 安装依赖
npm install

# 3. 创建并配置环境变量 (.env 文件)
cp .env.example .env
# 编辑 .env 文件，填入你的 AppID 和 AppSecret

# 4. 启动服务
npm run dev
```

## ⚙️ 环境变量配置

创建 `.env` 文件或在Vercel部署时配置以下环境变量：

```env
DANDAN_APP_ID=你的弹弹play AppID
DANDAN_APP_SECRET=你的弹弹play AppSecret
PORT=3000 # 本地开发端口
```

> **注意**：如何获取 AppID 和 AppSecret？请参考[弹弹play开发者文档](https://www.dandanplay.com/developer.html)

## 📝 API使用示例

### 基本请求格式

```javascript
// 搜索动画
fetch('https://your-project.vercel.app/api/v2/search/episodes?anime=进击的巨人')
  .then(res => res.json())
  .then(console.log);

// 获取弹幕
fetch('https://your-project.vercel.app/api/v2/comment/{episodeId}?withRelated=true')
  .then(res => res.json())
  .then(console.log);
```

### 支持的API端点

本代理服务支持弹弹play的所有API端点，主要包括：

- `/api/v2/search/episodes` - 搜索视频
- `/api/v2/comment/{episodeId}` - 获取弹幕
- `/api/v2/match` - 匹配视频
- 更多API请参考[弹弹play API文档](https://api.dandanplay.net/swagger/ui/index)

## 🔍 API响应格式

| 字段 | 类型 | 说明 |
|------|------|------|
| success | boolean | 请求是否成功 |
| errorCode | number | 错误代码，0表示成功 |
| errorMessage | string | 错误信息 |
| data | object/array | 返回数据 |

### 常见错误码

- `401`: 认证失败
- `404`: 资源不存在
- `400`: 参数错误
- `500`: 服务器内部错误

## 🔧 常见问题排查

### 认证失败
- 检查 AppID 和 AppSecret 是否正确配置
- 确认环境变量已正确设置

### 跨域问题
- 本服务已内置CORS支持，如遇跨域问题，请检查请求头设置

### Vercel部署问题
- 确保函数执行时间在Vercel的限制范围内
- 检查Vercel日志以获取更多信息

## 📦 项目依赖

- `express`: Web服务框架
- `axios`: HTTP客户端
- `cors`: 跨域资源共享中间件
- `dotenv`: 环境变量配置

## 🔧 技术要求

- Node.js >= 14
- npm 或 yarn

## 🔗 相关项目

- [Emby弹幕插件](https://github.com/kutongling/dd-danmaku)
- [弹弹play官网](https://www.dandanplay.com/)

## 📄 许可证

MIT 许可证

## 💖 致谢

感谢 [弹弹play](https://www.dandanplay.com) 提供的API服务。
感谢所有为本项目做出贡献的开发者。
