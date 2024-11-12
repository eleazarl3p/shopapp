import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class CloudmService {
  private driveClient;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    this.driveClient = google.drive({ version: 'v3', auth });
  }
}
