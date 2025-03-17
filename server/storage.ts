import { type User, type DeviceData, type Alert } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.SessionStore;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id">): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  
  // Device data methods
  getLatestDeviceData(userId: number): Promise<DeviceData | undefined>;
  updateDeviceData(userId: number, data: Partial<DeviceData>): Promise<DeviceData>;
  
  // Alert methods
  createAlert(alert: Omit<Alert, "id">): Promise<Alert>;
  getAlerts(userId: number): Promise<Alert[]>;
  resolveAlert(alertId: number): Promise<Alert>;
  
  // Settings methods
  updateDeviceSettings(userId: number, settings: { stressThreshold?: number; shockEnabled?: boolean }): Promise<User>;
  addEmergencyContact(userId: number, contact: { name: string; phone: string; relationship: string }): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private deviceData: Map<number, DeviceData>;
  private alerts: Map<number, Alert>;
  private currentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.deviceData = new Map();
    this.alerts = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    const id = this.currentId++;
    const newUser = { ...user, id } as User;
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }

  async getLatestDeviceData(userId: number): Promise<DeviceData | undefined> {
    return Array.from(this.deviceData.values())
      .filter(data => data.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }

  async updateDeviceData(userId: number, data: Partial<DeviceData>): Promise<DeviceData> {
    const id = this.currentId++;
    const newData = {
      id,
      userId,
      timestamp: new Date(),
      ...data
    } as DeviceData;
    
    this.deviceData.set(id, newData);
    return newData;
  }

  async createAlert(alert: Omit<Alert, "id">): Promise<Alert> {
    const id = this.currentId++;
    const newAlert = { ...alert, id } as Alert;
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async getAlerts(userId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async resolveAlert(alertId: number): Promise<Alert> {
    const alert = this.alerts.get(alertId);
    if (!alert) throw new Error("Alert not found");
    
    const updated = { ...alert, resolved: true };
    this.alerts.set(alertId, updated);
    return updated;
  }

  async updateDeviceSettings(userId: number, settings: { stressThreshold?: number; shockEnabled?: boolean }): Promise<User> {
    return this.updateUser(userId, settings);
  }

  async addEmergencyContact(userId: number, contact: { name: string; phone: string; relationship: string }): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const contacts = [...(user.emergencyContacts || []), contact];
    return this.updateUser(userId, { emergencyContacts: contacts });
  }
}

export const storage = new MemStorage();
