
// This file can be empty for now or used for other utility functions in the future
// Format phone number to XXX-XXX-XXXX
export const formatPhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters
  const cleaned = phoneNumber?.replace(/\D/g, '');
  // Check if the input is valid
  if (cleaned?.length !== 10) return phoneNumber;
  // Format the number
  return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
};
