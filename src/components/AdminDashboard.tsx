/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Item, Booking, ActivityLog, BookingStatus } from "../types";
import { LucideIcon } from "./LucideIcon";
import { MONTHS_DATA } from "../data";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface AdminDashboardProps {
  items: Item[];
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  activities: ActivityLog[];
  addActivity: (action: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  setPage: (p: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  items,
  bookings,
  setBookings,
  activities,
  addActivity,
  showToast,
  setPage,
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanTerm, setScanTerm] = useState("");
  const [scanResult, setScanResult] = useState<Booking | null>(null);

  const handleQueryScan = (code: string) => {
    const term = code.trim().toUpperCase();
    const found = bookings.find((b) => b.id.toUpperCase() === term);
    if (found) {
      setScanResult(found);
      showToast(`QR Code Terbaca! Reservasi ${found.id} An. ${found.custName}`, "success");
    } else {
      setScanResult(null);
      showToast(`ID booking "${term}" tidak ditemukan di sistem.`, "error");
    }
  };

  const updateScanStatus = (newStatus: BookingStatus) => {
    if (!scanResult) return;
    setBookings((prev) =>
      prev.map((b) => (b.id === scanResult.id ? { ...b, status: newStatus } : b))
    );
    addActivity(`Admin memproses transaksi ${scanResult.id} menjadi status [${newStatus}] via scan QR code digital`);
    showToast(`Status [${scanResult.id}] berhasil diupdate ke: ${newStatus}`, "success");
    setScanResult(null);
    setIsScannerOpen(false);
  };

  const rupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fmtDate = (d: string) => {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Calculations
  const totalItemsCount = items.length;
  const activeRentalsCount = bookings.filter((b) => b.status === "rented").length;
  const pendingCount = bookings.filter((b) => b.status === "pending_verification").length;
  const lateCount = bookings.filter((b) => b.status === "late").length;

  const totalRevenue = bookings
    .filter((b) => ["completed", "rented", "late"].includes(b.status))
    .reduce((sum, b) => sum + b.total, 0);

  const stats = [
    {
      label: "TOTAL BARANG",
      value: totalItemsCount,
      iconName: "Package",
      description: "Item unit terdaftar",
      color: "text-blue-400",
      borderColor: "border-neon-blue",
      onClick: () => setPage("admin_items"),
    },
    {
      label: "SEDANG DISEWA",
      value: activeRentalsCount,
      iconName: "Flame",
      description: "Dalam pemakaian customer",
      color: "text-amber-500",
      borderColor: "border-neon-gold",
      onClick: () => setPage("admin_verifications"),
    },
    {
      label: "VERIFIKASI PENDING",
      value: pendingCount,
      iconName: "Clock",
      description: "Menunggu approval (1x24 jam)",
      color: "text-red-400",
      borderColor: "border-red-500/20",
      onClick: () => setPage("admin_verifications"),
    },
    {
      label: "TELAT BALIK",
      value: lateCount,
      iconName: "AlertTriangle",
      description: "Terlambat & denda aktif",
      color: "text-[#ff5555]",
      borderColor: "border-red-900/30",
      onClick: () => setPage("admin_verifications"),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in px-4 sm:px-0">
      
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <h1 className="heading-jumbo text-3xl sm:text-4xl text-white tracking-wide">
            Dashboard Utama
          </h1>
          <div className="group relative hidden sm:block">
            <LucideIcon name="Info" size={16} className="text-[#8ca38a] cursor-pointer" />
            <div className="absolute left-0 top-6 w-56 p-2.5 bg-[#0a130c]/95 backdrop-blur-md border border-white/10 rounded-xl text-[10px] text-stone-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-10">
              Ringkasan performa dan aliran barang sewa secara real-time.
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setIsScannerOpen(true);
              setScanResult(null);
              setScanTerm("");
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-black px-4 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all font-sans w-full sm:w-auto"
          >
            <LucideIcon name="QrCode" size={15} />
            SCAN QR BASECAMP
          </button>

          <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.03)] px-4 py-3 rounded-xl border border-white/5 w-full sm:w-auto justify-center sm:justify-start">
            <LucideIcon name="Calendar" className="text-emerald-400" size={16} />
            <span className="text-xs font-bold text-stone-300">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Operational Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            onClick={stat.onClick}
            className={`glass-card-glow border rounded-2xl p-3 cursor-pointer flex justify-between items-start group ${stat.borderColor} w-full`}
          >
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black tracking-widest text-[#8ca38a] heading-caps">
                  {stat.label}
                </p>
                <h3 className={`heading-jumbo text-4xl mt-1.5 font-extrabold tracking-tight transition-transform group-hover:scale-105 ${stat.color}`}>
                  {stat.value}
                </h3>
              </div>
              <p className="text-[11px] text-stone-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {stat.description}
              </p>
            </div>
            <div className={`p-2.5 rounded-xl bg-white/5 border border-white/5 text-stone-400 group-hover:${stat.color} transition-colors`}>
              <LucideIcon name={stat.iconName} size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Laba Highlight Banner & Flow Shortcut */}
      <div className="relative glass-card-glow border border-emerald-500/10 rounded-2xl p-5 overflow-hidden">
        <div className="absolute top-0 right-0 bottom-0 left-0 bg-radial-[ellipse_at_top_right] from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase flex items-center gap-1.5">
              Pendapatan Sewa
              <div className="group relative hidden sm:inline-block">
                <LucideIcon name="Info" size={12} className="text-emerald-400/70 hover:text-emerald-400 cursor-pointer" />
                <div className="absolute left-0 top-4 w-48 p-2 bg-[#0a130c]/95 backdrop-blur-md border border-white/10 rounded-lg text-[10px] text-stone-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-10 font-normal normal-case tracking-normal">
                  Akumulasi dari transaksi aktif dan selesai.
                </div>
              </div>
            </span>
            <h2 className="heading-jumbo text-3xl sm:text-4xl text-white font-black leading-none tracking-tight">
              {rupiah(totalRevenue)}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage("admin_history")}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 font-bold px-4 py-4 rounded-xl text-xs uppercase heading-caps tracking-wide transition-all"
            >
              Cetak Transaksi
            </button>
            <button
              onClick={() => setPage("admin_verifications")}
              className="bg-emerald-500 hover:bg-emerald-600 border border-emerald-400/20 text-black font-extrabold px-5 py-4 rounded-xl text-xs uppercase heading-caps tracking-wide transition-all shadow-lg shadow-emerald-950/50"
            >
              Kelola Antrean Booking
            </button>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recharts BarChart */}
        <div className="glass-card-glow border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-sm text-stone-200 heading-caps tracking-wide flex items-center gap-2">
              <LucideIcon name="TrendingUp" className="text-emerald-400" size={15} />
              Grafik Volume Transaksi Bulanan
            </h4>
            <span className="text-[11px] text-[#8ca38a] font-bold">2026 Target</span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHS_DATA} barSize={25}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: "#8ca38a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false} 
                />
                <YAxis 
                  tick={{ fill: "#8ca38a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    background: "#0a130b", 
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px", 
                    color: "#eef5ec", 
                    fontSize: "12px" 
                  }} 
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar dataKey="tx" fill="#10b981" radius={[4, 4, 0, 0]} name="Order Sewa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recharts AreaChart with Area Gradient */}
        <div className="glass-card-glow border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-sm text-stone-200 heading-caps tracking-wide flex items-center gap-2">
              <LucideIcon name="DollarSign" className="text-amber-400" size={15} />
              Grafik Penghasilan Omset (Rp)
            </h4>
            <span className="text-[11px] text-[#8ca38a] font-bold">Grafik Laba</span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHS_DATA}>
                <defs>
                  <linearGradient id="revenueGlowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: "#8ca38a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false} 
                />
                <YAxis 
                  tick={{ fill: "#8ca38a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}jt`}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: "#0a130b", 
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px", 
                    color: "#eef5ec", 
                    fontSize: "12px" 
                  }}
                  formatter={(value) => [rupiah(Number(value)), "Omset Sewa"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="rev" 
                  stroke="#f59e0b" 
                  fillOpacity={1}
                  fill="url(#revenueGlowGradient)" 
                  strokeWidth={2.5} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid: Recent Bookings & System Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 glass-card-glow border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-stone-200 heading-caps tracking-wide flex items-center gap-2">
              <LucideIcon name="Calendar" className="text-emerald-400" size={15} />
              Daftar Booking Terbaru
            </h4>
            <button 
              onClick={() => setPage("admin_verifications")}
              className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider hover:underline"
            >
              LIHAT ANTREAN
            </button>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-[#8ca38a] font-bold uppercase tracking-wider heading-caps">
                  <th className="py-3 px-3">ID Order</th>
                  <th className="py-3 px-3">Pelanggan</th>
                  <th className="py-3 px-3">Item Alat</th>
                  <th className="py-3 px-3">Rentang Sewa</th>
                  <th className="py-3 px-3 text-right">Biaya</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-stone-200">
                {bookings.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-emerald-400 select-all">
                      {order.id}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-white">
                      {order.custName}
                    </td>
                    <td className="py-3.5 px-3 text-[#bdcfbb] max-w-[150px] truncate">
                      {order.items}
                    </td>
                    <td className="py-3.5 px-3 text-[#8ca38a]">
                      {fmtDate(order.start)} – {fmtDate(order.end)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-amber-400 uppercase heading-caps text-sm">
                      {rupiah(order.total)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-[9px] font-black uppercase border tracking-wider ${
                        order.status === "pending_verification" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        order.status === "verified" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        order.status === "ready_pickup" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                        order.status === "rented" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                        order.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        order.status === "late" ? "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse" :
                        "bg-stone-500/10 text-stone-400 border-stone-500/20"
                      }`}>
                        {order.status === "pending_verification" ? "Verif" :
                         order.status === "ready_pickup" ? "Ready" :
                         order.status === "rented" ? "Disewa" :
                         order.status === "completed" ? "Selesai" :
                         order.status === "late" ? "Telat" :
                         order.status === "verified" ? "Verif" : "Batal"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card-Stack List */}
          <div className="sm:hidden space-y-3">
            {bookings.slice(0, 5).map((order) => (
              <div key={order.id} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="font-bold text-emerald-400 select-all">{order.id}</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border tracking-wider ${
                    order.status === "pending_verification" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    order.status === "verified" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    order.status === "ready_pickup" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                    order.status === "rented" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                    order.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    order.status === "late" ? "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse" :
                    "bg-stone-500/10 text-stone-400 border-stone-500/20"
                  }`}>
                    {order.status === "pending_verification" ? "Verifikasi" :
                     order.status === "ready_pickup" ? "Siap Ambil" :
                     order.status === "rented" ? "Sedang Sewa" :
                     order.status === "completed" ? "Selesai" :
                     order.status === "late" ? "Telat" :
                     order.status === "verified" ? "Verif" : "Batal"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-300">
                  <div>
                    <span className="block text-[9px] text-[#8ca38a] font-bold uppercase tracking-wider">PELANGGAN</span>
                    <strong className="text-white text-[12px]">{order.custName}</strong>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] text-[#8ca38a] font-bold uppercase tracking-wider">HARGA TOTAL</span>
                    <strong className="text-amber-400 text-[12px] font-black">{rupiah(order.total)}</strong>
                  </div>
                </div>
                <div>
                  <span className="block text-[9px] text-[#8ca38a] font-bold uppercase tracking-wider mb-0.5">ITEM</span>
                  <p className="text-stone-200 truncate font-medium">{order.items}</p>
                </div>
                <div>
                  <span className="block text-[9px] text-[#8ca38a] font-bold uppercase tracking-wider mb-0.5">JADWAL RENTANG</span>
                  <p className="text-stone-300 font-semibold">{fmtDate(order.start)} – {fmtDate(order.end)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log Audit Trails */}
        <div className="glass-card-glow border border-white/5 rounded-2xl p-5 space-y-4">
          <h4 className="font-bold text-sm text-stone-200 heading-caps tracking-wide flex items-center gap-2">
            <LucideIcon name="Activity" className="text-emerald-400" size={15} />
            Log Aktivitas Sistem
          </h4>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start gap-2.5 text-xs text-[#bdcfbb] border-l-2 border-emerald-500/30 pl-3 py-0.5"
              >
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-white">
                    {activity.action}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#8ca38a]">
                    <span className="font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded text-[8px]">
                      {activity.role}
                    </span>
                    <span>•</span>
                    <span>{activity.user}</span>
                  </div>
                </div>
                <span className="text-[9px] text-[#8ca38a] shrink-0 font-medium whitespace-nowrap bg-white/2 px-1.5 py-0.5 rounded">
                  {activity.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Health & Predictive Maintenance Reminder */}
        <div className="glass-card-glow border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-stone-200 heading-caps tracking-wide flex items-center gap-2">
              <LucideIcon name="ShieldAlert" className="text-emerald-400" size={15} />
              Status Stok & Pemeliharaan Alat
            </h4>
            <span className="text-[9px] bg-amber-500/15 border border-amber-500/25 text-amber-500 font-extrabold px-2 py-0.5 rounded uppercase">CRITICAL ALERTS</span>
          </div>
          
          <div className="space-y-3">
            {items.filter(it => it.avail <= 2).length === 0 ? (
              <div className="text-center p-5 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl">
                <LucideIcon name="CheckCircle" className="text-emerald-400 mx-auto mb-2" size={24} />
                <p className="text-xs font-bold text-white">Stok Aman</p>
              </div>
            ) : (
              items.filter(it => it.avail <= 2).map((it, idx) => {
                const pct = Math.round((it.avail / it.stock) * 100);
                const isCritEmpty = it.avail === 0;
                return (
                  <div key={idx} className="bg-white/2 border border-white/5 p-3 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <h5 className="font-bold text-stone-200">{it.name}</h5>
                      <span className="block text-[10px] text-[#8ca38a] font-mono mt-0.5">
                        Tersedia: <strong className={isCritEmpty ? "text-red-400" : "text-amber-400"}>{it.avail}/{it.stock} Unit</strong> • 
                        <span className={isCritEmpty ? "text-red-400 ml-1" : "text-amber-400 ml-1"}>
                          {isCritEmpty ? "Habis Tersewa!" : "Stok Kritis!"}
                        </span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[9px] font-bold text-[#8ca38a]">SISA</span>
                      <span className={`font-black text-xs ${isCritEmpty ? "text-red-400" : "text-amber-400"}`}>{pct}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* QR Code Scanner Dialog Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-[#020503]/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300">
          <div className="bg-[#0a130c]/98 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up p-6 space-y-4 pb-12 sm:pb-6">
            
            {/* iOS Bottom Sheet style drag indicator */}
            <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-1 block sm:hidden" />
            
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <h4 className="heading-caps font-black text-white text-xs tracking-wider flex items-center gap-1.5">
                <LucideIcon name="Scan" className="text-emerald-400" size={14} />
                Basecamp QR Scanner Simulator
              </h4>
              <button 
                onClick={() => {
                  setIsScannerOpen(false);
                  setScanResult(null);
                }} 
                className="text-stone-400 hover:text-white"
                aria-label="Close"
              >
                <LucideIcon name="X" size={16} />
              </button>
            </div>

            {/* SCAN CHOOSE / DROPDOWN */}
            <div>
              <label className="text-[10px] font-bold text-[#8ca38a] uppercase block mb-1">
                Pilih atau Tulis ID Booking Pelanggan (Simulasi Kamera Scan)
              </label>
              <select
                onChange={(e) => handleQueryScan(e.target.value)}
                className="w-full bg-stone-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-emerald-500 mb-2.5"
              >
                <option value="">-- PILIH TRANSAKSI SEWA AKTIF --</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    [{b.id}] - {b.custName} ({b.items})
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Atau ketik ID: BK101, BK102..."
                  value={scanTerm}
                  onChange={(e) => setScanTerm(e.target.value)}
                  className="flex-1 bg-stone-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleQueryScan(scanTerm)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold px-3 py-1.5 rounded-xl text-xs uppercase"
                >
                  LOAD
                </button>
              </div>
            </div>

            {/* SCREEN VIEWPORT OF SIMULATED CAMERA */}
            <div className="relative h-28 bg-[#152e1b] rounded-2xl border border-emerald-500/20 flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-0.5 bg-red-500/60 animate-pulse shadow-sm shadow-red-500" />
              <LucideIcon name="Focus" className="text-emerald-400/40 animate-pulse" size={48} />
              <span className="text-[8.5px] font-mono tracking-widest text-emerald-400 absolute bottom-2 block animate-pulse">
                [ CAMERA SCANNER ONLINE ]
              </span>
            </div>

            {/* MATCH RESULT DATA DETAIL */}
            {scanResult ? (
              <div className="bg-white/[0.03] border border-white/5 p-3.5 rounded-xl space-y-2 text-left text-xs text-stone-200">
                <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                  <span className="font-extrabold text-stone-100">{scanResult.items}</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 font-bold px-1.5 py-0.5 rounded">
                    Status: {scanResult.status.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-0.5 font-light text-stone-400">
                  <p>Pelanggan: <strong className="text-white font-bold">{scanResult.custName}</strong></p>
                  <p>ID Transaksi: <strong className="text-white font-mono">{scanResult.id}</strong></p>
                  <p>Durasi Sewa: {scanResult.days} Hari ({fmtDate(scanResult.start)} - {fmtDate(scanResult.end)})</p>
                  <p>Jaminan KTP: <strong className={scanResult.idUploaded ? "text-emerald-400" : "text-amber-500"}>
                    {scanResult.idUploaded ? "Terunggah Aman" : "BELUM DIUNGGAH"}
                  </strong></p>
                </div>

                {/* SCANNED OPERATIONS IN ACTIONS BUTTON */}
                <div className="pt-2 flex flex-col gap-1.5">
                  {["pending_verification", "verified", "ready_pickup"].includes(scanResult.status) && (
                    <button
                      onClick={() => updateScanStatus("rented")}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-black py-2 rounded-xl text-xs uppercase transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <LucideIcon name="Handshake" size={14} /> KONFIRMASI SERAH TERIMA (Mulai Sewa)
                    </button>
                  )}
                  {["rented", "late"].includes(scanResult.status) && (
                    <button
                      onClick={() => updateScanStatus("completed")}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-2 rounded-xl text-xs uppercase transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <LucideIcon name="CheckCircle" size={14} /> KONFIRMASI PENGEMBALIAN (Cuci & Selesai)
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-[10.5px] text-[#8ca38a] leading-none">
                Pilih booking di atas atau scan QR code fisik pelanggan.
              </p>
            )}

            <button
              onClick={() => {
                setIsScannerOpen(false);
                setScanResult(null);
              }}
              className="w-full bg-white/5 hover:bg-white/10 text-stone-400 py-2.5 rounded-xl text-xs uppercase font-extrabold"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminDashboard;
