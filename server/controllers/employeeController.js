// 📁 server/controllers/employeeController.js
const axios = require('axios');
const Performance = require('../models/Performance');

// ✍️ Submit Performance Form
const submitPerformance = async (req, res) => {
  try {
    const {
      empId,
      name,
      location,
      department,
      date,
      ...fields
    } = req.body;

    // 🟡 Format the date as "DD/MM/YYYY"
    const formattedDate = new Date(date).toLocaleDateString('en-GB');

    const payload = {
      employeeId: empId,
      date: formattedDate,
      location,
      department,
    };

    switch (department) {
      case 'Reservation':
        payload.reservations = {
          bookingRequestsProcessed: Number(fields['Reservation - No of Booking Requests Processed ']),
          confirmationsUpdated: Number(fields['Reservation - No of Confirmations Updated']),
          cancellations: Number(fields['Reservation - No of Cancellations ']),
          amendmentsMade: Number(fields['Reservation - No. of Amendments Made ']),
          reconfirmationsMade: Number(fields['Reservation - No of Reconfirmations Made ']),
          remarks: fields['Reservation - Remarks '],
        };
        break;
      case 'Bhutan Air Tickets and Taj Hotels':
        payload.tajBhutan = {
          bhutanAirBookingProcessed: Number(fields['Taj/Bhutan - No. of Bhutan Air Booking Processed ']),
          confirmedBhutanAirTickets: Number(fields['Taj/Bhutan - No of Confirmed Bhutan Air Tickets ']),
          tajHotelsBookingProcessed: Number(fields['Taj/Bhutan - No of Taj Hotels Booking Processed ']),
          confirmedBookings: Number(fields['Taj/Bhutan - No of Confirmed bookings ']),
          cancellations: Number(fields['Taj/Bhutan - No of Cancellations ']),
          amendmentsMade: Number(fields['Taj/Bhutan - No of Amendments made']),
          reconfirmationsMade: Number(fields['Taj/Bhutan - No of Reconfirmations made']),
          remarks: fields['Taj/Bhutan - Remarks '],
        };
        break;
      case 'Sales(Online)':
        payload.salesOnline = {
          enquiriesReceived: Number(fields['Sales Online - No of Enquiries Received ']),
          conversions: Number(fields['Sales Online - No of Conversions ']),
          followUpsTaken: Number(fields['Sales Online - No of Follow​‑Ups Taken ']),
          cancellations: Number(fields['Sales Online - No of Cancellations ']),
          remarks: fields['Sales Online - Remarks '],
        };
        break;
      case 'Sales(Group)':
        payload.salesGroup = {
          enquiriesReceived: Number(fields['Sales Group - No of Enquiries Received ']),
          conversionsMade: Number(fields['Sales Group - No of Conversions Made ']),
          followUpsTaken: Number(fields['Sales Group - No of Follow​‑Ups Taken ']),
          cancellations: Number(fields['Sales Group - No of Cancellations ']),
          amendmentsMade: Number(fields['Sales Group - No of Amendments Made ']),
          remarks: fields['Sales Group - Remarks '],
        };
        break;
      case 'IT':
        payload.it = {
          entriesMade: Number(fields['IT - No of Entries Made ']),
          amendmentsMade: Number(fields['IT - No. of Amendments Made ']),
          callsOrEmailsMade: Number(fields['IT - No of Calls/Emails Made ']),
          creativesMade: Number(fields['IT - No of Creatives Made ']),
          remarks: fields['IT - Remarks '],
        };
        break;
      case 'HR':
        payload.hr = {
          interviewsTaken: Number(fields['HR - Number of Interviews Taken ']),
          jobOffersExtended: Number(fields['HR - Number of Job Offers Extended ']),
          leaveRequestsReceived: Number(fields['HR - How many Leave Requests Received Today ']),
          grievancesAddressed: Number(fields['HR - Number of Employee Grievances Addressed ']),
          salaryProcessing: Number(fields['HR - Number of Salary Processing ']),
          payrollProcessing: Number(fields['HR - Payroll Processing ']),
          exitInterviewsConducted: fields['HR - Were any Exit Interviews Conducted Today '],
          retentionEffortsMade: fields['HR - Were any Retention Efforts Made (at risk of leaving) '],
          remarks: fields['HR - Remarks '],
        };
        break;
      case 'ACCOUNTS':
        payload.accounts = {
          customerPaymentsProcessed: Number(fields['Accounts - Number of Customer Payments Processed ']),
          taxFilingsPreparedReviewed: Number(fields['Accounts - Number of Tax Filings Prepared/Reviewed ']),
          transactionsRecorded: Number(fields['Accounts - Number of transactions recorded in the accounting system']),
          vendorInvoicesProcessed: Number(fields['Accounts - Number of vendor invoices processed']),
          remarks: fields['Accounts - Remarks '],
        };
        break;
      case 'Graphic Designer':
        payload.graphicDesignerSummary = fields['Graphic Designer - Give a summary for the day'];
        break;
      case 'Others':
        payload.othersSummary = fields['Others - Give a summary for the day'];
        break;
    }

    const newPerformance = new Performance(payload);
    console.log('Payload to save:', payload);
    await newPerformance.save();
    console.log('Performance data saved:', newPerformance);
    res.status(201).json({ message: 'Performance saved successfully' });

  } catch (err) {
    console.error("Error in submitPerformance:", err);
    res.status(500).json({ message: 'Server error while saving performance data' });
  }
};

// 📊 View Own Performance Records (stub)
const viewOwnPerformance = async (req, res) => {
  res.status(200).json({ success: true, message: 'Viewing own performance (stub)' });
};

// 👤 Get Employee Details by ID
const getEmployeeById = async (req, res) => {
  const { employeeId } = req.query;

  if (!employeeId) {
    return res.status(400).json({ success: false, message: 'Employee ID is required' });
  }

  try {
    const sheetId = '1syIHQIWvg48i6UECVjRHz6G6F_PXR9avNveCfktZLTM';
    const sheetName = 'Master DB';
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

    const response = await axios.get(url);
    const raw = response.data;

    const json = JSON.parse(raw.substring(47, raw.length - 2));

    const cols = json.table.cols.map(col => col.label.trim());
    const rows = json.table.rows.map(row => {
      const obj = {};
      row.c.forEach((cell, i) => {
        if (cols[i]) {
          obj[cols[i]] = cell && cell.v !== null ? cell.v.toString() : '';
        }
      });
      return obj;
    });

    const employee = rows.find(emp =>
      String(emp['Employee ID']).toLowerCase() === String(employeeId).toLowerCase() &&
      String(emp['Status']).trim().toLowerCase() === 'active'
    );

    if (employee) {
      console.log(employee);
      return res.status(200).json({ success: true, data: employee });
    } else {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

  } catch (err) {
    console.error("Error in getEmployeeById:", err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch employee', error: err.message });
  }
};

module.exports = {
  submitPerformance,
  viewOwnPerformance,
  getEmployeeById,
};
