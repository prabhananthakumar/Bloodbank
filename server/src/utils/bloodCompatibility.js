/**
 * Clinical Blood Compatibility Rules Matrix
 */

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const BLOOD_COMPONENTS = [
  'Whole Blood',
  'Packed Red Blood Cells (PRBC)',
  'Fresh Frozen Plasma (FFP)',
  'Platelets',
  'Cryoprecipitate'
];

// Red Blood Cell / Whole Blood Compatibility Matrix
// Recipient Blood Group -> Compatible Donor Blood Groups
export const RBC_COMPATIBILITY_RECIPIENT_MAP = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Recipient
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'] // Only O-
};

// Plasma Compatibility Matrix (Inverse of RBC)
// Recipient Blood Group -> Compatible Donor Blood Groups for Plasma
export const PLASMA_COMPATIBILITY_RECIPIENT_MAP = {
  'O': ['O', 'A', 'B', 'AB'], // Universal Plasma Recipient
  'A': ['A', 'AB'],
  'B': ['B', 'AB'],
  'AB': ['AB'] // Universal Plasma Donor
};

/**
 * Checks if a donor blood group can donate to recipient for given component
 */
export const isBloodCompatible = (donorGroup, recipientGroup, component = 'Packed Red Blood Cells (PRBC)') => {
  if (!donorGroup || !recipientGroup) return false;

  // Universal rules for Platelets & Red Cells / Whole Blood
  if (component === 'Fresh Frozen Plasma (FFP)') {
    const cleanDonor = donorGroup.replace(/[+-]/g, '');
    const cleanRecipient = recipientGroup.replace(/[+-]/g, '');
    const allowed = PLASMA_COMPATIBILITY_RECIPIENT_MAP[cleanRecipient] || [];
    return allowed.includes(cleanDonor);
  }

  // Red Blood Cells, Whole Blood, Platelets
  const allowedDonors = RBC_COMPATIBILITY_RECIPIENT_MAP[recipientGroup] || [];
  return allowedDonors.includes(donorGroup);
};

/**
 * Gets list of compatible donor groups for a given recipient
 */
export const getCompatibleDonorsFor = (recipientGroup, component = 'Packed Red Blood Cells (PRBC)') => {
  if (component === 'Fresh Frozen Plasma (FFP)') {
    const cleanRecipient = recipientGroup.replace(/[+-]/g, '');
    const allowedABO = PLASMA_COMPATIBILITY_RECIPIENT_MAP[cleanRecipient] || [];
    return BLOOD_GROUPS.filter(bg => allowedABO.includes(bg.replace(/[+-]/g, '')));
  }
  return RBC_COMPATIBILITY_RECIPIENT_MAP[recipientGroup] || [];
};

/**
 * Component shelf life in days
 */
export const COMPONENT_SHELF_LIFE_DAYS = {
  'Whole Blood': 35,
  'Packed Red Blood Cells (PRBC)': 42,
  'Fresh Frozen Plasma (FFP)': 365,
  'Platelets': 5,
  'Cryoprecipitate': 365
};
