"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { BarChart3 } from "lucide-react";

export default function Signup() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/signup', data);
            localStorage.setItem('token', response.data.token);
            router.push('/');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand mb-4">
                        <BarChart3 size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-500">Join ExerciseRx today</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            {...register("name", { required: true })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                            placeholder="Dr. John Doe"
                        />
                        {errors.name && <span className="text-xs text-red-500">Name is required</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                        <input
                            {...register("clinicName")}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                            placeholder="City Physio"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            {...register("email", { required: true })}
                            type="email"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                            placeholder="john@example.com"
                        />
                        {errors.email && <span className="text-xs text-red-500">Email is required</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            {...register("password", { required: true, minLength: 6 })}
                            type="password"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                        {errors.password && <span className="text-xs text-red-500">Password must be at least 6 chars</span>}
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-brand hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Creating...' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account? <Link href="/login" className="text-brand font-medium hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
}
