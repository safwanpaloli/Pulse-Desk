import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
    Activity, Users, CreditCard, DollarSign, AlertCircle
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path, active }) => (
    <Link to={path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${active ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'}`}>
        <Icon size={18} className={active ? 'text-zinc-900' : 'text-zinc-400'} />
        {label}
    </Link>
);

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

    return (
        <div className="flex h-screen bg-zinc-50 font-sans overflow-hidden">
            {/* Left Sidebar */}
            <aside className="w-64 bg-white border-r border-zinc-100 flex flex-col justify-between hidden md:flex">
                <div>
                    <div className="h-16 flex items-center px-6 border-b border-zinc-100 mb-6">
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">P</span>
                            </div>
                            <h1 className="text-lg font-bold text-zinc-800 tracking-tight">PulseDesk</h1>
                        </Link>
                    </div>
                    
                    <div className="px-4 space-y-1">
                        <SidebarItem 
                            icon={Activity} 
                            label="Dashboard" 
                            path="/dashboard" 
                            active={location.pathname === '/dashboard'} 
                        />
                        {isAdminOrManager && (
                            <>
                                <SidebarItem 
                                    icon={Users} 
                                    label="Customers" 
                                    path="/customers" 
                                    active={location.pathname === '/customers'} 
                                />
                                <SidebarItem 
                                    icon={CreditCard} 
                                    label="Subscriptions" 
                                    path="/subscriptions" 
                                    active={location.pathname === '/subscriptions'} 
                                />
                                <SidebarItem 
                                    icon={DollarSign} 
                                    label="Invoices" 
                                    path="/invoices" 
                                    active={location.pathname === '/invoices'} 
                                />
                            </>
                        )}
                        <SidebarItem 
                            icon={AlertCircle} 
                            label="Support Tickets" 
                            path="/support" 
                            active={location.pathname === '/support'} 
                        />
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
                {/* Mobile Header */}
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
                    {children}
                </main>
            </div>
        </div>
    );
}
