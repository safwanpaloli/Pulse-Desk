import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Filter, Plus, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../lib/axios';

export default function Support() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({});
    
    // Filters and Sorting State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDir, setSortDir] = useState('desc');
    const [page, setPage] = useState(1);

    // Modal State for New Ticket
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');

    // Form Data
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        priority: 'medium',
    });

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                sort_by: sortBy,
                sort_dir: sortDir,
                ...(search && { search }),
                ...(statusFilter && { status: statusFilter }),
                ...(priorityFilter && { priority: priorityFilter }),
            });

            const response = await axios.get(`/api/tickets?${params.toString()}`);
            setTickets(response.data.data);
            setMeta({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total,
                from: response.data.from,
                to: response.data.to,
            });
        } catch (error) {
            console.error("Failed to fetch tickets", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (page !== 1) setPage(1);
            else fetchTickets();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search]);

    // Fetch on filter/sort/page changes
    useEffect(() => {
        fetchTickets();
    }, [statusFilter, priorityFilter, sortBy, sortDir, page]);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDir('asc');
        }
    };

    const SortIcon = ({ column }) => {
        if (sortBy !== column) return <ChevronDown size={14} className="text-zinc-300 ml-1" />;
        return sortDir === 'asc' 
            ? <ChevronUp size={14} className="text-zinc-800 ml-1" /> 
            : <ChevronDown size={14} className="text-zinc-800 ml-1" />;
    };

    const openAddModal = () => {
        setFormData({
            subject: '',
            description: '',
            priority: 'medium',
        });
        setError('');
        setIsAddModalOpen(true);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setError('');
        try {
            await axios.post('/api/tickets', formData);
            fetchTickets();
            setIsAddModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create ticket');
        } finally {
            setModalLoading(false);
        }
    };

    const getStatusBadgeStyle = (status) => {
        switch(status) {
            case 'open': return 'bg-emerald-50 text-emerald-700 border border-emerald-200/50';
            case 'in_progress': return 'bg-blue-50 text-blue-700 border border-blue-200/50';
            case 'resolved': return 'bg-purple-50 text-purple-700 border border-purple-200/50';
            case 'closed': return 'bg-zinc-100 text-zinc-600 border border-zinc-200/50';
            default: return 'bg-zinc-100 text-zinc-600 border border-zinc-200';
        }
    };

    const getPriorityBadgeStyle = (priority) => {
        switch(priority) {
            case 'high': return 'bg-rose-50 text-rose-700 border border-rose-200/50';
            case 'medium': return 'bg-amber-50 text-amber-700 border border-amber-200/50';
            case 'low': return 'bg-zinc-50 text-zinc-700 border border-zinc-200/50';
            default: return 'bg-zinc-50 text-zinc-700 border border-zinc-200';
        }
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mb-1">Support Tickets</h2>
                        <p className="text-zinc-600 text-sm">Manage and resolve customer inquiries.</p>
                    </div>
                    <button 
                        onClick={openAddModal}
                        className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-2 self-start sm:self-auto"
                    >
                        <Plus size={16} /> New Ticket
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 flex flex-col">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row items-center gap-4 justify-between">
                        <div className="relative w-full sm:max-w-xs">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search subject..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 text-sm text-zinc-900 outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative flex items-center w-full sm:w-auto">
                                <Filter size={16} className="absolute left-3 text-zinc-400" />
                                <select 
                                    value={priorityFilter}
                                    onChange={(e) => {
                                        setPriorityFilter(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full sm:w-auto pl-9 pr-8 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 appearance-none cursor-pointer"
                                >
                                    <option value="">All Priorities</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 text-zinc-400 pointer-events-none" />
                            </div>
                            <div className="relative flex items-center w-full sm:w-auto">
                                <Filter size={16} className="absolute left-3 text-zinc-400" />
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full sm:w-auto pl-9 pr-8 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 appearance-none cursor-pointer"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 text-zinc-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-zinc-50/50 text-zinc-500 font-medium border-b border-zinc-100">
                                <tr>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/50 transition-colors" onClick={() => handleSort('subject')}>
                                        <div className="flex items-center">Subject <SortIcon column="subject" /></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/50 transition-colors" onClick={() => handleSort('user_name')}>
                                        <div className="flex items-center">Customer <SortIcon column="user_name" /></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/50 transition-colors" onClick={() => handleSort('priority')}>
                                        <div className="flex items-center">Priority <SortIcon column="priority" /></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/50 transition-colors" onClick={() => handleSort('status')}>
                                        <div className="flex items-center">Status <SortIcon column="status" /></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/50 transition-colors" onClick={() => handleSort('created_at')}>
                                        <div className="flex items-center">Created <SortIcon column="created_at" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-zinc-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                                            Loading tickets...
                                        </td>
                                    </tr>
                                ) : tickets.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                                            No tickets found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    tickets.map((ticket) => (
                                        <tr key={ticket.id} className="hover:bg-zinc-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-zinc-900 truncate max-w-[250px]">
                                                {ticket.subject}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-medium shrink-0">
                                                        {ticket.user?.name.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <span className="block font-medium text-zinc-900">{ticket.user?.name || 'Unknown'}</span>
                                                        <span className="block text-xs text-zinc-500">{ticket.user?.email || ''}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadgeStyle(ticket.priority)}`}>
                                                    {ticket.priority.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(ticket.status)}`}>
                                                    {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.replace('_', ' ').slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-500">
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link 
                                                    to={`/support/${ticket.id}`} 
                                                    className="inline-flex items-center justify-center text-zinc-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50" 
                                                    title="View Ticket"
                                                >
                                                    <MessageSquare size={16} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && meta.total > 0 && (
                        <div className="p-4 border-t border-zinc-100 flex items-center justify-between text-sm">
                            <div className="text-zinc-500">
                                Showing <span className="font-medium text-zinc-900">{meta.from}</span> to <span className="font-medium text-zinc-900">{meta.to}</span> of <span className="font-medium text-zinc-900">{meta.total}</span> results
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button 
                                    onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                                    disabled={page === meta.last_page}
                                    className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl border border-zinc-100 max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-zinc-900 mb-4">Create New Ticket</h3>
                        {error && <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-xl">{error}</div>}
                        
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Subject</label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="Brief summary of the issue"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Priority</label>
                                <select 
                                    value={formData.priority}
                                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-800"
                                >
                                    <option value="low">Low - Minor issue</option>
                                    <option value="medium">Medium - Standard issue</option>
                                    <option value="high">High - Urgent issue</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Description</label>
                                <textarea 
                                    required
                                    rows="4"
                                    placeholder="Please describe your issue in detail..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-800 resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-zinc-100">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900">Cancel</button>
                                <button type="submit" disabled={modalLoading} className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-xl hover:bg-zinc-800">{modalLoading ? 'Creating...' : 'Submit Ticket'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
