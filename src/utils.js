
import { saveAs } from 'file-saver';

export const saveToCSV = (records, type) => {
  const headers = ['Type', 'Unit', 'Hours/Miles', 'Customer Name', 'Job Site', 'Date', 'Project Code', 'Department ID'];
  const csvContent = [
    headers.join(','),
    ...records.map(row => [
      type,
      row.unit,
      row.hoursMiles,
      row.customerName,
      row.jobSite,
      type === 'checkout' ? row.checkoutDate : row.dateTimeReturned,
      row.projectCode,
      row.departmentID
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const date = new Date().toISOString().split('T')[0];
  saveAs(blob, `equipment_tracking_${type}_${date}.csv`);
};
