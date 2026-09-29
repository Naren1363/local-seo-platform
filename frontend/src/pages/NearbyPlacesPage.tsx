import React, { useState, useEffect } from 'react';
import { useBusiness } from '../context/BusinessContext';
import api from '../services/api';
import { MapView } from '../components/MapView';
import { NearbyPlace, FullCompetitor } from '../types';
import { MapPin, Filter, Search, Star, Globe, Plus, Check, RefreshCw, Compass } from 'lucide-react';

export const NearbyPlacesPage: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [competitors, setCompetitors] = useState<FullCompetitor[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'direct_competitor' | 'related_business' | 'nearby_business'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchNearby = async (radius: number) => {
    if (!activeBusiness) return;
    setLoading(true);
    try {
      const bId = activeBusiness.business.id;
      const [nearbyRes, compRes] = await Promise.all([
        api.get(`/nearby?businessId=${bId}&radius=${radius}`),
        api.get(`/competitors?businessId=${bId}`),
      ]);

      setPlaces(nearbyRes.data.places || []);
      setCompetitors(compRes.data || []);
    } catch (err) {
      console.error('Error fetching nearby places:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby(radiusKm);
  }, [activeBusiness, radiusKm]);

  const handleTrackCompetitor = async (place: NearbyPlace) => {
    if (!activeBusiness) return;
    try {
      const res = await api.post('/competitors', {
        business_id: activeBusiness.business.id,
        name: place.name,
        category: place.category,
        website_url: place.website_url || '',
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
        distance_km: place.distance_km,
        is_direct_competitor: place.business_type === 'direct_competitor',
        rating: place.rating,
        review_count: place.review_count,
        has_website: !!place.website_url,
      });

      setCompetitors(prev => [...prev, res.data]);
    } catch (err) {
      console.error('Error tracking competitor:', err);
    }
  };

  if (!activeBusiness) {
    return (
      <div className="text-center py-12 text-slate-400">
        Please select or onboard a business to view Local Search Intelligence.
      </div>
    );
  }

  const trackedIds = new Set(competitors.map(c => c.competitor.name));

  const filteredPlaces = places.filter(p => {
    const matchesFilter = filterType === 'all' || p.business_type === filterType;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const directCount = places.filter(p => p.business_type === 'direct_competitor').length;
  const relatedCount = places.filter(p => p.business_type === 'related_business').length;
  const nearbyCount = places.filter(p => p.business_type === 'nearby_business').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Radius Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-brand-400 font-semibold mb-1">
            <Compass className="w-4 h-4" />
            <span>Local Search Radius Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Nearby Places & Businesses</h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing surrounding ecosystem within {radiusKm} km radius of {activeBusiness.business.name} ({activeBusiness.location.city})
          </p>
        </div>

        {/* Radius Selector Buttons */}
        <div className="flex items-center bg-slate-850 p-1.5 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 px-3 hidden sm:inline">Search Radius:</span>
          {[1, 3, 5, 10].map(r => (
            <button
              key={r}
              onClick={() => setRadiusKm(r)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                radiusKm === r
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center space-x-1 overflow-x-auto py-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Places ({places.length})
          </button>
          <button
            onClick={() => setFilterType('direct_competitor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center space-x-1.5 ${
              filterType === 'direct_competitor'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-slate-400 hover:text-red-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Direct Competitors ({directCount})</span>
          </button>
          <button
            onClick={() => setFilterType('related_business')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center space-x-1.5 ${
              filterType === 'related_business'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-slate-400 hover:text-purple-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span>Related ({relatedCount})</span>
          </button>
          <button
            onClick={() => setFilterType('nearby_business')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center space-x-1.5 ${
              filterType === 'nearby_business'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-blue-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Nearby ({nearbyCount})</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search place name or category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-slate-850 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Interactive Map View */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
        <MapView
          userBusiness={activeBusiness.business}
          userLocation={activeBusiness.location}
          nearbyPlaces={filteredPlaces}
          selectedRadiusKm={radiusKm}
          onSelectCompetitor={handleTrackCompetitor}
          trackedCompetitorIds={trackedIds}
          height="450px"
        />
      </div>

      {/* Sortable Places Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Discovered Businesses ({filteredPlaces.length})</h3>
          <span className="text-xs text-slate-400">Sorted by distance from your business</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Business Name & Category</th>
                <th className="px-4 py-3.5">Classification</th>
                <th className="px-4 py-3.5">Distance</th>
                <th className="px-4 py-3.5">Address</th>
                <th className="px-4 py-3.5">Rating / Reviews</th>
                <th className="px-4 py-3.5">Website</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredPlaces.map(place => {
                const isTracked = trackedIds.has(place.name);
                return (
                  <tr key={place.id} className="hover:bg-slate-850/60 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{place.name}</div>
                      <div className="text-[11px] text-slate-400">{place.category}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          place.business_type === 'direct_competitor'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : place.business_type === 'related_business'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {place.business_type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-200">
                      {place.distance_km} km
                    </td>
                    <td className="px-4 py-4 text-slate-400 max-w-xs truncate">
                      {place.address}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-amber-400">{place.rating?.toFixed(1) || '4.0'}</span>
                        <span className="text-slate-500 text-[10px]">({place.review_count || 15})</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {place.website_url ? (
                        <a
                          href={place.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-400 hover:underline flex items-center space-x-1"
                        >
                          <Globe className="w-3 h-3" />
                          <span>Visit Site</span>
                        </a>
                      ) : (
                        <span className="text-slate-600 text-[11px]">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleTrackCompetitor(place)}
                        disabled={isTracked}
                        className={`py-1.5 px-3 rounded-xl font-semibold text-[11px] transition ${
                          isTracked
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-default'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                        }`}
                      >
                        {isTracked ? '✓ Tracked' : '+ Add Competitor'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredPlaces.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 text-xs">
                    No places found matching your radius or filter criteria.
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
