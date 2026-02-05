import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario, mockUsuarios, mockRoles } from '../../../shared/lib/mockData';

interface AuthContextType {
  user: Usuario | null;
  roleName: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Partial<Usuario>) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [roleName, setRoleName] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved session
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        const role = mockRoles.find(r => r.id_rol === userData.id_rol);
        setRoleName(role?.nombre || null);
      }
    } catch (e) {
      // ignore malformed saved user
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = mockUsuarios.find(
      u => u.email === email && u.password === password && u.estado === 'activo'
    );

    if (foundUser) {
      const userToSave = { ...foundUser };
      delete (userToSave as any).password; // Don't save password
      setUser(userToSave as Usuario);
      
      const role = mockRoles.find(r => r.id_rol === foundUser.id_rol);
      setRoleName(role?.nombre || null);
      
      localStorage.setItem('user', JSON.stringify(userToSave));
      return true;
    }
    
    return false;
  };

  const register = async (userData: Partial<Usuario>): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if email already exists
    const existingUser = mockUsuarios.find(u => u.email === userData.email);
    if (existingUser) {
      return false;
    }

    // In a real app, this would save to backend
    // For now, just simulate success
    return true;
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = mockUsuarios.find(u => u.email === email);
    return !!foundUser;
  };

  const logout = () => {
    setUser(null);
    setRoleName(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roleName,
        login,
        register,
        logout,
        resetPassword,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
