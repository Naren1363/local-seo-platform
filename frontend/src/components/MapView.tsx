import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { NearbyPlace, BusinessLocation, Business } from '../types';

// Custom Leaflet Markers with FontAwesome / SVG style icons
const createCustomIcon = (color: string, iconLabel: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 13px;
      ">
        ${iconLabel}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

const userIcon = createCustomIcon('#eab308', '★'); // Gold Star for User Business
const competitorIcon = createCustomIcon('#ef4444', 'C'); // Red C for Direct Competitor
const relatedIcon = createCustomIcon('#8b5cf6', 'R'); // Purple R for Related
const nearbyIcon = createCustomIcon('#3b82f6', 'N'); // Blue N for Nearby

// Helper component to re-center map when location or radius changes
const MapRecenter: React.FC<{ lat: number; lng: number; zoom: number }> = ({ lat, lng, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [lat, lng, zoom, map]);
  return null;
};

interface MapViewProps {
  userBusiness?: Business;
  userLocation: BusinessLocation;
  nearbyPlaces?: NearbyPlace[];
  selectedRadiusKm?: number;
  onSelectCompetitor?: (place: NearbyPlace) => void;
  trackedCompetitorIds?: Set<string>;
  height?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  userBusiness,
  userLocation,
  nearbyPlaces = [],
  selectedRadiusKm = 5,
  onSelectCompetitor,
  trackedCompetitorIds = new Set(),
  height = '500px',
}) => {
  const centerLat = userLocation.latitude;
  const centerLng = userLocation.longitude;

  // Compute map zoom level dynamically based on radius
  const getZoomLevel = (radius: number) => {
    if (radius <= 1) return 15;
    if (radius <= 3) return 14;
    if (radius <= 5) return 13;
    return 12; // 10km
  };

  const zoomLevel = getZoomLevel(selectedRadiusKm);

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden shadow-lg border border-slate-700/60 relative z-0">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapRecenter lat={centerLat} lng={centerLng} zoom={zoomLevel} />

        {/* Dark-mode styled OpenStreetMap TileLayer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Search Radius Visualizer Circle */}
        <Circle
          center={[centerLat, centerLng]}
          radius={selectedRadiusKm * 1000}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.12,
            weight: 2,
            dashArray: '6, 6',
          }}
        />

        {/* User's Own Business Marker */}
        <Marker position={[centerLat, centerLng]} icon={userIcon}>
          <Popup>
            <div className="p-1 min-w-[200px]">
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Your Business
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">{userBusiness?.name || 'Your Business'}</h4>
              <p className="text-xs text-slate-600 font-medium">{userLocation.formatted_address || userLocation.address}</p>
              <div className="mt-2 text-[11px] text-slate-500">
                Category: <span className="font-semibold text-slate-700">{userBusiness?.category}</span>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Nearby Places & Competitor Markers */}
        {nearbyPlaces.map(place => {
          let icon = nearbyIcon;
          let typeLabel = 'Nearby Business';
          let badgeColor = 'bg-blue-100 text-blue-800';

          if (place.business_type === 'direct_competitor') {
            icon = competitorIcon;
            typeLabel = 'Direct Competitor';
            badgeColor = 'bg-red-100 text-red-800';
          } else if (place.business_type === 'related_business') {
            icon = relatedIcon;
            typeLabel = 'Related Business';
            badgeColor = 'bg-purple-100 text-purple-800';
          }

          const isTracked = trackedCompetitorIds.has(place.id) || trackedCompetitorIds.has(place.place_id || '');

          return (
            <Marker key={place.id} position={[place.latitude, place.longitude]} icon={icon}>
              <Popup>
                <div className="p-1 min-w-[210px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`${badgeColor} text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                      {typeLabel}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{place.distance_km} km away</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{place.name}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{place.address}</p>

                  <div className="mt-2 flex items-center justify-between text-xs border-t pt-2 border-slate-200">
                    <div>
                      <span className="text-amber-500 font-bold">★ {place.rating?.toFixed(1) || '4.0'}</span>
                      <span className="text-slate-400 text-[11px] ml-1">({place.review_count || 12} reviews)</span>
                    </div>
                  </div>

                  {onSelectCompetitor && (
                    <button
                      onClick={() => onSelectCompetitor(place)}
                      disabled={isTracked}
                      className={`mt-2.5 w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                        isTracked
                          ? 'bg-emerald-100 text-emerald-700 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                      }`}
                    >
                      {isTracked ? '✓ Tracked Competitor' : '+ Track Competitor'}
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
