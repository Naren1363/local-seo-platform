import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { Building2, MapPin, Globe, Tags, X, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface BusinessOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BusinessOnboardingModal: React.FC<BusinessOnboardingModalProps> = ({ isOpen, onClose }) => {
  const { createBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: 'ABC Bakery',
    website_url: 'https://abcbakerychennai.com',
    category: 'Bakery & Confectionery',
    address: 'Anna Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    target_keywords: 'bakery near me, best bakery in Anna Nagar, birthday cake Anna Nagar, custom cakes Chennai',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createBusiness(formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to onboard business.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 shadow-2xl overflow-hidden relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-500/20 text-brand-400 p-2.5 rounded-2xl border border-brand-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Onboard New Business</h3>
              <p className="text-xs text-slate-400">Validate address, geocode & setup local intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-2xl text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Business Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. ABC Bakery"
                  className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Website URL *</label>
              <div className="relative">
                <input
                  type="url"
                  required
                  value={formData.website_url}
                  onChange={e => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Business Category *</label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Bakery, Cafe, Dental Clinic"
              className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition"
            />
          </div>

          <div className="border-t border-slate-800/80 pt-3">
            <div className="text-xs font-semibold text-brand-400 mb-2.5 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Location & Geocoding Details</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">Street / Neighborhood Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Anna Nagar, 2nd Avenue"
                  className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Chennai"
                  className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">State / Province *</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g. Tamil Nadu"
                  className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">Country *</label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g. India"
                  className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Target Local Keywords</span>
              <span className="text-[11px] text-slate-400 font-normal">Comma-separated</span>
            </label>
            <textarea
              rows={2}
              value={formData.target_keywords}
              onChange={e => setFormData({ ...formData, target_keywords: e.target.value })}
              placeholder="e.g. bakery near me, best cakes in Chennai"
              className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500 transition"
            />
          </div>

          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs py-2.5 px-5 rounded-xl shadow-lg shadow-brand-500/20 flex items-center space-x-2 disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Geocoding & Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Geocode & Add Business</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
