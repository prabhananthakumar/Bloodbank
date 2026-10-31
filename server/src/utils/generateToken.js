import jwt from 'jsonwebtoken';

export const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'super_secret_blood_bank_jwt_key_2026_replace_in_prod',
    { expiresIn: '30d' }
  );
};
