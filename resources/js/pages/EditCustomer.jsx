import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from '../lib/axios';

export default function EditCustomer() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        status: 'active'
    });
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await axios.get(`/api/customers/${id}`);
                setFormData({
                    name: response.data.name,
                    email: response.data.email,
                    status: response.data.status,
                    password: '',
                    password_confirmation: ''
                });
            } catch (err) {
                setError('Failed to load customer data.');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await axios.put(`/api/customers/${id}`, formData);
            navigate('/customers');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update customer');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-full text-zinc-500">
                    Loading customer data...
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-zinc-500 mb-4">
                        <Link to="/customers" className="hover:text-zinc-900 transition-colors">Customers</Link>
                        <span>/</span>
                        <span className="text-zinc-900 font-medium">Edit Customer</span>
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mb-1">Edit Customer</h2>
                    <p className="text-zinc-600 text-sm">Update the account details for {formData.name}.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm border border-rose-100">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 focus:bg-white text-zinc-800 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 focus:bg-white text-zinc-800 outline-none transition-all"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Account Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 focus:bg-white text-zinc-800 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            
                            <div className="md:col-span-2 pt-4 border-t border-zinc-100">
                                <h4 className="text-sm font-bold text-zinc-900 mb-4">Change Password</h4>
                                <p className="text-xs text-zinc-500 mb-4">Leave these fields blank if you do not wish to change the password.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">New Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 focus:bg-white text-zinc-800 outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="password_confirmation"
                                            value={formData.password_confirmation}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 focus:bg-white text-zinc-800 outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100">
                            <Link 
                                to="/customers"
                                className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl transition-all shadow-sm disabled:opacity-70"
                            >
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
