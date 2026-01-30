"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import {
    Activity,
    AlertTriangle,
    Crosshair,
    ShieldAlert,
    Ship,
    Signal,
    Users,
} from "lucide-react";

/* ─────────────────────────────────────────── */
/* Leaflet map must be client-only              */
/* ─────────────────────────────────────────── */
const MapView = dynamic(() => import("./results-map"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-black animate-pulse" />
    ),
});

import { generateAnalysisPDF } from "@/lib/pdf-generator";

/* ─────────────────────────────────────────── */
/* Types                                       */
/* ─────────────────────────────────────────── */
interface VesselData {
    id: string;
    name: string;
    risk: number;
    status: string;
    lat: number | null;
    lng: number | null;
    lastSeen: string;
    type: string;
    flag: string;
    behavior_analysis: {
        reasoning?: string;
    };
}

interface AnalysisResults {
    detection_summary: any;
    intelligence_analysis: any;
}

/* ─────────────────────────────────────────── */
/* Component                                   */
/* ─────────────────────────────────────────── */
export function Dashboard() {
    const params = useParams();

    const [vessels, setVessels] = useState<VesselData[]>([]);
    const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
    const [analysisResults, setAnalysisResults] =
        useState<AnalysisResults | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Raw map center (may be invalid temporarily)
    const [mapCenter, setMapCenter] = useState<[number, number]>([20, -160]);

    /* ─────────────────────────────────────────── */
    /* Fetch + sanitize data                       */
    /* ─────────────────────────────────────────── */
    useEffect(() => {
        if (!params.id) return;

        const fetchResults = async () => {
            try {
                // FORCE STATIC: Assuming all IDs in frontend mode are static files
                const url = `/data/scenarios/${params.id}.json`;
                console.log(`[Dashboard] Fetching static scenario: ${url}`);

                const res = await fetch(url);
                if (!res.ok) throw new Error(`Failed to load results for ${params.id}. Status: ${res.status}`);
                const data = await res.json();

                /* ── Sanitize vessels ── */
                const formatted: VesselData[] = (data.vessels || []).map(
                    (v: any, i: number) => {
                        const lat = Number.isFinite(v.lat)
                            ? v.lat
                            : Number.isFinite(v.latitude)
                                ? v.latitude
                                : null;

                        const lng = Number.isFinite(v.lng)
                            ? v.lng
                            : Number.isFinite(v.longitude)
                                ? v.longitude
                                : null;

                        return {
                            id: String(v.id || v.vessel_id || `V-${i}`),
                            name: v.name || `Vessel ${i + 1}`,
                            risk: v.risk || v.risk_score || 0,
                            status: v.status || "ACTIVE",
                            lat,
                            lng,
                            lastSeen: "RECENT",
                            type: v.type || "Unknown",
                            flag: v.flag || "Unknown",
                            behavior_analysis:
                                v.behavior_analysis || { reasoning: v.analysis },
                        };
                    }
                );

                /* ── Keep only geo-valid vessels ── */
                const geoValid = formatted.filter(
                    v => Number.isFinite(v.lat) && Number.isFinite(v.lng)
                );

                setVessels(geoValid);

                setAnalysisResults({
                    detection_summary: data.detection_summary,
                    intelligence_analysis:
                        data.intelligence_analysis || data.intelligence_summary,
                });

                /* ── Select first valid vessel ── */
                if (geoValid.length > 0) {
                    const first = geoValid[0];
                    setSelectedVesselId(first.id);
                    setMapCenter([first.lat!, first.lng!]);
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Unknown error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [params.id]);

    /* ─────────────────────────────────────────── */
    /* Safe center guard                           */
    /* ─────────────────────────────────────────── */
    const safeCenter: [number, number] =
        mapCenter.every(Number.isFinite) ? mapCenter : [20, -160];

    const selected = vessels.find(v => v.id === selectedVesselId);

    /* ─────────────────────────────────────────── */
    /* Loading / Error state                       */
    /* ─────────────────────────────────────────── */
    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-black text-cyan-500">
                LOADING INTELLIGENCE…
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-red-500 gap-4">
                <AlertTriangle className="w-12 h-12" />
                <div className="text-xl font-bold">LOAD FAILED</div>
                <div className="font-mono text-sm bg-red-950/30 p-4 rounded border border-red-900/50">
                    {error}
                </div>
            </div>
        );
    }

    const handleDownloadReport = () => {
        if (vessels.length > 0) {
            generateAnalysisPDF(vessels, analysisResults, String(params.id));
        }
    };

    /* ─────────────────────────────────────────── */
    /* Layout                                     */
    /* ─────────────────────────────────────────── */
    return (
        <div className="flex h-screen w-full overflow-hidden bg-black text-white">

            {/* ───────── LEFT: VESSELS ───────── */}
            <aside className="w-[320px] shrink-0 flex flex-col border-r border-white/10 bg-black/90 z-30">
                <div className="h-16 px-6 flex items-center border-b border-white/10">
                    <ShieldAlert className="text-cyan-400 mr-2" />
                    <span className="font-bold tracking-wider text-cyan-400">
                        DETECTED VESSELS
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {vessels.map(v => (
                        <div
                            key={v.id}
                            onClick={() => {
                                if (Number.isFinite(v.lat) && Number.isFinite(v.lng)) {
                                    setSelectedVesselId(v.id);
                                    setMapCenter([v.lat!, v.lng!]);
                                }
                            }}
                            className={cn(
                                "p-3 rounded border cursor-pointer transition",
                                selectedVesselId === v.id
                                    ? "bg-white/10 border-cyan-500/50"
                                    : "border-white/5 hover:bg-white/5"
                            )}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Ship className="w-4 h-4 text-cyan-400" />
                                    <span className="font-bold text-sm">ID: {v.id}</span>
                                </div>
                                <span className="text-sm text-cyan-400">{v.risk}%</span>
                            </div>
                            <div className="text-[10px] text-gray-500 mt-1">
                                {v.status} • {v.lastSeen}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* ───────── CENTER: MAP ───────── */}
            <main className="relative flex-1 min-w-[500px] h-full z-10 border-r border-white/10">
                <div className="absolute inset-0">
                    <MapView
                        vessels={vessels}
                        selectedVesselId={selectedVesselId}
                        center={safeCenter}
                        zoom={9}
                        readOnly
                        onVesselSelect={(id: string) => {
                            const v = vessels.find(v => v.id === id);
                            if (v && Number.isFinite(v.lat) && Number.isFinite(v.lng)) {
                                setSelectedVesselId(id);
                                setMapCenter([v.lat!, v.lng!]);
                            }
                        }}
                    />
                </div>
            </main>

            {/* ───────── RIGHT: AI ANALYSIS ───────── */}
            <aside className="w-[320px] shrink-0 flex flex-col border-l border-white/10 bg-black/90 z-30">
                <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center">
                        <Activity className="text-cyan-400 mr-2" />
                        <span className="font-bold tracking-wider text-cyan-400">
                            ANALYSIS
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {analysisResults && (
                        <>
                            <div>
                                <h3 className="text-xs uppercase text-gray-500 mb-2 flex items-center gap-2">
                                    <Signal className="w-3 h-3" /> Global Situation
                                </h3>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {analysisResults.intelligence_analysis?.executive_summary}
                                </p>
                            </div>

                            {selected ? (
                                <div>
                                    <h3 className="text-xs uppercase text-gray-500 mb-2">
                                        Target: {selected.id}
                                    </h3>

                                    <div className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded text-sm">
                                        {selected.behavior_analysis?.reasoning ||
                                            "Analyzing vessel behavior…"}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                                        <div className="p-3 bg-white/5 rounded">
                                            <div className="text-gray-500 mb-1">Type</div>
                                            <div className="font-bold flex gap-2">
                                                <Ship className="w-3 h-3" /> {selected.type}
                                            </div>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded">
                                            <div className="text-gray-500 mb-1">Flag</div>
                                            <div className="font-bold flex gap-2">
                                                <Users className="w-3 h-3" /> {selected.flag}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-32 flex items-center justify-center border border-dashed border-white/10 text-gray-600">
                                    Select a vessel
                                </div>
                            )}

                            {/* DOWNLOAD BUTTON */}
                            <div className="pt-6 border-t border-white/10">
                                <button
                                    onClick={handleDownloadReport}
                                    className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 py-3 rounded flex items-center justify-center gap-2 transition-colors group"
                                >
                                    <span className="font-bold text-xs uppercase tracking-wider">Download PDF Report</span>
                                    <ArrowDownTrayIcon className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </aside>
        </div>
    );
}

function ArrowDownTrayIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
    )
}
