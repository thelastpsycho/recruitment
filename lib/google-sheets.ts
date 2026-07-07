const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY!;
const RANGE = 'Sheet1!A1:Z'; // Default sheet name

export interface Applicant {
  id: string;
  dateReceived: string;
  applicantName: string;
  email: string;
  phone: string;
  positionApplied: string;
  score: number;
  remarks: string;
  lastPlaceOfWork: string;
  googleDriveLink: string;
  cvFileName: string;
  source: string;
}

export interface Analytics {
  totalApplications: number;
  averageScore: number;
  byPosition: { position: string; count: number }[];
  byScoreRange: { range: string; count: number }[];
  bySource: { source: string; count: number }[];
}

export async function getApplicants(): Promise<Applicant[]> {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.statusText}`);
    }

    const data = await response.json();
    const rows = data.values || [];

    if (rows.length === 0) return [];

    // Get headers from first row
    const headers = rows[0].map((h: string) => {
      // Convert header to camelCase
      return h.toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, c) => c.toUpperCase());
    });

    // Convert rows to objects
    const applicants = rows.slice(1).map((row: string[], index: number) => {
      const obj: any = { id: `row-${index}` };
      headers.forEach((header: string, i: number) => {
        obj[header] = row[i] || '';
      });
      return obj;
    });

    return applicants as Applicant[];
  } catch (error) {
    console.error('Error fetching applicants:', error);
    return [];
  }
}

export async function getAnalytics(): Promise<Analytics> {
  const applicants = await getApplicants();

  if (applicants.length === 0) {
    return {
      totalApplications: 0,
      averageScore: 0,
      byPosition: [],
      byScoreRange: [],
      bySource: [],
    };
  }

  // Calculate average score
  const totalScore = applicants.reduce((sum, a) => sum + (Number(a.score) || 0), 0);
  const averageScore = Math.round(totalScore / applicants.length);

  // Count by position
  const positionCounts: Record<string, number> = {};
  applicants.forEach((a) => {
    const pos = a.positionApplied || 'Other/Unspecified';
    positionCounts[pos] = (positionCounts[pos] || 0) + 1;
  });
  const byPosition = Object.entries(positionCounts)
    .map(([position, count]) => ({ position, count }))
    .sort((a, b) => b.count - a.count);

  // Count by score range
  const scoreRanges = {
    '90-100': 0,
    '80-89': 0,
    '70-79': 0,
    '60-69': 0,
    '50-59': 0,
    'Below 50': 0,
  };
  applicants.forEach((a) => {
    const score = Number(a.score) || 0;
    if (score >= 90) scoreRanges['90-100']++;
    else if (score >= 80) scoreRanges['80-89']++;
    else if (score >= 70) scoreRanges['70-79']++;
    else if (score >= 60) scoreRanges['60-69']++;
    else if (score >= 50) scoreRanges['50-59']++;
    else scoreRanges['Below 50']++;
  });
  const byScoreRange = Object.entries(scoreRanges)
    .map(([range, count]) => ({ range, count }))
    .filter((s) => s.count > 0);

  // Count by source
  const sourceCounts: Record<string, number> = {};
  applicants.forEach((a) => {
    const sources = (a.source || 'body only').split(', ');
    sources.forEach((s) => {
      sourceCounts[s.trim()] = (sourceCounts[s.trim()] || 0) + 1;
    });
  });
  const bySource = Object.entries(sourceCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalApplications: applicants.length,
    averageScore,
    byPosition,
    byScoreRange,
    bySource,
  };
}
