/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Booking, ActivityLog } from "../types";
import { LucideIcon } from "./LucideIcon";

interface AdminHistoryProps {
  bookings: Booking[];
  activities: ActivityLog[];
}

export const AdminHistory: React.FC<AdminHistoryProps> = ({
  bookings,
  activities,
}) => {
  const [historySearch, setHistorySearch] = useState("");

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

  // Aggregated Values
  const totalCompletedCount = bookings.filter((b) => b.status === "completed").length;
  
  const totalRevenue = bookings
    .filter((b) => ["completed", "rented", "late"].includes(b.status))
    .reduce((sum, b) => sum + b.total, 0);

  const totalFines = bookings
    .filter((b) => b.denda)
    .reduce((sum, b) => sum + (b.denda || 0), 0);

  const filteredHistory = bookings.filter((b) =>
    b.custName.toLowerCase().includes(historySearch.toLowerCase()) ||
    b.id.toLowerCase().includes(historySearch.toLowerCase()) ||
    b.items.toLowerCase().includes(historySearch.toLowerCase())
  );

  const matrices = [
    { label: "Jumlah Transaksi", value: bookings.length, icon: "Calendar", color: "text-blue-400" },
    { label: "Durasi Sukses Selesai", value: totalCompletedCount, icon: "CheckCircle", color: "text-emerald-400" },
    { label: "Omset Pemasukan", value: rupiah(totalRevenue), icon: "DollarSign", color: "text-amber-500", raw: true },
    { label: "Total Denda Masuk", value: rupiah(totalFines), icon: "AlertTriangle", color: "text-[#ff5555]", raw: true },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center gap-2">
        <h1 className="heading-jumbo text-3xl sm:text-4xl text-white tracking-wide">
          Histori Transaksi
        </h1>
        <div className="group relative hidden sm:block">
          <LucideIcon name="Info" size={16} className="text-[#8ca38a] cursor-pointer" />
          <div className="absolute left-0 top-6 w-56 p-2.5 bg-[#0a130c]/95 backdrop-blur-md border border-white/10 rounded-xl text-[10px] text-stone-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-20">
            Arsip permanen aktivitas sewa, denda kerusakan, dan rekap keuangan.
          </div>
        </div>
      </div>

      {/* Aggregate Overview widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {matrices.map((m, idx) => (
          <div key={idx} className="glass-card-glow border border-white/5 rounded-2xl p-5 text-left flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#8ca38a] block">
                {m.label}
              </span>
              <h3 className={`heading-jumbo font-extrabold block tracking-tight ${
                m.raw ? "text-xl sm:text-2xl" : "text-3xl"
              } ${m.color}`}>
                {m.value}
              </h3>
            </div>
            <div className="p-2 bg-white/5 border border-white/5 rounded-xl text-stone-400">
              <LucideIcon name={m.icon} size={15} />
            </div>
          </div>
        ))}
      </div>

      {/* Control bar */}
      <div className="glass-card-glow border border-white/5 p-4 rounded-xl flex items-center">
        <div className="relative flex-1 max-w-sm">
          <LucideIcon name="Search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8ca38a]" size={15} />
          <input
            type="text"
            placeholder="Cari ID transaksi, nama penyewa, atau barang..."
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            className="w-full bg-white/4 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-stone-500 outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* History table */}
      <div className="glass-card-glow border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5 text-[10px] text-[#8ca38a] font-bold uppercase tracking-wider heading-caps bg-white/2">
                <th className="py-4 px-4 w-12 text-center">ID</th>
                <th className="py-4 px-4">Nama Pelanggan</th>
                <th className="py-4 px-4">Barang Sewa</th>
                <th className="py-4 px-4">Rentang Durasi</th>
                <th className="py-4 px-4 text-emerald-400 text-right">Denda</th>
                <th className="py-4 px-4 text-emerald-400 text-right">Biaya Total</th>
                <th className="py-4 px-6 text-center">Status Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-stone-200">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8ca38a]">
                    Belum ada riwayat transaksi yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-4 font-bold text-stone-400 text-center">
                      {item.id}
                    </td>
                    <td className="py-4 px-4 font-semibold text-white">
                      {item.custName}
                    </td>
                    <td className="py-4 px-4 text-stone-300">
                      {item.items} <span className="text-[#8ca38a] font-bold text-[10px]">x{item.qty}</span>
                    </td>
                    <td className="py-4 px-4 text-[#8ca38a]">
                      {fmtDate(item.start)} s/d {fmtDate(item.end)}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-red-400">
                      {item.denda ? rupiah(item.denda) : "-"}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-amber-400 text-sm">
                      {rupiah(item.total)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        item.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        item.status === "cancelled" ? "bg-stone-500/10 text-stone-400 border-stone-500/20" :
                        "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden block p-4 space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-[#8ca38a] text-xs">
              Belum ada riwayat transaksi yang cocok dengan filter pencarian.
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div key={item.id} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-3.5 text-xs text-left">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500/15 text-amber-400 font-mono text-[9px] font-bold flex items-center justify-center py-1 px-2 border border-amber-500/10 shadow shadow-amber-950">
                      ID
                    </span>
                    <span className="font-extrabold text-stone-400">{item.id}</span>
                  </div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border tracking-wider ${
                    item.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    item.status === "cancelled" ? "bg-stone-500/10 text-stone-400 border-stone-500/20" :
                    "bg-red-500/10 text-red-500 border-red-500/20"
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <span className="block text-[8px] text-[#8ca38a] font-bold uppercase tracking-wider">Penyewa</span>
                    <strong className="text-white font-black text-xs">{item.custName}</strong>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="block text-[8px] text-[#8ca38a] font-bold uppercase tracking-wider">Durasi</span>
                    <span className="text-stone-300 text-[10.5px] font-medium">
                      {fmtDate(item.start)} - {fmtDate(item.end)}
                    </span>
                  </div>
                </div>

                <div className="bg-white/1 border border-white/5 p-2 rounded-lg space-y-1">
                  <span className="block text-[8.5px] text-[#8ca38a] font-extrabold uppercase tracking-widest">Detail Sewa</span>
                  <div className="flex justify-between text-stone-300">
                    <span className="truncate pr-4">{item.items}</span>
                    <span className="font-black text-emerald-400 whitespace-nowrap">x{item.qty} unit</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-white/5">
                  <div>
                    {item.denda > 0 ? (
                      <span className="text-[10px] text-red-400 font-bold block">
                        Denda: {rupiah(item.denda)}
                      </span>
                    ) : (
                      <span className="text-[9px] text-[#8ca38a] font-mono">Bebas Denda</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] text-[#8ca38a] font-bold uppercase">Bayar Total</span>
                    <strong className="text-amber-400 font-black text-sm">{rupiah(item.total)}</strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
};
export default AdminHistory;
