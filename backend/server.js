const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());
app.use(cors());

// 过滤函数：判断是否为有效的内容图片
function isValidContentImage(url) {
  if (!url || typeof url !== 'string') return false;
  
  // 必须包含小红书图片域名
  if (!url.includes('sns-img') && !url.includes('xhscdn')) return false;
  
  // 排除头像图片
  if (url.includes('avatar/')) return false;
  
  // 排除图标和标签
  if (url.includes('icon/') || url.includes('search/trends/')) return false;
  
  // 排除表情包和小图标
  if (url.includes('emoji/') || url.includes('sticker/')) return false;
  
  // 排除太小的图片（通常是图标）
  if (url.includes('w/120') || url.includes('w/60') || url.includes('w/40')) return false;
  
  // 只保留较大的内容图片
  if (url.includes('w/1080') || url.includes('w/720') || url.includes('w/480')) return true;
  
  // 如果没有明确的尺寸参数，但是符合内容图片的URL模式
  const contentImagePattern = /sns-img.*\.(jpg|jpeg|png|webp)/i;
  return contentImagePattern.test(url);
}

// 基础版本：使用axios + cheerio
async function fetchImagesBasic(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    let images = [];
    
    // 方法1: 查找所有img标签
    $('img').each((i, el) => {
      const src = $(el).attr('src');
      if (isValidContentImage(src)) {
        images.push(src);
      }
    });
    
    // 方法2: 查找可能的图片URL在script标签中
    $('script').each((i, el) => {
      const scriptContent = $(el).html();
      if (scriptContent) {
        const imgMatches = scriptContent.match(/https:\/\/[^"]*\.(?:jpg|jpeg|png|webp)/gi);
        if (imgMatches) {
          imgMatches.forEach(img => {
            if (isValidContentImage(img)) {
              images.push(img);
            }
          });
        }
      }
    });
    
    // 去重并按URL排序（保持一致的顺序）
    images = [...new Set(images)];
    images.sort();
    
    return images;
  } catch (error) {
    console.error('Basic fetch error:', error.message);
    return [];
  }
}

// 高级版本：使用Puppeteer模拟浏览器
async function fetchImagesAdvanced(url) {
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 设置用户代理
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148');
    
    // 拦截图片请求以获取URL
    const imageUrls = [];
    await page.setRequestInterception(true);
    
    page.on('request', (request) => {
      if (request.resourceType() === 'image') {
        const imgUrl = request.url();
        if (isValidContentImage(imgUrl)) {
          imageUrls.push(imgUrl);
        }
      }
      request.continue();
    });
    
    // 访问页面
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // 等待页面加载
    await page.waitForTimeout(3000);
    
    // 滚动页面以触发懒加载
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    await page.waitForTimeout(2000);
    
    // 获取页面中的img元素
    const pageImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(img => img.src).filter(src => src);
    });
    
    // 过滤页面图片
    const validPageImages = pageImages.filter(isValidContentImage);
    
    // 合并所有图片URL
    const allImages = [...new Set([...imageUrls, ...validPageImages])];
    allImages.sort(); // 保持一致的顺序
    
    return allImages;
  } catch (error) {
    console.error('Advanced fetch error:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// API端点：抓取小红书图片
app.post('/api/xhs/images', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }
  
  if (!url.includes('xiaohongshu.com')) {
    return res.status(400).json({ error: 'Invalid URL: must be a xiaohongshu.com link' });
  }
  
  console.log(`Fetching images from: ${url}`);
  
  try {
    // 先尝试基础方法
    console.log('Trying basic method...');
    let images = await fetchImagesBasic(url);
    
    // 如果基础方法没有获取到图片，尝试高级方法
    if (images.length === 0) {
      console.log('Basic method failed, trying advanced method...');
      images = await fetchImagesAdvanced(url);
    }
    
    console.log(`Found ${images.length} valid content images:`, images);
    
    res.json({ 
      success: true,
      images: images,
      count: images.length 
    });
    
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch images', 
      detail: error.message 
    });
  }
});

// 测试端点
app.get('/api/test', (req, res) => {
  res.json({ message: 'XHS Image API is running!' });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 XHS Image API server running on port ${PORT}`);
  console.log(`📝 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🔍 Images endpoint: POST http://localhost:${PORT}/api/xhs/images`);
}); 