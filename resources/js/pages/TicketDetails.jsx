import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { ArrowLeft, Send, User, Shield, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../lib/axios';

export default function TicketDetails() {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const messagesEndRef = useRef(null);

    const fetchTicket = async () => {
        try {
            const response = await axios.get(`/api/tickets/${id}`);
            setTicket(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load ticket');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [id]);

    useEffect(() => {
        // Scroll to bottom when ticket loads or replies change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ticket]);

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setSubmitting(true);
        try {
            await axios.post(`/api/tickets/${id}/replies`, { message: replyText });
            setReplyText('');
            await fetchTicket(); // Refresh ticket and replies
        } catch (err) {
            console.error("Failed to send reply", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await axios.put(`/api/tickets/${id}/status`, { status: newStatus });
            setTicket({ ...ticket, status: newStatus });
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-full">
                    <div className="text-zinc-500">Loading ticket...</div>
                </div>
            </Layout>
        );
    }

    if (error || !ticket) {
        return (
            <Layout>
                <div className="p-8">
                    <div className="bg-rose-50 text-rose-700 p-4 rounded-xl border border-rose-200">
                        {error || 'Ticket not found'}
                    </div>
                    <Link to="/support" className="text-blue-600 hover:underline mt-4 inline-block">&larr; Back to tickets</Link>
                </div>
            </Layout>
        );
    }

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';
    const isClosed = ticket.status === 'closed';

    const getStatusBadgeStyle = (status) => {
        switch(status) {
            case 'open': return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
            case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200/50';
            case 'resolved': return 'bg-purple-50 text-purple-700 border-purple-200/50';
            case 'closed': return 'bg-zinc-100 text-zinc-600 border-zinc-200/50';
            default: return 'bg-zinc-100 text-zinc-600 border-zinc-200';
        }
    };

    const getPriorityBadgeStyle = (priority) => {
        switch(priority) {
            case 'high': return 'bg-rose-50 text-rose-700 border-rose-200/50';
            case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200/50';
            case 'low': return 'bg-zinc-50 text-zinc-700 border-zinc-200/50';
            default: return 'bg-zinc-50 text-zinc-700 border-zinc-200';
        }
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)] flex flex-col">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                    <div>
                        <Link to="/support" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-2">
                            <ArrowLeft size={16} className="mr-1" /> Back to tickets
                        </Link>
                        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">{ticket.subject}</h2>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-sm text-zinc-500">Ticket #{ticket.id}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${getPriorityBadgeStyle(ticket.priority)}`}>
                                {ticket.priority.toUpperCase()} PRIORITY
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${getStatusBadgeStyle(ticket.status)}`}>
                                {ticket.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                    </div>
                    
                    {/* Admin Actions */}
                    {isAdmin && !isClosed && (
                        <div className="flex items-center gap-2">
                            <select 
                                value={ticket.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-800"
                            >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    )}
                    
                    {/* User Action */}
                    {!isAdmin && !isClosed && (
                        <button 
                            onClick={() => handleStatusChange('closed')}
                            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-sm font-medium rounded-xl transition-colors self-start sm:self-auto"
                        >
                            Mark as Closed
                        </button>
                    )}
                </div>

                <div className="flex-1 bg-white border border-zinc-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                    {/* Conversation Thread */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/30">
                        {/* Original Ticket Description */}
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                                {ticket.user?.role === 'admin' || ticket.user?.role === 'manager' ? (
                                    <Shield size={18} className="text-zinc-600" />
                                ) : (
                                    <User size={18} className="text-zinc-600" />
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-zinc-900">{ticket.user?.name}</span>
                                    <span className="text-xs text-zinc-400">{new Date(ticket.created_at).toLocaleString()}</span>
                                </div>
                                <div className="bg-white border border-zinc-100 rounded-2xl rounded-tl-sm p-4 text-zinc-700 text-sm whitespace-pre-wrap shadow-sm">
                                    {ticket.description}
                                </div>
                            </div>
                        </div>

                        {/* Replies */}
                        {ticket.replies?.map((reply) => {
                            const isMe = reply.user_id === currentUser?.id;
                            const isStaff = reply.user?.role === 'admin' || reply.user?.role === 'manager';
                            
                            return (
                                <div key={reply.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                                        isStaff 
                                            ? 'bg-blue-50 border-blue-100 text-blue-600' 
                                            : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                                    }`}>
                                        {isStaff ? <Shield size={18} /> : <User size={18} />}
                                    </div>
                                    <div className={`flex-1 space-y-1 ${isMe ? 'text-right' : ''}`}>
                                        <div className={`flex items-center justify-between ${isMe ? 'flex-row-reverse' : ''}`}>
                                            <span className="font-semibold text-zinc-900">
                                                {reply.user?.name} {isStaff && <span className="ml-1 text-xs font-medium text-blue-600 px-1.5 py-0.5 bg-blue-50 rounded-md">Staff</span>}
                                            </span>
                                            <span className="text-xs text-zinc-400">{new Date(reply.created_at).toLocaleString()}</span>
                                        </div>
                                        <div className={`inline-block border p-4 text-sm whitespace-pre-wrap shadow-sm ${
                                            isMe 
                                                ? 'bg-zinc-900 border-zinc-800 text-white rounded-2xl rounded-tr-sm text-left' 
                                                : 'bg-white border-zinc-100 text-zinc-700 rounded-2xl rounded-tl-sm'
                                        }`}>
                                            {reply.message}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Reply Input Area */}
                    <div className="p-4 bg-white border-t border-zinc-100">
                        {isClosed ? (
                            <div className="flex items-center justify-center gap-2 text-zinc-500 py-4 bg-zinc-50 rounded-xl border border-zinc-100 border-dashed">
                                <AlertCircle size={18} />
                                <span className="text-sm font-medium">This ticket has been closed.</span>
                            </div>
                        ) : (
                            <form onSubmit={handleReply} className="relative">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your reply..."
                                    rows="3"
                                    className="w-full pl-4 pr-14 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-800 focus:bg-white transition-all resize-none"
                                />
                                <button
                                    type="submit"
                                    disabled={submitting || !replyText.trim()}
                                    className="absolute bottom-3 right-3 p-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
