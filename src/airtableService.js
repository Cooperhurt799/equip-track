
import Airtable from 'airtable';

const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;

let base;

try {
  base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
} catch (error) {
  console.error('Failed to initialize Airtable:', error);
  base = null;
}

export const getCheckouts = async (startDate, endDate) => {
  try {
    if (!base) throw new Error('Airtable not initialized');
    
    const records = await base('Checkouts')
      .select({
        filterByFormula: `AND(
          createdAt >= '${startDate.toISOString()}',
          createdAt <= '${endDate.toISOString()}'
        )`
      })
      .all();
    
    return records.map(record => record.fields);
  } catch (error) {
    console.error('Error fetching checkouts from Airtable:', error);
    return [];
  }
};

export const getCheckins = async (date) => {
  try {
    if (!base) throw new Error('Airtable not initialized');
    
    const records = await base('Checkins')
      .select({
        filterByFormula: `DATESTR(createdAt) = '${date.toISOString().split('T')[0]}'`
      })
      .all();
    
    return records.map(record => record.fields);
  } catch (error) {
    console.error('Error fetching checkins from Airtable:', error);
    return [];
  }
};

export default {
  getCheckouts,
  getCheckins
};
