// src/lib/auth.ts

import { useAuth } from '@/contexts/AuthContext';

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
    credentials: 'include',
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
  const { setUser } = useAuth(); // Get setUser from context
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

  // Update user in context with login response
  setUser({
    id: result.user.id,
    name: result.user.name,
    email: result.user.email,
    role: result.user.role,
    token: result.token, // Store token temporarily if needed
  });

  return result;
}