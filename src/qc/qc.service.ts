import { Injectable, NotFoundException } from '@nestjs/common';
import { JobService } from 'src/job/job.service';
import { TaskService } from 'src/task/task.service';
import { RFDto } from './dto/rf.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MaterialInspection,
  MemberInspection,
} from './entity/inspection.entity';
import { Repository } from 'typeorm';
import { SpecialUser } from 'src/specialuser/entity/special-user.entity';
import { InspectionCriteria } from './entity/inspection-criteria.entity';
// import { GldriveService } from 'src/gldrive/gldrive.service';

// pdf
// import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';
import { S3Service } from 'src/s3/s3.service';
import { url } from 'inspector';
@Injectable()
export class QcService {
  constructor(
    @InjectRepository(MaterialInspection)
    private readonly matInsRepo: Repository<MaterialInspection>,

    @InjectRepository(MemberInspection)
    private readonly memInsRepo: Repository<MemberInspection>,

    @InjectRepository(InspectionCriteria)
    private readonly inspectionCriteriaRepo: Repository<InspectionCriteria>,

    private readonly jobService: JobService,
    private readonly taskService: TaskService,

    private readonly s3Service: S3Service,

    // private readonly googleDriveService: GldriveService,
  ) {}

  async pendingJobs() {
    const jobs = await this.jobService.findAll();

    const njbs = await Promise.all(
      jobs.map(async (jb) => {
        const paq = await Promise.all(
          jb.paquetes.map(async (pq) => {
            const materials_to_review =
              await this.taskService.recentlyCutMaterials(pq._id);

            if (materials_to_review.length) {
              return pq;
            } else {
              const tasks_to_review = await this.taskService.qcCompletedTasks(
                pq._id,
              );

              if (tasks_to_review.length) {
                return pq;
              }
            }
          }),
        );

        const filteredPaq = paq.filter(Boolean);

        if (filteredPaq.length) {
          return {
            ...jb,
            paquetes: filteredPaq,
          };
        }
      }),
    );

    const filteredJobs = njbs.filter(Boolean);

    return filteredJobs;
  }

  async failedJobs() {
    const jobs = await this.jobService.findAll();

    const njbs = await Promise.all(
      jobs.map(async (jb) => {
        const paq = await Promise.all(
          jb.paquetes
            .map(async (pq) => {
              const materials_to_review =
                await this.taskService.failedCutMaterials(pq._id);

              if (materials_to_review.length) {
                return pq;
              } else {
                const tasks_to_review = await this.taskService.qcFailedTasks(
                  pq._id,
                );

                if (tasks_to_review.length) {
                  return pq;
                }
              }
            })
            .filter(Boolean),
        );

        const filteredPaq = paq.filter(Boolean);

        if (filteredPaq.length) {
          return {
            ...jb,
            paquetes: filteredPaq,
          };
        }
      }),
    );

    const filteredJobs = njbs.filter(Boolean);

    return filteredJobs;
  }

  async submitFormTaskItem(rfDto: RFDto, userId: number) {
    const { criteria_answers, ids, inspector, fabricator, ...rest } = rfDto;

    for (const _id of ids) {
      try {
        const mainsp = this.matInsRepo.create({
          ...rest,
          inspector: { _id: inspector._id } as SpecialUser,
          fabricator: { _id: fabricator._id } as SpecialUser,
        });

        const toSaveAnswer = [];
        for (const cia of criteria_answers) {
          const ipc = this.inspectionCriteriaRepo.create({
            criteria: { _id: cia.criteria._id },
            answer: cia.answer,
          });

          toSaveAnswer.push(ipc);
        }

        const crAns = await this.inspectionCriteriaRepo.save(toSaveAnswer);
        mainsp.criteriaAnswers = crAns;

        const inspection = await this.matInsRepo.save(mainsp);

        await this.taskService.qcInspectCutHistory(_id, inspection);

        console.log('end');
      } catch (error) {
        console.log(error, 'error');
      }
    }
  }

