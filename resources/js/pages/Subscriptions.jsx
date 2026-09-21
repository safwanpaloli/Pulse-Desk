import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreHorizontal, Filter, Plus, Ban, CheckCircle, Edit2 } from 'lucide-react';
import axios from '../lib/axios';

export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({});
    
    // Filters and Sorting State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [planFilter, setPlanFilter] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDir, setSortDir] = useState('desc');
    const [page, setPage] = useState(1);

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedSub, setSelectedSub] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');

    // Form Data
    const [formData, setFormData] = useState({
        user_id: '',
        plan_name: 'Basic',
        price: '9.99',
        status: 'active',
        starts_at: new Date().toISOString().split('T')[0],
        ends_at: ''
    });

    const [customers, setCustomers] = useState([]);

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                sort_by: sortBy,
                sort_dir: sortDir,
                ...(search && { search }),
                ...(statusFilter && { status: statusFilter }),
                ...(planFilter && { plan: planFilter }),
            });

            const response = await axios.get(`/api/subscriptions?${params.toString()}`);
            setSubscriptions(response.data.data);
            setMeta({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total,
                from: response.data.from,
                to: response.data.to,
            });
        } catch (error) {
            console.error("Failed to fetch subscriptions", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            // Fetch all customers for the add dropdown (simple implementation for now)
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
            else fetchSubscriptions();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search]);

    // Fetch on filter/sort/page changes
    useEffect(() => {
        fetchSubscriptions();
    }, [statusFilter, planFilter, sortBy, sortDir, page]);

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

    const handlePlanChange = (e) => {
        const plan = e.target.value;
        const prices = { 'Basic': '9.99', 'Pro': '29.99', 'Enterprise': '99.99' };
        setFormData({ ...formData, plan_name: plan, price: prices[plan] });
    };

    const openAddModal = () => {
        setFormData({
            user_id: customers.length > 0 ? customers[0].id : '',
            plan_name: 'Basic',
            price: '9.99',
            status: 'active',
            starts_at: new Date().toISOString().split('T')[0],
            ends_at: ''
        });
        setError('');
        setIsAddModalOpen(true);
    };

    const openEditModal = (sub) => {
        setSelectedSub(sub);
        setFormData({
            plan_name: sub.plan_name,
            price: sub.price,
            status: sub.status,
            ends_at: sub.ends_at ? sub.ends_at.split('T')[0] : ''
        });
        setError('');
        setIsEditModalOpen(true);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setError('');
        try {
            await axios.post('/api/subscriptions', formData);
            fetchSubscriptions();
            setIsAddModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create subscription');
        } finally {
            setModalLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setError('');
        try {
            await axios.put(`/api/subscriptions/${selectedSub.id}`, formData);
            fetchSubscriptions();
            setIsEditModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update subscription');
        } finally {
            setModalLoading(false);
        }
    };

    const confirmCancel = async () => {
        if (!selectedSub) return;
        setModalLoading(true);
        
        try {
            await axios.put(`/api/subscriptions/${selectedSub.id}/cancel`);
            fetchSubscriptions();
            setIsCancelModalOpen(false);
        } catch (error) {
            console.error("Failed to cancel", error);
        } finally {
            setModalLoading(false);
            setSelectedSub(null);
        }
    };

    const getPlanBadgeStyle = (plan) => {
        switch(plan) {
            case 'Pro': return 'bg-purple-50 text-purple-700 border-purple-200/50';
            case 'Enterprise': return 'bg-amber-50 text-amber-700 border-amber-200/50';
            default: return 'bg-blue-50 text-blue-700 border-blue-200/50';
        }
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mb-1">Subscriptions</h2>
                        <p className="text-zinc-600 text-sm">Manage recurring billing and plans.</p>
                    </div>
                    <button 
                        onClick={openAddModal}
                        className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-800 transition-colors shadow-sm self-start sm:self-auto flex items-center gap-2"
                    >
                        <Plus size={16} /> New Subscription
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 flex flex-col">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row items-center gap-4 justify-between">
                        <div className="relative w-full sm:max-w-xs">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search by user..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 text-sm text-zinc-900 outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative flex items-center w-full sm:w-auto">
                                <Filter size={16} className="absolute left-3 text-zinc-400" />
                                <select 
                                    value={planFilter}
                                    onChange={(e) => {
                                        setPlanFilter(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full sm:w-auto pl-9 pr-8 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 appearance-none cursor-pointer"
                                >
                                    <option value="">All Plans</option>
                                    <option value="Basic">Basic</option>
                                    <option value="Pro">Pro</option>
                                    <option value="Enterprise">Enterprise</option>
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
                                    <option value="active">Active</option>
                                    <option value="canceled">Canceled</option>
                                    <option value="past_due">Past Due</option>
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
                                    <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/50 transition-colors" onClick={() => handleSort('user_name')}>
                                        <div className="flex items-center">Customer <SortIcon column="user_name" /></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/50 transition-colors" onClick={() => handleSort('plan_name')}>
                                        <div className="flex items-center">Plan <SortIcon column="plan_name" /></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/50 transition-colors" onClick={() => handleSort('status')}>
                                        <div className="flex items-center">Status <SortIcon column="status" /></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/50 transition-colors" onClick={() => handleSort('price')}>
                                        <div className="flex items-center">Price <SortIcon column="price" /></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/50 transition-colors" onClick={() => handleSort('created_at')}>
                                        <div className="flex items-center">Started <SortIcon column="created_at" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-zinc-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                                            Loading subscriptions...
                                        </td>
                                    </tr>
                                ) : subscriptions.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                                            No subscriptions found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    subscriptions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-zinc-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-medium shrink-0">
                                                        {sub.user?.name.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <span className="block font-medium text-zinc-900">{sub.user?.name || 'Unknown User'}</span>
                                                        <span className="block text-xs text-zinc-500">{sub.user?.email || ''}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getPlanBadgeStyle(sub.plan_name)}`}>
                                                    {sub.plan_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    sub.status === 'active' 
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                                                        : sub.status === 'past_due'
                                                        ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                                                        : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                        sub.status === 'active' ? 'bg-emerald-500' : sub.status === 'past_due' ? 'bg-amber-500' : 'bg-zinc-400'
                                                    }`}></span>
                                                    {sub.status.replace('_', ' ').charAt(0).toUpperCase() + sub.status.replace('_', ' ').slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-zinc-800">
                                                ${parseFloat(sub.price).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-zinc-500">
                                                {new Date(sub.starts_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => openEditModal(sub)} className="text-zinc-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-blue-50" title="Edit Subscription">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    {sub.status !== 'canceled' && (
                                                        <button 
                                                            onClick={() => { setSelectedSub(sub); setIsCancelModalOpen(true); }} 
                                                            className="text-zinc-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50" 
                                                            title="Cancel Subscription"
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
                        <h3 className="text-lg font-bold text-zinc-900 mb-4">Add Subscription</h3>
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
                                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Plan</label>
                                    <select 
                                        name="plan_name"
                                        value={formData.plan_name}
                                        onChange={handlePlanChange}
                                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-800"
                                    >
                                        <option value="Basic">Basic</option>
                                        <option value="Pro">Pro</option>
                                        <option value="Enterprise">Enterprise</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Price ($)</label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-800"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 mt-2">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900">Cancel</button>
                                <button type="submit" disabled={modalLoading} className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-xl hover:bg-zinc-800">{modalLoading ? 'Saving...' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && selectedSub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl border border-zinc-100 max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-zinc-900 mb-4">Edit Subscription</h3>
                        {error && <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-xl">{error}</div>}
                        
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Plan</label>
                                    <select 
                                        name="plan_name"
                                        value={formData.plan_name}
                                        onChange={handlePlanChange}
                                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-800"
                                    >
                                        <option value="Basic">Basic</option>
                                        <option value="Pro">Pro</option>
                                        <option value="Enterprise">Enterprise</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Price ($)</label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-800"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Status</label>
                                <select 
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-800"
                                >
                                    <option value="active">Active</option>
                                    <option value="canceled">Canceled</option>
                                    <option value="past_due">Past Due</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 mt-2">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900">Cancel</button>
                                <button type="submit" disabled={modalLoading} className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-xl hover:bg-zinc-800">{modalLoading ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {isCancelModalOpen && selectedSub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl border border-zinc-100 max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-zinc-900 mb-2">Cancel Subscription</h3>
                        <p className="text-sm text-zinc-600 mb-6">
                            Are you sure you want to cancel the <strong>{selectedSub.plan_name}</strong> subscription for <strong>{selectedSub.user?.name}</strong>?
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button 
                                onClick={() => setIsCancelModalOpen(false)}
                                disabled={modalLoading}
                                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
                            >
                                Nevermind
                            </button>
                            <button 
                                onClick={confirmCancel}
                                disabled={modalLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
                            >
                                {modalLoading ? 'Processing...' : 'Confirm Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
