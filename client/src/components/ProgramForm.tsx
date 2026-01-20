"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { PatientSelector } from "@/components/PatientSelector";
import { ExerciseSelectorModal } from "@/components/ExerciseSelectorModal";
import { ProgramExerciseCard } from "@/components/ProgramExerciseCard";
import { ExpressImportModal } from "@/components/ExpressImportModal";
import { Plus, Save, Loader2, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// Simple ID generator since we might not have uuid
const generateId = () => Math.random().toString(36).substr(2, 9);

export interface ProgramExercise {
    tempId: string;
    exerciseId: string;
    title: string;
    imageUrl: string;
    description: string;
    sets: string;
    reps: string;
    frequency: string;
    weight: string;
    notes: string;
}

interface ProgramFormProps {
    initialData?: {
        title: string;
        patientId: string;
        status: string;
        exercises: ProgramExercise[];
    };
    onSubmit: (data: any) => Promise<void>;
    isSubmitting: boolean;
    mode: 'create' | 'edit';
}

export function ProgramForm({ initialData, onSubmit, isSubmitting, mode }: ProgramFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlPatientId = searchParams.get('patientId');

    const [title, setTitle] = useState("New Program");
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [exercises, setExercises] = useState<ProgramExercise[]>([]);

    const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
    const [isExpressImportOpen, setIsExpressImportOpen] = useState(false);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setSelectedPatientId(initialData.patientId);
            setExercises(initialData.exercises);
        } else if (urlPatientId) {
            setSelectedPatientId(urlPatientId);
        }
    }, [initialData, urlPatientId]);

    const handleAddExercise = (exercise: any) => {
        const newExercise: ProgramExercise = {
            tempId: generateId(),
            exerciseId: exercise.id,
            title: exercise.title,
            imageUrl: exercise.imageUrl || "",
            description: exercise.description || "",
            sets: "",
            reps: "",
            frequency: "",
            weight: "",
            notes: ""
        };
        setExercises([...exercises, newExercise]);
        setIsExerciseModalOpen(false);
    };

    const handleExpressImport = (importedExercises: any[]) => {
        const newExercises: ProgramExercise[] = importedExercises.map(ex => ({
            tempId: generateId(),
            exerciseId: ex.id || "manual-" + generateId(),
            title: ex.title,
            imageUrl: ex.imageUrl || "",
            description: ex.description || "",
            sets: ex.sets || "",
            reps: ex.reps || "",
            frequency: ex.frequency || "",
            weight: ex.weight || "",
            notes: ex.notes || ""
        }));
        setExercises([...exercises, ...newExercises]);
    };

    const handleExerciseChange = (tempId: string, field: string, value: string) => {
        setExercises(exercises.map(ex =>
            ex.tempId === tempId ? { ...ex, [field]: value } : ex
        ));
    };

    const handleRemoveExercise = (tempId: string) => {
        setExercises(exercises.filter(ex => ex.tempId !== tempId));
    };

    const handleSubmit = (status: 'DRAFT' | 'SENT') => {
        if (!selectedPatientId) {
            alert("Please select a patient.");
            return;
        }
        if (exercises.length === 0) {
            alert("Please add at least one exercise.");
            return;
        }

        onSubmit({
            title,
            patientId: selectedPatientId,
            status,
            exercises
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-12">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/programs" className="text-gray-400 hover:text-gray-600 transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-3xl font-bold text-gray-900 bg-transparent border-none focus:ring-0 p-0 placeholder-gray-300 w-full max-w-md"
                            placeholder="Program Title"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleSubmit('DRAFT')}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            Save Draft
                        </button>
                        <button
                            onClick={() => handleSubmit('SENT')}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-4 py-2 text-white bg-brand hover:bg-emerald-600 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {mode === 'edit' ? 'Update & Assign' : 'Save & Assign'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar: Settings */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Program Details</h2>
                            <PatientSelector
                                selectedPatientId={selectedPatientId}
                                onSelect={setSelectedPatientId}
                            />
                        </div>
                    </div>

                    {/* Right Main: Exercises */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[500px] flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">Exercises ({exercises.length})</h2>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsExpressImportOpen(true)}
                                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        <FileText size={16} />
                                        Import from Text
                                    </button>
                                    <button
                                        onClick={() => setIsExerciseModalOpen(true)}
                                        className="flex items-center gap-2 text-sm font-medium text-brand hover:text-emerald-700 transition-colors"
                                    >
                                        <Plus size={16} />
                                        Add Exercise
                                    </button>
                                </div>
                            </div>

                            {exercises.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg m-4">
                                    <p className="mb-2">No exercises added yet.</p>
                                    <button
                                        onClick={() => setIsExerciseModalOpen(true)}
                                        className="text-brand font-medium hover:underline"
                                    >
                                        Browse Library
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {exercises.map((exercise, index) => (
                                        <ProgramExerciseCard
                                            key={exercise.tempId}
                                            index={index}
                                            exercise={exercise}
                                            onChange={handleExerciseChange}
                                            onRemove={handleRemoveExercise}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <ExerciseSelectorModal
                    isOpen={isExerciseModalOpen}
                    onClose={() => setIsExerciseModalOpen(false)}
                    onSelect={handleAddExercise}
                />

                <ExpressImportModal
                    isOpen={isExpressImportOpen}
                    onClose={() => setIsExpressImportOpen(false)}
                    onImport={handleExpressImport}
                />
            </main>
        </div>
    );
}
