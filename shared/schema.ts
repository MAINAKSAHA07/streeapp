import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  age: integer("age"),
  gender: text("gender"),
  medicalConditions: text("medical_conditions"),
  emergencyContacts: json("emergency_contacts").$type<{
    name: string;
    phone: string;
    relationship: string;
  }[]>().default([]),
  stressThreshold: integer("stress_threshold").default(80),
  safeZones: json("safe_zones").$type<{
    name: string;
    lat: number;
    lng: number;
    radius: number;
  }[]>().default([]),
  notificationSettings: json("notification_settings").$type<{
    lowBattery: boolean;
    disconnection: boolean;
    highStress: boolean;
    geofencing: boolean;
  }>().default({
    lowBattery: true,
    disconnection: true,
    highStress: true,
    geofencing: true
  }),
  theme: text("theme").default("light")
});

export const deviceData = pgTable("device_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  batteryLevel: integer("battery_level").notNull(),
  heartRate: integer("heart_rate"),
  stressLevel: integer("stress_level"),
  location: json("location").$type<{
    lat: number;
    lng: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
  }>(),
  isConnected: boolean("is_connected").notNull().default(true),
  shockEnabled: boolean("shock_enabled").notNull().default(false)
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  level: integer("level").notNull(),
  location: json("location").$type<{
    lat: number;
    lng: number;
  }>(),
  resolved: boolean("resolved").notNull().default(false),
  details: text("details")
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  age: true,
  gender: true,
  medicalConditions: true,
  emergencyContacts: true
});

export const insertDeviceDataSchema = createInsertSchema(deviceData);
export const insertAlertSchema = createInsertSchema(alerts);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type DeviceData = typeof deviceData.$inferSelect;
export type Alert = typeof alerts.$inferSelect;