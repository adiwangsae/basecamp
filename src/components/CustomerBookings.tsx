/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { Booking, User, BookingStatus } from "../types";
import { LucideIcon } from "./LucideIcon";

interface CustomerBookingsProps {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  user: User;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

const STEPS: { key: BookingStatus; label: string }[] = [
  { key: "pending_verification", label: "Pending" },
  { key: "verified", label: "Diterima" },
  { key: "ready_pickup", label: "Siap Ambil" },
  { key: "rented", label: "Disewa" },
  { key: "completed", label: "Selesai" },
];

export const CustomerBookings: React.FC<CustomerBookingsProps> = ({
  bookings,
  setBookings,
  user,
  showToast,
}) => {
  const [ktpModalBookingId, setKtpModalBookingId] = useState<string | null>(null);
  const [transferModalBookingId, setTransferModalBookingId] = useState<string | null>(null);
  const [qrModalBookingId, setQrModalBookingId] = useState<string | null>(null);
  const [printModalBookingId, setPrintModalBookingId] = useState<string | null>(null);

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

  const myBookings = bookings.filter((b) => b.custId === user.id);

  // Handles simulated upload of KTP
  const handleUploadKtp = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, idUploaded: true } : b))
    );
    showToast("Dokumen jaminan KTP / KTM berhasil diunggah!", "success");
    setKtpModalBookingId(null);
  };

  // Handles simulated transfer slip upload -> transitions to payment approved
  const handleUploadTransferSlip = (id: string) => {
    showToast("Bukti pembayaran transfer telah dikirim ke admin!", "success");
    setTransferModalBookingId(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Intro info wrapper */}
      <div className="flex items-center gap-2">
        <h1 className="heading-jumbo text-3xl sm:text-4xl text-white tracking-wide">
          Booking Saya
        </h1>
        <div className="group relative hidden sm:block">
          <LucideIcon name="Info" size={16} className="text-[#8ca38a] cursor-pointer" />
          <div className="absolute left-0 top-6 w-56 p-2.5 bg-[#0a130c]/95 backdrop-blur-md border border-white/10 rounded-xl text-[10px] text-stone-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-10">
            Pantau status pesanan, unggah jaminan, dan instruksi pengambilan.
          </div>
        </div>
      </div>

      {myBookings.length === 0 ? (
        <div className="glass-card-glow border border-white/5 p-12 rounded-2xl text-center text-[#8ca38a] max-w-lg mx-auto">
          <LucideIcon name="Calendar" className="mx-auto mb-4 text-[#8ca38a]" size={36} />
          <h4 className="font-bold text-stone-200">Belum Ada Transaksi Booking</h4>
          <p className="text-xs text-stone-400 mt-2 leading-relaxed">
            Tidak ada booking aktif. Silakan kunjungi katalog.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {myBookings.map((order) => {
            // Find current progress index
            // If cancelled or late, handles slightly differently
            const activeIdx = order.status === "cancelled" ? -1 : STEPS.findIndex((s) => s.key === order.status || (order.status === "late" && s.key === "rented"));

            return (
              <motion.div
                key={order.id}
                whileHover={{ scale: 1.01 }}
                className={`glass-card-glow border rounded-2xl p-4 md:p-6 text-left relative ${
                  order.status === "late" ? "border-red-500/20 shadow-lg shadow-red-950/5" : "border-white/5"
                }`}
              >
                
                {/* Header Information and pricing element */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4.5 mb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-md tracking-wide">
                        {order.items}
                      </span>
                      <span className="text-xs text-[#8ca38a] font-bold">
                        #{order.id}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 font-semibold flex items-center gap-1.5">
                      <LucideIcon name="Calendar" size={13} className="text-emerald-400" />
                      Sewaan: {fmtDate(order.start)} – {fmtDate(order.end)} ({order.days} hari • {order.qty} unit)
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-[#8ca38a] block font-bold uppercase tracking-wide">Total Biaya</span>
                      <span className="heading-caps text-md tracking-wider font-black text-amber-400 text-lg">
                        {rupiah(order.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Visual Tracker Step Line (skip if cancelled) */}
                {order.status !== "cancelled" ? (
                  <div className="py-2.5">
                    {/* Stepper bubbles responsive loop */}
                    <div className="flex items-center justify-between overflow-x-auto pb-4 scrollbar-none">
                      {STEPS.map((step, sIdx) => {
                        const isDone = activeIdx > sIdx;
                        const isCurrent = activeIdx === sIdx;
                        
                        return (
                          <div key={step.key} className="flex-1 flex items-center min-w-[70px]">
                            <div className="flex flex-col items-center w-full relative z-10">
                              {/* Step circle bubble */}
                              <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-black transition-all ${
                                isDone 
                                  ? "bg-emerald-500 border-emerald-400 text-black font-extrabold" 
                                  : isCurrent
                                    ? "bg-amber-500/10 border-amber-400 text-amber-400 font-extrabold shadow-md shadow-amber-950/20 scale-105" 
                                    : "bg-[#050a06] border-white/5 text-[#8ca38a]"
                              }`}>
                                {isDone ? (
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : sIdx + 1}
                              </div>
                              <span className={`text-[9px] font-black uppercase mt-1.5 block tracking-widest ${
                                isCurrent ? "text-amber-400" : isDone ? "text-emerald-400" : "text-[#8ca38a]"
                              }`}>
                                {step.label}
                              </span>
                            </div>

                            {/* connector line, render for all except last */}
                            {sIdx < STEPS.length - 1 && (
                              <div className={`h-[1.5px] flex-1 -mx-4 mb-4 transition-colors ${
                                isDone ? "bg-emerald-500" : "bg-white/5"
                              }`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2 mb-4">
                    <LucideIcon name="AlertTriangle" size={16} />
                    PENGAJUAN REJECTED: Reservasi sewa dibatalkan atau ditolak oleh Administrator Basecamp.
                  </div>
                )}

                {/* Overdue Penalty Panel notifications */}
                {order.status === "late" && order.denda && (
                  <div className="p-3.5 bg-red-500/5 border border-red-500/20 rounded-xl space-y-1.5 mb-4 text-left">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest heading-caps">
                      <LucideIcon name="AlertTriangle" size={15} />
                      Overdue Keterlambatan Aktif!
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Batas pengembalian ({fmtDate(order.end)}) terlampaui.  Denda saat ini: <strong className="text-red-400">{rupiah(order.denda)}</strong>.
                    </p>
                  </div>
                )}

                {/* Sub-actions area */}
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                  <div className="text-xs text-stone-300 leading-relaxed text-left space-y-0.5">
                    <p className="font-semibold text-stone-400 text-[10px] uppercase tracking-wider">Garansi Dokumen</p>
                    {order.idUploaded ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <LucideIcon name="CheckCircle" size={13} />
                        KTP terunggah & valid
                      </span>
                    ) : (
                      <span className="text-stone-400 flex items-center gap-1 font-semibold">
                        <LucideIcon name="Info" size={13} className="text-amber-500" />
                        Upload KTP sebelum serah terima.
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 w-full sm:w-auto self-end sm:self-center">
                    {/* Invoice & Agreement print/download popup trigger */}
                    {order.status !== "cancelled" && (
                      <button
                        onClick={() => setPrintModalBookingId(order.id)}
                        className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[10.5px] uppercase heading-caps px-4 py-2 rounded-xl hover:bg-emerald-500 hover:text-black transition-all tracking-wider w-full sm:w-auto flex items-center justify-center gap-1.5"
                      >
                        <LucideIcon name="FileText" size={12} />
                        SURAT & INVOICE
                      </button>
                    )}

                    {/* Identity card upload button popup trigger */}
                    {!order.idUploaded && order.status !== "cancelled" && (
                      <button
                        onClick={() => setKtpModalBookingId(order.id)}
                        className="bg-emerald-500 text-black font-extrabold text-[10.5px] uppercase heading-caps px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors tracking-wider w-full sm:w-auto"
                      >
                        UNGGAH KTP / IDENTITAS
                      </button>
                    )}

                    {order.status !== "pending_verification" && order.status !== "cancelled" && (
                      <button
                        onClick={() => setQrModalBookingId(order.id)}
                        className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[10.5px] uppercase heading-caps px-4 py-2 rounded-xl hover:bg-emerald-500 hover:text-black transition-all tracking-wider w-full sm:w-auto flex items-center justify-center gap-1.5"
                      >
                        <LucideIcon name="QrCode" size={12} />
                        QR CODE LOGISTIK
                      </button>
                    )}

                    {/* Pay button for transfer options when verified or pickup */}
                    {["verified", "ready_pickup"].includes(order.status) && (
                      <button
                        onClick={() => setTransferModalBookingId(order.id)}
                        className="bg-white/5 border border-white/10 text-stone-300 font-bold text-[10.5px] uppercase heading-caps px-4 py-2 rounded-xl hover:bg-white/10 transition-colors tracking-wider w-full sm:w-auto flex items-center justify-center gap-1.5"
                      >
                        <LucideIcon name="CreditCard" size={12} />
                        INFO BAYAR TRANSFER
                      </button>
                    )}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* Uploading Identity Modal dialogue */}
      {ktpModalBookingId && (
        <div className="fixed inset-0 bg-[#020503]/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300">
          <div className="bg-[#0a130c]/98 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up pb-8 sm:pb-0">
            
            {/* iOS Bottom Sheet style drag indicator */}
            <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-1 mt-3 block sm:hidden" />
            
            <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-white/2">
              <h4 className="heading-caps font-black text-white text-sm tracking-wider flex items-center gap-1.5">
                <LucideIcon name="Shield" className="text-emerald-400" size={15} />
                Unggah Jaminan Identitas
              </h4>
              <button onClick={() => setKtpModalBookingId(null)} className="text-stone-400 hover:text-white" aria-label="Close">
                <LucideIcon name="X" size={16} />
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <div 
                onClick={() => handleUploadKtp(ktpModalBookingId)}
                className="border-2 border-dashed border-white/10 hover:border-emerald-500/45 rounded-2xl p-8 cursor-pointer transition-colors space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-1">
                  <LucideIcon name="UploadCloud" size={24} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-stone-200">Klik untuk Pilih dari Galeri HP/Laptop</span>
                  <span className="block text-[10px] text-[#8ca38a] mt-1">Format: JPG, PNG, atau PDF (Maks. 5MB)</span>
                </div>
              </div>
              <p className="text-[10.5px] text-[#8ca38a] leading-relaxed max-w-xs mx-auto">
                Dokumen jaminan Anda sangat aman, dienkripsi sistem, dan hanya dipergunakan untuk keperluan asuransi dan kualifikasi rental UMKM.
              </p>
              <button
                onClick={() => setKtpModalBookingId(null)}
                className="w-full bg-white/5 text-stone-400 py-2 rounded-xl text-xs uppercase"
              >
                BATAL
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Payment Details info modal dialogue */}
      {transferModalBookingId && (
        <div className="fixed inset-0 bg-[#020503]/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300">
          <div className="bg-[#0a130c]/98 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up pb-8 sm:pb-0">
            
            {/* iOS Bottom Sheet style drag indicator */}
            <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-1 mt-3 block sm:hidden" />
            
            <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-white/2">
              <h4 className="heading-caps font-black text-white text-sm tracking-wider flex items-center gap-1.5">
                <LucideIcon name="CreditCard" className="text-emerald-400" size={15} />
                Instruksi Pembayaran Offline / COD
              </h4>
              <button onClick={() => setTransferModalBookingId(null)} className="text-stone-400 hover:text-white" aria-label="Close">
                <LucideIcon name="X" size={16} />
              </button>
            </div>

            <div className="p-6 text-left space-y-4">
              
              <div className="space-y-3 divide-y divide-white/5">
                <div className="pb-3.5 space-y-1.5">
                  <span className="text-[9px] text-[#8ca38a] font-bold uppercase tracking-wider block">Metode A: Transfer Bank Mandiri</span>
                  <p className="text-xs font-semibold text-stone-200 leading-relaxed">
                    Kirim pembayaran sewa ke nomor rekening resmi berikut:
                  </p>
                  <div className="bg-stone-900 border border-white/5 p-3 rounded-xl select-all font-bold text-sm text-emerald-400 font-mono text-center">
                    Mandiri 123-45678-90 a.n Gede Adi Wangsa
                  </div>
                </div>

                <div className="pt-3.5 space-y-1 text-xs">
                  <span className="text-[9px] text-[#8ca38a] font-bold uppercase tracking-wider block mb-1">Metode B: Cash On Delivery / COD</span>
                  <p className="text-stone-400 leading-relaxed">
                    Anda juga dapat melunasi sewa secara tunai saat pengambilan alat di basecamp. Cukup tunjukkan ID Keterangan Order kepada admin.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setTransferModalBookingId(null)}
                  className="flex-grow bg-white/5 text-stone-300 font-bold px-4 py-2.5 rounded-xl text-xs uppercase"
                >
                  BATAL
                </button>
                <button
                  type="button"
                  onClick={() => handleUploadTransferSlip(transferModalBookingId)}
                  className="flex-grow bg-emerald-500 text-black font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md"
                >
                  KIRIM BUKTI BAYAR
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* QR Code Presentation Dialog Popup Modal */}
      {qrModalBookingId && (() => {
        const order = bookings.find(b => b.id === qrModalBookingId);
        if (!order) return null;
        return (
          <div className="fixed inset-0 bg-[#020503]/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300">
            <div className="bg-[#0a130c]/98 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up p-6 text-center space-y-4 pb-12 sm:pb-6">
              
              {/* iOS Bottom Sheet style drag indicator */}
              <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-1 block sm:hidden" />
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <h4 className="heading-caps font-black text-white text-sm tracking-wider flex items-center gap-1.5">
                  <LucideIcon name="QrCode" className="text-emerald-400" size={15} />
                  QR Check-In OutRent 2026
                </h4>
                <button onClick={() => setQrModalBookingId(null)} className="text-stone-400 hover:text-white" aria-label="Close">
                  <LucideIcon name="X" size={16} />
                </button>
              </div>

              <div className="bg-white p-4.5 rounded-2xl inline-block shadow-2xl mx-auto border border-stone-200">
                <svg width="150" height="150" viewBox="0 0 100 100" className="mx-auto text-black">
                  <path d="M 5,5 h 25 v 25 h -25 z M 10,10 h 15 v 15 h -15 z" fill="currentColor" />
                  <path d="M 65,5 h 25 v 25 h -25 z M 70,10 h 15 v 15 h -15 z" fill="currentColor" />
                  <path d="M 5,65 h 25 v 25 h -25 z M 10,70 h 15 v 15 h -15 z" fill="currentColor" />
                  <path d="M 35,5 h 5 v 10 h -5 z M 45,5 h 10 v 5 h -10 z M 40,25 h 15 v 5 h -15 z" fill="currentColor" />
                  <path d="M 5,35 h 10 v 15 h -10 z M 20,35 h 15 v 5 h -15 z M 25,45 h 15 v 10 h -15 z" fill="currentColor" />
                  <path d="M 55,35 h 15 v 10 h -15 z M 75,35 h 15 v 5 h -15 z M 80,45 h 10 v 15 h -10 z" fill="currentColor" />
                  <path d="M 45,65 h 15 v 10 h -15 z M 35,80 h 10 v 15 h -10 z M 70,70 h 20 v 20 h -20 z" fill="currentColor" />
                  <circle cx="50" cy="50" r="4" fill="currentColor" />
                </svg>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-[#8ca38a] uppercase font-bold tracking-wider block">ID SECURE BOOKING</span>
                <span className="text-sm font-black text-white">{order.id}</span>
                <p className="text-[11px] text-amber-400 font-extrabold">{order.items}</p>
                <p className="text-[10.5px] text-[#8ca38a] leading-relaxed max-w-xs mx-auto font-light">
                  Tunjukkan kode di atas pada petugas daki di Basecamp untuk pencocokan fisik digital instan (Check-in/Check-out).
                </p>
              </div>

              <button
                onClick={() => setQrModalBookingId(null)}
                className="w-full bg-white/5 hover:bg-white/10 text-stone-300 py-2.5 rounded-xl text-xs uppercase font-extrabold"
              >
                TUTUP
              </button>
            </div>
          </div>
        );
      })()}

      {/* DIGITAL RENTAL AGREEMENT & INVOICE PRINT PREVIEW MODAL */}
      {printModalBookingId && (() => {
        const order = bookings.find(b => b.id === printModalBookingId);
        if (!order) return null;
        return (
          <div className="fixed inset-0 bg-[#020503]/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 overflow-y-auto">
            <div className="bg-[#0a130c]/98 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[92vh] sm:max-h-[90vh] pb-10 sm:pb-0">
              
              {/* iOS Bottom Sheet style drag indicator */}
              <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-2 mt-3 block sm:hidden" />
              
              {/* Header inside modal */}
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/2 shrink-0">
                <h4 className="heading-caps font-black text-white text-sm tracking-wider flex items-center gap-1.5">
                  <LucideIcon name="Printer" className="text-emerald-400" size={15} />
                  Agreement & Surat Rental #BC-{order.id}
                </h4>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const printContents = document.getElementById("printable-agreement-area")?.innerHTML;
                      if (printContents) {
                        const win = window.open("", "_blank");
                        if (win) {
                          win.document.write(`
                            <html>
                              <head>
                                <title>Invoice & Surat Perjanjian #${order.id}</title>
                                <style>
                                  body { font-family: -apple-system, system-ui, sans-serif; padding: 40px; color: #111; line-height: 1.5; background-color: #fff; }
                                  .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                                  .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; color: #111; }
                                  .header p { margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; color: #555; }
                                  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
                                  .card-sign { border: 1px solid #ccc; padding: 15px; border-radius: 8px; background: #fafafa; }
                                  .card-sign p { margin: 3px 0; }
                                  .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px; color: #222; }
                                  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                                  th, td { padding: 9px; text-align: left; border-bottom: 1px solid #ddd; font-size: 11px; }
                                  th { background-color: #f0f0f0; text-transform: uppercase; color: #333; }
                                  .total-box { background-color: #f7fff7; border: 1px solid #cce8cc; padding: 12px; border-radius: 6px; text-align: right; font-size: 14px; font-weight: bold; margin-top: 15px; }
                                  .terms { font-size: 9.5px; color: #444; margin-top: 25px; text-align: justify; background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee; }
                                  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 35px; text-align: center; }
                                  .signature-box { border: 1px dashed #777; height: 60px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; background: #fff; position: relative; border-radius: 6px; }
                                  .sign-font { font-family: "Georgia", serif; font-style: italic; font-size: 16px; color: #1e3a1e; font-weight: bold; }
                                  .badge-stamp { border: 2px solid #10b981; color: #10b981; padding: 2px 6px; font-size: 8px; font-weight: bold; text-transform: uppercase; border-radius: 4px; display: inline-block; transform: rotate(-5deg); margin-top: 5px; }
                                </style>
                              </head>
                              <body>
                                ${printContents}
                                <script>window.onload = function() { window.print(); window.close(); }</script>
                              </body>
                            </html>
                          `);
                          win.document.close();
                        } else {
                          window.print();
                        }
                      }
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-[10.5px] uppercase heading-caps px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <LucideIcon name="Printer" size={13} />
                    CETAK PDF / SEWA
                  </button>
                  <button onClick={() => setPrintModalBookingId(null)} className="p-1 px-2.5 rounded bg-white/5 border border-white/5 text-stone-400 hover:text-white" aria-label="Close">
                    <LucideIcon name="X" size={16} />
                  </button>
                </div>
              </div>

              {/* Scrollable container displaying physical sheets inside dark dashboard */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
                <div 
                  id="printable-agreement-area"
                  className="bg-stone-950 p-6 rounded-xl border border-white/5 space-y-6"
                >
                  
                  {/* Store Header */}
                  <div className="text-center border-b border-white/10 pb-4 space-y-1">
                    <span className="text-emerald-400 font-bold tracking-widest text-xs uppercase block font-mono">OUTRENT RINJANI ADVENTURE LOGISTICS</span>
                    <h2 className="heading-jumbo text-lg tracking-wider text-white uppercase">SURAT PERJANJIAN SEWA & INVOICE RESMI</h2>
                    <p className="text-[10px] text-[#8ca38a] uppercase leading-none font-mono">Center Pos Sembalun - WhatsApp: +62 812-3456-7890</p>
                  </div>

                  {/* Customer and Rental Info Blocks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1 bg-white/2 border border-white/5 p-3 rounded-lg card-sign text-left">
                      <div className="section-title">Dokumentasi Penyewa</div>
                      <p className="text-white font-bold">{user.name}</p>
                      <p className="text-stone-300">Email: {user.email}</p>
                      <p className="text-stone-300">No HP: {user.phone}</p>
                      <span className="text-indigo-400 font-bold uppercase text-[8px] bg-indigo-500/10 px-1.5 py-0.5 rounded inline-block mt-1">Trust Score: Verified (98/100)</span>
                    </div>

                    <div className="space-y-1 bg-white/2 border border-white/5 p-3 rounded-lg card-sign text-left">
                      <div className="section-title">Rincian Nota Finansial</div>
                      <p className="text-stone-100 font-black">Invoice: #OUT-{order.id}</p>
                      <p className="text-stone-300">Status Bayar: <span className="text-emerald-400 uppercase font-bold">{order.status === "completed" ? "LUNAS SELESAI" : "DIKONFIRMASI SYSTEM"}</span></p>
                      <p className="text-stone-300">Dibuat Tanggal: {order.created || "2026-05-22"}</p>
                      <p className="text-stone-300">Cabang Pos: Sembalun Center</p>
                    </div>
                  </div>

                  {/* List of items table in standard layout */}
                  {/* Desktop View */}
                  <div className="hidden sm:block overflow-x-auto text-left">
                    <table className="w-full text-xs text-left text-stone-300">
                      <thead>
                        <tr className="border-b border-white/10 text-[#8ca38a] font-mono text-[10px] uppercase">
                          <th className="py-2">Item Deskripsi Rental</th>
                          <th className="py-2 text-center">Jumlah</th>
                          <th className="py-2 text-center">Durasi</th>
                          <th className="py-2 text-right">Biaya Nota</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                        <tr>
                          <td className="py-2.5 font-bold text-white text-left">
                            {order.items}
                          </td>
                          <td className="py-2.5 text-center">{order.qty} Unit</td>
                          <td className="py-2.5 text-center">{order.days} Hari</td>
                          <td className="py-2.5 text-right">{rupiah(order.total)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View */}
                  <div className="sm:hidden block text-xs space-y-2.5 text-left border-y border-white/15 py-3 font-mono">
                    <div className="flex justify-between items-start">
                      <span className="text-[#8ca38a] uppercase text-[10px]">Alat Rental</span>
                      <strong className="text-white text-right max-w-[180px] break-words">{order.items}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8ca38a] uppercase text-[10px]">Jumlah</span>
                      <span className="text-stone-300">{order.qty} Unit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8ca38a] uppercase text-[10px]">Durasi</span>
                      <span className="text-stone-300">{order.days} Hari</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8ca38a] uppercase text-[10px]">Biaya Nota</span>
                      <span className="text-amber-400 font-extrabold">{rupiah(order.total)}</span>
                    </div>
                  </div>

                  {/* Calculations ledger detail */}
                  <div className="border-t border-white/10 pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-mono text-xs text-left">
                    <div className="text-[10px] text-[#8ca38a] leading-normal max-w-sm">
                      * Tarif komputasi disinkronkan otomatis berdasarkan sistem Smart Pricing: Surcharge akhir pekan (+15%) atau Potongan multi-hari (Diskon -10%) jika durasi pendakian daki &ge; 3 hari. Belum termasuk denda operasional jika terlambat mengembalikan barang.
                    </div>
                    <div className="bg-emerald-500/[0.04] border border-emerald-500/15 p-3 rounded-lg text-right min-w-[200px] total-box">
                      <span className="text-[9px] text-[#8ca38a] uppercase block font-bold leading-none mb-1">TOTAL HARUS DIBAYAR</span>
                      <span className="text-lg font-black text-emerald-400 block leading-none">{rupiah(order.total)}</span>
                      <span className="text-[8px] text-[#8ca38a] block mt-1 uppercase font-bold">Lunas Tunai / Jaminan KTP Fisik</span>
                    </div>
                  </div>

                  {/* Official Terms & Conditions (Digital Rental Agreement) */}
                  <div className="bg-white/2 border border-white/5 p-4 rounded-xl text-[9.5px] text-[#8ca38a] space-y-2 leading-relaxed font-mono terms text-left">
                    <span className="text-white font-bold uppercase block text-[10px]">PASAL KETENTUAN HAK & KEWAJIBAN SEWA:</span>
                    <ol className="list-decimal pl-4.5 space-y-1">
                      <li>Penyewa bertanggung jawab penuh atas sterilisasi dan keselamatan kondisi barang sewaan selama daki lapangan.</li>
                      <li>Pengembalian barang sewaan wajib dilakukan pada tanggal jatuh tempo ({fmtDate(order.end)}). Keterlambatan didenda denda administratif Rp 50.000,- per hari per unit.</li>
                      <li>Penyewa memberikan persetujuan serta meletakkan kartu identitas asli berupa KTP/KTM penyaluran pendakian sebagai jaminan transaksi.</li>
                    </ol>
                  </div>

                  {/* Real Dynamic Interactive Digital Signature Row */}
                  <div className="grid grid-cols-2 gap-6 pt-4 text-xs font-mono signatures text-left">
                    
                    {/* Customer Sign */}
                    <div className="flex flex-col items-center justify-between text-center space-y-2">
                      <span className="text-[#8ca38a] text-[9.5px] uppercase tracking-wider block">Ttd. Penyewa (Tenant)</span>
                      <div className="border border-dashed border-white/10 bg-emerald-500/[0.02] rounded-xl h-16 w-full flex flex-col items-center justify-center p-2 relative overflow-hidden signature-box">
                        <span className="text-emerald-400 font-bold font-serif italic text-base transform rotate-[-2deg] select-none tracking-wide z-10 block sign-font">
                          {user.name}
                        </span>
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 rotate-[-12deg] select-none">
                          <span className="badge-stamp">CONTRACT SIGNED</span>
                        </div>
                        <span className="text-[7.5px] text-[#8ca38a] block leading-none font-sans absolute bottom-1 uppercase font-semibold">SECURE AUTO-SIGN</span>
                      </div>
                      <span className="text-stone-400 text-[10px] block font-mono">{user.name}</span>
                    </div>

                    {/* Admin Sign */}
                    <div className="flex flex-col items-center justify-between text-center space-y-2">
                      <span className="text-[#8ca38a] text-[9.5px] uppercase tracking-wider block">Ttd. Admin OutRent</span>
                      <div className="border border-dashed border-white/10 bg-amber-500/[0.02] rounded-xl h-16 w-full flex flex-col items-center justify-center p-2 relative overflow-hidden signature-box">
                        <span className="text-amber-400 font-bold font-serif italic text-base transform rotate-[-3deg] select-none tracking-wider z-10 block sign-font">
                          Adi Wangsa Eka
                        </span>
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 rotate-[15deg] select-none">
                          <span className="badge-stamp">APPROVED SYSTEM</span>
                        </div>
                        <span className="text-[7.5px] text-amber-500 block leading-none font-sans absolute bottom-1 uppercase font-semibold">BASECAMP STAMP</span>
                      </div>
                      <span className="text-stone-400 text-[10px] block font-mono">Gede Adi Wangsa</span>
                    </div>

                  </div>

                </div>
              </div>

              {/* Close footer panel */}
              <div className="px-6 py-4.5 border-t border-white/10 flex justify-end shrink-0 bg-white/2">
                <button
                  type="button"
                  onClick={() => setPrintModalBookingId(null)}
                  className="bg-white/5 hover:bg-white/10 text-stone-300 font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase transition-all"
                >
                  TUTUP JENDELA
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
export default CustomerBookings;
