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
        <div className="min-h-screen bg-zinc-50 flex">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-zinc-100 fixed inset-y-0 z-20">
                {/* Sidebar Header */}
                <div className="p-6 border-b border-zinc-100">
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl leading-none">P</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-zinc-900">PulseDesk</span>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4">
                    <div className="space-y-1">
                        {navItems.filter(item => item.roles.includes(user?.role)).map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                                        ${isActive 
                                            ? 'bg-zinc-100 text-zinc-900' 
                                            : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}
                                    `}
                                >
                                    <Icon size={18} />
                                    {item.name}
                                </NavLink>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 border-t border-zinc-100">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-medium shrink-0">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 truncate">{user?.name}</p>
                            <p className="text-xs text-zinc-500 truncate capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                        <LogOut size={18} />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col md:ml-64 min-w-0 transition-all duration-300">
                {/* Header Topbar */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-zinc-100 sticky top-0 z-10 px-4 sm:px-6 lg:px-8 flex items-center justify-between md:justify-end">
                    
                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden p-2 text-zinc-500 hover:text-zinc-900"
                    >
                        <Menu size={24} />
                    </button>
                    
                    {/* Top Right Actions */}
                    <div className="flex items-center gap-4">
                        
                        {/* Notification Bell */}
                        <div className="relative" ref={notificationRef}>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-zinc-500 hover:text-zinc-900 transition-colors rounded-full hover:bg-zinc-100"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>
                            
                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                                    <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                                        <h3 className="font-semibold text-zinc-900">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">{unreadCount} new</span>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {recentNotifications.length === 0 ? (
                                            <div className="p-6 text-center text-sm text-zinc-500">
                                                No notifications right now.
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-zinc-50">
                                                {recentNotifications.map(notification => (
                                                    <div 
                                                        key={notification.id} 
                                                        className={`p-4 transition-colors ${!notification.read_at ? 'bg-blue-50/30' : 'hover:bg-zinc-50'}`}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${getNotificationColor(notification.data.type)}`}></div>
                                                            <div className="flex-1 space-y-1">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <p className={`text-sm ${!notification.read_at ? 'font-semibold text-zinc-900' : 'font-medium text-zinc-700'}`}>
                                                                        {notification.data.title}
                                                                    </p>
                                                                    {!notification.read_at && (
                                                                        <button 
                                                                            onClick={(e) => markAsRead(notification.id, e)}
                                                                            className="text-zinc-400 hover:text-blue-600 p-0.5 rounded"
                                                                            title="Mark as read"
                                                                        >
                                                                            <Check size={14} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-zinc-500 leading-relaxed">{notification.data.message}</p>
                                                                <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium pt-1">
                                                                    {new Date(notification.created_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 border-t border-zinc-100 bg-zinc-50/50">
                                        <Link 
                                            to="/notifications" 
                                            onClick={() => setShowNotifications(false)}
                                            className="block w-full text-center py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            View all notifications
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 relative overflow-y-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden flex">
                    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <aside className="relative flex-1 flex flex-col max-w-xs w-full bg-white animate-in slide-in-from-left duration-200">
                        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
                            <Link to="/dashboard" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xl leading-none">P</span>
                                </div>
                                <span className="font-bold text-xl tracking-tight text-zinc-900">PulseDesk</span>
                            </Link>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-4 px-3">
                            <div className="space-y-1">
                                {navItems.filter(item => item.roles.includes(user?.role)).map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <NavLink
                                            key={item.name}
                                            to={item.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={({ isActive }) => `
                                                flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all
                                                ${isActive ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}
                                            `}
                                        >
                                            <Icon size={18} />
                                            {item.name}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-4 border-t border-zinc-100">
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-zinc-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            >
                                <LogOut size={18} />
                                Sign out
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}
