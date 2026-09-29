import React, { useState, useEffect } from 'react';
import { useBusiness } from '../context/BusinessContext';
import api from '../services/api';
import { FullKeywordData } from '../types';
import { KeyRound, Plus, Search, Sparkles, TrendingUp, Tag, CheckCircle2 } from 'lucide-react';

export const KeywordsPage: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const [keywordsData, setKeywordsData] = useState<FullKeywordData[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchKeywords = async () => {
    if (!activeBusiness) return;
    setLoading(true);
    try {
      const res = await api.get(`/keywords?businessId=${activeBusiness.business.id}`);
      setKeywordsData(res.data || []);
    } catch (err) {
      console.error('Error fetching keywords:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, [activeBusiness]);

  const handleAddKeywords = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusiness || !newKeywordInput.trim()) return;

    setLoading(true);
    const kwArray = newKeywordInput.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const res = await api.post('/keywords/analyze', {
        businessId: activeBusiness.business.id,
        keywords: kwArray,
      });
      setKeywordsData(res.data);
      setNewKeywordInput('');
    } catch (err) {
      console.error('Error adding keywords:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!activeBusiness) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Add Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-brand-400 font-semibold mb-1">
            <KeyRound className="w-4 h-4" />
            <span>Search Intent & Local Visibility Data</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Keyword Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">
            Target local high-intent keywords, search volume estimates, and competition density
          </p>
        </div>

        <form onSubmit={handleAddKeywords} className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <input
            type="text"
            required
            value={newKeywordInput}
            onChange={e => setNewKeywordInput(e.target.value)}
            placeholder="e.g. bakery near me, birthday cake Anna Nagar, custom cakes Chennai"
            className="w-full bg-slate-850 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs py-2.5 px-6 rounded-2xl shadow-lg shadow-brand-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 whitespace-nowrap transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Analyzing...' : 'Analyze Keywords'}</span>
          </button>
        </form>
      </div>

      {/* Keywords Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Tracked Keywords ({keywordsData.length})</h3>
          <span className="text-xs text-slate-400">Targeting {activeBusiness.location.city} market</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Keyword</th>
                <th className="px-4 py-3.5">Search Intent</th>
                <th className="px-4 py-3.5">Local Relevance</th>
                <th className="px-4 py-3.5">Competition</th>
                <th className="px-4 py-3.5">Est. Monthly Vol</th>
                <th className="px-4 py-3.5">Visibility Rank Score</th>
                <th className="px-6 py-3.5">Suggested Related Queries</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {keywordsData.map(item => (
                <tr key={item.keyword.id} className="hover:bg-slate-850/60 transition">
                  <td className="px-6 py-4 font-bold text-white">
                    {item.keyword.keyword}
                  </td>
                  <td className="px-4 py-4">
                    <span className="bg-brand-500/15 text-brand-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-brand-500/30">
                      {item.keyword.search_intent}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${item.result.local_relevance_score}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-slate-200">{item.result.local_relevance_score}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.result.competition_level === 'High'
                          ? 'bg-red-500/20 text-red-400'
                          : item.result.competition_level === 'Medium'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {item.result.competition_level}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-200">
                    ~{item.result.estimated_volume.toLocaleString()} / mo
                  </td>
                  <td className="px-4 py-4 font-bold text-brand-400">
                    {item.result.visibility_score} / 100
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {item.result.related_queries?.slice(0, 3).map((q, idx) => (
                        <span key={idx} className="bg-slate-850 text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-800">
                          {q}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {keywordsData.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 text-xs">
                    No keywords added yet. Enter your target keywords above to analyze local demand.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
