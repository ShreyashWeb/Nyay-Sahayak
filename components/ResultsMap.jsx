"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Phone, MapPin } from "lucide-react";

// Hook helper to pan the map dynamically when search coordinates change
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 12, { animate: true });
    }
  }, [center, map]);
  return null;
}

// Custom Leaflet HTML Pin Icon generator
const createPinIcon = (colorClass) => {
  return L.divIcon({
    html: `
      <div class="${colorClass} p-2 rounded-full border-2 border-white shadow-md flex items-center justify-center w-9 h-9 transform -translate-x-1/2 -translate-y-full hover:scale-105 transition-transform duration-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    className: "custom-leaflet-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

export default function ResultsMap({ offices, userCoords }) {
  const defaultCenter = [28.6139, 77.2090]; // Delhi Center
  const mapCenter = userCoords && userCoords[0] ? userCoords : defaultCenter;

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden border border-base-dark/5 shadow-xs relative z-10">
      <MapContainer
        center={mapCenter}
        zoom={11}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <ChangeView center={mapCenter} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Pin (Saffron Color) */}
        {userCoords && userCoords[0] && (
          <Marker position={userCoords} icon={createPinIcon("bg-primary text-[#FAF9F6]")}>
            <Popup>
              <div className="text-center font-sans text-xs font-bold">
                <span>Your Location / आपका स्थान</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* DLSA Office Pins (Teal Color) */}
        {offices.map((office) => {
          if (!office.latitude || !office.longitude) return null;
          return (
            <Marker
              key={office.id}
              position={[office.latitude, office.longitude]}
              icon={createPinIcon("bg-secondary text-[#FAF9F6]")}
            >
              <Popup>
                <div className="text-left p-1 text-xs font-sans">
                  <h3 className="font-extrabold text-base-dark text-sm mb-1">{office.name}</h3>
                  <p className="text-base-dark/75 leading-tight mb-2">{office.address}</p>
                  {office.distance !== undefined && office.distance !== null && (
                    <p className="text-3xs text-secondary font-bold mb-2">
                      Distance: {office.distance.toFixed(1)} km away
                    </p>
                  )}
                  <a
                    href={`tel:${office.phone}`}
                    className="flex items-center space-x-1 text-secondary hover:text-primary font-bold transition-colors w-max no-underline"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call: {office.phone}</span>
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
