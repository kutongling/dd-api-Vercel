import axios from 'axios';

export default async function handler(req, res) {
  const { query } = req;
  const targetUrl = query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'X-AppId': process.env.APP_ID,  // 从环境变量中获取
        'X-AppSecret': process.env.APP_SECRET,  // 从环境变量中获取
        'X-Timestamp': Math.floor(Date.now() / 1000),
        // 如果使用签名验证，请添加 X-Signature
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error while fetching data:", error);  // 打印详细的错误
    res.status(500).json({
      error: 'Failed to fetch data from external API',
      details: error.message,
    });
  }
}
