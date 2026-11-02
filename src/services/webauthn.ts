import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

export const registerBiometric = async (userId: string, email: string) => {
  const response = await fetch('/api/webauthn/register-challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, email }),
  });
  const options = await response.json();
  
  const credential = await startRegistration(options);
  
  await fetch('/api/webauthn/register-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, credential }),
  });
};

export const authenticateBiometric = async (userId: string) => {
  const response = await fetch('/api/webauthn/auth-challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const options = await response.json();
  
  const assertion = await startAuthentication(options);
  
  const verifyResponse = await fetch('/api/webauthn/auth-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, assertion }),
  });
  
  return await verifyResponse.json();
};
