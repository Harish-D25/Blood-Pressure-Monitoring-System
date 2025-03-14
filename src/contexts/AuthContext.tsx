
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (userData: { name: string; email: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data
const MOCK_USERS = [
  {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    password: "password123", // In a real app, this would be hashed
    createdAt: new Date().toISOString()
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });
  const { toast } = useToast();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("bp_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true
        });
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("bp_user");
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // First check mock users
      const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      
      if (mockUser) {
        const { password: _, ...userWithoutPassword } = mockUser;
        
        // Save user data to localStorage
        localStorage.setItem("bp_user", JSON.stringify(userWithoutPassword));
        
        // Update state
        setAuthState({
          user: userWithoutPassword as User,
          isAuthenticated: true
        });
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${mockUser.name}!`,
        });
        return;
      }
      
      // Also check localStorage for registered users
      const storedUsers = localStorage.getItem("bp_registered_users");
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const user = users.find((u: any) => u.email === email && u.password === password);
        
        if (user) {
          const { password: _, ...userWithoutPassword } = user;
          
          // Save user data to localStorage
          localStorage.setItem("bp_user", JSON.stringify(userWithoutPassword));
          
          // Update state
          setAuthState({
            user: userWithoutPassword as User,
            isAuthenticated: true
          });
          
          toast({
            title: "Login successful",
            description: `Welcome back, ${user.name}!`,
          });
          return;
        }
      }
      
      // If no user found, throw error
      throw new Error("Invalid credentials");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive"
      });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // Check if email already exists in mock users
      const existingMockUser = MOCK_USERS.find(u => u.email === email);
      if (existingMockUser) {
        toast({
          title: "Registration failed",
          description: "Email already in use",
          variant: "destructive"
        });
        throw new Error("Email already in use");
      }
      
      // Check if email already exists in registered users
      let registeredUsers: any[] = [];
      const storedUsers = localStorage.getItem("bp_registered_users");
      if (storedUsers) {
        registeredUsers = JSON.parse(storedUsers);
        const existingUser = registeredUsers.find((u: any) => u.email === email);
        if (existingUser) {
          toast({
            title: "Registration failed",
            description: "Email already in use",
            variant: "destructive"
          });
          throw new Error("Email already in use");
        }
      }
      
      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        createdAt: new Date().toISOString()
      };
      
      // Add to registered users
      registeredUsers.push(newUser);
      localStorage.setItem("bp_registered_users", JSON.stringify(registeredUsers));
      
      // Log in the new user
      const { password: _, ...userWithoutPassword } = newUser;
      
      localStorage.setItem("bp_user", JSON.stringify(userWithoutPassword));
      
      setAuthState({
        user: userWithoutPassword as User,
        isAuthenticated: true
      });
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${name}!`,
      });
    } catch (error) {
      if ((error as Error).message !== "Email already in use") {
        toast({
          title: "Registration failed",
          description: "An error occurred during registration",
          variant: "destructive"
        });
      }
      throw error;
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false
    });
    localStorage.removeItem("bp_user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const updateUserProfile = (userData: { name: string; email: string }) => {
    if (!authState.user) {
      throw new Error("User not authenticated");
    }
    
    const updatedUser = {
      ...authState.user,
      ...userData
    };
    
    // Update in localStorage
    localStorage.setItem("bp_user", JSON.stringify(updatedUser));
    
    // Update in registered users if it exists there
    const storedUsers = localStorage.getItem("bp_registered_users");
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const userIndex = users.findIndex((u: any) => u.id === updatedUser.id);
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          ...userData
        };
        localStorage.setItem("bp_registered_users", JSON.stringify(users));
      }
    }
    
    // Update the local state
    setAuthState({
      ...authState,
      user: updatedUser
    });
    
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
