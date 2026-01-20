"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { ProgramForm } from "@/components/ProgramForm";
import api from "@/lib/api";

export default function NewProgramPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewProgramContent />
        </Suspense>
    );
}

function NewProgramContent() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await api.post('/programs', {
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
            router.push('/programs');
        } catch (error) {
            console.error("Failed to save program", error);
            alert("Failed to save program. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ProgramForm
            mode="create"
            onSubmit={handleSubmit}
            isSubmitting={isSaving}
        />
    );
}
