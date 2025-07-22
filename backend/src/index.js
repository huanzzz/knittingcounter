import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { pdfToPng } from 'pdf-to-png-converter';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// 创建上传目录
const uploadsDir = join(__dirname, '../uploads');
const outputDir = join(__dirname, '../output');

try {
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });
} catch (err) {
  console.error('创建目录失败:', err);
}

// PDF转换API
app.post('/api/convert-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传PDF文件' });
    }

    // 将PDF转换为PNG
    const pngPages = await pdfToPng(req.file.buffer, {
      viewportScale: 2.0, // 设置更高的分辨率
      outputFolder: outputDir,
      outputFileMaskFunc: (pageNumber) => `page_${pageNumber}.png`,
    });

    // 返回转换后的图片信息
    const images = pngPages.map(page => ({
      pageNumber: page.pageNumber,
      path: page.path,
      width: page.width,
      height: page.height
    }));

    res.json({ images });
  } catch (error) {
    console.error('PDF转换错误:', error);
    res.status(500).json({ error: '转换PDF时发生错误' });
  }
});

// 获取转换后的图片
app.get('/api/images/:filename', async (req, res) => {
  try {
    const imagePath = join(outputDir, req.params.filename);
    res.sendFile(imagePath);
  } catch (error) {
    console.error('获取图片错误:', error);
    res.status(500).json({ error: '获取图片时发生错误' });
  }
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`服务器运行在 http://${HOST}:${PORT}`);
});