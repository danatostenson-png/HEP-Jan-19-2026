"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ActionCard } from "@/components/ActionCard";
import { Keyboard, Layers, BarChart3, Users, FileText, Send, UserPlus } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Try to fetch user profile to confirm login
      const { data: userData } = await api.get('/users/me');
      setUser(userData);

      // If logged in, fetch stats
      const { data: statsData } = await api.get('/dashboard/stats');
      setStats(statsData);
    } catch (error) {
      // Not logged in or error, perfectly fine for landing page
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-12 flex flex-col">
        {user ? (
          // DASHBOARD VEW
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, <span className="text-brand">{user.name.split(' ')[0]}</span>
              </h1>
              <p className="text-gray-500 mt-1">Here's what's happening in your clinic today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                  <Users size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats?.patients || 0}</div>
                  <div className="text-sm text-gray-500">Total Patients</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-purple-50 p-3 rounded-lg text-purple-600">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats?.programs || 0}</div>
                  <div className="text-sm text-gray-500">Programs Created</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600">
                  <Send size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats?.activePrograms || 0}</div>
                  <div className="text-sm text-gray-500">Active Programs</div>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/programs/new" className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-brand/50 hover:shadow-md transition-all flex flex-col items-center text-center">
                <div className="bg-brand-light p-4 rounded-full text-brand mb-4 group-hover:scale-110 transition-transform">
                  <Layers size={28} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">New Program</h3>
                <p className="text-sm text-gray-500">Build a custom program from the library</p>
              </Link>

              <Link href="/patients" className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-brand/50 hover:shadow-md transition-all flex flex-col items-center text-center">
                <div className="bg-blue-50 p-4 rounded-full text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                  <UserPlus size={28} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Add Patient</h3>
                <p className="text-sm text-gray-500">Create a new patient record</p>
              </Link>

              <Link href="/library" className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-brand/50 hover:shadow-md transition-all flex flex-col items-center text-center">
                <div className="bg-purple-50 p-4 rounded-full text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                  <Keyboard size={28} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Library</h3>
                <p className="text-sm text-gray-500">Browse or add custom exercises</p>
              </Link>
            </div>

          </div>
        ) : (
          // LANDING PAGE VIEW
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-16 mt-10">
              <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                Create <span className="text-brand">Exercise</span> Programs
              </h1>
              <p className="text-gray-500 text-xl max-w-2xl mx-auto">
                Professional home exercise builder for physical therapists. <br />
                Simple, fast, and beautiful.
              </p>
              <div className="mt-8">
                <Link href="/login" className="bg-brand text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-brand/20">
                  Get Started
                </Link>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  <Layers />
                </div>
                <h3 className="text-xl font-bold mb-2">Program Builder</h3>
                <p className="text-gray-500">Drag and drop exercises, set customized dosage, and share with patients instantly.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                  <Users />
                </div>
                <h3 className="text-xl font-bold mb-2">Patient Management</h3>
                <p className="text-gray-500">Keep track of all your patients and their active programs in one place.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 py-8 px-8 flex items-center justify-between text-gray-400 text-sm max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brand text-white">
            <BarChart3 size={12} />
          </div>
          <span className="font-semibold text-gray-600">ExerciseRx</span>
        </div>
        <p>© 2026 ExerciseRx</p>
      </footer>
    </div>
  );
}
