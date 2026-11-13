import { describe, it, expect } from 'vitest';
import { validateFileMagicBytes } from './file-validation';
import { BadRequestException } from '@nestjs/common';

describe('validateFileMagicBytes', () => {
  it('accepts legitimate JPEG image buffer', () => {
    // JPEG header: FF D8 FF
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
    const result = validateFileMagicBytes(jpegBuffer, 'tender_photo.jpg');
    expect(result.detectedMime).toBe('image/jpeg');
    expect(result.sanitizedFilename).toBe('tender_photo.jpg');
  });

  it('accepts legitimate PNG image buffer', () => {
    // PNG header: 89 50 4E 47 0D 0A 1A 0A
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
    const result = validateFileMagicBytes(pngBuffer, 'official_emblem.png');
    expect(result.detectedMime).toBe('image/png');
    expect(result.sanitizedFilename).toBe('official_emblem.png');
  });

  it('accepts legitimate PDF document buffer', () => {
    // PDF header: %PDF-
    const pdfBuffer = Buffer.from('%PDF-1.7\n%some binary data here');
    const result = validateFileMagicBytes(pdfBuffer, 'tender_notice_2026.pdf');
    expect(result.detectedMime).toBe('application/pdf');
    expect(result.sanitizedFilename).toBe('tender_notice_2026.pdf');
  });

  it('blocks executable scripts masquerading as images (.exe, .sh)', () => {
    const fakeBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00');
    expect(() => validateFileMagicBytes(fakeBuffer, 'malware.exe')).toThrow(BadRequestException);
  });

  it('blocks SVG images due to XSS script injection risks', () => {
    const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    expect(() => validateFileMagicBytes(svgBuffer, 'image.svg')).toThrow(BadRequestException);
  });

  it('blocks HTML files masquerading as JPEG (.jpg extension with HTML content)', () => {
    const htmlBuffer = Buffer.from('<html><head></head><body><h1>Phishing</h1></body></html>');
    expect(() => validateFileMagicBytes(htmlBuffer, 'document.jpg')).toThrow(BadRequestException);
  });

  it('blocks empty file buffers', () => {
    expect(() => validateFileMagicBytes(Buffer.alloc(0), 'empty.pdf')).toThrow(BadRequestException);
  });
});
