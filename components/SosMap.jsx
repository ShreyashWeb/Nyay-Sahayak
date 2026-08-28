"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapPin, Phone } from "lucide-react";

// Custom Leaflet HTML marker pin to bypass default asset path issues
const createCustomIcon = () => {
  return L.divIcon({
    html: `
      <div class="bg-secondary text-[#FAF9F6] p-2 rounded-full border-2 border-white shadow-md flex items-center justify-center w-9 h-9 transform -translate-x-1/2 -translate-y-full hover:scale-105 transition-transform duration-200">
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

const shelterLocations = [
  {
    id: 1,
    name: "One Stop Center (OSC) - Central Delhi",
    address: "Hospital Premises, New Delhi",
    phone: "011-23348123",
    position: [28.6250, 77.2150]
  },
  {
    id: 2,
    name: "Sakhi Safe House & Shelter",
    address: "Sector 4, Rohini, Delhi",
    phone: "9876543210",
    position: [28.6050, 77.1950]
  },
  {
    id: 3,
    name: "DLSA Central Legal Aid Desk",
    address: "Tis Hazari Court Complex, Delhi",
    phone: "011-23971234",
    position: [28.6150, 77.2250]
  }
];

export default function SosMap() {
  const centerPosition = [28.6139, 77.2090]; // Central New Delhi

  return (
    <div className="w-full h-80 rounded-2xl overflow-hidden border border-base-dark/5 shadow-xs relative z-10">
      <MapContainer 
        center={centerPosition} 
        zoom={12} 
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {shelterLocations.map((shelter) => (
          <Marker 
            key={shelter.id} 
            position={shelter.position} 
            icon={createCustomIcon()}
          >
            <Popup>
              <div className="text-left p-1 text-xs font-sans">
                <h3 className="font-extrabold text-base-dark text-sm mb-1">{shelter.name}</h3>
                <p className="text-base-dark/75 leading-tight mb-2">{shelter.address}</p>
                <a
                  href={`tel:${shelter.phone}`}
                  className="flex items-center space-x-1 text-secondary hover:text-primary font-bold transition-colors w-max no-underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call: {shelter.phone}</span>
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
