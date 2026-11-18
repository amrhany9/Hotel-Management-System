export type UserRole = 'Admin' | 'FrontDesk';

export interface StaffUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface CreateStaffRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface HotelSettings {
  hotelName: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  demoMode: boolean;
  demoResetHourUtc: number;
}
