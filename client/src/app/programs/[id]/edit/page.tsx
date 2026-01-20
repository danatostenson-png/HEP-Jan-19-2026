"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProgramForm, ProgramExercise } from "@/components/ProgramForm";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/Header";

// Helper to generate IDs for imported data
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function EditProgramPage() {
    const params = useParams();
    const router = useRouter();
    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchProgram(params.id as string);
        }
    }, [params.id]);

    const fetchProgram = async (id: string) => {
        try {
            const { data } = await api.get(`/programs/${id}`);
            // Transform data to match ProgramForm format
            setInitialData({
                title: data.title,
                patientId: data.patientId,
                status: data.status,
                exercises: data.exercises.map((ex: any) => ({
                    tempId: generateId(),
                    exerciseId: ex.exerciseId,
                    title: ex.title,
                    imageUrl: ex.imageUrl,
                    description: ex.description,
                    sets: ex.sets,
                    reps: ex.reps,
                    frequency: ex.frequency,
                    weight: ex.weight,
                    notes: ex.notes
                }))
            });
        } catch (error) {
            console.error(error);
            alert("Failed to load program");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data: any) => {
        setIsSaving(true);
        try {
            await api.put(`/programs/${params.id}`, {
                ...data,
                exercises: data.exercises.map((ex: any, index: number) => ({
                    exerciseId: ex.exerciseId,
                    title: ex.title,
                    imageUrl: ex.imageUrl,
                    description: ex.description,
                    sets: ex.sets,
                    reps: ex.reps,
                    frequency: ex.frequency,
                    weight: ex.weight,
                    notes: ex.notes,
                    order: index
                }))
            });
            router.push(`/programs/${params.id}`);
        } catch (error) {
            console.error("Failed to update program", error);
            alert("Failed to update program. Please try again.");
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

    if (!initialData) {
        return <div className="p-8">Program not found</div>;
    }

    return (
        <ProgramForm
            mode="edit"
            initialData={initialData}
            onSubmit={handleSubmit}
            isSubmitting={isSaving}
        />
    );
}
