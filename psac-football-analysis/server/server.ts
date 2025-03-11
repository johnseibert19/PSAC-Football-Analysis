import express, { Express, Request, Response } from 'express';
import multer from 'multer';
import next from 'next';
import path from 'path';
import fs from 'fs';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB limit

app.prepare().then(() => {
  const server: Express = express();

  server.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

  server.post('/api/uploadVideo', upload.single('video'), (req: any, res: Response) => {
    if (!req.file) {
      res.status(400).json({ message: 'No video file found.' });
      return;
    }

    const outputPath = path.join(__dirname, 'uploads', `${Date.now()}_annotated.mp4`);
    fs.writeFileSync(outputPath, fs.readFileSync(req.file.path));

    // Replace the original video:
    try {
      fs.unlinkSync(req.file.path); // Delete original
      const originalFileName = path.basename(req.file.originalname, path.extname(req.file.originalname));
      const newFilePath = path.join(__dirname, 'uploads', `${originalFileName}_annotated${path.extname(outputPath)}`);
      fs.renameSync(outputPath, newFilePath); // Rename annotated
      res.status(200).json({ message: 'Video processed successfully', videoUrl: newFilePath });
    } catch (replaceError: any) {
      // If replacement fails, send the annotated video's original path.
      res.status(200).json({ message: 'Video processed, but replacement failed.', videoUrl: outputPath });
    }
    return; // Explicitly return void
  });

  server.all('*', (req: Request, res: Response) => {
    return handle(req, res);
  });

  server.listen(3000, (err?: any) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});