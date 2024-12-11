import { differenceInMinutes, addDays } from 'date-fns';
import { SleepRecord } from '../schemas/sleep-record.schema';
import { CreateSleepRecordDto } from '../dto/create-sleep-record.dto';

interface SleepCalculations {
  minutesInBed: number | null;
  minutesSleeping: number | null;
  sleepingEfficiency: number | null;
}

export const calculateSleepMetrics = (record: Partial<CreateSleepRecordDto>): SleepCalculations => {
  // Initialize result with null values
  const result: SleepCalculations = {
    minutesInBed: null,
    minutesSleeping: null,
    sleepingEfficiency: null
  };

  // Check if we have the required times for minutes in bed calculation
  if (record?.timeGoToBed && record?.timeOutOfBedMorning) {
    const bedTime = new Date(record.timeGoToBed);
    let wakeTime = new Date(record.timeOutOfBedMorning);
    
    // If wake time is before bed time, add one day to wake time
    if (wakeTime < bedTime) {
      wakeTime = addDays(wakeTime, 1);
    }
    
    result.minutesInBed = differenceInMinutes(wakeTime, bedTime);
  }

  // Check if we have all required fields for minutes sleeping calculation
  if (
    result.minutesInBed !== null &&
    record.timeDecidedToSleep &&
    record.timeWakeupMorning &&
    record.minutesNeededToSleep !== null &&
    record.totalWokeupDuration !== null
  ) {
    const decidedToSleepTime = new Date(record.timeDecidedToSleep);
    const bedTime = new Date(record.timeGoToBed!);
    let wakeupTime = new Date(record.timeWakeupMorning);
    let getUpTime = new Date(record.timeOutOfBedMorning!);

    // Adjust dates if they cross midnight
    if (decidedToSleepTime < bedTime) {
      decidedToSleepTime.setDate(decidedToSleepTime.getDate() + 1);
    }
    if (wakeupTime < decidedToSleepTime) {
      wakeupTime.setDate(wakeupTime.getDate() + 1);
    }
    if (getUpTime < wakeupTime) {
      getUpTime.setDate(getUpTime.getDate() + 1);
    }

    // Calculate all the non-sleeping periods
    const timeToDecideSleep = differenceInMinutes(decidedToSleepTime, bedTime);
    const timeToGetUp = differenceInMinutes(getUpTime, wakeupTime);
    
    // Subtract all non-sleeping times from total time in bed
    result.minutesSleeping = result.minutesInBed - 
      timeToDecideSleep -
      record.minutesNeededToSleep -
      record.totalWokeupDuration -
      timeToGetUp;

    // Calculate sleeping efficiency as a percentage
    if (result.minutesInBed > 0 && result.minutesSleeping >= 0) {
      result.sleepingEfficiency = Math.round((result.minutesSleeping / result.minutesInBed) * 100);
      // Ensure the efficiency is between 0 and 100
      result.sleepingEfficiency = Math.max(0, Math.min(100, result.sleepingEfficiency));
    }
  }

  return result;
}; 