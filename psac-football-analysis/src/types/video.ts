export interface VideoProcessingResponse {
  success: boolean;
  annotatedVideoUrl?: string;
  processingTime?: number;
  totalFrames?: number;
  error?: string;
}

export interface VideoProperties {
  width: number;
  height: number;
  fps: number;
  totalFrames: number;
}

export interface ProcessingProgress {
  framesProcessed: number;
  totalFrames: number;
  fps: number;
  progress: number;
} 