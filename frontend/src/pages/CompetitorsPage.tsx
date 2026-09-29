import React, { useState, useEffect } from 'react';
import { useBusiness } from '../context/BusinessContext';
import api from '../services/api';
import { FullCompetitor } from '../types';
import { Users, Star, Globe, ShieldCheck, Trash2, ArrowUpRight, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export const CompetitorsPage: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const [competitors, setCompetitors] = useState<FullCompetitor[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCompetitors = async () => {
    if (!activeBusiness) return;
    setLoading(true);
    try {
      const res = await api.get(`/competitors?businessId=${activeBusiness.business.id}`);
      setCompetitors(res.data || []);
    } catch (err) {
      console.error('Error fetching competitors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, [activeBusiness]);

  const handleDelete = async (competitorId: string) => {
    if (!activeBusiness) return;
    try {
      await api.delete(`/competitors/${competitorId}?businessId=${activeBusiness.business.id}`);
      setCompetitors(prev => prev.filter(c => c.competitor.id !== competitorId));
    } catch (err) {
      console.error('Error removing competitor:', err);
    }
  };

  if (!activeBusiness) return null;

  const chartData = competitors.map(c => ({
    name: c.competitor.name.length > 15 ? c.competitor.name.substring(0, 15) + '...' : c.competitor.name,
    Rating: c.metrics.rating || 4.0,
    SeoScore: c.metrics.estimated_seo_score || 60,
    KeywordOverlap: c.metrics.keyword_overlap_score || 40,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-brand-400 font-semibold mb-1">
            <Users className="w-4 h-4" />
            <span>Local Competitor Intelligence & Benchmarking</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Competitor Comparison Matrix</h1>
          <p className="text-xs text-slate-400 mt-1">
            Benchmarking {competitors.length} tracked competitors against {activeBusiness.business.name} in {activeBusiness.location.city}
          </p>
        </div>
      </div>

      {/* Comparison Chart */}
      {competitors.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <h3 className="text-base font-bold text-white mb-1">Competitor Benchmark Metrics</h3>
          <p className="text-xs text-slate-400 mb-6">Compare Rating, Estimated SEO Score & Keyword Overlap</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="SeoScore" fill="#0c8de9" name="Est. SEO Score" radius={[6, 6, 0, 0]} />
                <Bar dataKey="KeywordOverlap" fill="#8b5cf6" name="Keyword Overlap %" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Side-by-side Competitor Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitors.map(c => (
          <div key={c.competitor.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4 relative">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-850 px-2 py-0.5 rounded-full border border-slate-700">
                    {c.competitor.distance_km} km away
                  </span>
                  <h3 className="font-bold text-base text-white mt-1.5">{c.competitor.name}</h3>
                  <p className="text-xs text-slate-400">{c.competitor.category}</p>
                </div>
                <button
                  onClick={() => handleDelete(c.competitor.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-850 rounded-xl transition"
                  title="Remove Competitor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-850 p-3 rounded-2xl border border-slate-800/80">
                <div>
                  <div className="text-[10px] text-slate-400">Rating</div>
                  <div className="flex items-center space-x-1 text-sm font-bold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{c.metrics.rating?.toFixed(1) || '4.0'}</span>
                    <span className="text-[10px] text-slate-500">({c.metrics.review_count || 20})</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400">Est. SEO Score</div>
                  <div className="text-sm font-bold text-brand-400">{c.metrics.estimated_seo_score} / 100</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400">HTTPS Security</div>
                  <div className={`text-xs font-bold ${c.metrics.has_https ? 'text-emerald-400' : 'text-red-400'}`}>
                    {c.metrics.has_https ? 'Active' : 'Missing'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400">Local Schema</div>
                  <div className={`text-xs font-bold ${c.metrics.local_schema_present ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {c.metrics.local_schema_present ? 'Present' : 'Missing'}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Keyword Overlap:</span>
              <span className="font-bold text-purple-400">{c.metrics.keyword_overlap_score}%</span>
            </div>
          </div>
        ))}

        {competitors.length === 0 && (
          <div className="col-span-full text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Competitors Selected Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Visit the Local Intelligence page to search nearby businesses and track direct competitors for side-by-side comparison.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
