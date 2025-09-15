// server/routes/performanceRoute.js
const express = require('express');
const router = express.Router();
const Performance = require('../models/Performance');

// --- Flatten section ---
function flattenSection(section, mapping) {
  const flat = {};
  if (!section) return flat;
  for (const [key, label] of Object.entries(mapping)) {
    flat[label] = section[key] ?? '';
  }
  return flat;
}

// --- Department config (copied from performanceExport.js) ---
const DEPARTMENTS = [
  { name: 'Reservations', key: 'reservations', mapping: { bookingRequestsProcessed: 'No of Booking Requests Processed', confirmationsUpdated: 'No of Confirmations Updated', cancellations: 'No of Cancellations', amendmentsMade: 'No. of Amendments Made', reconfirmationsMade: 'No of Reconfirmations Made', remarks: 'Remarks' } },
  { name: 'Taj/Bhutan', key: 'tajBhutan', mapping: { bhutanAirBookingProcessed: 'No. of Bhutan Air Booking Processed', confirmedBhutanAirTickets: 'No of Confirmed Bhutan Air Tickets', tajHotelsBookingProcessed: 'No of Taj Hotels Booking Processed', confirmedBookings: 'No of Confirmed bookings', cancellations: 'No of Cancellations', amendmentsMade: 'No of Amendments made', reconfirmationsMade: 'No of Reconfirmations made', remarks: 'Remarks' } },
  { name: 'Sales Online', key: 'salesOnline', mapping: { enquiriesReceived: 'No of Enquiries Received', conversions: 'No of Conversions', followUpsTaken: 'No of Follow-Ups Taken', cancellations: 'No of Cancellations', remarks: 'Remarks' } },
  { name: 'Sales Group', key: 'salesGroup', mapping: { enquiriesReceived: 'No of Enquiries Received', conversionsMade: 'No of Conversions Made', followUpsTaken: 'No of Follow-Ups Taken', cancellations: 'No of Cancellations', amendmentsMade: 'No of Amendments Made', remarks: 'Remarks' } },
  { name: 'IT', key: 'it', mapping: { entriesMade: 'No of Entries Made', amendmentsMade: 'No of Amendments Made', callsOrEmailsMade: 'No of Calls/Emails Made', creativesMade: 'No of Creatives Made', remarks: 'Remarks' } },
  { name: 'HR', key: 'hr', mapping: { interviewsTaken: 'Number of Interviews Taken', jobOffersExtended: 'Number of Job Offers Extended', leaveRequestsReceived: 'How many Leave Requests Received Today', grievancesAddressed: 'Number of Employee Grievances Addressed', salaryProcessing: 'Number of Salary Processing', payrollProcessing: 'Payroll Processing', exitInterviewsConducted: 'Were any Exit Interviews Conducted Today', retentionEffortsMade: 'Were any Retention Efforts Made (at risk of leaving)', remarks: 'Remarks' } },
  { name: 'Accounts', key: 'accounts', mapping: { customerPaymentsProcessed: 'Number of Customer Payments Processed', taxFilingsPreparedReviewed: 'Number of Tax Filings Prepared/Reviewed', transactionsRecorded: 'Number of transactions recorded in the accounting system', vendorInvoicesProcessed: 'Number of vendor invoices processed', remarks: 'Remarks' } },
  { name: 'Graphic Designer', isSummary: true, summaryKey: 'graphicDesignerSummary' },
  { name: 'Others', isSummary: true, summaryKey: 'othersSummary' }
];

// --- Dropdown name → DB key map ---
const DEPT_KEY_MAP = {
  Reservations: 'reservations',
  'Taj/Bhutan': 'tajBhutan',
  'Sales Online': 'salesOnline',
  'Sales Group': 'salesGroup',
  IT: 'it',
  HR: 'hr',
  Accounts: 'accounts',
  'Graphic Designer': 'graphicDesignerSummary',
  Others: 'othersSummary'
};

// --- Flatten per record ---
function flattenRecord(doc) {
  const base = {
    employeeId: doc.employeeId,
    department: doc.department,
    date: doc.date,
    location: doc.location,
  };

  let result = { ...base };

  for (const dept of DEPARTMENTS) {
    if (dept.isSummary) {
      result[`${dept.name} - Summary`] = doc[dept.summaryKey] ?? '';
    } else {
      Object.assign(result, flattenSection(doc[dept.key], dept.mapping));
    }
  }

  return result;
}

// --- Main route ---
router.get('/', async (req, res) => {
  try {
    const { empId, department, month, page = 1, limit = 20, viewAll } = req.query;

    const isViewAll =
      String(limit).toLowerCase() === 'all' || String(viewAll).toLowerCase() === 'true';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = isViewAll ? null : Math.max(1, parseInt(limit, 10) || 100);

    const filter = {};
    if (empId) filter.employeeId = empId;

    if (department) {
      const normalizedDept = DEPT_KEY_MAP[department] || department;
      filter.department = { $regex: new RegExp(`^${normalizedDept}$`, 'i') };
    }

    // Month filter
    if (month) {
      let monthNum, yearNum;
      if (/^\d{4}-\d{2}$/.test(month)) {
        yearNum = month.slice(0, 4);
        monthNum = month.slice(5, 7);
      } else if (/^\d{1,2}\/\d{4}$/.test(month)) {
        [monthNum, yearNum] = month.split('/');
        monthNum = monthNum.padStart(2, '0');
      }
      if (monthNum && yearNum) {
        const regex = new RegExp(`\\d{1,2}\\/${monthNum}\\/${yearNum}$`);
        filter.date = { $regex: regex };
      }
    }

    // Query with pagination
    let docs, total;
    if (isViewAll) {
      docs = await Performance.find(filter).sort({ date: -1 }).lean();
      total = docs.length;
    } else {
      docs = await Performance.find(filter)
        .sort({ date: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .lean();
      total = await Performance.countDocuments(filter);
    }

    const formatted = docs.map(flattenRecord);

    res.json({
      data: formatted,
      total,
      page: pageNum,
      totalPages: isViewAll ? 1 : Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error('Error fetching performance data:', err);
    res.status(500).json({ message: 'Error fetching performance data' });
  }
});

module.exports = router;
