"use client";

import React, { useEffect } from "react";
import {
    MapContainer,
    CircleMarker,
    Popup,
    TileLayer,
    useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Vessel {
    id: string;
    name: string;
    risk: number;
    status: string;
    lat: number;
    lng: number;
}

interface ResultsMapProps {
    vessels: Vessel[];
    selectedVesselId: string | null;
    onVesselSelect: (id: string) => void;
    center?: [number, number];
    zoom?: number;
    readOnly?: boolean;
}

/* 🔧 Fix Leaflet size + camera updates */
function MapController({
    center,
    zoom,
}: {
    center?: [number, number];
    zoom?: number;
}) {
    const map = useMap();

    useEffect(() => {
        // 🔑 CRITICAL: force Leaflet to recalc size
        setTimeout(() => {
            map.invalidateSize();
        }, 0);
    }, [map]);

    useEffect(() => {
        if (center) {
            map.setView(center, zoom ?? map.getZoom(), {
                animate: true,
            });
        }
    }, [center, zoom, map]);

    return null;
}

export default function ResultsMap({
    vessels,
    selectedVesselId,
    onVesselSelect,
    center,
    zoom = 9,
}: ResultsMapProps) {
    const getRiskColor = (risk: number) => {
        if (risk >= 80) return "#ef4444";
        if (risk >= 50) return "#eab308";
        return "#22c55e";
    };

    return (
        <div className="w-full h-full">
            <MapContainer
                center={center ?? [20, -160]}
                zoom={zoom}
                scrollWheelZoom
                attributionControl={false}
                style={{
                    height: "100%",
                    width: "100%",
                    background: "#050505",
                }}
            >
                <MapController center={center} zoom={zoom} />

                {/* 🌍 Base Map */}
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap contributors"
                />

                {/* 🚢 Vessel Markers */}
                {vessels.map((vessel) => {
                    const isSelected = vessel.id === selectedVesselId;

                    return (
                        <CircleMarker
                            key={vessel.id}
                            center={[vessel.lat, vessel.lng]}
                            radius={isSelected ? 8 : 5}
                            pathOptions={{
                                color: isSelected ? "#ffffff" : getRiskColor(vessel.risk),
                                fillColor: getRiskColor(vessel.risk),
                                fillOpacity: 0.85,
                                weight: isSelected ? 3 : 1,
                            }}
                            eventHandlers={{
                                click: () => onVesselSelect(vessel.id),
                            }}
                        >
                            <Popup>
                                <div className="text-black text-xs">
                                    <strong>{vessel.name || vessel.id}</strong>
                                    <br />
                                    Risk: {vessel.risk}%
                                    <br />
                                    Status: {vessel.status}
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
