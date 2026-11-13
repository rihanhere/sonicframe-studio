import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'sonicframe-studio', timestamp: new Date().toISOString() });
}
