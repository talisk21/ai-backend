import * as pdfParse from "pdf-parse";
import * as mammoth from "mammoth";
import * as XLSX from "xlsx";
import * as sharp from "sharp";

export interface ConvertedFile {
  name: string;
  mimeType: string;
  buffer: Buffer;
  ext: string;
}

export class FileConverterService {
  async convert(buffer: Buffer, originalFilename: string): Promise<ConvertedFile> {
    const ext = originalFilename.split(".").pop()?.toLowerCase();
    if (!ext) throw new Error("Unknown file extension");

    const baseName = originalFilename.replace(/\.[^/.]+$/, "");
    let converted: Omit<ConvertedFile, "name">;

    switch (ext) {
      case "txt":
        converted = await this.convertText(buffer);
        break;
      case "pdf":
        converted = await this.convertPdf(buffer);
        break;
      case "docx":
        converted = await this.convertDocx(buffer);
        break;
      case "xlsx":
      case "xls":
        converted = await this.convertExcel(buffer);
        break;
      case "png":
      case "jpg":
      case "jpeg":
      case "heic":
      case "heif":
      case "webp":
      case "bmp":
      case "tiff":
        converted = await this.convertImageToPng(buffer);
        break;
      default:
        throw new Error(`❌ Unsupported file type: ${ext}`);
    }

    return {
      ...converted,
      name: `${baseName}.${converted.ext}`
    };
  }

  private async convertText(buffer: Buffer): Promise<Omit<ConvertedFile, "name">> {
    const content = buffer.toString("utf-8");
    return {
      mimeType: "text/plain",
      buffer: Buffer.from(content),
      ext: "txt"
    };
  }

  private async convertPdf(buffer: Buffer): Promise<Omit<ConvertedFile, "name">> {
    const data = await pdfParse(buffer);
    return {
      mimeType: "text/plain",
      buffer: Buffer.from(data.text),
      ext: "txt"
    };
  }

  private async convertDocx(buffer: Buffer): Promise<Omit<ConvertedFile, "name">> {
    const result = await mammoth.extractRawText({ buffer });
    return {
      mimeType: "text/plain",
      buffer: Buffer.from(result.value),
      ext: "txt"
    };
  }

  private async convertExcel(buffer: Buffer): Promise<Omit<ConvertedFile, "name">> {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const text = json
      .map((row: any[]) => (row || []).join("\t"))
      .join("\n");

    return {
      mimeType: "text/plain",
      buffer: Buffer.from(text),
      ext: "txt"
    };
  }

  private async convertImageToPng(buffer: Buffer): Promise<Omit<ConvertedFile, "name">> {
    try {
      const image = sharp(buffer, { failOnError: false });
      const metadata = await image.metadata();

      if (!metadata.format) throw new Error("Unknown image format");

      const pngBuffer = await image
        .resize({ width: 1024, withoutEnlargement: true })
        .png({ compressionLevel: 9 })
        .toBuffer();

      return {
        mimeType: "image/png",
        buffer: pngBuffer,
        ext: "png"
      };
    } catch (error: any) {
      throw new Error(`Image conversion failed: ${error.message}`);
    }
  }
}