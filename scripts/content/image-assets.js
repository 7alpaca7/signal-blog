import fs from 'node:fs';
import path from 'node:path';

/**
 * 构建时读取本地 PNG 的尺寸，不让浏览器等图片下载后才确定正文高度。
 * @param {string} publicDirectory 静态资源根目录。
 * @param {string} source Markdown 中的站内图片路径。
 */
export function readPngSize(publicDirectory, source) {
  if (!source.startsWith('/images/') || !source.endsWith('.png')) return undefined;
  const file = path.resolve(publicDirectory, source.slice(1));
  if (!file.startsWith(`${path.resolve(publicDirectory)}${path.sep}`))
    throw new Error('图片路径越界。');
  const descriptor = fs.openSync(file, 'r');
  try {
    const header = Buffer.alloc(24);
    fs.readSync(descriptor, header, 0, header.length, 0);
    if (header.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a')
      throw new Error(`无效 PNG：${source}`);
    return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
  } finally {
    fs.closeSync(descriptor);
  }
}
