import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Filter, Plus, Edit2, CheckCircle, Ban } from 'lucide-react';
import axios from '../lib/axios';

export default function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({});
    
    // Filters and Sorting State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDir, setSortDir] = useState('desc');
    const [page, setPage] = useState(1);

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');

    // Form Data
    const [formData, setFormData] = useState({
        user_id: '',
        amount: '',
        status: 'pending',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        paid_at: ''
    });

    const [customers, setCustomers] = useState([]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                sort_by: sortBy,
                sort_dir: sortDir,
                ...(search && { search }),
                ...(statusFilter && { status: statusFilter }),
            });

            const response = await axios.get(`/api/invoices?${params.toString()}`);
            setInvoices(response.data.data);
            setMeta({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total,
                from: response.data.from,
                to: response.data.to,
            });
        } catch (error) {
            console.error("Failed to fetch invoices", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await axios.get('/api/customers?limit=100');
            setCustomers(response.data.data);
            if (response.data.data.length > 0) {
                setFormData(prev => ({ ...prev, user_id: response.data.data[0].id }));
            }
        } catch (err) {
            console.error("Failed to fetch customers", err);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (page !== 1) setPage(1);
            else fetchInvoices();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search]);

    // Fetch on filter/sort/page changes
    useEffect(() => {
        fetchInvoices();
    }, [statusFilter, sortBy, sortDir, page]);

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
            user_id: customers.length > 0 ? customers[0].id : '',
            amount: '',
            status: 'pending',
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            paid_at: ''
        });
        setError('');
        setIsAddModalOpen(true);
    };

    const openEditModal = (invoice) => {
        setSelectedInvoice(invoice);
        setFormData({
            amount: invoice.amount,
            status: invoice.status,
            due_date: invoice.due_date ? invoice.due_date.split('T')[0] : '',
            paid_at: invoice.paid_at ? invoice.paid_at.split('T')[0] : ''
        });
        setError('');
        setIsEditModalOpen(true);
    };

    const openStatusModal = (invoice, statusToSet) => {
        setSelectedInvoice(invoice);
        setNewStatus(statusToSet);
        setIsStatusModalOpen(true);
    }

    const handleCreate = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setError('');
        try {
            await axios.post('/api/invoices', formData);
            fetchInvoices();
            setIsAddModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create invoice');
        } finally {
            setModalLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setError('');
        try {
            await axios.put(`/api/invoices/${selectedInvoice.id}`, formData);
            fetchInvoices();
            setIsEditModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update invoice');
        } finally {
            setModalLoading(false);
        }
    };

    const confirmStatusChange = async () => {
        if (!selectedInvoice) return;
        setModalLoading(true);
        
        try {
            await axios.put(`/api/invoices/${selectedInvoice.id}/status`, { status: newStatus });
            fetchInvoices();
            setIsStatusModalOpen(false);
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setModalLoading(false);
            setSelectedInvoice(null);
        }
    };

    const getStatusBadgeStyle = (status) => {
        switch(status) {
            case 'paid': return 'bg-emerald-50 text-emerald-700 border border-emerald-200/50';
            case 'pending': return 'bg-blue-50 text-blue-700 border border-blue-200/50';
            case 'overdue': return 'bg-rose-50 text-rose-700 border border-rose-200/50';
            default: return 'bg-zinc-100 text-zinc-600 border border-zinc-200';
        }
    };
    
    const getStatusDotColor = (status) => {
        switch(status) {
            case 'paid': return 'bg-emerald-500';
            case 'pending': return 'bg-blue-500';
            case 'overdue': return 'bg-rose-500';
            default: return 'bg-zinc-400';
        }
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mb-1">Invoices</h2>
                        <p className="text-zinc-600 text-sm">Manage billing and collect payments.</p>
                    </div>
                    <button 
                        onClick={openAddModal}
                        className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-2 self-start sm:self-auto"
                    >
                        <Plus size={16} /> New Invoice
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 flex flex-col">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row items-center gap-4 justify-between">
                        <div className="relative w-full sm:max-w-xs">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search by customer or invoice #..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 text-sm text-zinc-900 outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
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
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="overdue">Overdue</option>
                                    <option value="canceled">Canceled</option>
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
                                    <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/50 transition-colors" onClick={() => handleSort('invoice_number')}>
                                        <div className="flex items-center">Invoice <SortIcon column="invoice_number" /></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/50 transition-colors" onClick={() => handleSort('user_name')}>
                                        <div className="flex items-center">Customer <SortIcon column="user_name" /></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/50 transition-colors" onClick={() => handleSort('amount')}>
                                        <div className="flex items-center">Amount <SortIcon column="amount" /></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/50 transition-colors" onClick={() => handleSort('status')}>
                                        <div className="flex items-center">Status <SortIcon column="status" /></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/50 transition-colors" onClick={() => handleSort('due_date')}>
                                        <div className="flex items-center">Due Date <SortIcon column="due_date" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-zinc-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                                            Loading invoices...
                                        </td>
                                    </tr>
                                ) : invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                                            No invoices found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-zinc-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-zinc-900">
                                                {invoice.invoice_number}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-medium shrink-0">
                                                        {invoice.user?.name.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <span className="block font-medium text-zinc-900">{invoice.user?.name || 'Unknown'}</span>
                                                        <span className="block text-xs text-zinc-500">{invoice.user?.email || ''}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-zinc-800">
                                                ${parseFloat(invoice.amount).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(invoice.status)}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDotColor(invoice.status)}`}></span>
                                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-500">
                                                {new Date(invoice.due_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {invoice.status !== 'paid' && invoice.status !== 'canceled' && (
                                                        <button 
                                                            onClick={() => openStatusModal(invoice, 'paid')} 
                                                            className="text-zinc-400 hover:text-emerald-600 transition-colors p-1.5 rounded-lg hover:bg-emerald-50" 
                                                            title="Mark as Paid"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => openEditModal(invoice)} className="text-zinc-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-blue-50" title="Edit Invoice">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    {invoice.status !== 'canceled' && (
                                                        <button 
                                                            onClick={() => openStatusModal(invoice, 'canceled')} 
                                                            className="text-zinc-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50" 
                                                            title="Cancel Invoice"
                                                        >
                                                            <Ban size={16} />
                                                        </button>
                                                    )}
                                                </div>
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

            {/* Modals */}

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl border border-zinc-100 max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-zinc-900 mb-4">Create Invoice</h3>
                        {error && <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-xl">{error}</div>}
                        
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Customer</label>
                                <select 
                                    name="user_id"
                                    value={formData.user_id}
                                    onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-800"
                                >
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Amount ($)</label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Due Date</label>
                                    <input 
                                        type="date"
                                        required
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-800"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 mt-2">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900">Cancel</button>
                                <button type="submit" disabled={modalLoading} className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-xl hover:bg-zinc-800">{modalLoading ? 'Saving...' : 'Create Invoice'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl border border-zinc-100 max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-zinc-900 mb-4">Edit Invoice {selectedInvoice.invoice_number}</h3>
                        {error && <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-xl">{error}</div>}
                        
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Amount ($)</label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Status</label>
                                    <select 
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-800"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="overdue">Overdue</option>
                                        <option value="canceled">Canceled</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Due Date</label>
                                <input 
                                    type="date"
                                    required
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-800"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 mt-2">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900">Cancel</button>
                                <button type="submit" disabled={modalLoading} className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-xl hover:bg-zinc-800">{modalLoading ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Status Change Modal (for quick actions) */}
            {isStatusModalOpen && selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl border border-zinc-100 max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-zinc-900 mb-2">Confirm Action</h3>
                        <p className="text-sm text-zinc-600 mb-6">
                            Are you sure you want to mark invoice <strong>{selectedInvoice.invoice_number}</strong> as {newStatus}?
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button 
                                onClick={() => setIsStatusModalOpen(false)}
                                disabled={modalLoading}
                                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
                            >
                                Nevermind
                            </button>
                            <button 
                                onClick={confirmStatusChange}
                                disabled={modalLoading}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-xl shadow-sm ${
                                    newStatus === 'paid' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                                }`}
                            >
                                {modalLoading ? 'Processing...' : `Mark as ${newStatus}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
