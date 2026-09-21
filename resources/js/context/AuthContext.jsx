import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../lib/axios';

const AuthContext = createContext({
    user: null,
    loading: true,
    login: async () => {},
    register: async () => {},
    logout: async () => {},
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const csrf = () => axios.get('/sanctum/csrf-cookie');

    const getUser = async () => {
        try {
            const response = await axios.get('/api/user');
            setUser(response.data.user);
        } catch (error) {
            setUser(null);
        }
        setLoading(false);
    };

    const login = async (credentials) => {
        await csrf();
        await axios.post('/api/login', credentials);
        await getUser();
    };

    const register = async (data) => {
        await csrf();
        await axios.post('/api/register', data);
        await getUser();
    };

    const logout = async () => {
        await axios.post('/api/logout');
        setUser(null);
    };

    useEffect(() => {
        getUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
