import * as PDFDocument from 'pdfkit';
import { SleepRecord } from '../schemas/sleep-record.schema';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

const formatTime = (date: Date | null | undefined): string => {
  if (!date) return '-';
  return format(new Date(date), 'HH:mm');
};

const formatMinutes = (minutes: number | null | undefined): string => {
  if (!minutes && minutes !== 0) return '-';
  return `${minutes}m`;
};

const calculateAverage = (records: SleepRecord[], getter: (r: SleepRecord) => number | null | undefined): string => {
  if (!records.length) return '-';
  const sum = records.reduce((acc, record) => acc + (getter(record) || 0), 0);
  return `${Math.round(sum / records.length)}`;
};

export const generateWeeklyPDF = (records: SleepRecord[]): PDFDocument => {
  const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
  
  const weekStart = startOfWeek(new Date(records[0]?.date || new Date()), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  // Add title and date range
  doc.fontSize(20)
     .text('Weekly Sleep Journal Summary', { align: 'center' })
     .moveDown()
     .fontSize(12)
     .text(`Week: ${format(weekStart, 'MMM dd, yyyy')} - ${format(weekEnd, 'MMM dd, yyyy')}`, { align: 'center' })
     .moveDown();

  // Define row headers and their corresponding data getters
  const rows = [
    { 
      label: 'Bed Time', 
      getValue: (r: SleepRecord) => formatTime(r.timeGoToBed),
      getAverage: () => '-' // No average for times
    },
    { 
      label: 'Sleep Time', 
      getValue: (r: SleepRecord) => formatTime(r.timeDecidedToSleep),
      getAverage: () => '-'
    },
    { 
      label: 'Wake Time', 
      getValue: (r: SleepRecord) => formatTime(r.timeWakeupMorning),
      getAverage: () => '-'
    },
    { 
      label: 'Out of Bed', 
      getValue: (r: SleepRecord) => formatTime(r.timeOutOfBedMorning),
      getAverage: () => '-'
    },
    { 
      label: 'Time in Bed', 
      getValue: (r: SleepRecord) => formatMinutes(r.minutesInBed),
      getAverage: () => `${calculateAverage(records, r => r.minutesInBed)}m`
    },
    { 
      label: 'Time Sleeping', 
      getValue: (r: SleepRecord) => formatMinutes(r.minutesSleeping),
      getAverage: () => `${calculateAverage(records, r => r.minutesSleeping)}m`
    },
    { 
      label: 'Minutes to Sleep', 
      getValue: (r: SleepRecord) => `${r.minutesNeededToSleep || 0}m`,
      getAverage: () => `${calculateAverage(records, r => r.minutesNeededToSleep)}m`
    },
    { 
      label: 'Times Woken Up', 
      getValue: (r: SleepRecord) => `${r.timesWokenUp || 0}`,
      getAverage: () => calculateAverage(records, r => r.timesWokenUp)
    },
    { 
      label: 'Wakeup Duration', 
      getValue: (r: SleepRecord) => `${r.totalWokeupDuration || 0}m`,
      getAverage: () => `${calculateAverage(records, r => r.totalWokeupDuration)}m`
    },
    { 
      label: 'Minutes Sleepy', 
      getValue: (r: SleepRecord) => `${r.minutesFeelingSleepy || 0}m`,
      getAverage: () => `${calculateAverage(records, r => r.minutesFeelingSleepy)}m`
    },
    { 
      label: 'Sleep Efficiency', 
      getValue: (r: SleepRecord) => `${r.sleepingEfficiency || 0}%`,
      getAverage: () => `${calculateAverage(records, r => r.sleepingEfficiency)}%`
    },
    { 
      label: 'Sleep Quality', 
      getValue: (r: SleepRecord) => `${r.sleepingQuality || 0}/5`,
      getAverage: () => `${calculateAverage(records, r => r.sleepingQuality)}/5`
    },
    { 
      label: 'Mood', 
      getValue: (r: SleepRecord) => `${r.mood || 0}/5`,
      getAverage: () => `${calculateAverage(records, r => r.mood)}/5`
    },
    { 
      label: 'Notes', 
      getValue: (r: SleepRecord) => r.comment || '-',
      getAverage: () => '-'
    }
  ];

  // Set column widths
  const labelWidth = 100;
  const dayWidth = 80;
  
  // Draw table header (days)
  const headerY = doc.y;
  let xOffset = labelWidth + 50;
  let currentDate = weekStart;
  
  // Draw column headers (days)
  while (currentDate <= weekEnd) {
    doc.text(format(currentDate, 'dd/MM'), xOffset, headerY, { width: dayWidth, align: 'center' });
    xOffset += dayWidth;
    currentDate = addDays(currentDate, 1);
  }

  // Draw Average column header
  doc.text('Average', xOffset, headerY, { width: dayWidth, align: 'center' });

  // Draw rows
  let yOffset = headerY + 20;
  rows.forEach(row => {
    if (yOffset > 500) {
      doc.addPage({ margin: 50, size: 'A4', layout: 'landscape' });
      yOffset = 50;
    }

    // Draw row label
    xOffset = 50;
    doc.text(row.label, xOffset, yOffset, { width: labelWidth });
    xOffset += labelWidth;

    // Draw values for each day
    currentDate = weekStart;
    while (currentDate <= weekEnd) {
      const record = records.find(r => 
        format(new Date(r.date), 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
      );
      
      const value = record ? row.getValue(record) : '-';
      doc.text(value, xOffset, yOffset, { width: dayWidth, align: 'center' });
      
      xOffset += dayWidth;
      currentDate = addDays(currentDate, 1);
    }

    // Draw average value
    doc.text(row.getAverage(), xOffset, yOffset, { width: dayWidth, align: 'center' });

    yOffset += 20;
  });

  doc.end();
  return doc;
}; 