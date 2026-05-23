/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Booking } from "../types";
import { LucideIcon } from "./LucideIcon";

interface CustomerProfileProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  bookings: Booking[];
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({
  user,
  setUser,
  bookings,
  showToast,
}) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [email, setEmail] = useState(user.email);
  const [pass, setPass] = useState(user.pass);

  const myBookings = bookings.filter((b) => b.custId === user.id);
  const activeCount = myBookings.filter((b) => b.status === "rented").length;
  const completedCount = myBookings.filter((b) => b.status === "completed").length;
  const lateCount = myBookings.filter((b) => b.status === "late").length;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !pass) {
      showToast("Gagal: Nama, email, dan password wajib diisi!", "error");
      return;
    }

    const updatedUser: User = {
      ...user,
      name,
      phone,
      email,
      pass,
    };

    setUser(updatedUser);
    
    // Save locally
    localStorage.setItem("bc_active_user", JSON.stringify(updatedUser));
    showToast("Profil Anda berhasil diperbarui!", "success");
  };

  const statCards = [
    { label: "Total Booking", value: myBookings.length, icon: "Calendar", color: "text-blue-400" },
    { label: "Aktif Disewa", value: activeCount, icon: "Flame", color: "text-amber-500" },
    { label: "Selesai", value: completedCount, icon: "CheckCircle", color: "text-emerald-400" },
    { label: "Overdue", value: lateCount, icon: "AlertTriangle", color: "text-red-400" },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
      
      {/* Intro block */}
      <div className="flex items-center gap-2">
        <h1 className="heading-jumbo text-3xl sm:text-4xl text-white tracking-wide">
          Profil Saya
        </h1>
        <div className="group relative hidden sm:block">
          <LucideIcon name="Info" size={16} className="text-[#8ca38a] cursor-pointer" />
          <div className="absolute left-0 top-6 w-56 p-2.5 bg-[#0a130c]/95 backdrop-blur-md border border-white/10 rounded-xl text-[10px] text-stone-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-20">
            Kelola detail kontak dan akun Anda.
          </div>
        </div>
      </div>

      {/* Main card with stats and avatar */}
      <div className="glass-card-glow border border-white/5 rounded-2xl p-6 space-y-6">
        
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 text-stone-100 font-black flex items-center justify-center text-3xl shadow-xl shadow-emerald-950/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h3 className="heading-caps text-xl font-extrabold text-white">
              {user.name}
            </h3>
            <p className="text-xs text-[#8ca38a] font-semibold">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider">
              Pelanggan Terverifikasi
            </span>
          </div>
        </div>

        {/* Dashboard microstats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
          {statCards.map((st) => (
            <div key={st.label} className="bg-white/2 border border-white/5 rounded-xl p-3 text-center">
              <span className={`heading-jumbo text-2xl font-black block ${st.color}`}>
                {st.value}
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#8ca38a] block mt-1">
                {st.label}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Profile Form Edit info fields */}
      <div className="glass-card-glow border border-white/5 rounded-2xl p-6 text-left">
        <h4 className="font-bold text-sm text-stone-200 uppercase heading-caps tracking-wider flex items-center gap-2 mb-4">
          <LucideIcon name="User" className="text-emerald-400" size={15} />
          Detail Akun & Kontak
        </h4>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          
          <div>
            <label className="text-[11px] font-bold text-[#8ca38a] uppercase tracking-wider block mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-stone-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[#8ca38a] uppercase tracking-wider block mb-1">
                Nomor Handphone / Whatsapp
              </label>
              <input
                type="text"
                placeholder="Contoh: 08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-stone-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#8ca38a] uppercase tracking-wider block mb-1">
                Email Aktif
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-stone-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#8ca38a] uppercase tracking-wider block mb-1">
              Kunci Password
            </label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full bg-stone-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold py-3 rounded-xl text-xs uppercase tracking-widest transition-all"
            >
              SIMPAN PERUBAHAN DATA
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
export default CustomerProfile;
