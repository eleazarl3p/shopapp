import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
// import { GldriveService } from './gldrive.service';

@Controller('gldrive')
export class GldriveController {
  // constructor(private readonly googleDriveService: GldriveService) {}
  // @Post()
  // @UseInterceptors(
  //   FilesInterceptor('files', 5, {
  //     // limits: { fileSize: 15 * 1024 * 1024 }, // Limit file size to 15MB
  //     fileFilter: (req, file, cb) => {
  //       if (file.mimetype.startsWith('image/')) {
  //         cb(null, true);
  //       } else {
  //         cb(new Error('Invalid file type, only images are allowed!'), false);
  //       }
  //     },
  //   }),
  // ) // Accept up to 10 files with the field name 'files'
  // async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
  //   if (!files || files.length === 0) {
  //     throw new Error('No files uploaded!');
  //   }
  //   // Call the service to upload multiple files to Google Drive
  //   // const uploadedFiles = await this.googleDriveService.uploadFiles(files);
  //   return {
  //     message: 'Files uploaded successfully!',
  //     // uploadedFiles,
  //   };
  // }
  //   @Post()
  //   @UseInterceptors(FileInterceptor('file'))
  //   async uploadFiles(@UploadedFiles() file: Express.Multer.File) {
  //     if (!file) {
  //       throw new Error('No file uploaded!');
  //     }
  //     console.log('File received:', file);
  //     // Check if buffer is available
  //     if (!file.buffer) {
  //       throw new Error('File buffer is undefined');
  //     }
  //     const uploadResult = await this.googleDriveService.uploadFile(file);
  //     return {
  //       message: 'File uploaded successfully!',
  //       fileId: uploadResult.id,
  //       fileName: uploadResult.name,
  //     };
  //   }
}
