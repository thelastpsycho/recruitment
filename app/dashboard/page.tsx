'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScoreChart } from '@/components/ScoreChart';
import { PositionChart } from '@/components/PositionChart';

interface Applicant {
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

interface Analytics {
  totalApplications: number;
  averageScore: number;
  byPosition: { position: string; count: number }[];
  byScoreRange: { range: string; count: number }[];
  bySource: { source: string; count: number }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('All');
  const [scoreFilter, setScoreFilter] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/applicants');
      const data = await response.json();
      setApplicants(data.applicants || []);
      setAnalytics(data.analytics);
    } catch {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Filter applicants
  const filteredApplicants = applicants.filter((a) => {
    const matchesSearch =
      searchTerm === '' ||
      a.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.positionApplied.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPosition = positionFilter === 'All' || a.positionApplied === positionFilter;

    let matchesScore = true;
    if (scoreFilter === '70+') matchesScore = a.score >= 70;
    else if (scoreFilter === '50-69') matchesScore = a.score >= 50 && a.score < 70;
    else if (scoreFilter === '<50') matchesScore = a.score < 50;

    return matchesSearch && matchesPosition && matchesScore;
  });

  // Get unique positions for filter
  const positions = ['All', ...Array.from(new Set(applicants.map((a) => a.positionApplied)))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Applicant Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm font-medium text-gray-500">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalApplications}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm font-medium text-gray-500">Average Score</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.averageScore}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm font-medium text-gray-500">Top Position</p>
              <p className="text-xl font-bold text-gray-900">
                {analytics.byPosition[0]?.position || 'N/A'}
              </p>
              <p className="text-sm text-gray-500">{analytics.byPosition[0]?.count || 0} applicants</p>
            </div>
          </div>
        )}

        {/* Charts */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Score Distribution</h2>
              <ScoreChart data={analytics.byScoreRange} />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Applications by Position</h2>
              <PositionChart data={analytics.byPosition} />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name, email, or position..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                {positions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="All">All Scores</option>
                <option value="70+">70+</option>
                <option value="50-69">50-69</option>
                <option value="<50">Below 50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applicants Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Place of Work</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No applicants found
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((applicant) => (
                    <tr key={applicant.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{applicant.applicantName}</div>
                          <div className="text-sm text-gray-500">{applicant.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{applicant.positionApplied}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            applicant.score >= 70
                              ? 'bg-green-100 text-green-800'
                              : applicant.score >= 50
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {applicant.score}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{applicant.lastPlaceOfWork}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{applicant.dateReceived}</td>
                      <td className="px-4 py-3">
                        {applicant.googleDriveLink && (
                          <a
                            href={applicant.googleDriveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            View CV
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
