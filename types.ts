
export type Role = 'none' | 'employee' | 'admin';

export interface RegistrationData {
  id: string;
  name: string;
  employeeId: string; // 工号
  contactInfo: string; // 联系方式
  dietary: string; // 饮食忌口
  activityInterest: string; // 自建活动报名
  carpool: 'Need a ride' | 'Offering a ride' | 'Self-drive';
  timestamp: string;
}

export type ViewState = 'gateway' | 'home' | 'form' | 'success' | 'admin' | 'my-status';