  async updateReport(
    rfId: number,
    rfDto: RFDto,
    imageUrls: any,
    userId: number,
  ): Promise<string> {
    const inspection = await this.matInsRepo.findOne({
      where: { _id: rfId },
      relations: { inspector: true, fabricator: true, criteriaAnswers: true },
    });
    const {
      criteria_answers,
      photos,
      inspector,
      fabricator,

      ...rest
    } = rfDto;

    if (!inspection) {
      throw new NotFoundException();
    }

    for (const photoId of photos) {
      try {
        // await this.googleDriveService.deleteFile(photoId); // Remove from Google Drive
      } catch (error) {}
    }

    //rfDto.photos = imageUrls;
    try {
      await this.matInsRepo.update(
        { _id: rfId },
        {
          inspection_type: rest.inspection_type,
          comments: rest.comments,
          fit_up_inspection: rest.fit_up_inspection,
          non_conformance: rest.non_conformance,
          inspector: { _id: inspector._id },
          fabricator: { _id: fabricator._id },
          photos: imageUrls,
          completed: rest.completed,
        },
      );

      for (const ca of inspection.criteriaAnswers) {
        const crA = criteria_answers.filter((c) => c['_id'] == ca._id);
        if (crA.length > 0) {
          const result = crA.pop();
          await this.inspectionCriteriaRepo.update(
            {
              _id: ca._id,
            },
            { answer: result.answer },
          );
        }
      }

      if (rest.completed) {
        const rep = await this.matInsRepo.findOne({
          where: { _id: rfId },
          relations: {
            inspector: true,
            fabricator: true,
            criteriaAnswers: { criteria: true },
          },
        });

        const material = rest['materials'][0];
        const questions = rep.criteriaAnswers.map(
          (cr) => `<p class="questions">${cr.criteria.question}</p>`,
        );
        const answers = rep.criteriaAnswers.map(
          (an) => `<p class="questions">${an.answer}</p>`,
        );

        const photos = rep.photos.map(
          (ph_id) =>
            `<img src="https://drive.google.com/thumbnail?id=${ph_id}&sz=w10000" alt="material image" />`,
        );
        //         const html = `
        //               <!DOCTYPE html>
        //               <html lang="en">
        //               <head>
        //                 <meta charset="UTF-8">
        //                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
        //                 <title>PDF Example</title>
        //                 <style>
        //                   body {
        //                     font-family: Arial, sans-serif;
        //                     margin: 0;
        //                     padding: 20px;
        //                     background-color: #f9f9f9;
        //                   }
        //                   h1 {
        //                     color: #333;
        //                     text-align: center;
        //                   }
        //                   p {
        //                     font-size: 14px;
        //                     line-height: 1.5;
        //                     color: #555;
        //                   }
        //                   .content {
        //                     background-color: #fff;
        //                     padding: 20px;
        //                     border-radius: 8px;
        //                     box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        //                   }
        //                     .column {
        //                       display : flex;
        //                       gap: 10px;
        //                     }
        //                 </style>
        //               </head>
        //               <body>
        //                 <div class="main">
        //     <div class="column">
        //       <div>
        //         <p>Job:</p>
        //         <p>Piecemark:</p>
        //         <p>Non Conformance:</p>
        //         <p>Fabricator:</p>
        //         <p>Inspector:</p>
        //       </div>
        //       <div>
        //         <p>${rep.job}</p>
        //         <p>${rep['piecemark']}</p>
        //         <p>${rep.non_conformance ? 'Yes' : 'No'}</p>
        //         <p>${rep.fabricator.name}</p>
        //         <p>${rep.inspector.name}</p>
        //       </div>
        //     </div>

        //     <h4>Inspection Criteria:</h4>
        //   <div class="column">
        //     <div>
        //         ${questions.map((i) => i).join(' ')}
        //     </div>
        //     <div>
        //       ${answers.map((i) => i).join(' ')}
        //     </div>
        //   </div>

        //   <h3>Comment</h3>
        //   <p>${rest.comments}</p>

        // </div>
        //               </body>
        //               </html>
        //               `;

        const html = this.genHtml(rep, questions, answers, photos);

        // const pdfBuffer = await this.createPdfFromHtml(html);
        // const fileId = await this.googleDriveService.uploadPdfToDrive(
        //   pdfBuffer,
        //   `Report ${Date()} ${rfId} - ${material['piecemark']}`,
        // );

        // return fileId;
        return '';
      }

      return '';
    } catch (error) {
      console.log(error);
    }
  }

  // async createPdfFromHtml(htmlContent: string): Promise<Buffer> {
  //   // Launch a headless browser
  //   // const browser = await puppeteer.launch();
  //   const page = await browser.newPage();

  //   // Set the HTML content of the page
  //   await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  //   // Generate the PDF
  //   const pdfUint8Array = await page.pdf({
  //     format: 'Letter',
  //     printBackground: true,
  //   });

  //   // Save the PDF to a file
  //   writeFileSync('styled-output.pdf', pdfUint8Array);

