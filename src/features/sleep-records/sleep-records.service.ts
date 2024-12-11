import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SleepRecord, SleepRecordDocument } from './schemas/sleep-record.schema';
import { CreateSleepRecordDto } from './dto/create-sleep-record.dto';

@Injectable()
export class SleepRecordsService {
  constructor(
    @InjectModel(SleepRecord.name) private sleepRecordModel: Model<SleepRecordDocument>
  ) {}

  async findAllByUserId(userId: Types.ObjectId): Promise<SleepRecord[]> {
    return this.sleepRecordModel.find({ userId }).sort({ date: -1 }).exec();
  }

  async create(createDto: CreateSleepRecordDto, userId: Types.ObjectId): Promise<SleepRecord> {
    const createdRecord = new this.sleepRecordModel({
      ...createDto,
      userId,
      date: new Date(createDto.date),
      timeGoToBed: createDto.timeGoToBed ? new Date(createDto.timeGoToBed) : undefined,
      timeDecidedToSleep: createDto.timeDecidedToSleep ? new Date(createDto.timeDecidedToSleep) : undefined,
      timeWakeupMorning: createDto.timeWakeupMorning ? new Date(createDto.timeWakeupMorning) : undefined,
      timeOutOfBedMorning: createDto.timeOutOfBedMorning ? new Date(createDto.timeOutOfBedMorning) : undefined,
    });
    return createdRecord.save();
  }

  async update(date: string, updateDto: Partial<CreateSleepRecordDto>, userId: Types.ObjectId): Promise<SleepRecord> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const updatedRecord = await this.sleepRecordModel.findOneAndUpdate(
      { 
        userId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      },
      {
        $set: {
          ...updateDto,
          timeGoToBed: updateDto.timeGoToBed ? new Date(updateDto.timeGoToBed) : undefined,
          timeDecidedToSleep: updateDto.timeDecidedToSleep ? new Date(updateDto.timeDecidedToSleep) : undefined,
          timeWakeupMorning: updateDto.timeWakeupMorning ? new Date(updateDto.timeWakeupMorning) : undefined,
          timeOutOfBedMorning: updateDto.timeOutOfBedMorning ? new Date(updateDto.timeOutOfBedMorning) : undefined,
        }
      },
      { new: true }
    );

    if (!updatedRecord) {
      throw new NotFoundException(`Sleep record for date ${date} not found`);
    }

    return updatedRecord;
  }
} 