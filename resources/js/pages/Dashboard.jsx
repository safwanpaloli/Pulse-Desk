import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar
} from 'recharts';
import { 
    DollarSign, Users, CreditCard, Activity, ArrowUpRight, 
    ArrowDownRight, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';

const mockRevenueData = [
    { name: 'Jan', revenue: 4000, expenses: 2400 },
    { name: 'Feb', revenue: 3000, expenses: 1398 },
    { name: 'Mar', revenue: 2000, expenses: 9800 },
    { name: 'Apr', revenue: 2780, expenses: 3908 },
    { name: 'May', revenue: 1890, expenses: 4800 },
    { name: 'Jun', revenue: 2390, expenses: 3800 },
    { name: 'Jul', revenue: 3490, expenses: 4300 },
];

const mockActivity = [
    { id: 1, type: 'success', text: 'Invoice #INV-2023-01 paid', time: '2 hours ago' },
    { id: 2, type: 'info', text: 'New user Alice Smith signed up', time: '4 hours ago' },
    { id: 3, type: 'warning', text: 'Server CPU usage spiked', time: '6 hours ago' },
    { id: 4, type: 'success', text: 'Subscription upgraded by Bob Jones', time: '1 day ago' },
];

const StatCard = ({ title, value, change, isPositive, icon: Icon }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 flex flex-col">
        <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-600">
                <Icon size={20} />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {change}%
            </div>
        </div>
        <h3 className="text-zinc-500 font-medium text-sm mb-1">{title}</h3>
        <p className="text-3xl font-bold text-zinc-800 tracking-tight">{value}</p>
    </div>
);

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

    const SidebarItem = ({ icon: Icon, label, active }) => (
        <a href="#" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${active ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'}`}>
            <Icon size={18} className={active ? 'text-zinc-900' : 'text-zinc-400'} />
            {label}
        </a>
    );

    return (
        <div className="flex h-screen bg-zinc-50 font-sans overflow-hidden">
            {/* Left Sidebar */}
            <aside className="w-64 bg-white border-r border-zinc-100 flex flex-col justify-between hidden md:flex">
                <div>
                    <div className="h-16 flex items-center px-6 border-b border-zinc-100 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">P</span>
                            </div>
                            <h1 className="text-lg font-bold text-zinc-800 tracking-tight">PulseDesk</h1>
                        </div>
                    </div>
                    
                    <div className="px-4 space-y-1">
                        <SidebarItem icon={Activity} label="Dashboard" active={true} />
                        {isAdminOrManager && (
                            <>
                                <SidebarItem icon={Users} label="Customers" active={false} />
                                <SidebarItem icon={CreditCard} label="Subscriptions" active={false} />
                                <SidebarItem icon={DollarSign} label="Invoices" active={false} />
                            </>
                        )}
                        <SidebarItem icon={AlertCircle} label="Support Tickets" active={false} />
                    </div>
                </div>

                <div className="p-4 border-t border-zinc-100">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 font-bold uppercase shrink-0">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-zinc-800 truncate">{user?.name}</p>
                            <p className="text-xs text-zinc-500 font-medium capitalize tracking-wide">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium text-zinc-600 bg-zinc-50 hover:bg-zinc-100 hover:text-zinc-900 transition-colors border border-zinc-200"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Mobile Header (visible only on small screens) */}
                <header className="h-16 bg-white border-b border-zinc-100 flex items-center justify-between px-4 md:hidden">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">P</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm font-medium text-zinc-500"
                    >
                        Sign Out
                    </button>
                </header>

                {/* Main Scrollable Content */}
                <main className="flex-1 overflow-y-auto w-full">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mb-1">Overview</h2>
                            <p className="text-zinc-600 text-sm">Welcome back! Here's what's happening with your platform today.</p>
                        </div>

                        {isAdminOrManager ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <StatCard title="Total Revenue" value="$45,231" change="12.5" isPositive={true} icon={DollarSign} />
                                    <StatCard title="Active Users" value="2,314" change="4.1" isPositive={true} icon={Users} />
                                    <StatCard title="Active Subscriptions" value="1,842" change="1.2" isPositive={false} icon={CreditCard} />
                                    <StatCard title="Platform Activity" value="94%" change="8.4" isPositive={true} icon={Activity} />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-base font-semibold text-zinc-800 tracking-tight">Revenue Analytics</h3>
                                                <p className="text-sm text-zinc-500">Monthly revenue breakdown over the last 6 months</p>
                                            </div>
                                        </div>
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={mockRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#27272a" stopOpacity={0.1}/>
                                                            <stop offset="95%" stopColor="#27272a" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dx={-10} tickFormatter={(value) => `$${value}`} />
                                                    <Tooltip 
                                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                        itemStyle={{ color: '#27272a', fontWeight: 500 }}
                                                    />
                                                    <Area type="monotone" dataKey="revenue" stroke="#27272a" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 flex flex-col">
                                        <div className="mb-6">
                                            <h3 className="text-base font-semibold text-zinc-800 tracking-tight">Recent Activity</h3>
                                            <p className="text-sm text-zinc-500">Latest actions on the platform</p>
                                        </div>
                                        
                                        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                                            {mockActivity.map((activity) => (
                                                <div key={activity.id} className="flex gap-4 relative">
                                                    <div className="absolute left-[11px] top-8 bottom-[-24px] w-px bg-zinc-100 last:hidden"></div>
                                                    <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                                                        {activity.type === 'success' && <CheckCircle2 size={18} className="text-emerald-500" />}
                                                        {activity.type === 'info' && <Users size={18} className="text-blue-500" />}
                                                        {activity.type === 'warning' && <AlertCircle size={18} className="text-amber-500" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-zinc-800 font-medium mb-1">{activity.text}</p>
                                                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                            <Clock size={12} />
                                                            {activity.time}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full mt-6 py-2.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-sm font-medium rounded-xl transition-colors border border-zinc-200">
                                            View All Activity
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8 text-center max-w-2xl mx-auto mt-12">
                                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-100">
                                    <Users size={32} className="text-zinc-400" />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-800 mb-2">Welcome to PulseDesk</h3>
                                <p className="text-zinc-500 mb-8 max-w-md mx-auto">
                                    You are logged in as a standard user. In the future, this space will display your personal usage stats, subscription details, and support tickets.
                                </p>
                                <div className="flex items-center justify-center gap-4">
                                    <button className="px-5 py-2.5 bg-zinc-800 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors shadow-sm">
                                        View Profile
                                    </button>
                                    <button className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-50 transition-colors shadow-sm">
                                        Contact Support
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
