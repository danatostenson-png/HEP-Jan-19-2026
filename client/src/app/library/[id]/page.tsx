"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Header } from "@/components/Header";
import { ArrowLeft, Edit2, Trash2, Save, X, ImageIcon, PlayCircle, Loader2 } from "lucide-react";

export default function ExerciseDetailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ExerciseDetailContent />
        </Suspense>
    );
}

function ExerciseDetailContent() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [exercise, setExercise] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        bodyPart: "",
        videoUrl: ""
    });
    const [isSaving, setIsSaving] = useState(false);

    // Delete Modal
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchExercise();
    }, [id]);

    const fetchExercise = async () => {
        try {
            const { data } = await api.get(`/exercises/${id}`);
            setExercise(data);
            setEditForm({
                title: data.title,
                description: data.description || "",
                bodyPart: data.bodyPart || "",
                videoUrl: data.videoUrl || ""
            });
        } catch (err) {
            console.error(err);
            setError("Failed to load exercise.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data } = await api.put(`/exercises/${id}`, editForm);
            setExercise(data); // Update with new data (might be an override now)
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert("Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const { data } = await api.delete(`/exercises/${id}`);
            // Success - redirect to library
            router.push('/library');
        } catch (err) {
            console.error(err);
            alert("Failed to delete exercise.");
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        </div>
    );

    if (error || !exercise) return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <p>{error || "Exercise not found"}</p>
                <button
                    onClick={() => router.push('/library')}
                    className="mt-4 text-brand hover:underline"
                >
                    Back to Library
                </button>
            </div>
        </div>
    );

    const isCustom = exercise.isCustom;
    // Determine delete text based on type
    const deleteTitle = isCustom ? "Delete Custom Exercise?" : "Hide from Library?";
    const deleteMessage = isCustom
        ? "This will permanently delete this exercise. This action cannot be undone."
        : "This will remove this exercise from your personal library view. You can restore it later from settings (future feature).";

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-12">
                <button
                    onClick={() => router.push('/library')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8"
                >
                    <ArrowLeft size={20} />
                    Back to Library
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header Image area */}
                    <div className="h-64 md:h-80 bg-gray-100 relative group">
                        <img
                            src={exercise.imageUrl || "https://placehold.co/800x400?text=No+Image"}
                            alt={exercise.title}
                            className="w-full h-full object-cover"
                        />
                        {/* Overlay for image editing could go here */}
                    </div>

                    <div className="p-8">
                        {/* Toolbar */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                            <div className="flex-1">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        className="text-3xl font-bold text-gray-900 border-b border-gray-300 focus:border-brand outline-none pb-1 w-full bg-transparent"
                                        placeholder="Exercise Title"
                                    />
                                ) : (
                                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                        {exercise.title}
                                        {exercise.isOverridden && (
                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">Modified</span>
                                        )}
                                        {isCustom && (
                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">Custom</span>
                                        )}
                                    </h1>
                                )}

                                {isEditing ? (
                                    <div className="mt-2 flex gap-2">
                                        <input
                                            type="text"
                                            value={editForm.bodyPart}
                                            onChange={(e) => setEditForm({ ...editForm, bodyPart: e.target.value })}
                                            className="text-sm text-gray-600 border border-gray-200 rounded px-2 py-1"
                                            placeholder="Body Part"
                                        />
                                    </div>
                                ) : (
                                    <div className="mt-2 text-gray-500 text-sm font-medium">
                                        {exercise.bodyPart}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Cancel"
                                        >
                                            <X size={20} />
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors font-medium shadow-sm"
                                        >
                                            <Edit2 size={18} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="flex items-center gap-2 px-4 py-2 text-red-600 bg-white border border-red-100 hover:bg-red-50 rounded-lg transition-colors font-medium shadow-sm"
                                        >
                                            <Trash2 size={18} />
                                            {isCustom ? 'Delete' : 'Hide'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="prose max-w-none text-gray-600">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instructions</h3>
                            {isEditing ? (
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full h-40 border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
                                />
                            ) : (
                                <div className="whitespace-pre-line">
                                    {exercise.description}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{deleteTitle}</h2>
                        <p className="text-gray-500 mb-6">{deleteMessage}</p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium flex items-center gap-2"
                                disabled={isDeleting}
                            >
                                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                                {isCustom ? 'Delete Permanently' : 'Hide Exercise'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
