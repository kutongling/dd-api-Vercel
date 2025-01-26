// api/proxy.js
import axios from 'axios';
import crypto from 'crypto';

export default async function handler(req, res) {
  const appId = process.env.APP_ID || 's8zi9cvbw9'; // 从环境变量中读取 AppId
  const appSecret = process.env.APP_SECRET || '24QkxXdVGF4k3RIVPHDNIbsUY4GYPtxF'; // 从环境变量中读取 AppSecret
  const targetUrl = req.query.url; // 获取目标 API URL

  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing target URL' });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const path = new URL(targetUrl).pathname; // 提取路径部分

  // 生成签名
  const data = appId + timestamp + path + appSecret;
  const signature = crypto.createHash('sha256').update(data).digest('base64');

  try {
    // 转发请求到弹弹play API
    const response = await axios.get(targetUrl, {
      headers: {
        'X-AppId': appId,
        'X-Timestamp': timestamp,
        'X-Signature': signature,
      },
    });

    // 返回弹弹play API 的响应
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error proxying request:', error.message);
    res.status(500).json({ error: 'Failed to proxy request' });
  }
}