import React, { useState, useEffect } from 'react';
import { useBusiness } from '../context/BusinessContext';
import api from '../services/api';
import { ReportRecord } from '../types';
import { FileText, Download, Printer, Sparkles, CheckCircle2, ShieldCheck, MapPin, Loader2 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchReports = async () => {
    if (!activeBusiness) return;
    setLoading(true);
    try {
      const res = await api.get(`/reports?businessId=${activeBusiness.business.id}`);
      setReports(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedReport(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeBusiness]);

  const handleGenerateReport = async () => {
    if (!activeBusiness) return;
    setGenerating(true);
    try {
      const res = await api.post('/reports/generate', { businessId: activeBusiness.business.id });
      setReports(prev => [res.data, ...prev]);
      setSelectedReport(res.data);
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!activeBusiness) return null;

  return (
    <div className="space-y-6 pb-12 print:p-0 print:m-0 print:bg-white print:text-black">
      {/* Header (Hidden on Print) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2 text-xs text-brand-400 font-semibold mb-1">
            <FileText className="w-4 h-4" />
            <span>Executive Report Generator</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Local SEO Audit Reports</h1>
          <p className="text-xs text-slate-400 mt-1">
            Downloadable & printable executive report summaries for client presentation
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs py-2.5 px-5 rounded-2xl shadow-lg shadow-brand-500/20 flex items-center space-x-2 transition disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{generating ? 'Generating Report...' : 'Generate New SEO Report'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block">
        {/* Report History List (Hidden on Print) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl h-fit space-y-3 print:hidden">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3">Report History ({reports.length})</h3>

          <div className="space-y-2">
            {reports.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedReport(r)}
                className={`w-full text-left p-3.5 rounded-2xl border transition ${
                  selectedReport?.id === r.id
                    ? 'bg-brand-600/15 text-white border-brand-500/40 shadow-md'
                    : 'bg-slate-850 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold truncate">{r.title}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Score: <strong className="text-brand-400">{r.overall_score}/100</strong></span>
                  <span>{new Date(r.created_at!).toLocaleDateString()}</span>
                </div>
              </button>
            ))}

            {reports.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">No reports generated yet.</p>
            )}
          </div>
        </div>

        {/* Selected Printable Report Viewer */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl print:border-none print:shadow-none print:p-0 print:bg-white text-slate-200">
          {selectedReport ? (
            <div className="space-y-6">
              {/* Report Control Toolbar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
                <div className="text-xs text-slate-400">
                  Report ID: <span className="font-mono text-slate-300">{selectedReport.id.substring(0, 8)}</span>
                </div>
                <button
                  onClick={handlePrint}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold py-2 px-4 rounded-xl flex items-center space-x-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF Report</span>
                </button>
              </div>

              {/* Document Header */}
              <div className="border-b border-slate-800 pb-6 print:border-slate-300">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">Executive Local SEO Report</span>
                    <h2 className="text-2xl font-extrabold text-white print:text-black mt-1">{selectedReport.report_data?.business?.name}</h2>
                    <p className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
                      {selectedReport.report_data?.location?.formatted_address}
                    </p>
                  </div>
                  <div className="bg-slate-850 print:bg-slate-100 p-4 rounded-2xl text-center border border-slate-800 print:border-slate-300">
                    <div className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-bold">Overall SEO Score</div>
                    <div className="text-3xl font-extrabold text-brand-400 print:text-blue-600">{selectedReport.overall_score}/100</div>
                  </div>
                </div>
              </div>

              {/* Summary Statement */}
              <div className="bg-slate-850 print:bg-slate-50 border border-slate-800 print:border-slate-200 rounded-2xl p-4 text-xs">
                <div className="font-bold text-slate-200 print:text-black mb-1">Executive Summary:</div>
                <p className="text-slate-300 print:text-slate-700 leading-relaxed">{selectedReport.summary}</p>
              </div>

              {/* Pillar Score Matrix */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-850 print:bg-slate-50 p-3 rounded-2xl border border-slate-800 print:border-slate-200">
                  <div className="text-[10px] text-slate-400 print:text-slate-600 font-bold">Technical SEO</div>
                  <div className="text-xl font-bold text-indigo-400 print:text-indigo-600">
                    {selectedReport.report_data?.scores?.technical}/100
                  </div>
                </div>
                <div className="bg-slate-850 print:bg-slate-50 p-3 rounded-2xl border border-slate-800 print:border-slate-200">
                  <div className="text-[10px] text-slate-400 print:text-slate-600 font-bold">On-Page SEO</div>
                  <div className="text-xl font-bold text-emerald-400 print:text-emerald-600">
                    {selectedReport.report_data?.scores?.onpage}/100
                  </div>
                </div>
                <div className="bg-slate-850 print:bg-slate-50 p-3 rounded-2xl border border-slate-800 print:border-slate-200">
                  <div className="text-[10px] text-slate-400 print:text-slate-600 font-bold">Local Signals</div>
                  <div className="text-xl font-bold text-amber-400 print:text-amber-600">
                    {selectedReport.report_data?.scores?.local}/100
                  </div>
                </div>
              </div>

              {/* Key Recommendations Summary */}
              {selectedReport.report_data?.topRecommendations && (
                <div>
                  <h4 className="font-bold text-sm text-white print:text-black mb-2">Priority SEO Action Plan:</h4>
                  <div className="space-y-2 text-xs">
                    {selectedReport.report_data.topRecommendations.map((rec: any, idx: number) => (
                      <div key={idx} className="bg-slate-850 print:bg-slate-50 p-3 rounded-xl border border-slate-800 print:border-slate-200">
                        <div className="font-bold text-slate-200 print:text-black">{rec.title}</div>
                        <div className="text-slate-400 print:text-slate-600 text-[11px] mt-0.5">{rec.issue_summary}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              Select or generate a report to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
