const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');
const { URL } = require('url');

const app = express();

// 启用CORS
app.use(cors());

// API配置
const API_BASE = 'https://api.dandanplay.net';
const appId = process.env.DANDAN_APP_ID;
const appSecret = process.env.DANDAN_APP_SECRET;

// 生成签名
function generateSignature(appId, timestamp, path, appSecret) {
    const data = `${appId}${timestamp}${path}${appSecret}`;
    return crypto.createHash('sha256')
                .update(data, 'utf8')
                .digest('base64');
}

// 通用路由 - 处理所有请求
app.get('*', async (req, res) => {
    try {
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

        res.json(response.data);

    } catch (error) {
        console.error('API错误:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

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
