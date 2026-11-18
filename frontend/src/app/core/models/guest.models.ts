export interface Guest {
  id: number;
  fullName: string;
  phone: string;
  email?: string | null;
  idNumber?: string | null;
  totalStays: number;
  totalPaid: number;
  lastStay?: string | null;
  createdAt: string;
}
