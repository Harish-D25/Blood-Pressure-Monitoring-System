
import React, { createContext, useContext, useState, useEffect } from "react";
import { BloodPressureRecord, FamilyMember, User } from "@/types";
import { useAuth } from "./AuthContext";
import { generateMockBPRecords } from "@/lib/bp-utils";
import { useToast } from "@/components/ui/use-toast";

interface DataContextType {
  bpRecords: BloodPressureRecord[];
  familyMembers: FamilyMember[];
  addBPRecord: (record: Omit<BloodPressureRecord, "id" | "userId">) => void;
  deleteBPRecord: (id: string) => void;
  addFamilyMember: (member: Omit<FamilyMember, "id" | "userId">) => void;
  updateFamilyMember: (id: string, data: Partial<FamilyMember>) => void;
  deleteFamilyMember: (id: string) => void;
  getPersonName: (personId: string, personType: 'user' | 'family') => string;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [bpRecords, setBpRecords] = useState<BloodPressureRecord[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Generate a unique ID with timestamp and random string
  const generateUniqueId = (prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  // Load data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Loading data for user:", user.id);
      
      // Load family members from local storage or initialize with mock data
      const storedFamilyMembers = localStorage.getItem(`bp_family_${user.id}`);
      if (storedFamilyMembers) {
        const parsedMembers = JSON.parse(storedFamilyMembers);
        console.log("Loaded family members:", parsedMembers.length);
        setFamilyMembers(parsedMembers);
      } else {
        // Add some mock family members
        const mockFamilyMembers: FamilyMember[] = [
          {
            id: generateUniqueId('family'),
            name: "Sarah Doe",
            relationship: "Spouse",
            age: 35,
            gender: "Female",
            userId: user.id
          },
          {
            id: generateUniqueId('family'),
            name: "Michael Doe",
            relationship: "Son",
            age: 12,
            gender: "Male",
            userId: user.id
          }
        ];
        console.log("Created mock family members:", mockFamilyMembers.length);
        setFamilyMembers(mockFamilyMembers);
        localStorage.setItem(`bp_family_${user.id}`, JSON.stringify(mockFamilyMembers));
      }

      // Load BP records from local storage or initialize with mock data
      const storedBPRecords = localStorage.getItem(`bp_records_${user.id}`);
      if (storedBPRecords) {
        const parsedRecords = JSON.parse(storedBPRecords);
        console.log("Loaded BP records:", parsedRecords.length);
        setBpRecords(parsedRecords);
      } else {
        // Generate some mock records for the user
        const userRecords = generateMockBPRecords(user.id, user.id, 'user', 20);
        console.log("Generated user BP records:", userRecords.length);
        
        // Generate mock records for family members
        let allRecords = [...userRecords];
        
        const mockFamilyMembers = JSON.parse(localStorage.getItem(`bp_family_${user.id}`) || "[]");
        console.log("Generating records for family members:", mockFamilyMembers.length);
        
        mockFamilyMembers.forEach((member: FamilyMember) => {
          const memberRecords = generateMockBPRecords(user.id, member.id, 'family', 10);
          console.log(`Generated ${memberRecords.length} records for family member ${member.name}`);
          allRecords = [...allRecords, ...memberRecords];
        });
        
        setBpRecords(allRecords);
        localStorage.setItem(`bp_records_${user.id}`, JSON.stringify(allRecords));
      }
      
      setLoading(false);
    } else {
      setBpRecords([]);
      setFamilyMembers([]);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Update localStorage when data changes
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem(`bp_records_${user.id}`, JSON.stringify(bpRecords));
    }
  }, [bpRecords, isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem(`bp_family_${user.id}`, JSON.stringify(familyMembers));
    }
  }, [familyMembers, isAuthenticated, user]);

  const addBPRecord = (record: Omit<BloodPressureRecord, "id" | "userId">) => {
    if (!user) return;

    const newRecord: BloodPressureRecord = {
      ...record,
      id: generateUniqueId('bp'),
      userId: user.id
    };

    setBpRecords(prev => [newRecord, ...prev]);
    toast({
      title: "Record added",
      description: "Blood pressure record has been added successfully"
    });
  };

  const deleteBPRecord = (id: string) => {
    setBpRecords(prev => prev.filter(record => record.id !== id));
    toast({
      title: "Record deleted",
      description: "Blood pressure record has been deleted"
    });
  };

  const addFamilyMember = (member: Omit<FamilyMember, "id" | "userId">) => {
    if (!user) return;

    const newMember: FamilyMember = {
      ...member,
      id: generateUniqueId('family'),
      userId: user.id
    };

    setFamilyMembers(prev => [...prev, newMember]);
    toast({
      title: "Member added",
      description: `${member.name} has been added to your family members`
    });
  };

  const updateFamilyMember = (id: string, data: Partial<FamilyMember>) => {
    setFamilyMembers(prev => 
      prev.map(member => 
        member.id === id ? { ...member, ...data } : member
      )
    );
    toast({
      title: "Member updated",
      description: "Family member information has been updated"
    });
  };

  const deleteFamilyMember = (id: string) => {
    setFamilyMembers(prev => prev.filter(member => member.id !== id));
    // Also delete all BP records for this family member
    setBpRecords(prev => 
      prev.filter(record => !(record.personId === id && record.personType === 'family'))
    );
    toast({
      title: "Member deleted",
      description: "Family member and associated records have been deleted"
    });
  };

  const getPersonName = (personId: string, personType: 'user' | 'family'): string => {
    if (personType === 'user' && user && user.id === personId) {
      return user.name + " (Me)";
    }
    
    if (personType === 'family') {
      const member = familyMembers.find(m => m.id === personId);
      return member ? member.name : "Unknown";
    }
    
    return "Unknown";
  };

  return (
    <DataContext.Provider
      value={{
        bpRecords,
        familyMembers,
        addBPRecord,
        deleteBPRecord,
        addFamilyMember,
        updateFamilyMember,
        deleteFamilyMember,
        getPersonName,
        loading
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
