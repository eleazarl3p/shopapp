import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { Readable } from 'stream';

@Injectable()
export class GgdrvService {
  private driveClient;
  constructor() {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    this.driveClient = google.drive({ version: 'v3', auth });
  }

  async uploadFiles(files: Express.Multer.File[]) {
    const uploadedFiles = [];

    for (const file of files) {
      const fileMetadata = {
        name: file.originalname,
        parents: ['1d2WQ7rRehM0fFSv3fM35_lStIg8J6nwj'], // Optional: specify folder ID
      };

      const media = {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer), // Convert buffer to readable stream
      };

      const response = await this.driveClient.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name',
      });

      uploadedFiles.push(response.data); // Store uploaded file info
    }

    return uploadedFiles; // Return array of uploaded file data
  }

  async deleteFile(fileId: string) {
    await this.driveClient.files.delete({ fileId });
  }

  async uploadPdfToDrive(pdfBuffer: Buffer, filename: string): Promise<string> {
    const fileMetadata = {
      name: filename,
      parents: ['1d2WQ7rRehM0fFSv3fM35_lStIg8J6nwj'],
    };

    const media = {
      mimeType: 'application/pdf',
      body: this.bufferToStream(pdfBuffer),
    };

    const response = await this.driveClient.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name',
    });

    return response.data.id;
    //console.log('File uploaded successfully with ID:', response.data.id);
  }

  bufferToStream(buffer: Buffer): Readable {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null); // Signal the end of the stream
    return readable;
  }
}
