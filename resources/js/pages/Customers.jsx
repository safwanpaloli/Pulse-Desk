import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreHorizontal, Filter, Edit2, Ban, CheckCircle } from 'lucide-react';
import axios from '../lib/axios';

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({});
    
    // Filters and Sorting State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDir, setSortDir] = useState('desc');
    const [page, setPage] = useState(1);
    
    // Modal State
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                sort_by: sortBy,
                sort_dir: sortDir,
                ...(search && { search }),
                ...(statusFilter && { status: statusFilter }),
            });

            const response = await axios.get(`/api/customers?${params.toString()}`);
            setCustomers(response.data.data);
            setMeta({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total,
                from: response.data.from,
                to: response.data.to,
            });
        } catch (error) {
            console.error("Failed to fetch customers", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (page !== 1) setPage(1);
            else fetchCustomers();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search]);

    // Fetch on filter/sort/page changes
    useEffect(() => {
        fetchCustomers();
    }, [statusFilter, sortBy, sortDir, page]);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDir('asc');
        }
    };

    const handleStatusToggle = (customer) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    const confirmStatusChange = async () => {
        if (!selectedCustomer) return;
        setModalLoading(true);
        const newStatus = selectedCustomer.status === 'active' ? 'inactive' : 'active';
        
        try {
            await axios.put(`/api/customers/${selectedCustomer.id}/status`, { status: newStatus });
            // Update local state without fetching again
            setCustomers(customers.map(c => c.id === selectedCustomer.id ? { ...c, status: newStatus } : c));
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setModalLoading(false);
            setSelectedCustomer(null);
        }
    };

    const SortIcon = ({ column }) => {
        if (sortBy !== column) return <ChevronDown size={14} className="text-zinc-300 ml-1" />;
        return sortDir === 'asc' 
            ? <ChevronUp size={14} className="text-zinc-800 ml-1" /> 
            : <ChevronDown size={14} className="text-zinc-800 ml-1" />;
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mb-1">Customers</h2>
                        <p className="text-zinc-600 text-sm">Manage your platform's users and their statuses.</p>
                    </div>
                    <Link to="/customers/add" className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-800 transition-colors shadow-sm self-start sm:self-auto">
                        Add Customer
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 flex flex-col">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row items-center gap-4 justify-between">
                        <div className="relative w-full sm:max-w-xs">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search customers..."
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
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
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
                                    <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/50 transition-colors" onClick={() => handleSort('name')}>
                                        <div className="flex items-center">Name <SortIcon column="name" /></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/50 transition-colors" onClick={() => handleSort('email')}>
                                        <div className="flex items-center">Email <SortIcon column="email" /></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/50 transition-colors" onClick={() => handleSort('status')}>
                                        <div className="flex items-center">Status <SortIcon column="status" /></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-zinc-100/50 transition-colors" onClick={() => handleSort('created_at')}>
                                        <div className="flex items-center">Joined <SortIcon column="created_at" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-zinc-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-zinc-500">
                                            Loading customers...
                                        </td>
                                    </tr>
                                ) : customers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-zinc-500">
                                            No customers found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-zinc-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-medium">
                                                        {customer.name.charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-zinc-900">{customer.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-600">{customer.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    customer.status === 'active' 
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                                                        : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                        customer.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-400'
                                                    }`}></span>
                                                    {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-500">
                                                {new Date(customer.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link to={`/customers/edit/${customer.id}`} className="text-zinc-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-blue-50" title="Edit Customer">
                                                        <Edit2 size={16} />
                                                    </Link>
                                                    {customer.status === 'active' ? (
                                                        <button onClick={() => handleStatusToggle(customer)} className="text-zinc-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50" title="Deactivate Customer">
                                                            <Ban size={16} />
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleStatusToggle(customer)} className="text-zinc-400 hover:text-emerald-600 transition-colors p-1.5 rounded-lg hover:bg-emerald-50" title="Activate Customer">
                                                            <CheckCircle size={16} />
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

            {/* Confirmation Modal */}
            {isModalOpen && selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl border border-zinc-100 max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-zinc-900 mb-2">
                            {selectedCustomer.status === 'active' ? 'Deactivate' : 'Activate'} Customer
                        </h3>
                        <p className="text-sm text-zinc-600 mb-6">
                            Are you sure you want to {selectedCustomer.status === 'active' ? 'deactivate' : 'activate'} <strong>{selectedCustomer.name}</strong>? 
                            {selectedCustomer.status === 'active' 
                                ? ' They will lose access to the platform.' 
                                : ' They will regain access to the platform.'}
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                disabled={modalLoading}
                                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmStatusChange}
                                disabled={modalLoading}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors shadow-sm disabled:opacity-70 ${
                                    selectedCustomer.status === 'active' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                                }`}
                            >
                                {modalLoading ? 'Processing...' : (selectedCustomer.status === 'active' ? 'Deactivate' : 'Activate')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
