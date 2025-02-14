
import Airtable from 'airtable';

const base = new Airtable({ apiKey: 'patd7ADu0bzOlkCvn' }).base('EquipTracker');

export const getCheckouts = async () => {
  try {
    const records = await base('Checkouts').select({
      sort: [{ field: 'createdAt', direction: 'desc' }]
    }).all();
    return records.map(record => ({
      id: record.id,
      createdAt: record.get('createdAt'),
      unit: record.get('unit'),
      customerName: record.get('customerName'),
      customerEmail: record.get('customerEmail'),
      customerPhone: record.get('customerPhone'),
      jobSite: record.get('jobSite'),
      returnDate: record.get('returnDate'),
      projectCode: record.get('projectCode'),
      departmentID: record.get('departmentID'),
      hoursMiles: record.get('hoursMiles')
    }));
  } catch (error) {
    console.error('Error fetching checkouts:', error);
    throw error;
  }
};

export const getCheckins = async () => {
  try {
    const records = await base('Checkins').select({
      sort: [{ field: 'createdAt', direction: 'desc' }]
    }).all();
    return records.map(record => ({
      id: record.id,
      createdAt: record.get('createdAt'),
      unit: record.get('unit'),
      customerName: record.get('customerName'),
      customerEmail: record.get('customerEmail'),
      customerPhone: record.get('customerPhone'),
      jobSite: record.get('jobSite'),
      hoursMiles: record.get('hoursMiles'),
      inspectionNotes: record.get('inspectionNotes'),
      projectCode: record.get('projectCode'),
      departmentID: record.get('departmentID')
    }));
  } catch (error) {
    console.error('Error fetching checkins:', error);
    throw error;
  }
};

export const addCheckoutToAirtable = async (checkoutData) => {
  try {
    const record = await base('Checkouts').create([
      { fields: checkoutData }
    ]);
    return {
      id: record[0].id,
      ...record[0].fields
    };
  } catch (error) {
    console.error('Error adding checkout:', error);
    throw error;
  }
};

export const addCheckinToAirtable = async (checkinData) => {
  try {
    const record = await base('Checkins').create([
      { fields: checkinData }
    ]);
    return {
      id: record[0].id,
      ...record[0].fields
    };
  } catch (error) {
    console.error('Error adding checkin:', error);
    throw error;
  }
};
