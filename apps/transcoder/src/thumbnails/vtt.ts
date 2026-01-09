export const formatVTTTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
};

export const calculateSpritePosition = (
  index: number,
  columns: number,
  thumbWidth: number,
  thumbHeight: number
): { x: number; y: number } => {
  const col = index % columns;
  const row = Math.floor(index / columns);
  return {
    x: col * thumbWidth,
    y: row * thumbHeight,
  };
};

export const generateVTT = (
  duration: number,
  interval: number,
  columns: number,
  rows: number,
  thumbWidth: number,
  thumbHeight: number,
  spriteFilename: string
): string => {
  const lines = ['WEBVTT', ''];
  let currentTime = 0;
  let index = 0;
  const maxFrames = columns * rows;

  while (currentTime < duration && index < maxFrames) {
    const { x, y } = calculateSpritePosition(index, columns, thumbWidth, thumbHeight);

    const startTime = formatVTTTime(currentTime);
    const endTime = formatVTTTime(Math.min(currentTime + interval, duration));

    lines.push(`${startTime} --> ${endTime}`);
    lines.push(`${spriteFilename}#xywh=${x},${y},${thumbWidth},${thumbHeight}`);
    lines.push('');

    currentTime += interval;
    index++;
  }

  return lines.join('\n');
};
