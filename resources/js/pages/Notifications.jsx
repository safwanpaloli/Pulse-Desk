import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Bell, Check, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from '../lib/axios';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({});
    const [page, setPage] = useState(1);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/notifications?page=${page}`);
            setNotifications(data.data);
            setMeta({
                current_page: data.current_page,
                last_page: data.last_page,
                total: data.total,
                from: data.from,
                to: data.to,
            });
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [page]);

    const markAsRead = async (id) => {
        try {
            await axios.put(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? {...n, read_at: new Date().toISOString()} : n));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put('/api/notifications/read-all');
            setNotifications(prev => prev.map(n => ({...n, read_at: n.read_at || new Date().toISOString()})));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const getNotificationColor = (type) => {
        switch(type) {
            case 'success': return 'bg-emerald-500';
            case 'warning': return 'bg-amber-500';
            default: return 'bg-blue-500';
        }
    };

    const getNotificationIconColor = (type) => {
        switch(type) {
            case 'success': return 'text-emerald-500 bg-emerald-50';
            case 'warning': return 'text-amber-500 bg-amber-50';
            default: return 'text-blue-500 bg-blue-50';
        }
    };

    const hasUnread = notifications.some(n => !n.read_at);

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mb-1">Notifications</h2>
                        <p className="text-zinc-600 text-sm">Stay updated with everything happening on PulseDesk.</p>
                    </div>
                    {hasUnread && (
                        <button 
                            onClick={markAllAsRead}
                            className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-50 transition-colors shadow-sm flex items-center gap-2 self-start sm:self-auto"
                        >
                            <CheckCircle2 size={16} className="text-zinc-500" /> 
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 flex flex-col overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-zinc-500">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                                <Bell size={24} />
                            </div>
                            <h3 className="text-lg font-medium text-zinc-900 mb-1">All caught up!</h3>
                            <p className="text-zinc-500 text-sm">You have no notifications to display.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-100">
                            {notifications.map(notification => {
                                const isUnread = !notification.read_at;
                                return (
                                    <div 
                                        key={notification.id} 
                                        className={`p-5 sm:p-6 transition-colors flex gap-4 ${isUnread ? 'bg-blue-50/20' : 'hover:bg-zinc-50'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center ${getNotificationIconColor(notification.data.type)}`}>
                                            <Bell size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                                                <h4 className={`text-sm sm:text-base ${isUnread ? 'font-semibold text-zinc-900' : 'font-medium text-zinc-800'}`}>
                                                    {notification.data.title}
                                                </h4>
                                                <span className="text-xs font-medium text-zinc-400 whitespace-nowrap">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className={`text-sm leading-relaxed ${isUnread ? 'text-zinc-700' : 'text-zinc-500'}`}>
                                                {notification.data.message}
                                            </p>
                                        </div>
                                        {isUnread && (
                                            <div className="shrink-0 flex items-center">
                                                <button 
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-blue-600 transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <div className={`w-2.5 h-2.5 ml-2 rounded-full ${getNotificationColor(notification.data.type)}`}></div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && meta.total > 0 && (
                        <div className="p-4 border-t border-zinc-100 flex items-center justify-between text-sm bg-zinc-50/50">
                            <div className="text-zinc-500">
                                Showing <span className="font-medium text-zinc-900">{meta.from}</span> to <span className="font-medium text-zinc-900">{meta.to}</span> of <span className="font-medium text-zinc-900">{meta.total}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-white bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button 
                                    onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                                    disabled={page === meta.last_page}
                                    className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-white bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
