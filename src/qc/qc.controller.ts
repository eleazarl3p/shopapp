import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { QcService } from './qc.service';

import { CutTaskItemDto } from 'src/task/dto/cut-task-item.dto';
import { TaskAreaHistoryDto } from 'src/task/dto/task-to-area.dto';

import { AuthGuard } from '@nestjs/passport';
import { TaskService } from 'src/task/task.service';
import { RFDto } from './dto/rf.dto';
// import { GldriveService } from 'src/gldrive/gldrive.service';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { GgdrvService } from 'src/ggdrv/ggdrv.service';

@Controller('qc')
@UseGuards(AuthGuard('jwt'))
export class QcController {
  constructor(
    private readonly qcService: QcService,
    private readonly taskService: TaskService,
    private readonly googleDriveService: GgdrvService,
  ) {}

  @Get('completed-tasks/:paquete')
  async completedTasks(@Param('paquete', ParseIntPipe) paqueteId: number) {
    return await this.taskService.qcCompletedTasks(paqueteId);
  }

  @Get('job/pending')
  async pendingJobs() {
    const t = await this.qcService.pendingJobs();
    return t;
  }

  @Get('job/failed')
  async failedJobs() {
    return await this.qcService.failedJobs();
  }

  // Materials from Cutting area that QC needs to check
  @Get('recently-cut-materials/:paquete')
  async recentlyCutMaterials(
    @Param('paquete', ParseIntPipe) paqueteId: number,
  ) {
    return await this.taskService.recentlyCutMaterials(paqueteId);
  }

  // QC sends verified materials to an area
  @Patch('review-materials/:area')
  async reviewCutMaterials(
    @Body() cutTaskItemDto: CutTaskItemDto[],
    @Param('area', ParseIntPipe) areaId: number,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    return await this.taskService.qcReviewCutMaterials(
      cutTaskItemDto,
      areaId,
      userId,
    );
  }

  // QC verify member from an area
  @Patch('review-member/:area')
  async reviewMember(
    @Body() taskAreaHistoryDto: TaskAreaHistoryDto[],
    @Param('area', ParseIntPipe) areaId: number,
    @Req() req: any,
  ) {
    const userId = req.user.sub;

    return await this.taskService.qcReviewMember(
      taskAreaHistoryDto,
      areaId,
      userId,
    );
  }

  // QC get list of failed materials
  @Get('failed-cut-materials/:paquete')
  async failedMaterials(@Param('paquete', ParseIntPipe) paqueteId: number) {
    return this.taskService.failedCutMaterials(paqueteId);
  }

  async submitFormReview(
    @UploadedFiles() photos: Express.Multer.File[],
    @Query('piecemarks') piecemarks: string,
    @Body('json') jsonData: string,
    @Request() req: any,
  ) {
    let imageUrls = [];

    // if (photos != null && photos.length > 0) {
    //   // const uploadedImages = await this.googleDriveService.uploadFiles(photos);
    //   // imageUrls = uploadedImages.map((img) => img.id);
    // }

    if (piecemarks == 'materials') {
      const parsedJson = JSON.parse(jsonData);
      const rfDto = plainToInstance(RFDto, parsedJson);
      //console.log(imageUrls);
      try {
        await validateOrReject(rfDto); // Validate the DTO
      } catch (errors) {
        console.log('invalid');
        throw new BadRequestException('Data not valid');
      }
      const userId = req.user.sub;
      rfDto.photos = imageUrls;
      await this.qcService.submitFormTaskItem(rfDto, userId);

      return imageUrls;
    } else if (piecemarks == 'members') {
      console.log('member');
    } else {
      console.log(piecemarks);
    }
  }
  // // QC send report
  // @Post('submit-form')
  // async submitFormReview(
  //   @Query('piecemarks') piecemarks: string,
  //   @Body() rfDto: RFDto,
  //   @Request() req: any,
  // ) {
  //   if (piecemarks == 'materials') {
  //     const userId = req.user.sub;

  //     return await this.qcService.submitFormTaskItem(rfDto, userId);
  //   } else if (piecemarks == 'members') {
  //     console.log('member');
  //   } else {
  //     console.log(piecemarks);
  //   }
  // }
  @Get('reports/:paquete')
  reports(@Param('paquete', ParseIntPipe) paqueteId: number) {
    return this.taskService.getReports(paqueteId);
  }

  // // // QC update report
  // // @Patch('report/:id')
  // // updateReport(
  // //   @Param('id', ParseIntPipe) reportId: number,
  // //   @Body() rfDto: any,
  // //   @Request() req: any,
  // // ) {
  // //   const userId = req.user.sub;
  // //   return this.qcService.updateReport(reportId, rfDto, userId);
  // // }

  // @Patch('report/:id')
  // @UseInterceptors(
  //   FilesInterceptor('photos', 5, {
  //     fileFilter: (req, file, cb) => {
  //       if (file.mimetype.startsWith('image/')) {
  //         cb(null, true);
  //       } else {
  //         cb(new Error('Invalid file type, only images are allowed!'), false);
  //       }
  //     },
  //   }),
  // )
  // async updateFormReview(
  //   @UploadedFiles() photos: Express.Multer.File[],
  //   @Param('id', ParseIntPipe) reportId: number,
  //   @Body('json') jsonData: string,
  //   @Request() req: any,
  // ) {
  //   let imageUrls = [];
  //   const parsedJson = JSON.parse(jsonData);
  //   const rfDto = plainToInstance(RFDto, parsedJson);

  //   try {
  //     await validateOrReject(rfDto); // Validate the DTO
  //   } catch (errors) {
  //     throw new BadRequestException('Data not valid');
  //   }
  //   if (photos != null && photos.length > 0) {
  //     // const uploadedImages = await this.googleDriveService.uploadFiles(photos);
  //     // imageUrls = uploadedImages.map((img) => img.id);
  //   }

  //   const userId = req.user.sub;

  //   return this.qcService.updateReport(reportId, rfDto, imageUrls, userId);
  // }
}
