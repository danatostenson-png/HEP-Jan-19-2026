import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, Dumbbell, Image } from 'lucide-react';
import api from '@/lib/api';

interface CreateExerciseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newExercise: any) => void;
}

interface CustomExerciseForm {
    title: string;
    description: string;
    bodyPart: string;
    imageUrl: string;
}

const BODY_PARTS = ["Legs", "Shoulder", "Core", "Back", "Chest", "Arm", "Hip"];

export function CreateExerciseModal({ isOpen, onClose, onSuccess }: CreateExerciseModalProps) {
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<CustomExerciseForm>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [nameAnchorUsed, setNameAnchorUsed] = useState(false);
    const [analysisSource, setAnalysisSource] = useState('manual');

    if (!isOpen) return null;

    // Trigger analysis
    const triggerAnalysis = async (file: File | null, titleVal: string) => {
        if (!file || !titleVal || titleVal.length < 3) return;

        setIsAnalyzing(true);
        setNameAnchorUsed(false);
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('anchorName', titleVal);

            const { data } = await api.post('/exercises/analyze-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.description) {
                setValue('description', data.description);
                if (data.nameAnchorUsed) {
                    setNameAnchorUsed(true);
                }
                setAnalysisSource(data.analysisSource || 'photo');
            }
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setValue('imageUrl', 'upload');

            // Trigger analysis if title exists
            const currentTitle = document.querySelector<HTMLInputElement>('input[name="title"]')?.value;
            if (currentTitle) {
                triggerAnalysis(file, currentTitle);
            }
        }
    };

    const handleTitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (imageFile) {
            triggerAnalysis(imageFile, e.target.value);
        }
    };

    const onSubmit = async (data: CustomExerciseForm) => {
        setIsLoading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('bodyPart', data.bodyPart);
            formData.append('description', data.description);
            formData.append('nameAnchorUsed', String(nameAnchorUsed));
            formData.append('analysisSource', analysisSource);

            if (imageFile) {
                formData.append('image', imageFile);
            } else if (data.imageUrl && data.imageUrl !== 'upload') {
                formData.append('imageUrl', data.imageUrl);
            }

            const response = await api.post('/exercises', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            reset();
            setImageFile(null);
            setPreviewUrl('');
            onSuccess(response.data);
            onClose();
        } catch (err: any) {
            console.error(err);
            setError('Failed to create exercise. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Dumbbell className="text-brand" size={24} />
                        Add Custom Exercise
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Exercise Title
                        </label>
                        <input
                            {...register('title', { required: 'Title is required' })}
                            onBlur={handleTitleBlur}
                            type="text"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Wall Squat"
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Body Part
                            </label>
                            <select
                                {...register('bodyPart', { required: 'Body part is required' })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all bg-white"
                            >
                                <option value="">Select...</option>
                                {BODY_PARTS.map(part => (
                                    <option key={part} value={part}>{part}</option>
                                ))}
                            </select>
                            {errors.bodyPart && (
                                <p className="mt-1 text-sm text-red-600">{errors.bodyPart.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Image</label>

                            <div className="flex flex-col gap-4">
                                {previewUrl ? (
                                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPreviewUrl('');
                                                setImageFile(null);
                                                setValue('imageUrl', '');
                                            }}
                                            className="absolute top-2 right-2 bg-white/90 p-1 rounded-full shadow-sm hover:bg-white text-gray-500"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('file-upload')?.click()}
                                            className="flex-1 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-brand hover:bg-brand/5 transition-colors"
                                        >
                                            <Image size={24} className="mb-2" />
                                            <span className="text-sm">Click to upload photo</span>
                                        </button>
                                        <input
                                            type="file"
                                            id="file-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                )}

                                <div className="text-center text-xs text-gray-400 font-medium">OR</div>

                                <input
                                    {...register("imageUrl")}
                                    type="text"
                                    placeholder="Paste image URL (optional)"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Instructions / Description
                            </label>
                            {isAnalyzing && (
                                <span className="text-xs text-brand flex items-center gap-1 animate-pulse">
                                    <Loader2 size={12} className="animate-spin" />
                                    Generating description...
                                </span>
                            )}
                            {!isAnalyzing && nameAnchorUsed && (
                                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full flex items-center gap-1 border border-indigo-100">
                                    ✨ Name anchor applied
                                </span>
                            )}
                        </div>
                        <textarea
                            {...register('description')}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Describe how to perform the exercise..."
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-emerald-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading && <Loader2 size={16} className="animate-spin" />}
                            Create Exercise
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
