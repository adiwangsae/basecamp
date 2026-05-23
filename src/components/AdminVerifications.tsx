/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Booking, BookingStatus, Item } from "../types";
import { LucideIcon } from "./LucideIcon";

interface AdminVerificationsProps {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  addActivity: (action: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const AdminVerifications: React.FC<AdminVerificationsProps> = ({
  bookings,
  setBookings,
  items,
  setItems,
  addActivity,
  showToast,
}) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [tempNote, setTempNote] = useState("");
  const [fineAmount, setFineAmount] = useState("");
  const [beforeCondLog, setBeforeCondLog] = useState("");
  const [afterCondLog, setAfterCondLog] = useState("");

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

  const pendingList = bookings.filter((b) => b.status === "pending_verification");
  const activeProcessList = bookings.filter((b) =>
    ["verified", "ready_pickup", "rented", "late"].includes(b.status)
  );

  const handleApprove = (id: string, custName: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "verified" } : b))
    );
    addActivity(`Menyetujui pesanan booking ${id} (${custName})`);
    showToast(`Booking ${id} berhasil disetujui!`, "success");
  };

  const handleReject = (id: string, custName: string) => {
    if (confirm(`Apakah Anda yakin ingin MENOLAK pesanan ${id}?`)) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
      );
      addActivity(`Menolak order sewa ${id} (${custName})`);
      showToast(`Pesanan ${id} ditolak.`, "info");
    }
  };

  // Status progression updater
  const handleNextStep = (booking: Booking) => {
    let nextStatus: BookingStatus = booking.status;
    let desc = "";

    if (booking.status === "verified") {
      nextStatus = "ready_pickup";
      desc = "Barang disiapkan & siap diambil";
    } else if (booking.status === "ready_pickup") {
      nextStatus = "rented";
      desc = "Barang diserahkan (Status: Sedang Disewa)";
    } else if (booking.status === "rented" || booking.status === "late") {
      nextStatus = "completed";
      desc = "Transaksi pengembalian selesai.";
    }

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === booking.id) {
          return {
            ...b,
            status: nextStatus,
            conditionBefore: beforeCondLog || b.conditionBefore || "Sangat baik",
            conditionAfter: afterCondLog || b.conditionAfter || "Sama seperti semula",
            denda: fineAmount ? Number(fineAmount) : b.denda,
          };
        }
        return b;
      })
    );

    // If renting or completing, adjust stock parameters
    if (nextStatus === "rented") {
      setItems((prev) =>
        prev.map((it) => {
          if (booking.items.toLowerCase().includes(it.name.toLowerCase())) {
            const nextAvail = Math.max(0, it.avail - booking.qty);
            return { ...it, avail: nextAvail, status: nextAvail === 0 ? "dipinjam" : it.status };
          }
          return it;
        })
      );
    } else if (nextStatus === "completed") {
      setItems((prev) =>
        prev.map((it) => {
          if (booking.items.toLowerCase().includes(it.name.toLowerCase())) {
            const nextAvail = Math.min(it.stock, it.avail + booking.qty);
            return { ...it, avail: nextAvail, status: "tersedia" };
          }
          return it;
        })
      );
    }

    addActivity(`Memperbarui status order ${booking.id} (${booking.custName}) ke: ${nextStatus}`);
    showToast(`Order ${booking.id} diperbarui ke: ${nextStatus}!`, "success");
    setSelectedBooking(null);
    setBeforeCondLog("");
    setAfterCondLog("");
    setFineAmount("");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Title section */}
      <div className="flex items-center gap-2">
        <h1 className="heading-jumbo text-3xl sm:text-4xl text-white tracking-wide">
          Verifikasi & Aliran Status
        </h1>
        <div className="group relative hidden sm:block">
          <LucideIcon name="Info" size={16} className="text-[#8ca38a] cursor-pointer" />
          <div className="absolute left-0 top-6 w-56 p-2.5 bg-[#0a130c]/95 backdrop-blur-md border border-white/10 rounded-xl text-[10px] text-stone-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-10">
            Daftar pesanan baru, persiapan alat, hingga status pengembalian.
          </div>
        </div>
      </div>

      {/* Grid wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Verification queue list (COL-12 or COL-6 depending on active lists) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h3 className="heading-caps text-sm text-stone-200 font-bold tracking-wider uppercase">
              Butuh Verifikasi Akun/Order ({pendingList.length})
            </h3>
          </div>

          {pendingList.length === 0 ? (
            <div className="glass-card-glow border border-white/5 p-8 rounded-2xl text-center text-[#8ca38a] text-xs">
              <LucideIcon name="CheckCircle" className="text-emerald-400 mx-auto mb-3" size={28} />
              Antrean kosong! Semua booking telah divalidasi.
            </div>
          ) : (
            pendingList.map((order) => (
              <div
                key={order.id}
                className="glass-card-glow border border-amber-500/10 rounded-2xl p-4.5 space-y-4 shadow-xl"
              >
                {/* Header card info */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-white">{order.custName}</span>
                      <span className="text-[10px] font-bold text-[#8ca38a]">#{order.id}</span>
                      {order.idUploaded && (
                        <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold px-1.5 py-0.5 rounded uppercase">
                          ID Terlampir
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-400 font-bold">
                      {order.items} • {order.qty} Unit
                    </p>
                    <p className="text-[10px] text-stone-400 font-medium">
                      Tanggal: {fmtDate(order.start)} s/d {fmtDate(order.end)} ({order.days} hari)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#8ca38a] block uppercase tracking-wide">Total Biaya</span>
                    <span className="heading-caps text-sm font-black text-amber-400">{rupiah(order.total)}</span>
                  </div>
                </div>

                {order.note && (
                  <div className="bg-white/2 border border-white/5 p-2 rounded-lg text-[11px] text-[#bdcfbb]">
                    <span className="font-bold text-[#8ca38a]">Catatan:</span> "{order.note}"
                  </div>
                )}

                {/* Simulated Identity Card Doc Review */}
                {order.idUploaded && (
                  <div className="bg-stone-900 border border-white/5 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <LucideIcon name="FileText" size={16} className="text-[#8ca38a]" />
                      <div className="text-left">
                        <span className="block text-[11px] font-bold text-stone-300">DOKUMEN_KTP_VERIF.jpg</span>
                        <span className="block text-[9px] text-[#8ca38a]">Sertifikasi Valid • Jaminan Aman</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => showToast(`Pratinjau KTP ${order.custName} valid!`, "info")}
                      className="text-[10px] bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-bold px-2 py-1 rounded"
                    >
                      LIHAT DOKUMEN
                    </button>
                  </div>
                )}

                {/* Control Action Buttons */}
                <div className="flex gap-2 pt-1.5">
                  <button
                    onClick={() => handleReject(order.id, order.custName)}
                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold py-2 rounded-xl text-[11px] uppercase tracking-wide transition-colors"
                  >
                    TOLAK BOOKING
                  </button>
                  <button
                    onClick={() => handleApprove(order.id, order.custName)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold py-2 rounded-xl text-[11px] uppercase tracking-wide transition-colors"
                  >
                    SETUJUI / APPROVE
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Status pipeline update list (COL-6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="heading-caps text-sm text-stone-200 font-bold tracking-wider uppercase">
              Pelacakan Status Aktif ({activeProcessList.length})
            </h3>
          </div>

          {activeProcessList.length === 0 ? (
            <div className="glass-card-glow border border-white/5 p-8 rounded-2xl text-center text-[#8ca38a] text-xs">
              Tidak ada penyewaan aktif yang berjalan hari ini.
            </div>
          ) : (
            activeProcessList.map((order) => (
              <div
                key={order.id}
                className="glass-card-glow border border-white/5 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg text-left"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-stone-100 text-xs">{order.custName}</span>
                    <span className="text-[10px] text-[#8ca38a]">#{order.id}</span>
                  </div>
                  <p className="text-xs text-[#bdcfbb] font-semibold mt-1">
                    {order.items} <span className="text-[#8ca38a]">({order.qty} unit)</span>
                  </p>
                  <p className="text-[10px] text-[#8ca38a] mt-0.5">
                    Periode: {fmtDate(order.start)} – {fmtDate(order.end)}
                  </p>
                  {order.denda && (
                    <span className="inline-block text-[10px] text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded mt-1">
                      Denda: {rupiah(order.denda)} (Overdue)
                    </span>
                  )}
                </div>

                <div className="flex sm:flex-col items-end gap-2.5">
                  {/* Active Step status badge */}
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-center border mr-auto sm:mr-0 ${
                    order.status === "verified" ? "bg-blend-overlay bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    order.status === "ready_pickup" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                    order.status === "rented" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                    "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"
                  }`}>
                    {order.status === "verified" ? "Terverifikasi" :
                     order.status === "ready_pickup" ? "Siap Diambil" :
                     order.status === "rented" ? "Sedang Disewa" : "Terlambat"}
                  </span>

                  {/* Flow Action triggers */}
                  <button
                    onClick={() => {
                      setSelectedBooking(order);
                      if (order.status === "ready_pickup") {
                        setBeforeCondLog("Kondisi baik, bersih, siap pakai...");
                      } else if (order.status === "rented" || order.status === "late") {
                        setAfterCondLog("Bersih, tidak ada sobek...");
                      }
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold px-3 py-1.5 rounded-xl text-[10px] uppercase heading-caps tracking-wider transition-colors shadow-md"
                  >
                    PROSES
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Advanced Gear Condition Documentation and Status Updater Overlay modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-[#020503]/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300">
          <div className="bg-[#0a130c]/98 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up pb-8 sm:pb-0">
            
            {/* iOS Bottom Sheet style drag indicator */}
            <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-2 mt-3 block sm:hidden" />
            
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/2">
              <h2 className="heading-caps font-black text-white text-md tracking-wider flex items-center gap-2">
                <LucideIcon name="Shield" className="text-emerald-400" size={16} />
                Dokumentasi & Progres Order #{selectedBooking.id}
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 px-2 text-xs rounded bg-white/5 text-stone-400 hover:text-white"
                aria-label="Close"
              >
                <LucideIcon name="X" size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-white/2 p-3.5 rounded-xl text-left text-xs text-stone-300">
                <p><span className="font-bold text-[#8ca38a]">Pelanggan:</span> {selectedBooking.custName}</p>
                <p className="mt-1"><span className="font-bold text-[#8ca38a]">Barang Sewa:</span> {selectedBooking.items} ({selectedBooking.qty} unit)</p>
                <p className="mt-1"><span className="font-bold text-[#8ca38a]">Hari & Sewa:</span> {fmtDate(selectedBooking.start)} to {fmtDate(selectedBooking.end)}</p>
                <p className="mt-1 font-bold text-amber-400"><span className="text-[#8ca38a]">Total Biaya:</span> {rupiah(selectedBooking.total)}</p>
              </div>

              {/* Verified to Ready-to-pickup step requires no details, just double confirm */}
              {selectedBooking.status === "verified" ? (
                <div className="text-center py-4 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-2 border border-blue-500/20">
                    <LucideIcon name="Package" size={24} />
                  </div>
                  <p className="text-sm font-bold text-white">Siapkan Perlengkapan Outdoor</p>
                  <p className="text-xs text-stone-400 max-w-xs mx-auto">
                    Konfirmasi jika barang sewa sudah dibersihkan, dipacking komplit, dan ditaruh di rak pengambilan agar status berubah menjadi "Siap Diambil".
                  </p>
                </div>
              ) : selectedBooking.status === "ready_pickup" ? (
                /* Ready to rent transition: Record condition before */
                <div className="space-y-3.5 text-left">
                  <label className="text-[11px] font-bold text-[#8ca38a] uppercase block">
                    Catatan Kondisi Fisik Sebelum Sewa (Jaminan Keluar)
                  </label>
                  <input
                    type="text"
                    value={beforeCondLog}
                    onChange={(e) => setBeforeCondLog(e.target.value)}
                    className="w-full bg-white/4 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-emerald-500"
                    placeholder="Contoh: Tenda warna biru lengkap, pasak utuh 10 pcs, frame mulus."
                    required
                  />
                  <div className="space-y-1.5 p-3 rounded bg-amber-500/5 border border-amber-500/20 text-[11px] text-[#bdcfbb]">
                    <span className="font-bold text-amber-400 block uppercase">FUNGSI PENGAMANAN</span>
                    Catatan ini penting untuk membandingkan kondisi alat saat dikembalikan nanti guna meminimalkan sengketa fisik denda.
                  </div>
                </div>
              ) : (
                /* Rented/Late to Complete */
                <div className="space-y-4 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-[#8ca38a] uppercase block mb-1">
                        Denda Keterlambatan / Kerusakan (Rp - Opsional)
                      </label>
                      <input
                        type="number"
                        value={fineAmount}
                        onChange={(e) => setFineAmount(e.target.value)}
                        className="w-full bg-white/4 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-red-500"
                        placeholder="Contoh: 50000"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#8ca38a] uppercase block mb-1">
                        Selisih Hari Terlambat (Jika Ada)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 2 Hari denda keterlambatan"
                        className="w-full bg-white/4 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-red-500"
                        disabled
                        value={selectedBooking.status === "late" ? "Terlambat aktif" : "Tepat waktu"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#8ca38a] uppercase block mb-1">
                      Catatan Kondisi Fisik Saat Pengembalian (Jaminan Masuk)
                    </label>
                    <input
                      type="text"
                      value={afterCondLog}
                      onChange={(e) => setAfterCondLog(e.target.value)}
                      className="w-full bg-white/4 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-emerald-500"
                      placeholder="Contoh: Lengkap mulus bersih, tidak ada robekan."
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-stone-300 font-bold px-4 py-2.5 rounded-xl text-xs uppercase transition-all"
                >
                  BATAL
                </button>
                <button
                  onClick={() => handleNextStep(selectedBooking)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                  KONFIRMASI SELESAI
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
export default AdminVerifications;
