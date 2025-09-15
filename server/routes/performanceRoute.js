// routes/performanceRoute.js
const express = require('express');
const router = express.Router();
const Performance = require('../models/Performance');

function flattenSection(section, mapping) {
  const flat = {};
  if (!section) return flat;
  for (const [key, label] of Object.entries(mapping)) {
    flat[label] = section[key] ?? '';
  }
  return flat;
}

// mapping for all departments
const departmentMappings = {
  reservations: {
    bookingRequestsProcessed: 'Reservation - No of Booking Requests Processed ',
    confirmationsUpdated: 'Reservation - No of Confirmations Updated',
    cancellations: 'Reservation - No of Cancellations ',
    amendmentsMade: 'Reservation - No. of Amendments Made ',
    reconfirmationsMade: 'Reservation - No of Reconfirmations Made ',
    remarks: 'Reservation - Remarks ',
  },
  tajBhutan: {
    bhutanAirBookingProcessed: 'Taj/Bhutan - No. of Bhutan Air Booking Processed ',
    confirmedBhutanAirTickets: 'Taj/Bhutan - No of Confirmed Bhutan Air Tickets ',
    tajHotelsBookingProcessed: 'Taj/Bhutan - No of Taj Hotels Booking Processed ',
    confirmedBookings: 'Taj/Bhutan - No of Confirmed bookings ',
    cancellations: 'Taj/Bhutan - No of Cancellations ',
    amendmentsMade: 'Taj/Bhutan - No of Amendments made',
    reconfirmationsMade: 'Taj/Bhutan - No of Reconfirmations made',
    remarks: 'Taj/Bhutan - Remarks ',
  },
  salesOnline: {
    enquiriesReceived: 'Sales Online - No of Enquiries Received ',
    conversions: 'Sales Online - No of Conversions ',
    followUpsTaken: 'Sales Online - No of Follow-Ups Taken ',
    cancellations: 'Sales Online - No of Cancellations ',
    remarks: 'Sales Online - Remarks ',
  },
  salesGroup: {
    enquiriesReceived: 'Sales Group - No of Enquiries Received ',
    conversionsMade: 'Sales Group - No of Conversions Made ',
    followUpsTaken: 'Sales Group - No of Follow-Ups Taken ',
    cancellations: 'Sales Group - No of Cancellations ',
    amendmentsMade: 'Sales Group - No of Amendments Made ',
    remarks: 'Sales Group - Remarks ',
  },
  it: {
    entriesMade: 'IT - No of Entries Made ',
    amendmentsMade: 'IT - No. of Amendments Made ',
    callsOrEmailsMade: 'IT - No of Calls/Emails Made ',
    creativesMade: 'IT - No of Creatives Made ',
    remarks: 'IT - Remarks ',
  },
  hr: {
    interviewsTaken: 'HR - Number of Interviews Taken ',
    jobOffersExtended: 'HR - Number of Job Offers Extended ',
    leaveRequestsReceived: 'HR - How many Leave Requests Received Today ',
    grievancesAddressed: 'HR - Number of Employee Grievances Addressed ',
    salaryProcessing: 'HR - Number of Salary Processing ',
    payrollProcessing: 'HR - Payroll Processing ',
    exitInterviewsConducted: 'HR - Were any Exit Interviews Conducted Today ',
    retentionEffortsMade: 'HR - Were any Retention Efforts Made (at risk of leaving) ',
    remarks: 'HR - Remarks ',
  },
  accounts: {
    customerPaymentsProcessed: 'Accounts - Number of Customer Payments Processed ',
    taxFilingsPreparedReviewed: 'Accounts - Number of Tax Filings Prepared/Reviewed ',
    transactionsRecorded: 'Accounts - Number of transactions recorded in the accounting system',
    vendorInvoicesProcessed: 'Accounts - Number of vendor invoices processed',
    remarks: 'Accounts - Remarks ',
  },
};

function formatDoc(doc, department) {
  const base = {
    employeeId: doc.employeeId,
    department: doc.department,
    date: doc.date,
    location: doc.location,
  };

  // if department filter provided, flatten only that
  if (department && departmentMappings[department]) {
    return { ...base, ...flattenSection(doc[department], departmentMappings[department]) };
  }

  // fallback: flatten all
  let combined = { ...base };
  for (const [deptKey, mapping] of Object.entries(departmentMappings)) {
    combined = { ...combined, ...flattenSection(doc[deptKey], mapping) };
  }
  return combined;
}

router.get('/', async (req, res) => {
  try {
    const {
      empId,
      department,
      month, // keep for backward compatibility
      page = 1,
      limit = 20,
      viewAll,
    } = req.query;

    const isViewAll = String(limit).toLowerCase() === 'all' || String(viewAll).toLowerCase() === 'true';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = isViewAll ? null : Math.max(1, parseInt(limit, 10) || 100);

    if (isViewAll || month) {
      const skip = isViewAll ? 0 : (pageNum - 1) * pageSize;

      const filter = {};
      if (empId) filter.employeeId = empId;
      if (department) filter.department = department;

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

      const basePipeline = [
        { $match: filter },
        {
          $addFields: {
            parsedDate: {
              $dateFromString: {
                dateString: { $trim: { input: '$date' } },
                format: '%d/%m/%Y',
                onError: null,
              },
            },
          },
        },
        { $sort: { parsedDate: -1 } },
      ];

      let docs = [];
      let total = 0;

      if (isViewAll) {
        docs = await Performance.aggregate(basePipeline).exec();
        total = docs.length;
      } else {
        const pipeline = [
          ...basePipeline,
          {
            $facet: {
              data: [{ $skip: skip }, { $limit: pageSize }],
              totalCount: [{ $count: 'count' }],
            },
          },
        ];

        const aggResult = await Performance.aggregate(pipeline).exec();
        docs = (aggResult[0] && aggResult[0].data) || [];
        total = (aggResult[0] && aggResult[0].totalCount[0] && aggResult[0].totalCount[0].count) || 0;
      }

      const formatted = docs.map((doc) => formatDoc(doc, department));

      return res.json({
        data: formatted,
        total,
        page: pageNum,
        totalPages: isViewAll ? 1 : Math.ceil(total / pageSize),
      });
    }

    // --- NEW: Month-wise paging logic when no month filter and no viewAll ---
    const filter = {};
    if (empId) filter.employeeId = empId;
    if (department) filter.department = department;

    const monthsAgg = await Performance.aggregate([
      { $match: filter },
      {
        $project: {
          monthYear: {
            $substr: ['$date', 3, 7],
          },
        },
      },
      { $group: { _id: '$monthYear' } },
      { $sort: { _id: -1 } },
    ]);

    const months = monthsAgg.map((m) => m._id).filter(Boolean);

    if (pageNum > months.length) {
      return res.json({
        data: [],
        total: 0,
        page: pageNum,
        totalPages: months.length,
        currentMonth: null,
      });
    }

    const selectedMonth = months[pageNum - 1];
    const regex = new RegExp(`\\d{1,2}\\/${selectedMonth}$`);

    const docs = await Performance.find({
      ...filter,
      date: { $regex: regex },
    })
      .sort({ date: -1 })
      .exec();

    const formatted = docs.map((doc) => formatDoc(doc, department));

    res.json({
      data: formatted,
      total: docs.length,
      page: pageNum,
      totalPages: months.length,
      currentMonth: selectedMonth,
    });
  } catch (err) {
    console.error('Error fetching performance data:', err);
    res.status(500).json({ message: 'Error fetching performance data' });
  }
});

module.exports = router;
