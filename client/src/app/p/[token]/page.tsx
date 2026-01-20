"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import dynamic from "next/dynamic";
import { ProgramPDF } from "@/components/ProgramPDF";

// Dynamic import for PDFDownloadLink
const PDFDownloadLink = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
    { ssr: false, loading: () => <span className="text-xs">Loading PDF...</span> }
);

interface Program {
    id: string;
    title: string;
    status: string;
    updatedAt: string;
    user: {
        name: string;
        clinicName: string;
        logoUrl: string;
    };
    patient: {
        name: string;
        email: string;
    };
    exercises: {
        id: string;
        title: string;
        description: string;
        imageUrl: string;
        sets: string;
        reps: string;
        frequency: string;
        weight: string;
        notes: string;
    }[];
}

export default function PublicProgramPage() {
    const params = useParams();
    const [program, setProgram] = useState<Program | null>(null);
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (params.token) {
            fetchProgram(params.token as string);
        }
    }, [params.token]);

    const fetchProgram = async (token: string) => {
        try {
            // Use direct axios fetch or create a publicApi instance if auth header is issue
            // For now assuming api instance handles 401 gracefully or we modify it.
            // Actually, our api instance attaches token if present. If public, valid to send token but backend ignores key.
            // But if user not logged in, no token.
            const response = await fetch(`http://localhost:3002/api/public/programs/${token}`);
            if (!response.ok) throw new Error('Failed');
            const data = await response.json();
            setProgram(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleComplete = (id: string) => {
        setCompleted(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    if (!program) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
                Program not found or link expired.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Mobile-friendly Header */}
            <header className="bg-white border-b border-gray-100 p-4 sticky top-0 z-10 shadow-sm">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-gray-900 leading-tight">{program.title}</h1>
                        <p className="text-xs text-gray-500">{program.user.clinicName || program.user.name}</p>
                    </div>
                    {/* PDF Download for Patient */}
                    <PDFDownloadLink
                        document={<ProgramPDF program={program} />}
                        fileName="My_Exercise_Program.pdf"
                        className="text-xs font-medium text-brand bg-brand-light px-3 py-1.5 rounded-full"
                    >
                        {/* @ts-ignore */}
                        {({ loading }: any) => loading ? '...' : 'PDF'}
                    </PDFDownloadLink>
                </div>
            </header>

            <main className="max-w-md mx-auto p-4 space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 mb-6">
                    <p>Hi <strong>{program.patient.name}</strong>, here are your exercises for today.</p>
                </div>

                {program.exercises.map((exercise, index) => (
                    <div
                        key={exercise.id}
                        onClick={() => toggleComplete(exercise.id)}
                        className={`bg-white rounded-xl overflow-hidden shadow-sm border transition-all cursor-pointer ${completed[exercise.id] ? 'border-brand ring-1 ring-brand bg-emerald-50/30' : 'border-gray-100'
                            }`}
                    >
                        <div className="relative aspect-video bg-gray-100">
                            <img
                                src={exercise.imageUrl || "https://placehold.co/400x300?text=No+Preview"}
                                alt={exercise.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 right-3">
                                {completed[exercise.id] ? (
                                    <div className="bg-brand text-white p-1 rounded-full shadow-lg">
                                        <CheckCircle2 size={24} className="fill-brand text-white" />
                                    </div>
                                ) : (
                                    <div className="bg-black/20 backdrop-blur-sm text-white p-1 rounded-full">
                                        <Circle size={24} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className={`font-bold text-lg mb-2 ${completed[exercise.id] ? 'text-brand' : 'text-gray-900'}`}>
                                {exercise.title}
                            </h3>

                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="bg-gray-50 p-2 rounded text-center">
                                    <div className="text-[10px] text-gray-500 uppercase">Sets</div>
                                    <div className="font-semibold text-gray-900 text-sm">{exercise.sets || '-'}</div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded text-center">
                                    <div className="text-[10px] text-gray-500 uppercase">Reps</div>
                                    <div className="font-semibold text-gray-900 text-sm">{exercise.reps || '-'}</div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded text-center">
                                    <div className="text-[10px] text-gray-500 uppercase">Freq</div>
                                    <div className="font-semibold text-gray-900 text-sm">{exercise.frequency || '-'}</div>
                                </div>
                            </div>

                            {exercise.notes && (
                                <div className="text-sm text-gray-600 italic bg-yellow-50 p-2 rounded border border-yellow-100 mb-2">
                                    {exercise.notes}
                                </div>
                            )}

                            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center uppercase tracking-wider font-medium">
                                {completed[exercise.id] ? 'Completed' : 'Tap to Complete'}
                            </div>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
}
