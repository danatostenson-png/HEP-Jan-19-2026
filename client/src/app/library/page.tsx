"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Header } from "@/components/Header";
import { Search, Filter, Dumbbell, Star, Loader2 } from "lucide-react";
import { CreateExerciseModal } from "@/components/CreateExerciseModal";

interface Exercise {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    bodyPart: string;
    tags: string | null;
    isFavorite: boolean;
}

const BODY_PARTS = ["All", "Favorites", "Legs", "Shoulder", "Core", "Back", "Chest"];

export default function LibraryPage() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [selectedBodyPart, setSelectedBodyPart] = useState("All");

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchExercises();
        }, 500);
        return () => clearTimeout(timer);
    }, [query, selectedBodyPart]);

    const fetchExercises = async () => {
        setLoading(true);
        try {
            const params: any = { query };
            if (selectedBodyPart === 'Favorites') {
                params.favoritesOnly = 'true';
            } else if (selectedBodyPart !== 'All') {
                params.bodyPart = selectedBodyPart;
            }

            const { data } = await api.get('/exercises', { params });

            // Sort: Favorites first (if not in Favorites tab, where all are favorites)
            if (selectedBodyPart !== 'Favorites') {
                data.sort((a: Exercise, b: Exercise) => {
                    if (a.isFavorite === b.isFavorite) return 0;
                    return a.isFavorite ? -1 : 1;
                });
            }

            setExercises(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent card click if added later

        // Optimistic UI update
        const updatedExercises = exercises.map(ex =>
            ex.id === id ? { ...ex, isFavorite: !ex.isFavorite } : ex
        );

        // If sorting favorites first, resorting immediately might be jarring, 
        // so we just update status visually unless we want live resorting.
        // Let's keep it simple: update state.
        setExercises(updatedExercises);

        try {
            await api.post(`/exercises/${id}/favorite`);
        } catch (error) {
            // Revert on error
            console.error("Failed to toggle favorite");
            setExercises(exercises); // Revert to old state
        }
    };

    const handleCreateExercise = (newExercise: Exercise) => {
        setExercises(prev => [newExercise, ...prev]);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Exercise Library</h1>
                        <p className="text-gray-500 mt-1">Browse and search clinical exercises</p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Dumbbell size={18} />
                        Create Custom Exercise
                    </button>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name, tags..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2 text-sm overflow-x-auto pb-1 md:pb-0">
                        <Filter size={18} className="text-gray-400 mr-1" />
                        {BODY_PARTS.map((part) => (
                            <button
                                key={part}
                                onClick={() => setSelectedBodyPart(part)}
                                className={`px-4 py-2 rounded-full border transition-all whitespace-nowrap flex items-center gap-1.5 ${selectedBodyPart === part
                                    ? 'bg-brand text-white border-brand'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                {part === 'Favorites' && <Star size={14} className={selectedBodyPart === 'Favorites' ? "fill-white" : "fill-yellow-400 text-yellow-400"} />}
                                {part}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-gray-400" size={32} />
                    </div>
                ) : exercises.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        No exercises found. Try adjusting your search.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {exercises.map((exercise) => (
                            <div key={exercise.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col relative">
                                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                    {/* In a real app, use Next.js Image component */}
                                    <img
                                        src={exercise.imageUrl || "https://placehold.co/600x400?text=No+Image"}
                                        alt={exercise.title}
                                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                        {exercise.bodyPart}
                                    </div>

                                    {/* Favorite Button */}
                                    <button
                                        onClick={(e) => toggleFavorite(e, exercise.id)}
                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white transition-all shadow-sm hover:scale-110 z-10"
                                        title={exercise.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                                    >
                                        <Star
                                            size={16}
                                            className={`${exercise.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                                        />
                                    </button>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-semibold text-gray-900 group-hover:text-brand transition-colors mb-1">{exercise.title}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-4">{exercise.description}</p>

                                    <div className="mt-auto pt-3 border-t border-gray-50 flex flex-wrap gap-1">
                                        {exercise.tags?.split(',').slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <CreateExerciseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleCreateExercise}
            />
        </div>
    );
}
