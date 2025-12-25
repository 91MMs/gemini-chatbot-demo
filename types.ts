
export type Role = 'none' | 'employee' | 'admin';

export interface RegistrationData {
  id: string;
  name: string;
  department: string;
  dietary: 'None' | 'Vegetarian' | 'Halal' | 'Allergy';
  tshirtSize: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  carpool: 'Need a ride' | 'Offering a ride' | 'Self-drive';
  emergencyContact: string;
  timestamp: string;
}

export type ViewState = 'gateway' | 'home' | 'form' | 'success' | 'admin' | 'my-status';
