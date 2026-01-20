"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Header } from "@/components/Header";
import { User, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { AddPatientModal } from "@/components/AddPatientModal";

interface Patient {
    id: string;
    name: string;
    diagnosis: string;
    email: string;
    updatedAt: string;
}

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const { data } = await api.get('/patients');
            setPatients(data);
        } catch (error) {
            console.error(error);
            // In a real app we'd handle auth redirect here if 401
        } finally {
            setLoading(false);
        }
    };

    const handleAddPatient = (newPatient: Patient) => {
        setPatients(prev => [newPatient, ...prev]);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this patient?')) return;

        try {
            await api.delete(`/patients/${id}`);
            setPatients(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Failed to delete patient:', error);
            alert('Failed to delete patient');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
                        <p className="text-gray-500 mt-1">Manage your patient list</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-brand hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        Add Patient
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search patients..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all text-sm"
                            />
                        </div>
                        {/* Filters could go here */}
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-400">Loading patients...</div>
                    ) : patients.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No patients found. Create one to get started.
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Diagnosis</th>
                                    <th className="px-6 py-4">Last Active</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {patients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-brand-light text-brand flex items-center justify-center font-semibold">
                                                    {patient.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{patient.name}</div>
                                                    <div className="text-xs text-gray-500">{patient.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                {patient.diagnosis || 'No Diagnosis'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(patient.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/patients/${patient.id}`} className="text-brand hover:text-emerald-700 text-sm font-medium transition-colors">
                                                    View Details
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(patient.id)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Delete Patient"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            <AddPatientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleAddPatient}
            />
        </div>
    );
}
