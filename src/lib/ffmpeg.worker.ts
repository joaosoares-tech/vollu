import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

const loadFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;
  
  ffmpeg = new FFmpeg();
  
  // Base URL for FFmpeg core files
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  
  return ffmpeg;
};

self.onmessage = async (e: MessageEvent) => {
  const { command, id, data } = e.data;
  
  try {
    const ffmpegInstance = await loadFFmpeg();
    
    ffmpegInstance.on('log', ({ message }) => {
      self.postMessage({ id, type: 'log', message });
    });
    
    ffmpegInstance.on('progress', ({ progress }) => {
      self.postMessage({ id, type: 'progress', progress });
    });

    if (command === 'VIDEO_TO_GIF') {
      const { file, start, end, fps, width } = data;
      const inputName = 'input_video';
      const outputName = 'output.gif';
      const paletteName = 'palette.png';

      await ffmpegInstance.writeFile(inputName, await fetchFile(file));

      // Pass 1: Generate palette
      // fps=15,scale=480:-1:flags=lanczos,palettegen
      await ffmpegInstance.exec([
        '-i', inputName,
        '-ss', start.toString(),
        '-to', end.toString(),
        '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos,palettegen`,
        paletteName
      ]);

      // Pass 2: Apply palette
      // fps=15,scale=480:-1:flags=lanczos [x]; [x][1:v] paletteuse
      await ffmpegInstance.exec([
        '-i', inputName,
        '-i', paletteName,
        '-ss', start.toString(),
        '-to', end.toString(),
        '-lavfi', `fps=${fps},scale=${width}:-1:flags=lanczos [x]; [x][1:v] paletteuse`,
        outputName
      ]);

      const outputData = await ffmpegInstance.readFile(outputName);
      self.postMessage({ id, type: 'done', data: outputData, mimeType: 'image/gif' });

      // Cleanup
      await ffmpegInstance.deleteFile(inputName);
      await ffmpegInstance.deleteFile(paletteName);
      await ffmpegInstance.deleteFile(outputName);

    } else if (command === 'CUT_AUDIO') {
      const { file, start, end, format, fadeIn, fadeOut } = data;
      const inputName = 'input_audio';
      const outputName = `output.${format}`;

      await ffmpegInstance.writeFile(inputName, await fetchFile(file));

      const filters: string[] = [];
      if (fadeIn > 0) {
        filters.push(`afade=t=in:st=0:d=${fadeIn}`);
      }
      if (fadeOut > 0) {
        // We need the duration for the fade out start time
        // But since we are cutting, st should be (duration - fadeOut)
        // Simplified: we'll use duration in the command if possible or just assume start/end
        const duration = end - start;
        filters.push(`afade=t=out:st=${duration - fadeOut}:d=${fadeOut}`);
      }

      const args = [
        '-i', inputName,
        '-ss', start.toString(),
        '-to', end.toString(),
      ];

      if (filters.length > 0) {
        args.push('-af', filters.join(','));
      } else {
        args.push('-c', 'copy'); // Ultra-fast if no filters
      }

      args.push(outputName);

      await ffmpegInstance.exec(args);

      const outputData = await ffmpegInstance.readFile(outputName);
      self.postMessage({ id, type: 'done', data: outputData, mimeType: format === 'mp3' ? 'audio/mpeg' : 'audio/wav' });

      // Cleanup
      await ffmpegInstance.deleteFile(inputName);
      await ffmpegInstance.deleteFile(outputName);

    } else if (command === 'CONVERT_AUDIO') {
      const { file, format, bitrate, sampleRate } = data;
      const inputName = `input_${id}_src`;
      const outputName = `output_${id}.${format}`;

      await ffmpegInstance.writeFile(inputName, await fetchFile(file));

      const args = ['-i', inputName];

      if (format === 'mp3') {
        args.push('-c:a', 'libmp3lame', '-b:a', bitrate || '192k');
      } else if (format === 'wav') {
        args.push('-c:a', 'pcm_s16le'); // Standard 16-bit PCM
      } else if (format === 'ogg') {
        args.push('-c:a', 'libvorbis', '-q:a', '4');
      }

      // Metadata preservation is default in ffmpeg for most formats if not stripped
      args.push(outputName);

      await ffmpegInstance.exec(args);

      const outputData = await ffmpegInstance.readFile(outputName);
      
      let mimeType = 'audio/mpeg';
      if (format === 'wav') mimeType = 'audio/wav';
      if (format === 'ogg') mimeType = 'audio/ogg';

      self.postMessage({ id, type: 'done', data: outputData, mimeType });
      
      // Cleanup
      await ffmpegInstance.deleteFile(inputName);
      await ffmpegInstance.deleteFile(outputName);
    }

  } catch (error: any) {
    self.postMessage({ id, type: 'error', error: error.message });
  }
};
