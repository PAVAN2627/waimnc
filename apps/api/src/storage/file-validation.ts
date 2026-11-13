import { BadRequestException } from '@nestjs/common';

export interface ValidatedFileResult {
  detectedMime: string;
  sanitizedFilename: string;
}

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'pdf']);

const BLOCKED_EXTENSIONS = new Set([
  'html', 'htm', 'xhtml', 'svg', 'xml',
  'php', 'phtml', 'php3', 'php4', 'php5', 'phps',
  'exe', 'dll', 'bat', 'cmd', 'sh', 'bash', 'bin',
  'js', 'mjs', 'ts', 'jsx', 'tsx',
  'asp', 'aspx', 'jsp', 'cgi', 'pl', 'py',
]);

/**
 * Validates file buffer magic bytes (file signature) to prevent forged MIME types.
 */
export function validateFileMagicBytes(buffer: Buffer, originalname: string): ValidatedFileResult {
  if (!buffer || buffer.length === 0) {
    throw new BadRequestException('Empty file buffer provided');
  }

  // 1. Extension check
  const extMatch = originalname.toLowerCase().match(/\.([a-z0-9]+)$/i);
  if (!extMatch) {
    throw new BadRequestException('File must have a valid extension (.jpg, .jpeg, .png, .webp, .pdf)');
  }
  const ext = extMatch[1].toLowerCase();

  if (BLOCKED_EXTENSIONS.has(ext)) {
    throw new BadRequestException(`Forbidden file extension: .${ext}`);
  }

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new BadRequestException(`Unsupported file type: .${ext}. Only JPG, PNG, WEBP, and PDF are allowed.`);
  }

  // 2. Magic byte inspection
  let detectedMime: string | null = null;

  // PDF: %PDF- (0x25 0x50 0x44 0x46)
  if (
    buffer.length >= 5 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    detectedMime = 'application/pdf';
  }
  // JPEG: 0xFF 0xD8 0xFF
  else if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    detectedMime = 'image/jpeg';
  }
  // PNG: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  else if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    detectedMime = 'image/png';
  }
  // WebP: RIFF....WEBP
  else if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    detectedMime = 'image/webp';
  }

  if (!detectedMime) {
    throw new BadRequestException(
      'File signature validation failed. The file contents do not match supported image (JPEG/PNG/WEBP) or PDF formats.'
    );
  }

  // Ensure extension matches detected content
  if (detectedMime === 'application/pdf' && ext !== 'pdf') {
    throw new BadRequestException('Mismatched file extension and content for PDF file.');
  }
  if (detectedMime === 'image/jpeg' && ext !== 'jpg' && ext !== 'jpeg') {
    throw new BadRequestException('Mismatched file extension and content for JPEG file.');
  }
  if (detectedMime === 'image/png' && ext !== 'png') {
    throw new BadRequestException('Mismatched file extension and content for PNG file.');
  }
  if (detectedMime === 'image/webp' && ext !== 'webp') {
    throw new BadRequestException('Mismatched file extension and content for WebP file.');
  }

  // Sanitize filename: replace unsafe chars
  const sanitizedFilename = originalname.replace(/[^a-zA-Z0-9._-]/g, '_');

  return { detectedMime, sanitizedFilename };
}
