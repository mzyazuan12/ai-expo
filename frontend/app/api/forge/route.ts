import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const response = await fetch('http://localhost:8001/forge', {
    method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
  });

    if (!response.ok) {
      throw new Error('Failed to create mission');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in forge API route:', error);
    return NextResponse.json(
      { error: 'Failed to create mission' },
      { status: 500 }
    );
}
} 