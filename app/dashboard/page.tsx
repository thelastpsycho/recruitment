'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

  // Score badge color
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (score >= 50) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1e3a5f] to-[#0a1628] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-[#d4a574] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1e3a5f] to-[#0a1628]">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Decorative Orbs */}
      <div className="fixed top-40 right-40 w-96 h-96 bg-[#d4a574] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 pointer-events-none" />
      <div className="fixed bottom-20 left-20 w-64 h-64 bg-[#3d5a80] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4a574] to-[#f5d5b0] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.376-9.043-1.067.996.996 0 01-.846-.629 9.277 9.277 0 00.398-5.022 23.928 23.928 0 0110.883 6.876c.02.015.04.032.059.049.06.045.12.09.183.135.277a9.28 9.28 0 005.936 2.482 9.28 9.28 0 01-5.066 8.052c-.034.012-.07.024-.107.037-.033.012-.067.024-.101.037a9.277 9.277 0 01-8.302-2.482c-.048-.045-.096-.09-.143-.137-.018-.018-.037-.037-.055-.054a9.277 9.277 0 00-5.936-2.482.984.984 0 01-.846.629 9.28 9.28 0 01.398 5.022 23.928 23.928 0 0010.883 6.876c-.045-.012-.09-.024-.135-.037zM12 20.464a8.464 8.464 0 100-16.928 8.464 8.464 0 0016.928 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-serif text-white">Applicant Dashboard</h1>
                <p className="text-white/50 text-sm">The Anvaya Beach Resort Bali</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-[#d4a574]/30 transition-all duration-300 group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/50 text-sm mb-1">Total Applications</p>
                    <p className="text-4xl font-serif text-white">{analytics.totalApplications}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#d4a574]/20 flex items-center justify-center group-hover:bg-[#d4a574]/30 transition-colors">
                    <svg className="w-6 h-6 text-[#d4a574]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-[#d4a574]/30 transition-all duration-300 group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/50 text-sm mb-1">Average Score</p>
                    <p className="text-4xl font-serif text-white">{analytics.averageScore}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-[#d4a574]/30 transition-all duration-300 group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/50 text-sm mb-1">Top Position</p>
                    <p className="text-xl font-serif text-white truncate max-w-[200px]">
                      {analytics.byPosition[0]?.position || 'N/A'}
                    </p>
                    <p className="text-white/50 text-sm">{analytics.byPosition[0]?.count || 0} applicants</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#3d5a80]/20 flex items-center justify-center group-hover:bg-[#3d5a80]/30 transition-colors">
                    <svg className="w-6 h-6 text-[#6b8cae]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.376-9.043-1.067.996.996 0 01-.846-.629 9.277 9.277 0 00.398-5.022 23.928 23.928 0 0110.883 6.876c.02.015.04.032.059.049.06.045.12.09.183.135.277a9.28 9.28 0 005.936 2.482 9.28 9.28 0 01-5.066 8.052c-.034.012-.07.024-.107.037-.033.012-.067.024-.101.037a9.277 9.277 0 01-8.302-2.482c-.048-.045-.096-.09-.143-.137-.018-.018-.037-.037-.055-.054a9.277 9.277 0 00-5.936-2.482.984.984 0 01-.846.629 9.28 9.28 0 01.398 5.022 23.928 23.928 0 0010.883 6.876c-.045-.012-.09-.024-.135-.037zM12 20.464a8.464 8.464 0 100-16.928 8.464 8.464 0 0016.928 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts */}
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-slide-up delay-100">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h2 className="text-lg font-serif text-white mb-6">Score Distribution</h2>
                <div className="space-y-3">
                  {analytics.byScoreRange.map((item, i) => (
                    <div key={item.range} className="flex items-center gap-4">
                      <span className="text-white/60 text-sm w-20">{item.range}</span>
                      <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#d4a574] to-[#f5d5b0] rounded-lg transition-all duration-1000"
                                                          style={{ width: `${(item.count / analytics.totalApplications) * 100}%` }}
                                                        />
                                                      </div>
                      <span className="text-white font-medium w-10 text-right">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h2 className="text-lg font-serif text-white mb-6">Applications by Position</h2>
                <div className="space-y-3">
                  {analytics.byPosition.slice(0, 6).map((item, i) => (
                    <div key={item.position} className="flex items-center gap-4">
                      <span className="text-white/60 text-sm truncate max-w-[150px]">{item.position}</span>
                      <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#3d5a80] to-[#6b8cae] rounded-lg transition-all duration-1000"
                                                          style={{ width: `${(item.count / analytics.byPosition[0].count) * 100}%` }}
                                                        />
                                                      </div>
                      <span className="text-white font-medium w-10 text-right">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/10 animate-slide-up delay-200">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-white/70 mb-2">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Name, email, or position..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 transition-all"
                />
              </div>
              <div className="w-48">
                <label className="block text-sm font-medium text-white/70 mb-2">Position</label>
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 transition-all [&>option]:bg-[#1e3a5f]"
                >
                  {positions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-48">
                <label className="block text-sm font-medium text-white/70 mb-2">Score</label>
                <select
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 transition-all [&>option]:bg-[#1e3a5f]"
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
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 animate-slide-up delay-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Last Place of Work
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplicants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                        <div className="flex flex-col items-center gap-4">
                          <svg className="w-12 h-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <p>No applicants found matching your criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredApplicants.map((applicant, idx) => (
                      <tr key={applicant.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-white">{applicant.applicantName}</div>
                            <div className="text-sm text-white/40">{applicant.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white/80">{applicant.positionApplied}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getScoreColor(applicant.score)}`}>
                            {applicant.score}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/60">{applicant.lastPlaceOfWork}</td>
                        <td className="px-6 py-4 text-sm text-white/40">{applicant.dateReceived}</td>
                        <td className="px-6 py-4">
                          {applicant.googleDriveLink ? (
                            <a
                              href={applicant.googleDriveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#d4a574]/20 hover:bg-[#d4a574]/30 rounded-xl border border-[#d4a574]/30 transition-all hover:scale-105"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                              View CV
                            </a>
                          ) : (
                            <span className="text-white/30 text-sm">No CV</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-white/30 text-sm">
            <p>© 2024 The Anvaya Beach Resort Bali • HR Portal</p>
          </div>
        </main>
      </div>
    </div>
  );
}
