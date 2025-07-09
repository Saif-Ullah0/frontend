// src/lib/auth.ts

// REGISTER
export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include', // Send HTTP-only cookies
  });

  const result = await res.json();

  if (!res.ok) throw new Error(result?.error || 'Registration failed');

  return result;
}

// LOGIN
export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) throw new Error(result?.error || 'Login failed');

  return result;
}
