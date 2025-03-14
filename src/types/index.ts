
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age?: number;
  gender?: string;
  userId: string;
}

export interface BloodPressureRecord {
  id: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  timestamp: string;
  notes?: string;
  userId: string;
  personId: string; // Either the user's ID or a family member's ID
  personType: 'user' | 'family'; // To distinguish between user and family member records
}

export interface BloodPressureStats {
  averageSystolic: number;
  averageDiastolic: number;
  averagePulse: number;
  totalRecords: number;
  normalReadings: number;
  elevatedReadings: number;
  stage1Readings: number;
  stage2Readings: number;
  crisisReadings: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
