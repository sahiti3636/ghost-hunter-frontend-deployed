"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Mail, Send, X, ShieldCheck, FileText, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ReportModal({ isOpen, onClose }: ReportModalProps) {
    const [email, setEmail] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSend = () => {
        setSending(true);
        setTimeout(() => {
            setSending(false);
            setSent(true);
            setTimeout(() => {
                onClose();
                setSent(false); // Reset for next time
                setEmail("");
            }, 1500);
        }, 1500);
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0a0a0a] border border-cyan-500/30 text-white rounded-xl shadow-2xl z-50 p-0 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-cyan-900/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/20 rounded-lg">
                                <Send className="w-5 h-5 text-cyan-400" />
                            </div>
                            <Dialog.Title className="text-lg font-bold tracking-wide">
                                SEND ANALYSIS REPORT
                            </Dialog.Title>
                        </div>
                        <Dialog.Close asChild>
                            <button className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    <div className="p-6 space-y-6">
                        {!sent ? (
                            <>
                                <p className="text-sm text-gray-400 font-mono border-l-2 border-cyan-500 pl-3">
                                    // ENCRYPTING SIGNAL DATA FOR SECURE TRANSMISSION
                                </p>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">Recipient Identity</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="ENTER_AGENT_ID_OR_EMAIL..."
                                                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500 font-mono placeholder:text-gray-600"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-wider">
                                            <span>Data Packets</span>
                                            <span>...</span>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="flex items-center gap-3 p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 cursor-pointer hover:bg-cyan-500/10 transition-colors">
                                                <div className="w-4 h-4 rounded bg-cyan-500 flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-black font-bold" />
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-200">
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                    Include Sector/Region Summary
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors group">
                                                <div className="w-4 h-4 rounded border border-gray-600 group-hover:border-gray-400" />
                                                <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-300">
                                                    <ShieldCheck className="w-4 h-4" />
                                                    Attach Identified Vessel Manifest
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors group">
                                                <div className="w-4 h-4 rounded border border-gray-600 group-hover:border-gray-400" />
                                                <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-300">
                                                    <BrainCircuit className="w-4 h-4" />
                                                    Append AI Anomaly Explanations
                                                </div>
                                                <span className="ml-auto text-[10px] bg-cyan-900 text-cyan-200 px-1.5 py-0.5 rounded">BETA</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-xs font-bold tracking-wider text-gray-400 hover:text-white transition-colors uppercase"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        onClick={handleSend}
                                        disabled={!email || sending}
                                        className={cn(
                                            "bg-cyan-500 text-black px-6 py-2 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition-all hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed",
                                            sending && "animate-pulse"
                                        )}
                                    >
                                        {sending ? "Transmitting..." : "Transmit Data"}
                                        {!sending && <Send className="w-3 h-3" />}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                                    <Check className="w-8 h-8 text-green-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Transmission Complete</h3>
                                <p className="text-gray-400 text-sm max-w-xs">Secure report package has been sent to {email}.</p>
                            </div>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

function Check({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}
