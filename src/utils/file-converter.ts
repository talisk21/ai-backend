import * as mammoth from 'mammoth';
import * as pdfParse from 'pdf-parse';
import * as sharp from 'sharp';
import * as XLSX from 'xlsx';

export interface ConvertedFile {
  name: string;
  mimeType: string;
  buffer: Buffer;
  ext: string;
}

export async function convertFile(
  buffer: Buffer,
  originalFilename: string,
): Promise<ConvertedFile> {
  const ext = originalFilename.split('.').pop()?.toLowerCase();
  if (!ext) throw new Error('Unknown file extension');

  const baseName = originalFilename.replace(/\.[^/.]+$/, '');
  let converted: Omit<ConvertedFile, 'name'>;

  switch (ext) {
    case 'txt':
      converted = await convertText(buffer);
      break;
    case 'pdf':
      converted = await convertPdf(buffer);
      break;
    case 'docx':
      converted = await convertDocx(buffer);
      break;
    case 'xlsx':
    case 'xls':
      converted = await convertExcel(buffer);
      break;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'heic':
    case 'heif':
    case 'webp':
    case 'bmp':
    case 'tiff':
      converted = await convertImageToPng(buffer);
      break;
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }

  return {
    ...converted,
    name: `${baseName}.${converted.ext}`,
  };
}

async function convertText(
  buffer: Buffer,
): Promise<Omit<ConvertedFile, 'name'>> {
  return {
    mimeType: 'text/plain',
    buffer: Buffer.from(buffer.toString('utf-8')),
    ext: 'txt',
  };
}

async function convertPdf(
  buffer: Buffer,
): Promise<Omit<ConvertedFile, 'name'>> {
  const data = await pdfParse(buffer);
  return {
    mimeType: 'text/plain',
    buffer: Buffer.from(data.text, 'utf-8'),
    ext: 'txt',
  };
}

async function convertDocx(
  buffer: Buffer,
): Promise<Omit<ConvertedFile, 'name'>> {
  const result = await mammoth.extractRawText({ buffer });
  return {
    mimeType: 'text/plain',
    buffer: Buffer.from(result.value, 'utf-8'),
    ext: 'txt',
  };
}

async function convertExcel(
  buffer: Buffer,
): Promise<Omit<ConvertedFile, 'name'>> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const text = rows.map((row) => row.join('\t')).join('\n');

  return {
    mimeType: 'text/plain',
    buffer: Buffer.from(text, 'utf-8'),
    ext: 'txt',
  };
}

async function convertImageToPng(
  buffer: Buffer,
): Promise<Omit<ConvertedFile, 'name'>> {
  const img = sharp(buffer, { failOnError: false });
  const metadata = await img.metadata();
  if (!metadata.format) throw new Error('Unknown image format');

  const pngBuffer = await img
    .resize({ width: 1024, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer();

  return {
    mimeType: 'image/png',
    buffer: pngBuffer,
    ext: 'png',
  };
}
