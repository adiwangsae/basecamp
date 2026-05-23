/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, SystemNotification } from "../types";
import { LucideIcon } from "./LucideIcon";

interface HeaderProps {
  user: User;
  currentPage: string;
  setPage: (p: string) => void;
  notifs: SystemNotification[];
  setNotifs: React.Dispatch<React.SetStateAction<SystemNotification[]>>;
  handleLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentPage,
  setPage,
  notifs,
  setNotifs,
  handleLogout,
}) => {
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const adminMenuItems = [
    { key: "admin_dashboard", label: "Dashboard", shortLabel: "Dashboard", icon: "Activity" },
    { key: "admin_items", label: "Gudang Barang", shortLabel: "Gudang", icon: "Package" },
    { key: "admin_verifications", label: "Verifikasi Order", shortLabel: "Verif", icon: "Shield" },
    { key: "admin_history", label: "Histori & Laba", shortLabel: "History", icon: "History" },
  ];

  const customerMenuItems = [
    { key: "customer_catalog", label: "Katalog Alat", shortLabel: "Katalog", icon: "Tent" },
    { key: "customer_bookings", label: "Booking Saya", shortLabel: "Booking", icon: "Calendar" },
    { key: "customer_profile", label: "Profil & ID", shortLabel: "Akun", icon: "User" },
  ];

  const menuItems = user.role === "admin" ? adminMenuItems : customerMenuItems;

  const handleMarkAsRead = (id: number) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-3 z-50 w-full max-w-7xl mx-auto px-4 sm:px-6">
      <div className="liquid-glass rounded-2xl px-4 sm:px-6 h-16 flex items-center justify-between shadow-2xl relative">
        
        {/* Branding Logo */}
        <div 
          onClick={() => setPage(user.role === "admin" ? "admin_dashboard" : "customer_catalog")}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center border border-emerald-400/20 group-hover:scale-105 transition-transform shadow-lg shadow-emerald-950/40">
            <LucideIcon name="Tent" className="text-emerald-100" size={18} />
          </div>
          <div>
            <span className="heading-caps text-base sm:text-lg md:text-xl font-black text-white tracking-wider sm:tracking-widest block leading-none mt-1">
              BASECAMP
            </span>
            <span className="text-[8px] sm:text-[10px] text-emerald-400 font-bold tracking-wider uppercase block mt-1">
              OUTDOOR RENTAL
            </span>
          </div>
        </div>

        {/* Desktop Central Navigation Menu */}
        <nav className="hidden md:flex items-center gap-1.5">
          {menuItems.map((item) => {
            const isActive = currentPage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all uppercase heading-caps border ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-inner"
                    : "text-[#8ca38a] hover:text-white hover:bg-white/5 border-transparent"
                }`}
              >
                <LucideIcon name={item.icon} size={15} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Widgets */}
        <div className="flex items-center gap-3.5">
          
          {/* Notification Button Module */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifPanel(!showNotifPanel);
                if (mobileOpen) setMobileOpen(false);
              }}
              className={`p-2.5 rounded-xl border transition-all relative ${
                showNotifPanel 
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                  : "bg-white/5 border-white/5 text-[#8ca38a] hover:text-white"
              }`}
            >
              <LucideIcon name="Bell" size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-black flex items-center justify-center animate-pulse border border-emerald-950">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Micro panel with gorgeous design */}
            {showNotifPanel && (
              <div className="fixed inset-x-4 top-24 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 w-auto sm:w-80 bg-[#0a140c]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/2">
                  <span className="font-bold text-sm text-white flex items-center gap-2 uppercase tracking-wider heading-caps">
                    <LucideIcon name="Bell" className="text-amber-400" size={15} />
                    Pemberitahuan
                  </span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 px-2 py-1 rounded"
                    >
                      BACA SEMUA
                    </button>
                  )}
                </div>
                
                <div className="max-h-[320px] overflow-y-auto divide-y divide-white/5">
                  {notifs.length === 0 ? (
                    <div className="py-8 text-center text-[#8ca38a] text-xs">
                      Tidak ada notifikasi baru
                    </div>
                  ) : (
                    notifs.map((n) => (
                      <div 
                        key={n.id}
                        onClick={() => handleMarkAsRead(n.id)}
                        className={`p-3.5 cursor-pointer transition-colors hover:bg-white/5 flex gap-2.5 ${
                          n.read ? "opacity-60" : "bg-emerald-500/[0.03]"
                        }`}
                      >
                        <div className="mt-0.5">
                          {n.type === "danger" && <LucideIcon name="AlertTriangle" size={14} className="text-red-400" />}
                          {n.type === "warn" && <LucideIcon name="Clock" size={14} className="text-amber-400" />}
                          {n.type === "success" && <LucideIcon name="CheckCircle" size={14} className="text-emerald-400" />}
                          {n.type === "info" && <LucideIcon name="Info" size={14} className="text-blue-400" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-stone-200 leading-relaxed font-semibold">
                            {n.text}
                          </p>
                          <span className="text-[9px] text-[#8ca38a] mt-1 block">
                            {n.created_at}
                          </span>
                        </div>
                        {!n.read && (
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 self-center" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Info Pill */}
          <div className="hidden sm:flex items-center gap-2.5 bg-white/5 border border-white/5 pl-2.5 pr-3.5 py-1.5 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-emerald-950 font-black flex items-center justify-center text-sm uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold text-white max-w-[100px] truncate">
                {user.name}
              </span>
              <span className={`block text-[9px] font-black uppercase tracking-wider ${
                user.role === "admin" ? "text-amber-400" : "text-emerald-400"
              }`}>
                {user.role}
              </span>
            </div>
          </div>

          {/* Logout Trigger button */}
          <button
            onClick={handleLogout}
            className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all"
            title="Keluar"
          >
            <LucideIcon name="LogOut" size={18} />
          </button>

        </div>
      </div>

      {/* Mobile Floating Bottom Bar Menu with notch and bottom navigation alignment */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-[#0a140c]/92 backdrop-blur-2xl border border-white/10 rounded-2xl h-16 flex items-center justify-around px-1 shadow-[0_10px_35px_rgba(0,0,0,0.85)] border-t border-t-white/15">
        {menuItems.map((item) => {
          const isActive = currentPage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                setPage(item.key);
              }}
              className="flex flex-col items-center justify-center flex-1 h-full relative transition-all active:scale-95"
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive
                    ? "text-emerald-400 scale-110"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <LucideIcon name={item.icon} size={18} />
              </div>
              <span
                className={`text-[9.5px] font-bold tracking-wider uppercase transition-all ${
                  isActive ? "text-emerald-400 font-extrabold" : "text-stone-500"
                }`}
              >
                {item.shortLabel}
              </span>
              {isActive && (
                <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
export default Header;
