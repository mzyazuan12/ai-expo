import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const backendUrl = `http://localhost:8001/simulate/${params.id}`;
    const response = await fetch(backendUrl, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Backend request failed: ${response.status} - ${errorBody}`);
      throw new Error("Failed to start simulation");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to start simulation:', error);
    return NextResponse.json(
      { message: 'Failed to start simulation', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 