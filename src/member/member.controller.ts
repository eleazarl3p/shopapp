import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { MemberService } from './member.service';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get('job/:jobid/')
  findAll(
    @Param('jobid', ParseIntPipe) jobid: number,
    @Query('paqueteid') paqueteid: number,
    @Req() req: any,
  ) {
    return this.memberService.findAll(jobid, paqueteid);
  }

  @Get('not-yet-assigned-to-team/:pqtid')
  memberNotYetAssigned(@Param('pqtid', ParseIntPipe) pqtid: number) {
    return this.memberService.memberNotYetAssignedToTeam(pqtid);
  }

  @Get('/one/:jobid/:id')
  findOne(
    @Param('jobid', ParseIntPipe) jobid: number,
    @Param('id', ParseIntPipe) _id: number,
  ) {
    return this.memberService.findOne(_id);
  }
}
