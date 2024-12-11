import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SleepRecord, SleepRecordSchema } from './schemas/sleep-record.schema';
import { SleepRecordsService } from './sleep-records.service';
import { SleepRecordsController } from './sleep-records.controller';
import { JwtModule } from '../../auth/jwt.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SleepRecord.name, schema: SleepRecordSchema }]),
    JwtModule,
  ],
  providers: [SleepRecordsService],
  controllers: [SleepRecordsController],
})
export class SleepRecordsModule {} 