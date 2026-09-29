import React, { useState, useEffect } from 'react';
import { useBusiness } from '../context/BusinessContext';
import api from '../services/api';
import { LocalOpportunity } from '../types';
import { Lightbulb, Sparkles, TrendingUp, Compass, ArrowUpRight } from 'lucide-react';

export const OpportunitiesPage: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const [opportunities, setOpportunities] = useState<LocalOpportunity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOpportunities = async () => {
    if (!activeBusiness) return;
    setLoading(true);
    try {
      const res = await api.get(`/opportunities?businessId=${activeBusiness.business.id}`);
      setOpportunities(res.data || []);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [activeBusiness]);

  if (!activeBusiness) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-brand-400 font-semibold mb-1">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Local Market Opportunity Detection</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Strategic Local Growth Opportunities</h1>
          <p className="text-xs text-slate-400 mt-1">
            Inferred market gaps, untargeted location landing pages & citation partnerships for {activeBusiness.location.city}
          </p>
        </div>
      </div>

      {/* Opportunity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {opportunities.map(opp => (
          <div
            key={opp.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
                  {opp.type}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    opp.estimated_impact === 'High'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {opp.estimated_impact} Estimated Impact
                </span>
              </div>

              <h3 className="font-bold text-base text-white mt-2">{opp.title}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{opp.description}</p>
            </div>

            <div className="bg-slate-850 border border-slate-800/80 rounded-2xl p-4 text-xs space-y-1">
              <div className="font-bold text-brand-400 uppercase tracking-wider text-[10px] flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Actionable Strategic Insight:</span>
              </div>
              <p className="text-slate-200 font-medium leading-relaxed">{opp.actionable_insight}</p>
            </div>

            {opp.target_entity && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Target Entity:</span>
                <span className="font-semibold text-slate-200">{opp.target_entity}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
