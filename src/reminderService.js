
import Airtable from 'airtable';

const airtable = new Airtable({ apiKey: import.meta.env.VITE_AIRTABLE_PAT });
const reminderBase = airtable.base(import.meta.env.VITE_AIRTABLE_BASE_ID);

export const checkForDueReturns = async () => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const records = await reminderBase('tblBPe0VIpO38LPP9').select({
      filterByFormula: `AND(returnDate <= '${today.toISOString()}', status = 'active')`
    }).all();

    console.log(`Found ${records.length} due returns`);
  } catch (error) {
    console.error('Error checking for due returns:', error);
    throw error;
  }
};

// Check for due returns every day
setInterval(checkForDueReturns, 24 * 60 * 60 * 1000);
