"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Header } from "@/components/Header";
import { Plus, Search, Calendar, User as UserIcon, FileText } from "lucide-react";
import Link from "next/link";

interface Program {
    id: string;
    title: string;
    status: string;
    updatedAt: string;
    patient: {
        name: string;
    };
    _count: {
        exercises: number;
    };
}

export default function ProgramsPage() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            const { data } = await api.get('/programs');
            setPrograms(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Programs</h1>
                        <p className="text-gray-500 mt-1">Manage and assign exercise programs</p>
                    </div>
                    <Link href="/programs/new" className="flex items-center gap-2 bg-brand hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                        <Plus size={18} />
                        New Program
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search programs..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-400">Loading programs...</div>
                    ) : programs.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No programs found. Create one to get started.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {programs.map((program) => (
                                <Link
                                    href={`/programs/${program.id}`}
                                    key={program.id}
                                    className="block bg-white rounded-xl border border-gray-200 hover:border-brand hover:shadow-md transition-all group"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                <FileText size={20} />
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${program.status === 'SENT'
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'bg-yellow-50 text-yellow-700'
                                                }`}>
                                                {program.status}
                                            </span>
                                        </div>

                                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-brand transition-colors">
                                            {program.title}
                                        </h3>

                                        <div className="space-y-2 text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <UserIcon size={16} />
                                                <span>{program.patient.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} />
                                                <span>{new Date(program.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400 font-medium">
                                                {program._count.exercises} Exercises
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
