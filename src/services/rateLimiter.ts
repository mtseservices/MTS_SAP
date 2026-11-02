import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface TenantRateLimitRecord {
  companyId: string;
  companyName: string;
  requestCount: number;
  maxLimit: number;
  windowStart: string;
  isRateLimited: boolean;
  updatedAt?: any;
}

/**
 * Checks and enforces API rate limit per tenant in Firestore.
 * Prevents system abuse and ensures fair usage across all tenant companies.
 */
export async function checkAndIncrementRateLimit(
  companyId: string,
  companyName: string,
  maxLimit: number = 2500
): Promise<{ allowed: boolean; currentCount: number; maxLimit: number; message?: string }> {
  try {
    const rateLimitRef = doc(db, 'tenant_rate_limits', companyId);
    const snap = await getDoc(rateLimitRef);
    
    const now = new Date();
    const currentHourString = now.toISOString().slice(0, 13); // Hourly window grouping (e.g. 2026-11-01T07)

    let currentCount = 1;
    let windowStart = currentHourString;
    let isRateLimited = false;

    if (snap.exists()) {
      const data = snap.data() as TenantRateLimitRecord;
      if (data.windowStart === currentHourString) {
        currentCount = (data.requestCount || 0) + 1;
      } else {
        // New hour window reset
        currentCount = 1;
        windowStart = currentHourString;
      }
    }

    if (currentCount > maxLimit) {
      isRateLimited = true;
    }

    const record: TenantRateLimitRecord = {
      companyId,
      companyName,
      requestCount: currentCount,
      maxLimit,
      windowStart,
      isRateLimited,
      updatedAt: serverTimestamp()
    };

    await setDoc(rateLimitRef, record, { merge: true });

    if (isRateLimited) {
      return {
        allowed: false,
        currentCount,
        maxLimit,
        message: `API Rate limit exceeded for tenant ${companyName} (${currentCount}/${maxLimit} requests this hour). Please try again later or upgrade your plan.`
      };
    }

    return {
      allowed: true,
      currentCount,
      maxLimit
    };
  } catch (error) {
    console.warn('Rate limiter Firestore check error (allowing request as fallback):', error);
    return { allowed: true, currentCount: 1, maxLimit };
  }
}

/**
 * Reset rate limit counters for a tenant (Master Admin action).
 */
export async function resetTenantRateLimit(companyId: string, companyName: string, maxLimit: number = 2500): Promise<void> {
  try {
    const rateLimitRef = doc(db, 'tenant_rate_limits', companyId);
    const record: TenantRateLimitRecord = {
      companyId,
      companyName,
      requestCount: 0,
      maxLimit,
      windowStart: new Date().toISOString().slice(0, 13),
      isRateLimited: false,
      updatedAt: serverTimestamp()
    };
    await setDoc(rateLimitRef, record);
  } catch (error) {
    console.warn('Could not reset tenant rate limit:', error);
  }
}
