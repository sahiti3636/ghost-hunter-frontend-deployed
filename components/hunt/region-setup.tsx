"use client";

import React, { useState } from "react";
import { CalendarIcon, Crosshair, Map as MapIcon, PlayCircle, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProcessingView } from "./processing-view";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import MapView to avoid SSR issues
const MapView = dynamic(() => import("./map-view"), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-[#050505] text-gray-500">
            <div className="text-center">
                <Crosshair className="mx-auto mb-2 h-8 w-8 animate-spin opacity-20" />
                <p className="text-xs font-mono tracking-widest opacity-40">LOADING MAP SYSTEMS...</p>
            </div>
        </div>
    ),
});

// Static Scenarios for Frontend-Only Mode
const SCENARIOS = [
    {
        "value": "simulated_traffic",
        "label": "SIMULATED TRAFFIC (Demo)"
    },
    {
        "value": "papahanaumokuakea",
        "label": "Papahānaumokuākea (Real Data)"
    },
    {
        "value": "S1C_IW_GRDH_1SDV_20251229T135157_20251229T135222_005667_00B519_E24C.SAFE",
        "label": "Pacific Sector: Alert #E24C"
    },
    {
        "value": "sat6",
        "label": "Satellite Feed #6"
    },
    {
        "value": "sat11",
        "label": "Satellite Feed #11"
    },
    {
        "value": "S1A_IW_GRDH_1SDV_20251228T140125_20251228T140141_062516_07D581_42C8.SAFE",
        "label": "Indian Ocean: Incident #42C8"
    },
    {
        "value": "S1A_IW_GRDH_1SDV_20251228T231936_20251228T232001_062522_07D5BF_FAE4.SAFE",
        "label": "South China Sea: Patrol #FAE4"
    },
    {
        "value": "S1A_IW_GRDH_1SDV_20251228T232206_20251228T232231_062522_07D5BF_39AF.SAFE",
        "label": "Gulf of Guinea: Sweep #39AF"
    },
    {
        "value": "sat10",
        "label": "Satellite Feed #10"
    },
    {
        "value": "sat7",
        "label": "Satellite Feed #7"
    },
    {
        "value": "sat1",
        "label": "Satellite Feed #1"
    },
    {
        "value": "S1A_IW_GRDH_1SDV_20260129T031756_20260129T031821_062976_07E6D2_0791.SAFE",
        "label": "North Atlantic: Zone #0791"
    },
    {
        "value": "S1A_IW_GRDH_1SDV_20251228T214746_20251228T214811_062521_07D5B8_53DF.SAFE",
        "label": "Mediterranean: Ops #53DF"
    },
    {
        "value": "sat2",
        "label": "Satellite Feed #2"
    },
    {
        "value": "S1A_IW_GRDH_1SDV_20251228T001355_20251228T001424_062508_07D539_B554.SAFE",
        "label": "Caribbean: Watch #B554"
    },
    {
        "value": "sat3",
        "label": "Satellite Feed #3"
    },
    {
        "value": "sat14",
        "label": "Satellite Feed #14"
    },
    {
        "value": "S1A_IW_GRDH_1SDV_20251228T232116_20251228T232141_062522_07D5BF_9658.SAFE",
        "label": "Baltic Sea: Scan #9658"
    },
    {
        "value": "S1A_IW_GRDH_1SDV_20251228T232141_20251228T232206_062522_07D5BF_6E7D.SAFE",
        "label": "Black Sea: Monitor #6E7D"
    },
    {
        "value": "S1A_IW_GRDH_1SDV_20260129T031821_20260129T031846_062976_07E6D2_CE40.SAFE",
        "label": "Arctic: Survey #CE40"
    },
    {
        "value": "sat13",
        "label": "Satellite Feed #13"
    },
    {
        "value": "sat4",
        "label": "Satellite Feed #4"
    },
    {
        "value": "S1C_IW_GRDH_1SDV_20251230T043952_20251230T044017_005676_00B568_561F.SAFE",
        "label": "Pacific Sector: Patrol #561F"
    },
    {
        "value": "sat8",
        "label": "Satellite Feed #8"
    },
    {
        "value": "sat9",
        "label": "Satellite Feed #9"
    },
    {
        "value": "sat5",
        "label": "Satellite Feed #5"
    },
    {
        "value": "sat12",
        "label": "Satellite Feed #12"
    }
];

