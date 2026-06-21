import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          setToken('');
          setUser(null);
          window.location.href = '/?expired=true';
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  useEffect(() => {
    if (token) {
      axios.get(`${(import.meta.env.PROD ? "" : "http://localhost:5001")}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUser(res.data);
      })
      .catch((error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          setToken('');
          localStorage.removeItem('token');
        }
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password, turnstileToken) => {
    const res = await axios.post(`${(import.meta.env.PROD ? "" : "http://localhost:5001")}/api/auth/login`, { email, password, turnstileToken });
    setToken(res.data.token);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const register = async (name, email, password, role = 'agent', turnstileToken) => {
    const res = await axios.post(`${(import.meta.env.PROD ? "" : "http://localhost:5001")}/api/auth/register`, { name, email, password, role, turnstileToken });
    if (res.data.token) {
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    }
    return res;
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};
