import React, { useState } from 'react';
import { X, ArrowRight, Check, AlertCircle, Loader2, Save } from 'lucide-react';
import api from '@/lib/api';

interface ExpressImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (exercises: any[]) => void;
}

interface ParsedExercise {
    id?: string; // If matched
    title: string;
    description?: string;
    imageUrl?: string;
    sets: string | null;
    reps: string | null;
    weight: string | null;
    frequency: string | null;
    notes: string | null;
    matchedExerciseId: string | null;
    isNewCustom: boolean;
    matchConfidence: number;
}

export function ExpressImportModal({ isOpen, onClose, onImport }: ExpressImportModalProps) {
    const [step, setStep] = useState<'INPUT' | 'REVIEW'>('INPUT');
    const [text, setText] = useState('');
    const [globalCadence, setGlobalCadence] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [parsedItems, setParsedItems] = useState<ParsedExercise[]>([]);

    if (!isOpen) return null;

    const handleAnalyze = async () => {
        if (!text.trim()) return;

        setIsAnalyzing(true);
        try {
            const res = await api.post('/exercises/express-import', {
                text,
                globalCadence
            });
            setParsedItems(res.data.exercises);
            setStep('REVIEW');
        } catch (error) {
            console.error("Import failed", error);
            alert("Failed to analyze text. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleItemChange = (index: number, field: keyof ParsedExercise, value: string) => {
        const newItems = [...parsedItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setParsedItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = parsedItems.filter((_, i) => i !== index);
        setParsedItems(newItems);
    };

    const handleConfirmImport = async () => {
        // Prepare valid program exercises
        // For new custom exercises, we might need to actually create them in the DB first?
        // OR we can just pass them as "Custom" to the UI and let the main save handler deal with it?
        // The Program Builder current logic expects `exerciseId`. 
        // If it's a new custom exercise, we should probably create it now so it has an ID, 
        // OR modify Program Builder to handle "pending" custom exercises.

        // Strategy: Create valid Exercise entities for the "New Custom" ones right now.
        // This ensures the rest of the app works standardly.

        const finalImportList = [];

        for (const item of parsedItems) {
            let exerciseId = item.matchedExerciseId;
            let title = item.title;
            let imageUrl = item.imageUrl;
            let description = item.description;

            if (item.isNewCustom && !exerciseId) {
                // Create custom exercise on the fly
                try {
                    const createRes = await api.post('/exercises', {
                        title: item.title,
                        description: `Imported from plan: ${item.notes || ''}`,
                        imageUrl: null, // No image for text import usually
                        bodyPart: 'Other',
                        parsedFromExpressImport: true,
                        globalCadenceApplied: !!item.frequency
                    });
                    exerciseId = createRes.data.id;
                    title = createRes.data.title;
                    imageUrl = createRes.data.imageUrl;
                    description = createRes.data.description;
                } catch (e) {
                    console.error("Failed to create custom exercise", e);
                    continue; // Skip failed ones?
                }
            }

            finalImportList.push({
                id: exerciseId,
                title,
                imageUrl,
                description,
                sets: item.sets || '',
                reps: item.reps || '',
                weight: item.weight || '',
                frequency: item.frequency || '',
                notes: item.notes || ''
            });
        }

        onImport(finalImportList);
        // Reset and close
        setStep('INPUT');
        setText('');
        setGlobalCadence('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {step === 'INPUT' ? 'Express Text Import' : 'Review & Import'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {step === 'INPUT'
                                ? 'Paste your workout plan below. We will parse it for you.'
                                : `Found ${parsedItems.length} exercises. Review details before importing.`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 'INPUT' ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Global Frequency (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={globalCadence}
                                        onChange={(e) => setGlobalCadence(e.target.value)}
                                        placeholder="e.g. 3x/week"
                                        className="w-full rounded-lg border-gray-300 focus:ring-brand focus:border-brand"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Applies to all exercises unless specified otherwise.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Paste Workout Plan
                                </label>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder={`Squats 3x10\nPushups 15 reps\nPlank 30s`}
                                    className="w-full h-64 p-4 rounded-xl border-gray-300 focus:ring-brand focus:border-brand font-mono text-sm leading-relaxed"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {parsedItems.map((item, index) => (
                                <div key={index} className={`p-4 rounded-xl border ${item.isNewCustom ? 'border-blue-100 bg-blue-50/30' : 'border-green-100 bg-green-50/30'} transition-all`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${item.isNewCustom ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                            {item.isNewCustom ? <AlertCircle size={14} /> : <Check size={14} />}
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                                            {/* Top Row: Title & badge */}
                                            <div className="md:col-span-12 flex items-center justify-between">
                                                <div className="flex items-center gap-2 w-full">
                                                    <input
                                                        type="text"
                                                        value={item.title}
                                                        onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                                                        className="font-semibold text-gray-900 bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-brand focus:ring-0 p-0 w-full"
                                                    />
                                                    {item.isNewCustom && (
                                                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                            New Custom
                                                        </span>
                                                    )}
                                                    {!item.isNewCustom && (
                                                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                            Library Match
                                                        </span>
                                                    )}
                                                </div>
                                                <button onClick={() => handleRemoveItem(index)} className="text-gray-400 hover:text-red-500">
                                                    <X size={16} />
                                                </button>
                                            </div>

                                            {/* Dosage Inputs */}
                                            <div className="md:col-span-2">
                                                <label className="text-xs text-gray-500 uppercase">Sets</label>
                                                <input
                                                    type="text"
                                                    value={item.sets || ''}
                                                    onChange={(e) => handleItemChange(index, 'sets', e.target.value)}
                                                    className="w-full mt-1 px-2 py-1 text-sm border-gray-200 rounded-md focus:border-brand focus:ring-brand"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-xs text-gray-500 uppercase">Reps</label>
                                                <input
                                                    type="text"
                                                    value={item.reps || ''}
                                                    onChange={(e) => handleItemChange(index, 'reps', e.target.value)}
                                                    className="w-full mt-1 px-2 py-1 text-sm border-gray-200 rounded-md focus:border-brand focus:ring-brand"
                                                />
                                            </div>
                                            <div className="md:col-span-3">
                                                <label className="text-xs text-gray-500 uppercase">Frequency</label>
                                                <input
                                                    type="text"
                                                    value={item.frequency || ''}
                                                    onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                                                    className="w-full mt-1 px-2 py-1 text-sm border-gray-200 rounded-md focus:border-brand focus:ring-brand"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-xs text-gray-500 uppercase">Weight</label>
                                                <input
                                                    type="text"
                                                    value={item.weight || ''}
                                                    onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                                                    className="w-full mt-1 px-2 py-1 text-sm border-gray-200 rounded-md focus:border-brand focus:ring-brand"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    {step === 'INPUT' ? (
                        <>
                            <div className="text-xs text-gray-400">
                                Tip: You can paste a full list like "Squats 3x10, Pushups 2x15"
                            </div>
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !text.trim()}
                                className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                                Analyze Text
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setStep('INPUT')}
                                className="text-gray-500 hover:text-gray-700 font-medium text-sm"
                            >
                                Back to Input
                            </button>
                            <button
                                onClick={handleConfirmImport}
                                className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                            >
                                <Save size={18} />
                                Import {parsedItems.length} Exercises
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
