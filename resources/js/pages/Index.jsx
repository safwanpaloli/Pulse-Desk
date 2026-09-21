import React from 'react';
import { Link } from 'react-router-dom';

export default function Index() {
    return (
        <div className="min-h-screen bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] flex flex-col">
            <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">P</span>
                    </div>
                    <span className="text-xl font-semibold text-zinc-800 tracking-tight">PulseDesk</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link to="/login" className="text-sm font-medium text-zinc-500 hover:text-zinc-800 transition-colors">
                        Sign In
                    </Link>
                    <Link to="/register" className="text-sm font-medium px-5 py-2.5 bg-zinc-800 text-white rounded-full hover:bg-zinc-700 transition-colors shadow-sm">
                        Get Started
                    </Link>
                </div>
            </nav>

            <main className="flex-grow flex flex-col items-center justify-center text-center px-4 -mt-20">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-medium mb-8">
                    <span className="flex h-2 w-2 rounded-full bg-zinc-400"></span>
                    Now in public beta
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold text-zinc-800 tracking-tight leading-tight max-w-4xl mb-6">
                    The minimal admin platform <br className="hidden md:block"/> for modern SaaS
                </h1>
                
                <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mb-10 leading-relaxed">
                    PulseDesk provides powerful analytics, user management, and support ticketing without the clutter. Designed for clarity, built for speed.
                </p>
                
                <div className="flex items-center gap-4">
                    <Link to="/register" className="px-8 py-3.5 bg-zinc-800 text-white font-medium rounded-full hover:bg-zinc-700 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-200">
                        Start your free trial
                    </Link>
                    <a href="#features" className="px-8 py-3.5 bg-white border border-zinc-200 text-zinc-600 font-medium rounded-full hover:border-zinc-300 hover:text-zinc-800 transition-colors">
                        View Features
                    </a>
                </div>

                <div className="mt-20 relative w-full max-w-5xl mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 h-full"></div>
                    <div className="bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden relative">
                        <div className="h-12 border-b border-zinc-100 flex items-center px-4 gap-2 bg-zinc-50/50">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-zinc-200"></div>
                                <div className="w-3 h-3 rounded-full bg-zinc-200"></div>
                                <div className="w-3 h-3 rounded-full bg-zinc-200"></div>
                            </div>
                        </div>
                        <div className="h-96 bg-zinc-50 flex items-center justify-center p-8">
                            <div className="w-full h-full border-2 border-dashed border-zinc-200 rounded-xl flex items-center justify-center text-zinc-400 font-medium">
                                Dashboard Interface Preview
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
