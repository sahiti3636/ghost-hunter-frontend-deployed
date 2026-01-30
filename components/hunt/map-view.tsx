"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap, CircleMarker, Popup, LayersControl, LayerGroup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import area from "@turf/area";
import { cn } from "@/lib/utils";

// Fix Leaflet marker icons in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface VesselMarker {
    id: string;
    lat: number;
    lng: number;
    risk: number;
    name: string;
    status: string;
}

interface MapViewProps {
    onPolygonComplete?: (data: { areaKm2: number; geoJson: any }) => void;
    readOnly?: boolean;
    vessels?: VesselMarker[];
    selectedVesselId?: string | null;
    onVesselSelect?: (id: string) => void;
    center?: [number, number];
    zoom?: number;
}

function DrawControl({ onCreated }: { onCreated: (e: any) => void }) {
    const map = useMap();

    useEffect(() => {
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        const drawControl = new L.Control.Draw({
            draw: {
                polygon: {
                    allowIntersection: false,
                    showArea: true,
                    shapeOptions: {
                        color: "#06b6d4", // cyan-500
                        fillOpacity: 0.2,
                    },
                },
                rectangle: {
                    shapeOptions: {
                        color: "#06b6d4",
                        fillOpacity: 0.2,
                    },
                },
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
            },
            edit: {
                featureGroup: drawnItems,
                remove: true,
            },
        });

        map.addControl(drawControl);

        const handleCreated = (e: any) => {
            const layer = e.layer;
            drawnItems.clearLayers();
            drawnItems.addLayer(layer);
            onCreated(e);
        };

        map.on(L.Draw.Event.CREATED, handleCreated);

        return () => {
            map.removeControl(drawControl);
            map.removeLayer(drawnItems);
            map.off(L.Draw.Event.CREATED, handleCreated);
        };
    }, [map, onCreated]);

    return null;
}

function MapController({ center, zoom }: { center?: [number, number], zoom?: number }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, zoom || map.getZoom());
    }, [center, zoom, map]);
    return null;
}

export default function MapView({
    onPolygonComplete,
    readOnly = false,
    vessels = [],
    selectedVesselId,
    onVesselSelect,
    center = [20, -160], // Default: Pacific
    zoom = 3
}: MapViewProps) {

    // Dynamic center calculation if vessels exist and no explicit center
    const [mapCenter, setMapCenter] = useState<[number, number]>(center);
    const [mapZoom, setMapZoom] = useState(zoom);

    useEffect(() => {
        if (vessels.length > 0 && !readOnly) {
            // Auto-center logic could go here, but for now trusting props or default
        }
    }, [vessels, readOnly]);

    const handleCreated = (e: any) => {
        if (readOnly || !onPolygonComplete) return;

        const type = e.layerType;
        const layer = e.layer;

        if (type === 'polygon' || type === 'rectangle') {
            const geoJson = layer.toGeoJSON();
            const calculatedArea = area(geoJson);
            const areaKm2 = Math.round(calculatedArea / 1000000);
            onPolygonComplete({ areaKm2, geoJson });
        }
    };

    return (
        <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: "100%", width: "100%", background: "#050505" }}
            zoomControl={false}
        >
            {/* Dark Matter Tiles */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            <MapController center={center} zoom={zoom} />

            {!readOnly && <DrawControl onCreated={handleCreated} />}

            {/* Render Vessels */}
            {vessels.map(v => {
                const isSelected = v.id === selectedVesselId;
                const riskColor = v.risk >= 90 ? "#ef4444" : v.risk >= 50 ? "#eab308" : "#22c55e"; // Red, Yellow, Green

                return (
                    <CircleMarker
                        key={v.id}
                        center={[v.lat, v.lng]}
                        pathOptions={{
                            color: isSelected ? "#ffffff" : riskColor,
                            fillColor: riskColor,
                            fillOpacity: isSelected ? 1 : 0.7,
                            weight: isSelected ? 3 : 1
                        }}
                        radius={isSelected ? 8 : 5}
                        eventHandlers={{
                            click: () => onVesselSelect && onVesselSelect(v.id)
                        }}
                    >
                        {/* Optional Popup on hover or click */}
                        {/* <Popup>
                            <div className="text-black text-xs font-bold">
                                {v.name} <br/>
                                Risk: {v.risk}
                            </div>
                         </Popup> */}
                    </CircleMarker>
                );
            })}
        </MapContainer>
    );
}
