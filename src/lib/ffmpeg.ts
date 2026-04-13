'use client';

let sharedWorker: Worker | null = null;

export const getFFmpegWorker = () => {
  if (typeof window === 'undefined') return null;
  
  if (!sharedWorker) {
    sharedWorker = new Worker(new URL('./ffmpeg.worker.ts', import.meta.url));
  }
  
  return sharedWorker;
};

export const terminateFFmpegWorker = () => {
  if (sharedWorker) {
    sharedWorker.terminate();
    sharedWorker = null;
  }
};
