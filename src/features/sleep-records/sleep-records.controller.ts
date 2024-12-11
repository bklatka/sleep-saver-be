import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Body, 
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SleepRecordsService } from './sleep-records.service';
import { CreateSleepRecordDto } from './dto/create-sleep-record.dto';
import { AuthGuard } from '../../auth/auth.guard';
import { Types } from 'mongoose';

@Controller('journal')
@UseGuards(AuthGuard)
export class SleepRecordsController {
  constructor(private readonly sleepRecordsService: SleepRecordsService) {}

  @Get()
  async findAll(@Request() req) {
    const userId = new Types.ObjectId(req.user.sub);
    return this.sleepRecordsService.findAllByUserId(userId);
  }

  @Post()
  async create(@Body() createDto: CreateSleepRecordDto, @Request() req) {
    const userId = new Types.ObjectId(req.user.sub);
    return this.sleepRecordsService.create(createDto, userId);
  }

  @Put(':date')
  async update(
    @Param('date') date: string,
    @Body() updateDto: Partial<CreateSleepRecordDto>,
    @Request() req
  ) {
    const userId = new Types.ObjectId(req.user.sub);
    return this.sleepRecordsService.update(date, updateDto, userId);
  }
} 