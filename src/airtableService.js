
import Airtable from 'airtable';

const base = new Airtable({ apiKey: 'patd7ADu0bzOlkCvn' }).base('EquipTracker');

export const getCheckouts = async () => {
  try {
    const records = await base('Checkouts').select({
      sort: [{ field: 'createdAt', direction: 'desc' }]
    }).all();
    return records.map(record => ({ ...record.fields, id: record.id }));
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
    return records.map(record => ({ ...record.fields, id: record.id }));
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
    return record[0];
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
    return record[0];
  } catch (error) {
    console.error('Error adding checkin:', error);
    throw error;
  }
};
