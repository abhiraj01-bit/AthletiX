import { VercelRequest, VercelResponse } from '@vercel/node';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { geminiService } from '../../server/services/geminiService.js';
import { db, TestAttempt } from '../../server/lib/database.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files allowed'));
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
    await runMiddleware(req, res, upload.single('video'));
    
    const { testType, userId } = req.body;
    const videoFile = (req as any).file;
    
    if (!videoFile) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    if (!testType || !userId) {
      return res.status(400).json({ error: 'Missing testType or userId' });
    }
    
    const analysis = await geminiService.analyzeVideo(videoFile.buffer, testType);

    const attempt: TestAttempt = {
      id: randomUUID(),
      userId,
      testType,
      videoUrl: undefined,
      analysisResult: analysis,
      metrics: analysis.metrics,
      formScore: analysis.formScore,
      badge: analysis.badge,
      recommendations: analysis.recommendations,
      createdAt: new Date().toISOString()
    };

    const savedAttempt = await db.saveTestAttempt(attempt);

    res.json({
      success: true,
      attempt: savedAttempt,
      analysis
    });

  } catch (error) {
    console.error('Test analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};