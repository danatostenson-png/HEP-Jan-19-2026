"use client";

import { X } from "lucide-react";

interface Exercise {
    exerciseId: string; // The ID of the exercise in the library
    title: string;
    imageUrl: string;
    // Dosage fields
    sets?: string;
    reps?: string;
    frequency?: string;
    weight?: string;
    notes?: string;
    tempId: string; // Unique ID for this instance in the list
}

interface ProgramExerciseCardProps {
    exercise: Exercise;
    index: number;
    onChange: (id: string, field: string, value: string) => void;
    onRemove: (id: string) => void;
}

export function ProgramExerciseCard({ exercise, index, onChange, onRemove }: ProgramExerciseCardProps) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative group transition-all hover:border-gray-300">
            <button
                onClick={() => onRemove(exercise.tempId)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all bg-white rounded-full shadow-sm border border-gray-100"
                title="Remove exercise"
            >
                <X size={16} />
            </button>

            <div className="flex gap-4 mb-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                        src={exercise.imageUrl || "https://placehold.co/100x100?text=No+Img"}
                        alt={exercise.title}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-900 text-white text-xs font-bold">
                            {index + 1}
                        </span>
                        <h3 className="font-semibold text-gray-900 truncate">{exercise.title}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Sets</label>
                    <input
                        type="text"
                        value={exercise.sets || ''}
                        onChange={(e) => onChange(exercise.tempId, 'sets', e.target.value)}
                        placeholder="e.g. 3"
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Reps / Time</label>
                    <input
                        type="text"
                        value={exercise.reps || ''}
                        onChange={(e) => onChange(exercise.tempId, 'reps', e.target.value)}
                        placeholder="e.g. 10"
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Frequency</label>
                    <input
                        type="text"
                        value={exercise.frequency || ''}
                        onChange={(e) => onChange(exercise.tempId, 'frequency', e.target.value)}
                        placeholder="e.g. 2x Daily"
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Weight / Resistance</label>
                    <input
                        type="text"
                        value={exercise.weight || ''}
                        onChange={(e) => onChange(exercise.tempId, 'weight', e.target.value)}
                        placeholder="e.g. 5lbs"
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                    />
                </div>
            </div>

            <div className="mt-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                <input
                    type="text"
                    value={exercise.notes || ''}
                    onChange={(e) => onChange(exercise.tempId, 'notes', e.target.value)}
                    placeholder="Special instructions..."
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                />
            </div>
        </div>
    );
}
