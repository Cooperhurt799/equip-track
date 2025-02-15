import Airtable from 'airtable';

const base = new Airtable({ apiKey: 'patd7ADu0bzOlkCvn' }).base('appWJ4F5x70p3NMms');

export const checkForDueReturns = async () => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const records = await base('Checkouts').select({
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