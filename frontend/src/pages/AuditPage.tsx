import React, { useState, useEffect } from 'react';
import { useBusiness } from '../context/BusinessContext';
import api from '../services/api';
import { AuditAnalysisResult } from '../types';
import { SearchCheck, ShieldCheck, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Code, Copy, Check } from 'lucide-react';

export const AuditPage: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const [auditResult, setAuditResult] = useState<AuditAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'Technical' | 'On-Page' | 'Local'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLatestAudit = async () => {
    if (!activeBusiness) return;
    setLoading(true);
    try {
      const res = await api.get(`/audit/latest?businessId=${activeBusiness.business.id}`);
      setAuditResult(res.data);
      setTargetUrl(res.data.audit.website_url);
    } catch (err) {
      console.warn('No audit found:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeBusiness) {
      setTargetUrl(activeBusiness.business.website_url);
      fetchLatestAudit();
    }
  }, [activeBusiness]);

  const handleRunAudit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeBusiness || !targetUrl) return;

    setLoading(true);
    try {
      const res = await api.post('/audit/run', {
        businessId: activeBusiness.business.id,
        websiteUrl: targetUrl,
      });
      setAuditResult(res.data);
    } catch (err) {
      console.error('Error running website audit:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!activeBusiness) return null;

  const filteredIssues = auditResult?.issues.filter(
    iss => activeTab === 'all' || iss.category === activeTab
  ) || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Audit Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-brand-400 font-semibold mb-1">
            <SearchCheck className="w-4 h-4" />
            <span>Automated Technical & On-Page Auditor</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Website SEO Audit Engine</h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyze HTTPS, response speed, meta tags, heading structure, and Schema.org LocalBusiness data
          </p>
        </div>

        <form onSubmit={handleRunAudit} className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <input
            type="url"
            required
            value={targetUrl}
            onChange={e => setTargetUrl(e.target.value)}
            placeholder="https://yourbusinesswebsite.com"
            className="w-full bg-slate-850 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs py-2.5 px-6 rounded-2xl shadow-lg shadow-brand-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 whitespace-nowrap transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing Website...' : 'Run Audit Now'}</span>
          </button>
        </form>
      </div>

      {auditResult && (
        <>
          {/* Score Gauges Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl text-center shadow-lg">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Overall Score</div>
              <div className="text-4xl font-extrabold text-white">{auditResult.audit.overall_score}</div>
              <div className="text-[11px] text-slate-500 mt-1">Weighted Total</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl text-center shadow-lg">
              <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Technical SEO</div>
              <div className="text-4xl font-extrabold text-indigo-400">{auditResult.audit.technical_score}</div>
              <div className="text-[11px] text-slate-500 mt-1">Speed, HTTPS, Sitemap</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl text-center shadow-lg">
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">On-Page SEO</div>
              <div className="text-4xl font-extrabold text-emerald-400">{auditResult.audit.onpage_score}</div>
              <div className="text-[11px] text-slate-500 mt-1">Title, Meta, Alt Tags</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl text-center shadow-lg">
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Local SEO</div>
              <div className="text-4xl font-extrabold text-amber-400">{auditResult.audit.local_score}</div>
              <div className="text-[11px] text-slate-500 mt-1">JSON-LD Schema & NAP</div>
            </div>
          </div>

          {/* Issue Category Filters */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            {(['all', 'Technical', 'On-Page', 'Local'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold transition ${
                  activeTab === tab
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab === 'all' ? 'All Detected Issues' : `${tab} Issues`}
              </button>
            ))}
          </div>

          {/* Detailed Issues Feed */}
          <div className="space-y-4">
            {filteredIssues.map(issue => (
              <div
                key={issue.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        issue.severity === 'Critical'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : issue.severity === 'High'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-850 px-2 py-0.5 rounded-md">
                      {issue.category}
                    </span>
                    <h3 className="font-bold text-sm text-white">{issue.title}</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300">{issue.description}</p>

                <div className="bg-slate-850 border border-slate-800/80 rounded-2xl p-3.5 space-y-1.5 text-xs">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">SEO Impact:</div>
                  <p className="text-slate-300 leading-relaxed">{issue.impact_explanation}</p>
                </div>

                <div className="text-xs text-emerald-400 font-medium">
                  <strong>Fix Recommendation:</strong> {issue.recommendation}
                </div>

                {issue.code_snippet && (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs font-mono text-slate-200 relative group">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 border-b border-slate-850 pb-1">
                      <span>Code Fix Snippet</span>
                      <button
                        onClick={() => handleCopySnippet(issue.id, issue.code_snippet!)}
                        className="text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                      >
                        {copiedId === issue.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === issue.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="overflow-x-auto whitespace-pre-wrap">{issue.code_snippet}</pre>
                  </div>
                )}
              </div>
            ))}

            {filteredIssues.length === 0 && (
              <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h3 className="font-bold text-white text-base">No Issues Detected in Category</h3>
                <p className="text-xs text-slate-400">Your website passed all checks for this SEO category.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
