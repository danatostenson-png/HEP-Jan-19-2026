"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Header } from "@/components/Header";
import { ArrowLeft, Save, Loader2, Plus, FileText, Calendar, Clock } from "lucide-react";
import Link from "next/link";

interface Program {
    id: string;
    title: string | null;
    status: string;
    updatedAt: string;
    createdAt: string;
}

interface Patient {
    id: string;
    name: string;
    email: string | null;
    diagnosis: string | null;
    notes: string | null;
    updatedAt: string;
    programs: Program[];
}

export default function PatientProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        diagnosis: "",
        notes: ""
    });

    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchPatient(params.id as string);
        }
    }, [params.id]);

    const fetchPatient = async (id: string) => {
        try {
            const { data } = await api.get(`/patients/${id}`);
            setPatient(data);
            setFormData({
                name: data.name,
                email: data.email || "",
                diagnosis: data.diagnosis || "",
                notes: data.notes || ""
            });
        } catch (error) {
            console.error(error);
            alert("Failed to load patient");
            router.push('/patients');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!patient) return;
        setIsSaving(true);
        try {
            const { data } = await api.put(`/patients/${patient.id}`, formData);
            setPatient({ ...patient, ...data }); // Update local state mostly for timestamp if returned
            setHasChanges(false);
            alert("Patient details updated successfully.");
        } catch (error) {
            console.error(error);
            alert("Failed to update patient.");
        } finally {
            setIsSaving(false);
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

    if (!patient) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-12">

                {/* Top Nav / Actions */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/patients" className="text-gray-400 hover:text-gray-600 transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{formData.name || 'Patient Profile'}</h1>
                            <p className="text-sm text-gray-500">Last active: {new Date(patient.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !hasChanges}
                            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Save Changes
                        </button>
                        <Link
                            href={`/programs/new?patientId=${patient.id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <Plus size={18} />
                            New Program
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details & Notes */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Personal Info Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-brand focus:border-brand text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-brand focus:border-brand text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Diagnosis / Condition</label>
                                    <input
                                        type="text"
                                        value={formData.diagnosis}
                                        onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-brand focus:border-brand text-sm"
                                        placeholder="e.g. ACL Rehab"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notes Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText size={18} className="text-gray-400" />
                                Clinical Notes
                            </h2>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                className="w-full h-64 p-3 border border-gray-200 rounded-lg focus:ring-brand focus:border-brand text-sm resize-none"
                                placeholder="Add private clinical notes here..."
                            />
                        </div>
                    </div>

                    {/* Right Column: Program History */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Program History</h2>
                                <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                    {patient.programs.length} Programs
                                </span>
                            </div>

                            {patient.programs.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    No programs prescribed yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {patient.programs.map((program) => (
                                        <Link
                                            key={program.id}
                                            href={`/programs/${program.id}`}
                                            className="block p-4 hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${program.status === 'SENT' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'
                                                        }`}>
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand transition-colors">
                                                            {program.title || 'Untitled Program'}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${program.status === 'SENT' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                {program.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6 text-sm text-gray-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={14} />
                                                        <span>{new Date(program.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="hidden sm:flex items-center gap-1.5">
                                                        <Clock size={14} />
                                                        <span>Updated {new Date(program.updatedAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
