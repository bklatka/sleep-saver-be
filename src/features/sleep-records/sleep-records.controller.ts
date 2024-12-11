import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  Res,
  Query,
} from '@nestjs/common';
import { SleepRecordsService } from './sleep-records.service';
import { CreateSleepRecordDto } from './dto/create-sleep-record.dto';
import { AuthGuard } from '../../auth/auth.guard';
import { Types } from 'mongoose';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { generateWeeklyPDF } from './utils/pdf-generator';
import { startOfWeek, endOfWeek, format, parseISO, startOfDay, endOfDay } from 'date-fns';

@ApiTags('sleep-records')
@Controller('journal')
@UseGuards(AuthGuard)
export class SleepRecordsController {
  constructor(private readonly sleepRecordsService: SleepRecordsService) {}

  @Get('records')
  async findAll(@Request() req) {
    const userId = new Types.ObjectId(req.user.sub);
    return this.sleepRecordsService.findAllByUserId(userId);
  }

  @Post('record')
  async create(@Body() createDto: CreateSleepRecordDto, @Request() req) {
    const userId = new Types.ObjectId(req.user.sub);
    return this.sleepRecordsService.create(createDto, userId);
  }

  @Put('record/:date')
  async update(
    @Param('date') date: string,
    @Body() updateDto: Partial<CreateSleepRecordDto>,
    @Request() req,
  ) {
    const userId = new Types.ObjectId(req.user.sub);
    return this.sleepRecordsService.update(date, updateDto, userId);
  }

  @Get('record/:date')
  @ApiOperation({ summary: 'Get journal entry by date' })
  @ApiResponse({
    status: 200,
    description: 'Returns the journal entry for the specified date',
  })
  @ApiResponse({ status: 404, description: 'Journal entry not found' })
  async findByDate(@Param('date') date: string, @Request() req) {
    const userId = new Types.ObjectId(req.user.sub);
    return this.sleepRecordsService.findByDate(date, userId);
  }

  @Get('report')
  async getReport(
    @Query('from') fromDate: string,
    @Query('to') toDate: string,
    @Res() res: Response,
    @Request() req,
  ) {
    const userId = new Types.ObjectId(req.user.sub);
    const from = startOfDay(parseISO(fromDate));
    const to = endOfDay(parseISO(toDate));

    const records = await this.sleepRecordsService.findByDateRange(
      from,
      to,
      userId,
    );

    const doc = generateWeeklyPDF(records, from, to);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=sleep-report-${format(from, 'yyyy-MM-dd')}-${format(to, 'yyyy-MM-dd')}.pdf`,
    );

    doc.pipe(res);
  }
}
