import { VercelRequest, VercelResponse } from '@vercel/node';
import multer from 'multer';
import { foodAnalysisService } from '../../server/services/foodAnalysisService.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await runMiddleware(req, res, upload.single('foodImage'));
    
    const imageFile = (req as any).file;
    
    if (!imageFile) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const analysis = await foodAnalysisService.analyzeFood(imageFile.buffer);

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Food analysis error:', error);
    res.status(500).json({ error: 'Food analysis failed' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};