import { NextResponse } from 'next/server';
import { getApplicants, getAnalytics } from '@/lib/google-sheets';

export async function GET() {
  try {
    const [applicants, analytics] = await Promise.all([
      getApplicants(),
      getAnalytics(),
    ]);

    return NextResponse.json({ applicants, analytics });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', applicants: [], analytics: null },
      { status: 500 }
    );
  }
}
