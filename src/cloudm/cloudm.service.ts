import { Injectable } from '@nestjs/common';

@Injectable()
export class CloudmService {
  private driveClient;

  constructor() {
    // Drive client is not initialized immediately, it will be loaded lazily
    this.driveClient = null;
  }

  // Lazy initialize the Google Drive client
  private async initDriveClient() {
    if (!this.driveClient) {
      const { google } = await import('googleapis');
      const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });
      this.driveClient = google.drive({ version: 'v3', auth });
    }
    return this.driveClient;
  }
}
