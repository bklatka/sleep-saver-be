import * as PDFDocument from 'pdfkit';
import { SleepRecord } from '../schemas/sleep-record.schema';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import * as path from 'path';

const formatTime = (date: Date | null | undefined): string => {
  if (!date) return '-';
  return format(new Date(date), 'HH:mm');
};

const formatMinutes = (minutes: number | null | undefined): string => {
  if (!minutes && minutes !== 0) return '-';
  return `${minutes}m`;
};

const calculateAverage = (
  records: SleepRecord[],
  getter: (r: SleepRecord) => number | null | undefined,
): string => {
  if (!records.length) return '-';
  const sum = records.reduce((acc, record) => acc + (getter(record) || 0), 0);
  return `${Math.round(sum / records.length)}`;
};

export const generateWeeklyPDF = (records: SleepRecord[]): PDFDocument => {
  // Create PDF with custom font
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4',
    layout: 'landscape',
    font: path.join(__dirname, '../../../../assets/fonts/DejaVuSans.ttf'),
  });

  // Register font for different styles
  doc.registerFont(
    'DejaVuSans',
    path.join(__dirname, '../../../../assets/fonts/DejaVuSans.ttf'),
  );
  doc.registerFont(
    'DejaVuSans-Bold',
    path.join(__dirname, '../../../../assets/fonts/DejaVuSans-Bold.ttf'),
  );

  // Set default font
  doc.font('DejaVuSans');

  const weekStart = startOfWeek(new Date(records[0]?.date || new Date()), {
    weekStartsOn: 1,
  });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  // Add title and date range
  doc
    .fontSize(20)
    .text('Tygodniowe podsumowanie snu', { align: 'center' })
    .moveDown()
    .fontSize(12)
    .text(
      `Tydzień: ${format(weekStart, 'MMM dd, yyyy')} - ${format(weekEnd, 'MMM dd, yyyy')}`,
      { align: 'center' },
    )
    .moveDown();

  // Define row headers and their corresponding data getters
  const rows = [
    {
      label: 'Położenie w łóżku',
      getValue: (r: SleepRecord) => formatTime(r.timeGoToBed),
      getAverage: () => '-', // No average for times
    },
    {
      label: 'Decyzja o zaśnięciu',
      getValue: (r: SleepRecord) => formatTime(r.timeDecidedToSleep),
      getAverage: () => '-',
    },
    {
      label: 'Czas do zaśnięcia',
      getValue: (r: SleepRecord) => `${r.minutesNeededToSleep || 0}m`,
      getAverage: () =>
        `${calculateAverage(records, (r) => r.minutesNeededToSleep)}m`,
    },
    {
      label: 'Ilość przebudzeń',
      getValue: (r: SleepRecord) => `${r.timesWokenUp || 0}`,
      getAverage: () => calculateAverage(records, (r) => r.timesWokenUp),
    },
    {
      label: 'Łączny czas przebudzeń',
      getValue: (r: SleepRecord) => `${r.totalWokeupDuration || 0}m`,
      getAverage: () =>
        `${calculateAverage(records, (r) => r.totalWokeupDuration)}m`,
    },
    {
      label: 'Godzina wstania',
      getValue: (r: SleepRecord) => formatTime(r.timeWakeupMorning),
      getAverage: () => '-',
    },
    {
      label: 'Godzina wyjścia z łóżka',
      getValue: (r: SleepRecord) => formatTime(r.timeOutOfBedMorning),
      getAverage: () => '-',
    },
    {
      label: 'Czas w łóżku',
      getValue: (r: SleepRecord) => formatMinutes(r.minutesInBed),
      getAverage: () => `${calculateAverage(records, (r) => r.minutesInBed)}m`,
    },
    {
      label: 'Czas snu',
      getValue: (r: SleepRecord) => formatMinutes(r.minutesSleeping),
      getAverage: () =>
        `${calculateAverage(records, (r) => r.minutesSleeping)}m`,
    },
    {
      label: 'Efektywność snu',
      getValue: (r: SleepRecord) => `${r.sleepingEfficiency || 0}%`,
      getAverage: () =>
        `${calculateAverage(records, (r) => r.sleepingEfficiency)}%`,
    },
    {
      label: 'Czas poczucia snu',
      getValue: (r: SleepRecord) => `${r.minutesFeelingSleepy || 0}m`,
      getAverage: () =>
        `${calculateAverage(records, (r) => r.minutesFeelingSleepy)}m`,
    },

    {
      label: 'Jakość snu',
      getValue: (r: SleepRecord) => `${r.sleepingQuality || 0}/5`,
      getAverage: () =>
        `${calculateAverage(records, (r) => r.sleepingQuality)}/5`,
    },
    {
      label: 'Nastrój',
      getValue: (r: SleepRecord) => `${r.mood || 0}/5`,
      getAverage: () => `${calculateAverage(records, (r) => r.mood)}/5`,
    },
    {
      label: 'Uwagi',
      getValue: (r: SleepRecord) => r.comment || '-',
      getAverage: () => '-',
    },
  ];

  // Set column widths
  const labelWidth = 140;
  const dayWidth = 60;

  // Draw table header (days)
  const headerY = doc.y;
  let xOffset = labelWidth + 50;
  let currentDate = weekStart;

  // Draw column headers (days)
  while (currentDate <= weekEnd) {
    doc.text(format(currentDate, 'dd/MM'), xOffset, headerY, {
      width: dayWidth,
      align: 'center',
    });
    xOffset += dayWidth;
    currentDate = addDays(currentDate, 1);
  }

  // Draw Average column header
  doc.text('Średnia', xOffset, headerY, { width: dayWidth, align: 'center' });

  // Draw horizontal line under headers
  doc
    .moveTo(50, headerY + 15)
    .lineTo(xOffset + dayWidth, headerY + 15)
    .stroke();

  // Draw vertical line separating labels from values
  doc
    .moveTo(labelWidth + 50, headerY - 5)
    .lineTo(labelWidth + 50, headerY + 15 + rows.length * 20)
    .stroke();

  // Draw rows
  let yOffset = headerY + 20;
  rows.forEach((row) => {
    if (yOffset > 500) {
      doc.addPage({ margin: 50, size: 'A4', layout: 'landscape' });
      yOffset = 50;
    }

    // Draw row label
    xOffset = 50;
    doc.fontSize(11).text(row.label, xOffset, yOffset, { width: labelWidth });
    xOffset += labelWidth;

    // Draw values for each day
    currentDate = weekStart;
    while (currentDate <= weekEnd) {
      const record = records.find(
        (r) =>
          format(new Date(r.date), 'yyyy-MM-dd') ===
          format(currentDate, 'yyyy-MM-dd'),
      );

      const value = record ? row.getValue(record) : '-';
      doc.text(value, xOffset, yOffset, { width: dayWidth, align: 'center' });

      xOffset += dayWidth;
      currentDate = addDays(currentDate, 1);
    }

    // Draw average value
    doc.text(row.getAverage(), xOffset, yOffset, {
      width: dayWidth,
      align: 'center',
    });

    yOffset += 20;
  });

  doc.end();
  return doc;
};