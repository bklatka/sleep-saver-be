import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SleepRecord, SleepRecordDocument } from './schemas/sleep-record.schema';
import { CreateSleepRecordDto } from './dto/create-sleep-record.dto';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { calculateSleepMetrics } from './utils/sleep-calculations';

@Injectable()
export class SleepRecordsService {
  constructor(
    @InjectModel(SleepRecord.name) private sleepRecordModel: Model<SleepRecordDocument>
  ) {}

  async findAllByUserId(userId: Types.ObjectId): Promise<SleepRecord[]> {
    return this.sleepRecordModel.find({ userId }).sort({ date: -1 }).exec();
  }

  async create(createDto: CreateSleepRecordDto, userId: Types.ObjectId): Promise<SleepRecord> {
    const parsedDate = parseISO(createDto.date);
    const startDate = startOfDay(parsedDate);

    const calculations = calculateSleepMetrics(createDto);
    const createdRecord = new this.sleepRecordModel({
      ...createDto,
      userId,
      date: startDate,
      timeGoToBed: createDto.timeGoToBed ? new Date(createDto.timeGoToBed) : undefined,
      timeDecidedToSleep: createDto.timeDecidedToSleep ? new Date(createDto.timeDecidedToSleep) : undefined,
      timeWakeupMorning: createDto.timeWakeupMorning ? new Date(createDto.timeWakeupMorning) : undefined,
      timeOutOfBedMorning: createDto.timeOutOfBedMorning ? new Date(createDto.timeOutOfBedMorning) : undefined,
      ...calculations
    });
    return createdRecord.save();
  }

  async update(date: string, updateDto: Partial<CreateSleepRecordDto>, userId: Types.ObjectId): Promise<SleepRecord> {
    const parsedDate = parseISO(date);
    console.log('Parsed date:', parsedDate, date);
    const startDate = startOfDay(parsedDate);
    const endDate = endOfDay(parsedDate);

    const calculations = calculateSleepMetrics(updateDto);
    const updatedRecord = await this.sleepRecordModel.findOneAndUpdate(
      { 
        userId,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      },
      {
        $set: {
          ...updateDto,
          timeGoToBed: updateDto.timeGoToBed ? new Date(updateDto.timeGoToBed) : undefined,
          timeDecidedToSleep: updateDto.timeDecidedToSleep ? new Date(updateDto.timeDecidedToSleep) : undefined,
          timeWakeupMorning: updateDto.timeWakeupMorning ? new Date(updateDto.timeWakeupMorning) : undefined,
          timeOutOfBedMorning: updateDto.timeOutOfBedMorning ? new Date(updateDto.timeOutOfBedMorning) : undefined,
          ...calculations
        }
      },
      { new: true }
    );

    if (!updatedRecord) {
      throw new NotFoundException(`Sleep record for date ${date} not found`);
    }

    return updatedRecord;
  }

  async findByDate(date: string, userId: Types.ObjectId) {
    // Parse the date and set it to UTC to match the stored dates
    const parsedDate = parseISO(date);
    const startDate = startOfDay(parsedDate);
    const endDate = endOfDay(parsedDate);

    console.log('Looking for records between:', startDate, 'and', endDate);
    console.log('For user:', userId);

    const record = await this.sleepRecordModel.findOne({
      userId: new Types.ObjectId(userId),
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).exec();

    console.log('Found record:', record);

    if (!record) {
      throw new NotFoundException(`No journal entry found for date ${date}`);
    }

    return record;
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    userId: Types.ObjectId
  ): Promise<SleepRecord[]> {
    return this.sleepRecordModel
      .find({
        userId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ date: 1 })
      .exec();
  }
} 