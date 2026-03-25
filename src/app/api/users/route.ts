import { NextRequest, NextResponse } from 'next/server';

interface User {
  id: string;
  type: 'google' | 'github';
  email?: string;
  username?: string;
  phone: string;
  registeredAt: string;
}

// In-memory storage (resets on deployment - for demo purposes)
// For production, use a database like Supabase, PlanetScale, or MongoDB
let users: User[] = [];

// GET - Retrieve all users
export async function GET(request: NextRequest) {
  // Simple auth check
  const authHeader = request.headers.get('x-admin-key');
  if (authHeader !== process.env.ADMIN_KEY && process.env.ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ users });
}

// POST - Add a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, email, username, phone } = body;

    if (!type || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      email: email || undefined,
      username: username || undefined,
      phone,
      registeredAt: new Date().toISOString(),
    };

    // Add to in-memory storage
    users.push(newUser);

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Error saving user:', error);
    return NextResponse.json(
      { error: 'Failed to save user' },
      { status: 500 }
    );
  }
}
