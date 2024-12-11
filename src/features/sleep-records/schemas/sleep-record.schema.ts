import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../database/schemas/base.schema';

@Schema({ timestamps: true })
export class SleepRecord extends BaseSchema {
  @Prop({ required: true, type: Date, unique: true })
  date: Date;

  @Prop({ type: Date })
  timeGoToBed: Date;

  @Prop({ type: Date })
  timeDecidedToSleep: Date;

  @Prop({ type: Number, min: 0 })
  minutesNeededToSleep: number;

  @Prop({ type: Number, min: 0 })
  timesWokenUp: number;

  @Prop({ type: Number, min: 0 })
  totalWokeupDuration: number;

  @Prop({ type: Date })
  timeWakeupMorning: Date;

  @Prop({ type: Date })
  timeOutOfBedMorning: Date;

  @Prop({ type: Number, min: 0, max: 100 })
  sleepingEfficiency: number;

  @Prop({ type: Number, min: 0 })
  minutesFeelingSleepy: number;

  @Prop({ type: Number, min: 1, max: 5 })
  sleepingQuality: number;

  @Prop({ type: Number, min: 1, max: 5 })
  mood: number;

  @Prop({ type: String })
  comment: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop()
  minutesInBed?: number;

  @Prop()
  minutesSleeping?: number;
}

export type SleepRecordDocument = SleepRecord & Document;
export const SleepRecordSchema = SchemaFactory.createForClass(SleepRecord);

// Add index for faster queries by date and userId
SleepRecordSchema.index({ date: 1, userId: 1 }, { unique: true }); 