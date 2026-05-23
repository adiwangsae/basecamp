/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = "admin" | "customer";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  pass: string;
  phone?: string;
}

export type ItemStatus = "tersedia" | "dipinjam" | "maintenance" | "rusak";

export interface Item {
  id: number;
  name: string;
  cat: string;
  price: number;
  stock: number;
  avail: number;
  iconName: string; // Map to dynamic Lucide icons instead of emojis
  status: ItemStatus;
  desc: string;
}

export type BookingStatus =
  | "pending_verification"
  | "verified"
  | "ready_pickup"
  | "rented"
  | "completed"
  | "late"
  | "cancelled";

export interface Booking {
  id: string;
  custId: number;
  custName: string;
  items: string;
  qty: number;
  start: string;
  end: string;
  days: number;
  status: BookingStatus;
  total: number;
  idUploaded: boolean;
  created: string;
  note: string;
  denda: number | null;
  conditionBefore?: string;
  conditionAfter?: string;
  imgBefore?: string;
  imgAfter?: string;
}

export interface SystemNotification {
  id: number;
  text: string;
  type: "info" | "warn" | "success" | "danger";
  read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user: string;
  role: string;
  action: string;
  timestamp: string;
}
