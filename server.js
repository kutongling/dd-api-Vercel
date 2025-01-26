const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');
const { URL } = require('url');

const app = express();

// 增强的CORS配置
const corsOptions = {
    origin: true, // 允许所有来源
    methods: ['GET', 'POST', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
        'Content-Type',
        'X-AppId',
        'X-Timestamp',
        'X-Signature',
        'Accept',
        'Origin',
        'Authorization',
        'X-Requested-With'
    ],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    credentials: true,
    maxAge: 86400 // 预检请求缓存24小时
};

// 使用增强的CORS配置
app.use(cors(corsOptions));

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        success: false,
        errorCode: 500,
        errorMessage: '服务器内部错误'
    });
});

// 通用路由 - 处理所有请求
app.get('*', async (req, res) => {
    try {
        // 设置增强的响应头
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
        res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
        res.header('Access-Control-Expose-Headers', corsOptions.exposedHeaders.join(', '));
        res.header('Access-Control-Max-Age', corsOptions.maxAge);
        res.header('Access-Control-Allow-Credentials', 'true');

        let apiPath;
        let targetUrl;
        let params = {};

        // 解析请求URL
        const fullUrl = req.url.slice(1); // 移除开头的 /
        if (fullUrl.startsWith('http')) {
            // 完整URL格式
            const urlObj = new URL(fullUrl);
            apiPath = urlObj.pathname;
            targetUrl = `${API_BASE}${apiPath}`;
            // 获取查询参数
            urlObj.searchParams.forEach((value, key) => {
                params[key] = value;
            });
        } else {
            // 相对路径格式
            apiPath = req.path;
            targetUrl = `${API_BASE}${apiPath}`;
            params = req.query;
        }

        // 规范化路径
        apiPath = apiPath.replace(/\/+/g, '/');

        // 生成签名
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = generateSignature(appId, timestamp, apiPath, appSecret);

        console.log('请求信息:', {
            原始URL: fullUrl,
            API路径: apiPath,
            目标URL: targetUrl,
            参数: params,
            时间戳: timestamp
        });

        // 发送请求
        const response = await axios({
            method: 'get',
            url: targetUrl,
            params: params,
            headers: {
                'X-AppId': appId,
                'X-Timestamp': timestamp.toString(),
                'X-Signature': signature,
                'Accept': 'application/json'
            }
        });

        // 修改响应发送
        return res.set({
            'Content-Type': 'application/json;charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }).json(response.data);

    } catch (error) {
        console.error('API错误:', error);
        
        // 确保错误响应也包含正确的CORS头
        res.header('Access-Control-Allow-Origin', '*');
        res.status(error.response?.status || 500).json({
            success: false,
            errorCode: error.response?.status || 500,
            errorMessage: error.response?.data?.errorMessage || error.message
        });
    }
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
