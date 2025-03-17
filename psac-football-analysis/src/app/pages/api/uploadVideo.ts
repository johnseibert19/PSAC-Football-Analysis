import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Error from 'next/error';
import { ValidationError } from 'next/dist/compiled/amphtml-validator';

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

// Create a middleware function to run multer
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) => { //eslint-disable-line
  return new Promise((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      await runMiddleware(req, res, upload.single('video'));

      const videoFile = req.file;
      if (!videoFile) {
        return res.status(400).json({ message: 'No video file found.' });
      }

      const outputPath = path.join('./uploads', `${Date.now()}_annotated.mp4`);
      fs.writeFileSync(outputPath, fs.readFileSync(videoFile.path));

      // Replace the original video:
      try{
          fs.unlinkSync(videoFile.path); // Delete original
          const originalFileName = path.basename(videoFile.originalname, path.extname(videoFile.originalname));
          const newFilePath = path.join('./uploads', `${originalFileName}_annotated${path.extname(outputPath)}`);
          fs.renameSync(outputPath, newFilePath); // Rename annotated
          res.status(200).json({ message: 'Video processed successfully', videoUrl: newFilePath });
      } catch (replaceError: unknown) {
          // If replacement fails, send the annotated video's original path.
          const knownError = replaceError as ValidationError
          res.status(200).json({ message: 'Video processed, but replacement failed.', videoUrl: outputPath, error: knownError.message });
      }

    } catch (error: unknown) {
      const knownError = error as ValidationError
      res.status(500).json({ message: 'Error processing video', error: knownError.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};

export const config = {
  api: {
    bodyParser: false, // Disable built-in body parsing
  },
};

export default handler;