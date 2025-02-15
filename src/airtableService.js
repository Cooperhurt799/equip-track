
import Airtable from 'airtable';

const AIRTABLE_PAT = import.meta.env.VITE_AIRTABLE_PAT;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;

if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
  console.error('Airtable credentials are missing from environment variables');
}

console.log('Initializing Airtable with Base ID:', AIRTABLE_BASE_ID);
const base = new Airtable({ 
  apiKey: AIRTABLE_PAT,
  endpointUrl: 'https://api.airtable.com/v0'
}).base(AIRTABLE_BASE_ID);

// Use table IDs instead of names for more stability
const CHECKOUT_TABLE = 'tblBPe0VIpO38LPP9';
const CHECKIN_TABLE = 'tbl89yClqdrF1I5Pv';

// Verify tables exist
base(CHECKOUT_TABLE).select({ maxRecords: 1 }).firstPage()
  .then(() => console.log('✅ Checkouts table verified'))
  .catch(err => console.error('❌ Checkouts table error:', err));

base(CHECKIN_TABLE).select({ maxRecords: 1 }).firstPage()
  .then(() => console.log('✅ Checkins table verified'))
  .catch(err => console.error('❌ Checkins table error:', err));

// General error logging function
const logError = (errorContext, error) => {
  console.error(`Error in ${errorContext}:`, error);
};

// Create (Checkout)
export const syncCheckout = async (checkoutData) => {
  try {
    const record = await base(CHECKOUT_TABLE).create({
      fields: {
        unit: checkoutData.unit,
        hoursMiles: checkoutData.hoursMiles,
        checkoutDate: checkoutData.checkoutDate,
        returnDate: checkoutData.returnDate,
        customerName: checkoutData.customerName,
        customerEmail: checkoutData.customerEmail,
        customerPhone: checkoutData.customerPhone,
        jobSite: checkoutData.jobSite,
        projectCode: checkoutData.projectCode,
        departmentID: checkoutData.departmentID,
        createdAt: new Date().toISOString(),
        status: checkoutData.status
      }
    });
    console.log('Successfully synced checkout to Airtable:', record.getId());
    return record;
  } catch (error) {
    logError('syncCheckout', error);
    throw error;
  }
};

// Create (Checkin)
export const syncCheckin = async (checkinData) => {
  try {
    const record = await base(CHECKIN_TABLE).create({
      fields: {
        unit: checkinData.unit,
        hoursMiles: checkinData.hoursMiles,
        dateTimeReturned: checkinData.dateTimeReturned,
        customerName: checkinData.customerName,
        customerEmail: checkinData.customerEmail,
        customerPhone: checkinData.customerPhone,
        jobSite: checkinData.jobSite,
        duration: checkinData.duration,
        inspectionNotes: checkinData.inspectionNotes,
        projectCode: checkinData.projectCode,
        departmentID: checkinData.departmentID,
        createdAt: new Date().toISOString()
      }
    });
    console.log('Synced checkin to Airtable:', record.getId());
    return record;
  } catch (error) {
    logError('syncCheckin', error);
    throw error;
  }
};

// Read (Get all checkouts)
export const fetchCheckouts = async () => {
  try {
    const records = await base(CHECKOUT_TABLE).select().all();
    return records.map(record => ({ id: record.id, ...record.fields }));
  } catch (error) {
    logError('fetchCheckouts', error);
    throw error;
  }
};

// Read (Get active checkouts)
export const fetchActiveCheckouts = async () => {
  try {
    const records = await base(CHECKOUT_TABLE)
      .select({
        filterByFormula: "{status} = 'active'"
      })
      .all();
    return records.map(record => ({ id: record.id, ...record.fields }));
  } catch (error) {
    logError('fetchActiveCheckouts', error);
    throw error;
  }
};

// Update checkout status
export const updateCheckoutStatus = async (recordId, status) => {
  try {
    const record = await base(CHECKOUT_TABLE).update(recordId, {
      status: status
    });
    return record;
  } catch (error) {
    logError('updateCheckoutStatus', error);
    throw error;
  }
};

// Delete checkout
export const deleteCheckout = async (recordId) => {
  try {
    const record = await base(CHECKOUT_TABLE).destroy(recordId);
    return record;
  } catch (error) {
    logError('deleteCheckout', error);
    throw error;
  }
};

export default {
  syncCheckout,
  syncCheckin,
  fetchCheckouts,
  fetchActiveCheckouts,
  updateCheckoutStatus,
  deleteCheckout
};
