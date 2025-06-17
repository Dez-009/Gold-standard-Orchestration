// Wrapper around referral-related API calls

import { getToken } from './authUtils';
import { getReferralCode, submitReferralCode } from './apiClient';

// Fetch the current user's referral code
export async function fetchReferralCode() {
  const token = getToken();
  if (!token) throw new Error('User not authenticated');
  // Notes: Call the API to obtain the referral code
  const data = await getReferralCode(token);
  return data.referral_code;
}

// Redeem a code during the signup flow
export async function applyReferralCode(code: string) {
  const token = getToken();
  if (!token) throw new Error('User not authenticated');
  // Notes: Post the code for redemption under the current user
  await submitReferralCode(code, token);
}
