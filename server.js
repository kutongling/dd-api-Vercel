const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');

const app = express();

// 启用CORS
app.use(cors());

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

// API路由
app.get('/api/:path(*)', async (req, res) => {
    try {
        const apiPath = '/' + req.params.path;
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = generateSignature(appId, timestamp, apiPath, appSecret);

        // 构建请求URL和参数
        const targetUrl = `${API_BASE}${apiPath}`;
        const headers = {
            'X-AppId': appId,
            'X-Timestamp': timestamp.toString(),
            'X-Signature': signature,
            'Accept': 'application/json'
        };

        // 转发请求
        const response = await axios({
            method: 'get',
            url: targetUrl,
            params: req.query,
            headers: headers
        });

        res.json(response.data);
    } catch (error) {
        console.error('API错误:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            errorCode: error.response?.status,
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