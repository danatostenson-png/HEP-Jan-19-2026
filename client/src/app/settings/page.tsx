"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import { Header } from "@/components/Header";
import { Building2, User, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    clinicName: string | null;
    logoUrl: string | null;
}

interface ProfileFormData {
    name: string;
    clinicName: string;
    logoUrl: string;
}

export default function SettingsPage() {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormData>();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [successMessage, setSuccessMessage] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/users/me');
            setValue("name", data.name || "");
            setValue("clinicName", data.clinicName || "");
            setValue("logoUrl", data.logoUrl || "");
        } catch (error) {
            console.error("Failed to fetch profile", error);
            // If unauthorized, redirect to login
        } finally {
            setIsFetching(false);
        }
    };

    const onSubmit = async (data: ProfileFormData) => {
        setIsLoading(true);
        setSuccessMessage("");
        try {
            await api.put('/users/me', data);
            setSuccessMessage("Profile updated successfully");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-3xl mx-auto w-full px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your profile and clinic details</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                    </div>

                    {isFetching ? (
                        <div className="p-12 text-center text-gray-400">Loading profile...</div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                            {successMessage && (
                                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2">
                                    <Save size={18} />
                                    {successMessage}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                {...register("name", { required: "Name is required" })}
                                                type="text"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                                                placeholder="Dr. Jane Doe"
                                            />
                                        </div>
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Clinic Name
                                        </label>
                                        <div className="relative">
                                            <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                {...register("clinicName")}
                                                type="text"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                                                placeholder="Downtown Physio"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Clinic Logo URL
                                    </label>
                                    <input
                                        {...register("logoUrl")}
                                        type="url"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all mb-2"
                                        placeholder="https://..."
                                    />
                                    <p className="text-xs text-gray-500">
                                        Enter a URL for your clinic's logo image.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-end">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-6 py-2 text-white bg-brand hover:bg-emerald-600 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}
