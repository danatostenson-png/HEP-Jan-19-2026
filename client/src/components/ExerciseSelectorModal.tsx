import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Search, X, Loader2, Plus, Star } from "lucide-react";

interface Exercise {
    id: string;
    title: string;
    imageUrl: string;
    bodyPart: string;
    description: string;
    isFavorite: boolean;
}

interface ExerciseSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (exercise: Exercise) => void;
}

export function ExerciseSelectorModal({ isOpen, onClose, onSelect }: ExerciseSelectorModalProps) {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchExercises();
        }
    }, [isOpen]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isOpen) fetchExercises();
        }, 500);
        return () => clearTimeout(timer);
    }, [query]);

    const fetchExercises = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/exercises', {
                params: { query }
            });

            // Sort: Favorites first logic for modal too
            data.sort((a: Exercise, b: Exercise) => {
                if (a.isFavorite === b.isFavorite) return 0;
                return a.isFavorite ? -1 : 1;
            });

            setExercises(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Select Exercise</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search exercises..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all text-sm"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-gray-400" />
                        </div>
                    ) : exercises.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No exercises found.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {exercises.map((exercise) => (
                                <div key={exercise.id} className="group border border-gray-200 rounded-lg overflow-hidden hover:border-brand hover:shadow-sm transition-all flex flex-col relative">
                                    <div className="aspect-video bg-gray-100 relative">
                                        <img
                                            src={exercise.imageUrl || "https://placehold.co/600x400?text=No+Image"}
                                            alt={exercise.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                                            {exercise.bodyPart}
                                        </div>
                                        {exercise.isFavorite && (
                                            <div className="absolute top-2 left-2 p-1 bg-white/90 rounded-full shadow-sm">
                                                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 flex-1 flex flex-col">
                                        <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">{exercise.title}</h3>
                                        <button
                                            onClick={() => onSelect(exercise)}
                                            className="mt-auto w-full flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-brand hover:text-white text-gray-600 border border-gray-200 hover:border-transparent text-xs font-medium py-1.5 rounded transition-all"
                                        >
                                            <Plus size={14} />
                                            Add
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
