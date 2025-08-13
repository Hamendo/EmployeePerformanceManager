// server/routes/performanceExport.js
const express = require('express');
const router = express.Router();
const Performance = require('../models/Performance');
const { Parser } = require('json2csv');
const archiver = require('archiver');
const dayjs = require('dayjs');

// --- Flatten section ---
function flattenSection(section, mapping) {
  const flat = {};
  if (!section) return flat;
  for (const [key, label] of Object.entries(mapping)) {
    flat[label] = section[key] ?? '';
  }
  return flat;
}

// --- Get months for period ---
function getMonthsForPeriod(period) {
  const now = dayjs();
  switch (period) {
    case 'last3months':
      return [1, 2, 3].map(i => now.subtract(i, 'month').format('MM/YYYY')); // last 3 months excluding current
    case 'lastmonth':
      return [now.subtract(1, 'month').format('MM/YYYY')];
    case 'secondlastmonth':
      return [now.subtract(2, 'month').format('MM/YYYY')];
    case 'thirdlastmonth':
      return [now.subtract(3, 'month').format('MM/YYYY')];
    default:
      return [];
  }
}

// --- Fetch raw data ---
async function fetchRawDataForMonths(months) {
  if (!months?.length) return [];
  
  const monthRegexes = months.map(m => new RegExp(`\\d{1,2}\\/${m.replace('/', '\\/')}`)); // removed $ anchor

  return Performance.find({
    $or: monthRegexes.map(regex => ({ date: { $regex: regex } }))
  }).lean();
}

// --- Department config ---
const DEPARTMENTS = [
  { name: 'Reservations', key: 'reservations', mapping: { bookingRequestsProcessed: 'No of Booking Requests Processed', confirmationsUpdated: 'No of Confirmations Updated', cancellations: 'No of Cancellations', amendmentsMade: 'No. of Amendments Made', reconfirmationsMade: 'No of Reconfirmations Made', remarks: 'Remarks' } },
  { name: 'Taj_Bhutan', key: 'tajBhutan', mapping: { bhutanAirBookingProcessed: 'No. of Bhutan Air Booking Processed', confirmedBhutanAirTickets: 'No of Confirmed Bhutan Air Tickets', tajHotelsBookingProcessed: 'No of Taj Hotels Booking Processed', confirmedBookings: 'No of Confirmed bookings', cancellations: 'No of Cancellations', amendmentsMade: 'No of Amendments made', reconfirmationsMade: 'No of Reconfirmations made', remarks: 'Remarks' } },
  { name: 'Sales_Online', key: 'salesOnline', mapping: { enquiriesReceived: 'No of Enquiries Received', conversions: 'No of Conversions', followUpsTaken: 'No of Follow-Ups Taken', cancellations: 'No of Cancellations', remarks: 'Remarks' } },
  { name: 'Sales_Group', key: 'salesGroup', mapping: { enquiriesReceived: 'No of Enquiries Received', conversionsMade: 'No of Conversions Made', followUpsTaken: 'No of Follow-Ups Taken', cancellations: 'No of Cancellations', amendmentsMade: 'No of Amendments Made', remarks: 'Remarks' } },
  { name: 'IT', key: 'it', mapping: { entriesMade: 'No of Entries Made', amendmentsMade: 'No of Amendments Made', callsOrEmailsMade: 'No of Calls/Emails Made', creativesMade: 'No of Creatives Made', remarks: 'Remarks' } },
  { name: 'HR', key: 'hr', mapping: { interviewsTaken: 'Number of Interviews Taken', jobOffersExtended: 'Number of Job Offers Extended', leaveRequestsReceived: 'How many Leave Requests Received Today', grievancesAddressed: 'Number of Employee Grievances Addressed', salaryProcessing: 'Number of Salary Processing', payrollProcessing: 'Payroll Processing', exitInterviewsConducted: 'Were any Exit Interviews Conducted Today', retentionEffortsMade: 'Were any Retention Efforts Made (at risk of leaving)', remarks: 'Remarks' } },
  { name: 'Accounts', key: 'accounts', mapping: { customerPaymentsProcessed: 'Number of Customer Payments Processed', taxFilingsPreparedReviewed: 'Number of Tax Filings Prepared/Reviewed', transactionsRecorded: 'Number of transactions recorded in the accounting system', vendorInvoicesProcessed: 'Number of vendor invoices processed', remarks: 'Remarks' } },
  { name: 'Graphic_Designer', isSummary: true, summaryKey: 'graphicDesignerSummary', headers: ['employeeId', 'date', 'location', 'Summary'] },
  { name: 'Others', isSummary: true, summaryKey: 'othersSummary', headers: ['employeeId', 'date', 'location', 'Summary'] }
];

// --- Flatten per department ---
function flattenRecordByDepartment(doc, dept) {
  const base = { employeeId: doc.employeeId, date: doc.date, location: doc.location };
  if (dept.isSummary) {
    return { ...base, Summary: doc[dept.summaryKey] || '' };
  }
  const section = doc[dept.key];
  const flatFields = flattenSection(section, dept.mapping);
  return { ...base, ...flatFields };
}

// --- Export ZIP ---
router.get('/export-zip', async (req, res) => {
  try {
    const { period, debug } = req.query;
    const debugMode = debug === 'true';

    if (!period) return res.status(400).json({ message: 'Missing period parameter' });

    const months = getMonthsForPeriod(period);
    if (!months.length) return res.status(400).json({ message: 'Invalid period parameter' });

    const records = await fetchRawDataForMonths(months);

    if (debugMode) {
      console.log(`Fetched ${records.length} total records for months: ${months.join(', ')}`);
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=performance_export_${period}.zip`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const dept of DEPARTMENTS) {
      // Include only if all relevant fields are filled
      let deptRecords = records.filter(r => {
        if (dept.isSummary) {
          return typeof r[dept.summaryKey] === 'string' && r[dept.summaryKey].trim() !== '';
        }

        const section = r[dept.key];
        if (!section || typeof section !== 'object') return false;

        return Object.keys(dept.mapping).every(fieldKey => {
          const value = section[fieldKey];
          return value !== null && value !== undefined && String(value).trim() !== '';
        });
      });

      if (debugMode) {
        console.log(`Department ${dept.name}: ${deptRecords.length} matching records`);
      }

      const fields = dept.isSummary
        ? dept.headers
        : ['employeeId', 'date', 'location', ...Object.values(dept.mapping)];

      const dataForCsv = deptRecords.map(doc => flattenRecordByDepartment(doc, dept));

      const parser = new Parser({ fields });
      const csv = dataForCsv.length ? parser.parse(dataForCsv) : parser.parse([]);

      archive.append(csv, { name: `${dept.name}.csv` });
    }

    await archive.finalize();
  } catch (err) {
    console.error('Error exporting ZIP:', err);
    res.status(500).json({ message: 'Error exporting performance data as ZIP' });
  }
});

module.exports = router;