export function RegionSetup() {
    const router = useRouter();
    const [selectedScenario, setSelectedScenario] = useState<string>("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleAnalysisComplete = () => {
        if (selectedScenario) {
            router.push(`/results/${selectedScenario}`);
        }
    };

    const startAnalysis = async () => {
        setIsAnalyzing(true);
        // Simulate processing time
        setTimeout(() => {
            // ProcessingView handles the completion callback
        }, 100);
    };

    const canAnalyze = !!selectedScenario;

    if (isAnalyzing) {
        return <ProcessingView analysisId={selectedScenario} onComplete={handleAnalysisComplete} />;
    }

    return (
        <div className="flex flex-col h-screen w-full bg-black text-white overflow-hidden font-sans">
            {/* Top Bar */}
            <header className="h-14 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Crosshair className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold tracking-wider text-lg">GHOST<span className="text-cyan-400">HUNTER</span></span>
                    <div className="h-4 w-[1px] bg-white/20 mx-3" />
                    <span className="text-sm text-gray-400 font-medium">New Analysis</span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <Settings className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <User className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Left Panel: Region Controls */}
                <aside className="w-80 border-r border-white/10 bg-black/80 backdrop-blur-sm flex flex-col z-40 relative shadow-2xl">
                    <div className="p-6 space-y-8 flex-1 overflow-y-auto">

                        {/* 1. Region Selection */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-cyan-400 mb-2">
                                <MapIcon className="w-4 h-4" />
                                <h3 className="text-sm font-bold uppercase tracking-widest">Select Scenario</h3>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-gray-400">Choose Analysis Target</label>
                                <select
                                    value={selectedScenario}
                                    onChange={(e) => setSelectedScenario(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                >
                                    <option value="" disabled>Select a scenario...</option>
                                    {SCENARIOS.map(scenario => (
                                        <option key={scenario.value} value={scenario.value}>{scenario.label}</option>
                                    ))}
                                </select>
                                {selectedScenario && (
                                    <div className="p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
                                        <div className="text-xs text-cyan-200">
                                            <span className="font-bold">{SCENARIOS.find(s => s.value === selectedScenario)?.label}</span>
                                            <br />
                                            <span className="text-cyan-400/70">Satellite Analysis Ready</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Timeframe Selection */}
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <div className="flex items-center gap-2 text-cyan-400 mb-2">
                                <CalendarIcon className="w-4 h-4" />
                                <h3 className="text-sm font-bold uppercase tracking-widest">Timeframe</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 transition-colors [color-scheme:dark]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 transition-colors [color-scheme:dark]"
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-500 leading-relaxed">
                                * Using archived satellite data for this demonstration.
                            </p>
                        </div>

                    </div>

                    {/* Action Footer */}
                    <div className="p-6 border-t border-white/10 bg-black/40">
                        <button
                            onClick={startAnalysis}
                            disabled={!canAnalyze}
                            className={cn(
                                "w-full py-4 px-6 rounded-lg font-bold tracking-wider flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group",
                                canAnalyze
                                    ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
                                    : "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"
                            )}
                        >
                            {canAnalyze && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            )}
                            <PlayCircle className={cn("w-5 h-5", canAnalyze && "animate-pulse")} />
                            <span>INITIATE SCAN</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Area (Real Map) */}
                <main className="flex-1 relative bg-[#050505] overflow-hidden">
                    <MapView onPolygonComplete={() => { }} />
                </main>
            </div>
        </div>
    );
}
