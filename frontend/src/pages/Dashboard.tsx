import React, { useEffect, useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import api from '../services/api';
import { MapView } from '../components/MapView';
import {
  AuditAnalysisResult,
  FullCompetitor,
  FullKeywordData,
  NearbyPlace,
  RecommendationRecord,
  LocalOpportunity,
} from '../types';
import {
  Sparkles,
  ShieldCheck,
  SearchCheck,
  MapPin,
  AlertTriangle,
  TrendingUp,
  FileText,
  Users,
  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Compass,
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface DashboardProps {
  onOpenOnboarding: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenOnboarding }) => {
  const { activeBusiness } = useBusiness();
  const [loading, setLoading] = useState(true);

  const [auditResult, setAuditResult] = useState<AuditAnalysisResult | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [competitors, setCompetitors] = useState<FullCompetitor[]>([]);
  const [keywords, setKeywords] = useState<FullKeywordData[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationRecord[]>([]);
  const [opportunities, setOpportunities] = useState<LocalOpportunity[]>([]);
  const [runningAudit, setRunningAudit] = useState(false);

  const loadDashboardData = async () => {
    if (!activeBusiness) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const bId = activeBusiness.business.id;

    try {
      const [auditRes, nearbyRes, compRes, kwRes, recRes, oppRes] = await Promise.allSettled([
        api.get(`/audit/latest?businessId=${bId}`),
        api.get(`/nearby?businessId=${bId}&radius=5`),
        api.get(`/competitors?businessId=${bId}`),
        api.get(`/keywords?businessId=${bId}`),
        api.get(`/recommendations?businessId=${bId}`),
        api.get(`/opportunities?businessId=${bId}`),
      ]);

      if (auditRes.status === 'fulfilled') setAuditResult(auditRes.value.data);
      if (nearbyRes.status === 'fulfilled') setNearbyPlaces(nearbyRes.value.data.places || []);
      if (compRes.status === 'fulfilled') setCompetitors(compRes.value.data || []);
      if (kwRes.status === 'fulfilled') setKeywords(kwRes.value.data || []);
      if (recRes.status === 'fulfilled') setRecommendations(recRes.value.data || []);
      if (oppRes.status === 'fulfilled') setOpportunities(oppRes.value.data || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeBusiness]);

  const handleRunAudit = async () => {
    if (!activeBusiness) return;
    setRunningAudit(true);
    try {
      const res = await api.post('/audit/run', {
        businessId: activeBusiness.business.id,
        websiteUrl: activeBusiness.business.website_url,
      });
      setAuditResult(res.data);
      // Reload recommendations
      const recRes = await api.get(`/recommendations?businessId=${activeBusiness.business.id}`);
      setRecommendations(recRes.data);
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setRunningAudit(false);
    }
  };

  if (!activeBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="bg-brand-500/10 text-brand-400 p-4 rounded-3xl mb-4 border border-brand-500/20">
          <Compass className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Business Onboarded Yet</h2>
        <p className="text-slate-400 max-w-md mb-6 text-sm">
          Get started by adding your business name, address, website, and target keywords to unlock local search intelligence.
        </p>
        <button
          onClick={onOpenOnboarding}
          className="bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm py-3 px-6 rounded-2xl shadow-xl shadow-brand-500/20 flex items-center space-x-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Your First Business</span>
        </button>
      </div>
    );
  }

  const scores = auditResult
    ? {
        overall: auditResult.audit.overall_score,
        technical: auditResult.audit.technical_score,
        onpage: auditResult.audit.onpage_score,
        local: auditResult.audit.local_score,
      }
    : { overall: 72, technical: 75, onpage: 70, local: 68 };

  const radarData = [
    { subject: 'Technical SEO', score: scores.technical, fullMark: 100 },
    { subject: 'On-Page SEO', score: scores.onpage, fullMark: 100 },
    { subject: 'Local Signals', score: scores.local, fullMark: 100 },
    { subject: 'Mobile Readiness', score: auditResult?.audit.has_canonical ? 90 : 60, fullMark: 100 },
    { subject: 'Local Schema', score: auditResult?.audit.has_local_schema ? 100 : 20, fullMark: 100 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2.5 mb-1.5">
            <span className="bg-brand-500/20 text-brand-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-brand-500/30 flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>{activeBusiness.location.city}, {activeBusiness.location.country}</span>
            </span>
            <span className="text-xs text-slate-400">Category: <strong className="text-slate-200">{activeBusiness.business.category}</strong></span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {activeBusiness.business.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1.5">
            <span>Website:</span>
            <a href={activeBusiness.business.website_url} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline">
              {activeBusiness.business.website_url}
            </a>
          </p>
        </div>

        <div className="flex items-center space-x-3 relative z-10">
          <button
            onClick={handleRunAudit}
            disabled={runningAudit}
            className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-2 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${runningAudit ? 'animate-spin text-brand-400' : ''}`} />
            <span>{runningAudit ? 'Auditing Website...' : 'Re-Run Audit'}</span>
          </button>
        </div>
      </div>

      {/* Overview Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Score */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall SEO Score</span>
            <ShieldCheck className="w-5 h-5 text-brand-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold text-white">{scores.overall}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                scores.overall >= 80 ? 'bg-emerald-500' : scores.overall >= 60 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${scores.overall}%` }}
            ></div>
          </div>
        </div>

        {/* Technical Score */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Technical SEO</span>
            <SearchCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold text-white">{scores.technical}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>HTTPS: <strong className={auditResult?.audit.is_https ? 'text-emerald-400' : 'text-red-400'}>{auditResult?.audit.is_https ? 'Active' : 'Missing'}</strong></span>
            <span>Robots: <strong className={auditResult?.audit.has_robots_txt ? 'text-emerald-400' : 'text-amber-400'}>{auditResult?.audit.has_robots_txt ? 'Valid' : 'Check'}</strong></span>
          </div>
        </div>

        {/* On-Page Score */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">On-Page SEO</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold text-white">{scores.onpage}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Title & Meta Tags</span>
            <span className="text-slate-200 font-semibold">{auditResult?.issues.length || 0} issues</span>
          </div>
        </div>

        {/* Local SEO Score */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Local Search Score</span>
            <MapPin className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold text-white">{scores.local}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Local Schema: <strong className={auditResult?.audit.has_local_schema ? 'text-emerald-400' : 'text-red-400'}>{auditResult?.audit.has_local_schema ? 'Detected' : 'Missing'}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Grid: Map + Radar & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map & Nearby Places Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Local Search Map & Radius (5 km)</h3>
                <p className="text-xs text-slate-400">User business, direct competitors and nearby places</p>
              </div>
              <span className="bg-slate-800 text-slate-300 text-xs font-medium px-3 py-1 rounded-full border border-slate-700">
                {nearbyPlaces.length} Nearby Places Discovered
              </span>
            </div>

            <MapView
              userBusiness={activeBusiness.business}
              userLocation={activeBusiness.location}
              nearbyPlaces={nearbyPlaces}
              selectedRadiusKm={5}
              height="380px"
            />
          </div>
        </div>

        {/* Radar Chart: SEO Pillars Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">SEO Pillars Breakdown</h3>
            <p className="text-xs text-slate-400 mb-4">Multi-factor health analysis</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                  <Radar name="Score" dataKey="score" stroke="#0c8de9" fill="#0c8de9" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Action Items:</span>
            <span className="bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full font-bold border border-red-500/30">
              {recommendations.length} Recommendations
            </span>
          </div>
        </div>
      </div>

      {/* Priority Recommendations & Opportunities Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Recommendations */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Priority SEO Action Items</span>
            </h3>
            <span className="text-xs text-slate-400">Top {Math.min(4, recommendations.length)} Priority</span>
          </div>

          <div className="space-y-3">
            {recommendations.slice(0, 4).map(rec => (
              <div
                key={rec.id}
                className="bg-slate-850 border border-slate-800 p-3.5 rounded-2xl flex items-start space-x-3 hover:border-slate-700 transition"
              >
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                    rec.severity === 'Critical'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : rec.severity === 'High'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {rec.severity}
                </span>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-200">{rec.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{rec.issue_summary}</p>
                </div>
              </div>
            ))}
            {recommendations.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">No pending critical recommendations.</p>
            )}
          </div>
        </div>

        {/* Local Opportunities */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Local Opportunity Signals</span>
            </h3>
          </div>

          <div className="space-y-3">
            {opportunities.slice(0, 3).map(opp => (
              <div key={opp.id} className="bg-slate-850 border border-slate-800 p-3.5 rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-500/20">
                    {opp.type}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">{opp.estimated_impact} Impact</span>
                </div>
                <h4 className="text-xs font-bold text-slate-200">{opp.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{opp.actionable_insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
