import React, { useState, useEffect } from 'react';
import { useBusiness } from '../context/BusinessContext';
import api from '../services/api';
import { RecommendationRecord } from '../types';
import { CheckSquare, AlertTriangle, CheckCircle2, Copy, Check, Filter } from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const [recommendations, setRecommendations] = useState<RecommendationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'Critical' | 'High' | 'Medium' | 'Low'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    if (!activeBusiness) return;
    setLoading(true);
    try {
      const res = await api.get(`/recommendations?businessId=${activeBusiness.business.id}`);
      setRecommendations(res.data || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [activeBusiness]);

  const handleUpdateStatus = async (id: string, status: RecommendationRecord['status']) => {
    try {
      await api.patch(`/recommendations/${id}/status`, { status });
      setRecommendations(prev =>
        prev.map(r => (r.id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error('Error updating recommendation status:', err);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!activeBusiness) return null;

  const filteredRecs = recommendations.filter(
    r => filterSeverity === 'all' || r.severity === filterSeverity
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-brand-400 font-semibold mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Prioritized Action Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Actionable SEO Recommendations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Prioritized step-by-step tasks with code snippets to boost your local rankings
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto bg-slate-850 p-1.5 rounded-2xl border border-slate-800">
          {(['all', 'Critical', 'High', 'Medium', 'Low'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterSeverity === sev
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev === 'all' ? 'All Severities' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Feed */}
      <div className="space-y-4">
        {filteredRecs.map(rec => (
          <div
            key={rec.id}
            className={`bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 transition ${
              rec.status === 'completed' ? 'opacity-60 bg-slate-900/50' : ''
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    rec.severity === 'Critical'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : rec.severity === 'High'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {rec.severity}
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-850 px-2 py-0.5 rounded-md border border-slate-800">
                  {rec.category}
                </span>
                <h3 className="font-bold text-base text-white">{rec.title}</h3>
              </div>

              {/* Status Switcher Buttons */}
              <div className="flex items-center space-x-1.5 self-start sm:self-auto">
                <button
                  onClick={() => handleUpdateStatus(rec.id, rec.status === 'completed' ? 'open' : 'completed')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center space-x-1 transition ${
                    rec.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{rec.status === 'completed' ? 'Resolved ✓' : 'Mark Fixed'}</span>
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-300 font-medium">{rec.issue_summary}</div>

            {/* Impact Explanation */}
            <div className="bg-slate-850 border border-slate-800/80 rounded-2xl p-4 text-xs space-y-1">
              <div className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">SEO Impact Rationale:</div>
              <p className="text-slate-300 leading-relaxed">{rec.impact_explanation}</p>
            </div>

            {/* Step-by-Step Action Plan */}
            <div>
              <div className="text-xs font-bold text-white mb-2">Step-by-Step Resolution:</div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {rec.action_steps.map((step, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-brand-400 font-bold">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Code Snippet */}
            {rec.code_example && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs font-mono text-slate-200">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2 border-b border-slate-850 pb-1">
                  <span>Implementation Code Example</span>
                  <button
                    onClick={() => handleCopy(rec.id, rec.code_example!)}
                    className="text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                  >
                    {copiedId === rec.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === rec.id ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap">{rec.code_example}</pre>
              </div>
            )}
          </div>
        ))}

        {filteredRecs.length === 0 && (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h3 className="font-bold text-white text-base">No Recommendations in Severity Category</h3>
            <p className="text-xs text-slate-400">All checks in this severity bucket are clear.</p>
          </div>
        )}
      </div>
    </div>
  );
};
