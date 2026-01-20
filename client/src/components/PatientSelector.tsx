"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Search, User, Plus } from "lucide-react";
import api from "@/lib/api";
import { CreatePatientModal } from "./CreatePatientModal";

interface Patient {
    id: string;
    name: string;
    email: string;
}

interface PatientSelectorProps {
    selectedPatientId: string | null;
    onSelect: (patientId: string) => void;
}

export function PatientSelector({ selectedPatientId, onSelect }: PatientSelectorProps) {
    const [open, setOpen] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        if (open && patients.length === 0) {
            fetchPatients();
        }
    }, [open]);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/patients');
            setPatients(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSuccess = (newPatientId: string) => {
        fetchPatients().then(() => {
            onSelect(newPatientId);
            setIsCreateModalOpen(false);
            setOpen(false);
        });
    };

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(query.toLowerCase())
    );

    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to Patient
            </label>

            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
                {selectedPatient ? (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-light text-brand flex items-center justify-center text-xs font-bold">
                            {selectedPatient.name.charAt(0)}
                        </div>
                        <span className="text-gray-900">{selectedPatient.name}</span>
                    </div>
                ) : (
                    <span className="text-gray-500">Select a patient...</span>
                )}
                <ChevronsUpDown size={16} className="text-gray-400" />
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-gray-100">
                            <div className="relative">
                                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-8 pr-2 py-1.5 text-sm bg-gray-50 rounded border-none focus:ring-0"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 p-1">
                            {loading ? (
                                <div className="p-2 text-center text-sm text-gray-400">Loading...</div>
                            ) : filteredPatients.length === 0 && query ? (
                                <div className="p-2 text-center text-sm text-gray-400">No patients found</div>
                            ) : (
                                filteredPatients.map((patient) => (
                                    <button
                                        key={patient.id}
                                        type="button"
                                        onClick={() => {
                                            onSelect(patient.id);
                                            setOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${selectedPatientId === patient.id
                                            ? 'bg-brand-light text-brand'
                                            : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                    >
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                                            {patient.name.charAt(0)}
                                        </div>
                                        <span>{patient.name}</span>
                                        {selectedPatientId === patient.id && (
                                            <Check size={14} className="ml-auto" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="p-1 border-t border-gray-100 bg-gray-50">
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-brand hover:bg-brand-light/50 rounded-md transition-colors"
                            >
                                <Plus size={14} />
                                Create New Patient
                            </button>
                        </div>
                    </div>
                </>
            )}

            <CreatePatientModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
}
