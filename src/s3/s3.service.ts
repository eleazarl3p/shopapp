import {
  PutBucketAclCommandOutput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class S3Service {
  private region: string;
  private s3Client: S3Client;
  private logger = new Logger(S3Service.name);

  constructor() {
    this.region = process.env.AWS_S3_REGION;
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      },
    });
  }
  async upload(file: Express.Multer.File, key: string) {
    const bucket = process.env.S3_BUCKET;

    const input: PutObjectCommandInput = {
      Body: file.buffer,
      Bucket: bucket,
      Key: key,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    try {
      const response: PutBucketAclCommandOutput = await this.s3Client.send(
        new PutObjectCommand(input),
      );

      if (response.$metadata.httpStatusCode == 200) {
        return `https://${bucket}.s3.${this.region}.amazonaws.com/${key}`;
      }
      throw new Error('image not save to s3!');
    } catch (error) {
      this.logger.error('Cannot save file inside s3', error);
      throw error;
    }
  }

  // Upload PDF to S3
  async uploadPdfToS3(
    pdfBuffer: Buffer,

    key: string,
  ): Promise<any> {
    const bucket = process.env.S3_BUCKET;
    const input: PutObjectCommandInput = {
      Body: pdfBuffer,
      Bucket: bucket,
      Key: key,
      ContentType: 'application/pdf',
      ACL: 'public-read',
    };

    try {
      const response: PutBucketAclCommandOutput = await this.s3Client.send(
        new PutObjectCommand(input),
      );

      if (response.$metadata.httpStatusCode == 200) {
        return `https://${bucket}.s3.${this.region}.amazonaws.com/${key}`;
      }
      throw new Error('image not save to s3!');
    } catch (error) {
      this.logger.error('Cannot save file inside s3', error);
      throw error;
    }
  }
}
