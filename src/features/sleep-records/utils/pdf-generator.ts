import * as PDFDocument from 'pdfkit';
import { SleepRecord } from '../schemas/sleep-record.schema';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

const formatTime = (date: Date | null | undefined): string => {
  if (!date) return '-';
  return format(new Date(date), 'HH:mm');
};

const formatMinutes = (minutes: number | null | undefined): string => {
  if (!minutes && minutes !== 0) return '-';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m (${minutes}m)`;
};

export const generateWeeklyPDF = (records: SleepRecord[]): PDFDocument => {
  const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
  
  // Get week range based on the first record's date
  const weekStart = startOfWeek(new Date(records[0]?.date || new Date()), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  // Add title and date range
  doc.fontSize(20)
     .text('Weekly Sleep Journal Summary', { align: 'center' })
     .moveDown()
     .fontSize(12)
     .text(`Week: ${format(weekStart, 'MMM dd, yyyy')} - ${format(weekEnd, 'MMM dd, yyyy')}`, { align: 'center' })
     .moveDown();

  // Add summary statistics
  if (records.length > 0) {
    const avgEfficiency = records.reduce((sum, record) => sum + (record.sleepingEfficiency || 0), 0) / records.length;
    const avgTimeInBed = records.reduce((sum, record) => sum + (record.minutesInBed || 0), 0) / records.length;
    const avgTimeSleeping = records.reduce((sum, record) => sum + (record.minutesSleeping || 0), 0) / records.length;
    const avgQuality = records.reduce((sum, record) => sum + (record.sleepingQuality || 0), 0) / records.length;
    const avgMood = records.reduce((sum, record) => sum + (record.mood || 0), 0) / records.length;

    doc.fontSize(14)
       .text('Weekly Averages', { underline: true })
       .moveDown()
       .fontSize(12)
       .text(`Sleep Efficiency: ${Math.round(avgEfficiency)}%`)
       .text(`Time in Bed: ${formatMinutes(Math.round(avgTimeInBed))}`)
       .text(`Time Sleeping: ${formatMinutes(Math.round(avgTimeSleeping))}`)
       .text(`Sleep Quality: ${avgQuality.toFixed(1)}/5`)
       .text(`Mood: ${avgMood.toFixed(1)}/5`)
       .moveDown();
  }

  // Create table for daily records
  const columns = [
    { header: 'Date', width: 80 },
    { header: 'Bed Time', width: 70 },
    { header: 'Sleep Time', width: 70 },
    { header: 'Wake Time', width: 70 },
    { header: 'Out of Bed', width: 70 },
    { header: 'Time in Bed', width: 80 },
    { header: 'Time Sleeping', width: 80 },
    { header: 'Efficiency', width: 60 },
    { header: 'Quality', width: 50 },
    { header: 'Mood', width: 50 },
    { header: 'Notes', width: 150 }
  ];

  // Draw table header
  let xOffset = 50;
  let yOffset = doc.y;
  
  columns.forEach(column => {
    doc.text(column.header, xOffset, yOffset, { width: column.width });
    xOffset += column.width;
  });

  // Draw records for each day of the week
  yOffset += 20;
  let currentDate = weekStart;

  while (currentDate <= weekEnd) {
    if (yOffset > 500) { // Check if we need a new page
      doc.addPage({ margin: 50, size: 'A4', layout: 'landscape' });
      yOffset = 50;
    }

    const record = records.find(r => 
      format(new Date(r.date), 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
    );

    xOffset = 50;
    
    // Date
    doc.text(format(currentDate, 'EEE, MMM dd'), xOffset, yOffset, { width: 80 });
    xOffset += 80;

    if (record) {
      // Times
      doc.text(formatTime(record.timeGoToBed), xOffset, yOffset, { width: 70 });
      xOffset += 70;
      
      doc.text(formatTime(record.timeDecidedToSleep), xOffset, yOffset, { width: 70 });
      xOffset += 70;
      
      doc.text(formatTime(record.timeWakeupMorning), xOffset, yOffset, { width: 70 });
      xOffset += 70;
      
      doc.text(formatTime(record.timeOutOfBedMorning), xOffset, yOffset, { width: 70 });
      xOffset += 70;

      // Durations
      doc.text(formatMinutes(record.minutesInBed), xOffset, yOffset, { width: 80 });
      xOffset += 80;
      
      doc.text(formatMinutes(record.minutesSleeping), xOffset, yOffset, { width: 80 });
      xOffset += 80;

      // Metrics
      doc.text(`${record.sleepingEfficiency || 0}%`, xOffset, yOffset, { width: 60 });
      xOffset += 60;
      
      doc.text(`${record.sleepingQuality || 0}/5`, xOffset, yOffset, { width: 50 });
      xOffset += 50;
      
      doc.text(`${record.mood || 0}/5`, xOffset, yOffset, { width: 50 });
      xOffset += 50;
      
      doc.text(record.comment || '-', xOffset, yOffset, { width: 150 });
    } else {
      // Fill with dashes if no record exists
      while (xOffset < 800) {
        doc.text('-', xOffset, yOffset, { width: 70 });
        xOffset += 70;
      }
    }

    currentDate = addDays(currentDate, 1);
    yOffset += 20;
  }

  doc.end();
  return doc;
}; 