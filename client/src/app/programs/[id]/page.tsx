"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Header } from "@/components/Header";
import { Loader2, Download, ExternalLink, Calendar, User, Mail, Edit } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import for PDFDownloadLink to avoid SSR issues with @react-pdf/renderer
const PDFDownloadLink = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
    {
        ssr: false,
        loading: () => <span className="text-sm text-gray-400">Loading PDF...</span>,
    }
);

import Link from "next/link";

// We will create this component next
import { ProgramPDF } from "@/components/ProgramPDF";

interface Program {
    id: string;
    title: string;
    status: string;
    updatedAt: string;
    shareToken: string;
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

export default function ProgramDetailPage() {
    const params = useParams();
    const [program, setProgram] = useState<Program | null>(null);
    const [loading, setLoading] = useState(true);
    const [sendingEmail, setSendingEmail] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchProgram(params.id as string);
        }
    }, [params.id]);

    const fetchProgram = async (id: string) => {
        try {
            const { data } = await api.get(`/programs/${id}`);
            setProgram(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin text-gray-400" size={32} />
                </div>
            </div>
        );
    }

    if (!program) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    Program not found.
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-12">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold text-gray-900">{program.title}</h1>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${program.status === 'SENT'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-yellow-50 text-yellow-700'
                                }`}>
                                {program.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <User size={16} />
                                {program.patient.name}
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar size={16} />
                                {new Date(program.updatedAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={`/programs/${program.id}/edit`}
                            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                        >
                            <Edit size={18} />
                            Edit
                        </Link>
                        <button
                            onClick={async () => {
                                if (!confirm(`Send email to ${program.patient.name} (${program.patient.email})?`)) return;
                                setSendingEmail(true);
                                try {
                                    await api.post(`/programs/${program.id}/email`);
                                    alert("Email sent successfully!");
                                    fetchProgram(program.id); // Refresh to see status update
                                } catch (error) {
                                    console.error(error);
                                    alert("Failed to send email");
                                } finally {
                                    setSendingEmail(false);
                                }
                            }}
                            disabled={sendingEmail}
                            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
                        >
                            {sendingEmail ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                            {program.status === 'SENT' ? 'Resend Email' : 'Send Email'}
                        </button>
                        <button
                            onClick={() => {
                                const url = `${window.location.origin}/p/${program.shareToken}`;
                                navigator.clipboard.writeText(url);
                                alert("Link copied to clipboard!");
                            }}
                            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                        >
                            <ExternalLink size={18} />
                            Copy Link
                        </button>
                        <PDFDownloadLink
                            document={<ProgramPDF program={program} />}
                            fileName={`${program.title.replace(/\s+/g, '_')}.pdf`}
                            className="flex items-center gap-2 bg-brand hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                        >
                            {/* @ts-ignore - render prop signature mismatch typically ignored */}
                            {({ blob, url, loading, error }: any) =>
                                loading ? 'Generating PDF...' : (
                                    <>
                                        <Download size={18} />
                                        Download PDF
                                    </>
                                )
                            }
                        </PDFDownloadLink>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Program Exercises</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {program.exercises.map((exercise, index) => (
                                <div key={exercise.id} className="p-6 flex flex-col md:flex-row gap-6">
                                    <div className="w-full md:w-48 aspect-video bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={exercise.imageUrl || "https://placehold.co/400x300?text=No+Preview"}
                                            alt={exercise.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {index + 1}. {exercise.title}
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="text-xs text-gray-500 uppercase">Sets</div>
                                                <div className="font-medium text-gray-900">{exercise.sets || '-'}</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="text-xs text-gray-500 uppercase">Reps</div>
                                                <div className="font-medium text-gray-900">{exercise.reps || '-'}</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="text-xs text-gray-500 uppercase">Frequency</div>
                                                <div className="font-medium text-gray-900">{exercise.frequency || '-'}</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="text-xs text-gray-500 uppercase">Weight</div>
                                                <div className="font-medium text-gray-900">{exercise.weight || '-'}</div>
                                            </div>
                                        </div>
                                        {exercise.notes && (
                                            <div className="text-sm text-gray-600 italic bg-yellow-50/50 p-3 rounded border border-yellow-100">
                                                Note: {exercise.notes}
                                            </div>
                                        )}
                                        {exercise.description && (
                                            <div className="mt-4 text-sm text-gray-500">
                                                {exercise.description}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
