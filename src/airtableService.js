
import Airtable from 'airtable';

const AIRTABLE_PAT = import.meta.env.VITE_AIRTABLE_PAT;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;

const base = new Airtable({ apiKey: AIRTABLE_PAT }).base(AIRTABLE_BASE_ID);

// General error logging function
const logError = (errorContext, error) => {
  console.error(`Error in ${errorContext}:`, error);
};

// Create (Checkout)
export const syncCheckout = async (checkoutData) => {
  try {
    const record = await base('Checkouts').create({
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
    const record = await base('Checkins').create({
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
    const records = await base('Checkouts').select().all();
    return records.map(record => ({ id: record.id, ...record.fields }));
  } catch (error) {
    logError('fetchCheckouts', error);
    throw error;
  }
};

// Read (Get active checkouts)
export const fetchActiveCheckouts = async () => {
  try {
    const records = await base('Checkouts')
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
    const record = await base('Checkouts').update(recordId, {
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
    const record = await base('Checkouts').destroy(recordId);
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
