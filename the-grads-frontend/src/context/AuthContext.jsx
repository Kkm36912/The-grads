import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  

  // Set default auth header for all future requests
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);


  // Function to get the freshest data from the backend
  const fetchProfile = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    // 🔥 THE FIX: Only trigger the full-screen loader if the user isn't loaded yet!
    // If they are already playing, do this silently in the background.
    if (!user) {
      setLoading(true); 
    }
    
    try {
      const res = await fetch('https://the-grads.onrender.com/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
      } else {
        logout(); 
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false); 
    }
  };
  // Fetch profile whenever token changes
  useEffect(() => {
    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('https://the-grads.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user};
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Server error' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password) => {
    setLoading(true);
    try {
      const response = await fetch('https://the-grads.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        // Auto-login after successful registration
        return await login(email, password);
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Server error' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token'); // 🔥 INSTANTLY NUKE THE TOKEN
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, fetchProfile, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};