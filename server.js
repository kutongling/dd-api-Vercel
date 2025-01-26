const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');
const { URL } = require('url');

const app = express();

// 简化 CORS 配置，专注于基本功能
const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type', 'Origin', 'Accept'],
    credentials: false  // 移动端通常不需要凭证
};

// 基础中间件
app.use(cors(corsOptions));
app.use(express.json());

// 添加简单的健康检查端点
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// API配置
const API_BASE = 'https://api.dandanplay.net';
const appId = process.env.DANDAN_APP_ID || 's8zi9cvbw9';
const appSecret = process.env.DANDAN_APP_SECRET || '24QkxXdVGF4k3RIVPHDNIbsUY4GYPtxF';

// 生成签名
function generateSignature(appId, timestamp, path, appSecret) {
    const data = `${appId}${timestamp}${path}${appSecret}`;
    return crypto.createHash('sha256')
                .update(data, 'utf8')
                .digest('base64');
}

// 通用路由处理
app.get('*', async (req, res) => {
    try {
        // 简化响应头设置
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET');
        res.header('Content-Type', 'application/json;charset=utf-8');
        res.header('Cache-Control', 'no-cache');

        let apiPath;
        let targetUrl;
        let params = {};

        // 简化 URL 处理
        const fullUrl = req.url.slice(1);
        if (fullUrl.startsWith('http')) {
            const urlObj = new URL(fullUrl);
            apiPath = urlObj.pathname;
            targetUrl = `${API_BASE}${apiPath}`;
            urlObj.searchParams.forEach((value, key) => {
                params[key] = value;
            });
        } else {
            apiPath = req.path;
            targetUrl = `${API_BASE}${apiPath}`;
            params = req.query;
        }

        // 规范化路径
        apiPath = apiPath.replace(/\/+/g, '/');

        const timestamp = Math.floor(Date.now() / 1000);
        const signature = generateSignature(appId, timestamp, apiPath, appSecret);

        // 添加重试逻辑
        const response = await axios({
            method: 'get',
            url: targetUrl,
            params: params,
            headers: {
                'X-AppId': appId,
                'X-Timestamp': timestamp.toString(),
                'X-Signature': signature,
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'  // 添加通用 User-Agent
            },
            timeout: 10000,  // 10秒超时
            validateStatus: status => status < 500  // 允许非500错误
        });

        return res.json(response.data);

    } catch (error) {
        // 改进错误处理
        console.error('请求失败:', {
            error: error.message,
            url: req.url,
            status: error.response?.status,
            data: error.response?.data
        });

        // 返回友好的错误信息
        res.status(error.response?.status || 500).json({
            success: false,
            errorCode: error.response?.status || 500,
            errorMessage: '请求失败，请稍后重试'
        });
    }
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        success: false,
        errorCode: 500,
        errorMessage: '服务器内部错误'
    });
});

// 如果不在Vercel环境中，启动本地服务器
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`本地服务器运行在 http://localhost:${port}`);
    });
}

// 导出app实例供Vercel使用
module.exports = app;