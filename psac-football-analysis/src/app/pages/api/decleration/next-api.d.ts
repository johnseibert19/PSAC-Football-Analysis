import { File } from 'multer';

declare module 'next' {
  interface NextApiRequest {
    file: File;
  }
}