  //   // Close the browser
  //   await browser.close();

  //   return Buffer.from(pdfUint8Array);
  // }

  genHtml(
    inspection: MaterialInspection,
    questions: string[],
    answers: string[],
    photos: string[],
  ): string {
    const head = `
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      * {
        box-sizing: border-box; /* Ensure padding and borders don't cause overflow */
      }
      body {
        font-family: Arial, sans-serif;
        margin: 1in; /* 1-inch margin for the document */
        width: calc(vw - 2in); /* Adjust width based on the margins */
        word-wrap: break-word; /* Handle long text */
      }
      .main {
        width: 100%; /* Let the main container take full width */
      }
      .info {
        width: 300px;
      }
      .two-columns {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap; /* Ensure columns wrap if space is too tight */
      }
      .title {
        font-weight: 500;
        width: 550px;
        text-align: justify;
      }
      .questions {
        height: 2rem;
        
        word-wrap: break-word; /* Break long words if necessary */
      }
      .answer {
        width: 50px;
        word-wrap: break-word; /* Ensure answers don't overflow */
      }
      /* Ensures data stays on one page */
      .data-page {
        page-break-after: always;
      }
      /* Adjust picture layout for two per page, one top and one bottom */
      .picture-page {
        display: flex;
        flex-direction: column;
        justify-content: space-between; /* Top and bottom layout */
        height: calc(
          100vh - 2in
        ); /* Use full page height minus top/bottom margins */
        page-break-before: always;
        margin-top: 1in;
        margin-bottom: 1in;
      }
      /* Ensure image takes available space but maintains aspect ratio */
      .picture-page img {
        max-width: 100%;
        max-height: 48%; /* Adjust to ensure both images fit within page height */
        object-fit: contain;
      }
        .pad-top {
          padding-top: 1in;
        }
      /* Comment section on its own page */
      .comments-page {
        page-break-before: always;
        padding-top : 1in;
      }

      h1 {
        text-align: center;
        font-size: 22px;
      }

      h2 {
        font-size: 16px;
      }
    </style>
    </head>
  `;

    const html = `
<!doctype html>
<html lang="en">
  ${head}
  <body>
    <div class="main">
      <h1>Report</h1>

      <!-- DATA -->
      <div class="two-columns">
        <div class="info">
          <p>Job</p>
          <p>Piecemark:</p>
          <p>Type of Inspection</p>
          <p>Inspector:</p>
          <p>Fabricator:</p>
          <p>Non Conformance:</p>
          <p>Fit-Up Inspection</p>
        </div>
        <div>
          <p>${inspection.job}</p>
          <p>${inspection['piecemark']}</p>
          <p>${inspection.inspection_type}</p>
          <p>${inspection.fabricator.name}</p>
          <p>${inspection.inspector.name}</p>
          <p>${inspection.non_conformance ? 'Yes' : 'No'}</p>
          <p>${inspection.fit_up_inspection}</p>
        </div>
      </div>

      <!-- INSPECTION CRITERIA -->

      <h2>Inspection Criteria</h2>
      <div class="two-columns">
        <div class="title questions">
          ${questions.map((i) => i).join(' ')}
        </div>
        <div class="answer">
          ${answers.map((i) => i).join(' ')}
        </div>
      </div>

      <!-- PICTURES - Two pictures per page, one top, one bottom -->
      <div class="pictures">
    
        <div class="picture-page">
          ${photos.length > 0 ? photos[0] : ''}

          ${photos.length > 1 ? photos[1] : ''}
        </div>
         ${
           photos.length > 2
             ? `
          <div class="picture-page pad-top">
            ${photos.length > 2 ? photos[2] : ''}
            ${photos.length > 3 ? photos[3] : ''}
          </div>
          `
             : ''
         }
      </div>

      <!-- COMMENTS - Start on a new page -->
      <div class=${inspection.comments.length > 1 ? 'comments-page' : ''}>
        <h2>${inspection.comments.length > 1 ? 'Comments' : ''} </h2>
        <p>
          ${inspection.comments}
        </p>
      </div>
    </div>
  </body>
</html>
`;

    return html;
  }

  async testS3W(photos: Express.Multer.File[]) {
    const urls = [];

    for (const file of photos) {
      const key = `${file.fieldname}${Date.now()}`;
      const imageUrl = await this.s3Service.upload(file, key);

      urls.push(imageUrl);
    }

    console.log(urls);
  }
}
