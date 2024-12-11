import {
  IsDateString,
  IsOptional,
  IsNumber,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class CreateSleepRecordDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsDateString()
  timeGoToBed?: string;

  @IsOptional()
  @IsDateString()
  timeDecidedToSleep?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minutesNeededToSleep?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timesWokenUp?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalWokeupDuration?: number;

  @IsOptional()
  @IsDateString()
  timeWakeupMorning?: string;

  @IsOptional()
  @IsDateString()
  timeOutOfBedMorning?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minutesSpentInBed?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minutesSleeping?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  sleepingEfficiency?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minutesFeelingSleepy?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  sleepingQuality?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  mood?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
