import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { FullBusiness } from '../types';
import { useAuth } from './AuthContext';

interface BusinessContextType {
  businesses: FullBusiness[];
  activeBusiness: FullBusiness | null;
  loading: boolean;
  setActiveBusiness: (b: FullBusiness) => void;
  fetchBusinesses: () => Promise<void>;
  createBusiness: (data: any) => Promise<FullBusiness>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [businesses, setBusinesses] = useState<FullBusiness[]>([]);
  const [activeBusiness, setActiveBusinessState] = useState<FullBusiness | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBusinesses = async () => {
    if (!token || !user) {
      setBusinesses([]);
      setActiveBusinessState(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/business');
      const list: FullBusiness[] = res.data;
      setBusinesses(list);

      // Restore active business selection or pick first
      const savedActiveId = localStorage.getItem('local_seo_active_business_id');
      const matched = list.find(b => b.business.id === savedActiveId);
      if (matched) {
        setActiveBusinessState(matched);
      } else if (list.length > 0) {
        setActiveBusinessState(list[0]);
        localStorage.setItem('local_seo_active_business_id', list[0].business.id);
      } else {
        setActiveBusinessState(null);
      }
    } catch (err) {
      console.error('Error fetching businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [user, token]);

  const setActiveBusiness = (b: FullBusiness) => {
    setActiveBusinessState(b);
    localStorage.setItem('local_seo_active_business_id', b.business.id);
  };

  const createBusiness = async (formData: any): Promise<FullBusiness> => {
    const res = await api.post('/business', formData);
    const newBiz: FullBusiness = res.data;
    setBusinesses(prev => [...prev, newBiz]);
    setActiveBusiness(newBiz);
    return newBiz;
  };

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        activeBusiness,
        loading,
        setActiveBusiness,
        fetchBusinesses,
        createBusiness,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
