import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserData {
  fullname: string;
  gender: string;
  email: {
    email_address: string;
    verified: boolean;
  };
  phone_number: string;
  username: string;
  dob: string;
  address: {
    city: string;
    district: string;
    ward: string;
    description: string;
  };
}

interface UserContextType {
  userData: UserData | null;
  isLoading: boolean;
  fetchUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        console.error('No auth token found');
        setIsLoading(false);
        return;
      }
      
      const userId = '2f94020b-d56e-4c40-98a9-7ecb99a8184a';
      
      const response = await fetch(`http://localhost:3000/api/v1/customer/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setUserData(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ userData, isLoading, fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}