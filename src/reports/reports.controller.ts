import { 
  Body, 
  Controller, 
  Get, 
  HttpCode, 
  Param, 
  Patch, 
  Post, 
  Request 
} from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiBody, 
  ApiCreatedResponse, 
  ApiNotFoundResponse, 
  ApiOkResponse, 
  ApiParam, 
  ApiTags 
} from '@nestjs/swagger';
import { Request as Req } from 'express';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dtos/create-report.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { ReportDto } from './dtos/report.dto';
import { ApproveReportDto } from './dtos/approve-report.dto';
import { GetEstimateDto } from './dtos/get-estimate.dto';
import { EstimateResultDto } from './dtos/estimate-result.dto';
import { Public } from '../decorators/public.decorator';
import { Role } from '../account/decorators/roles.decorator';
import { Roles } from '../account/roles.enum';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService){}

  @Public()
  @Post('/estimate')
  @HttpCode(200)
  @ApiBody({ type: GetEstimateDto })
  @ApiOkResponse({ type: EstimateResultDto })
  getEstimate(@Body() body: GetEstimateDto){
    return this.reportsService.createEstimate(body);
  }

  @Get('/')
  @Role([Roles.Admin,Roles.User])
  @Serialize(ReportDto)
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ReportDto] })
  listReports(@Request() req: Req){
    return this.reportsService.list(req.account);
  }

  @Post('/')
  @Role([Roles.Admin,Roles.User])
  @ApiBearerAuth()
  @Serialize(ReportDto)
  @ApiBody({ type: CreateReportDto })
  @ApiCreatedResponse({ type: ReportDto })
  createReport(@Body() body: CreateReportDto, @Request() req: Req){
    return this.reportsService.create(body,req.account);
  }

  @Patch('/:id')
  @Role([Roles.Admin])
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true, example: '1' })
  @ApiBody({ type: ApproveReportDto })
  @ApiOkResponse({ type: ReportDto })
  @ApiNotFoundResponse({ description: 'Report not found!' })
  updateApproval(@Param('id') id: string, @Body() body: ApproveReportDto){
    return this.reportsService.updateApproval(id, body.approved);
  }
}
