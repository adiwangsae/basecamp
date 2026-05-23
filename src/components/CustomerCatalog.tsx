/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Item, Booking, User } from "../types";
import { LucideIcon } from "./LucideIcon";
import { CATS } from "../data";

interface CustomerCatalogProps {
  items: Item[];
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  user: User;
  addActivity: (action: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  setPage: (p: string) => void;
}

export const CustomerCatalog: React.FC<CustomerCatalogProps> = ({
  items,
  bookings,
  setBookings,
  user,
  addActivity,
  showToast,
  setPage,
}) => {
  const [selectedBranch, setSelectedBranch] = useState("Sembalun Utama");
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Semua");
  const [bookingItem, setBookingItem] = useState<Item | null>(null);
  const [step, setStep] = useState(1);
  
  // Booking Form State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  
  // Smart Bundle Recommendation Sub-selection state
  const [includeMatras, setIncludeMatras] = useState(false);
  const [includeSleepingBag, setIncludeSleepingBag] = useState(false);
  
  // Digital Agreement sign state verified
  const [acceptedAgreement, setAcceptedAgreement] = useState(false);

  // Load Offline Draft values automatically on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("outrent_booking_draft_2026");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.startDate) setStartDate(parsed.startDate);
        if (parsed.endDate) setEndDate(parsed.endDate);
        if (parsed.qty) setQty(parsed.qty);
        if (parsed.note) setNote(parsed.note);
      } catch (e) {
        // ignore JSON errors silently
      }
    }
  }, []);

  // Save Offline Draft on changes
  useEffect(() => {
    localStorage.setItem(
      "outrent_booking_draft_2026",
      JSON.stringify({ startDate, endDate, qty, note })
    );
  }, [startDate, endDate, qty, note]);

  const rupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleOpenBooking = (item: Item) => {
    if (item.avail <= 0) {
      showToast("Gagal: Unit alat ini sedang disewa seluruhnya!", "error");
      return;
    }
    setBookingItem(item);
    setStep(1);
    setQty(1);
    setNote("");
    setIncludeMatras(false);
    setIncludeSleepingBag(false);
    setAcceptedAgreement(false);
    
    // Set default dates: start is H+2 as per rules "Minimal Booking H-2"
    const h2 = new Date();
    h2.setDate(h2.getDate() + 2);
    const startStr = h2.toISOString().split("T")[0];
    setStartDate(startStr);

    const h3 = new Date();
    h3.setDate(h3.getDate() + 3);
    const endStr = h3.toISOString().split("T")[0];
    setEndDate(endStr);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingItem || !startDate || !endDate) return;

    if (!acceptedAgreement) {
      showToast("Gagal: Anda wajib menyetujui Perjanjian Sewa Digital KTP Jaminan!", "error");
      return;
    }

    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();
    const nowMs = new Date().getTime();

    // Check date range
    const days = Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24));
    if (days <= 0) {
      showToast("Rentang tanggal kembali harus minimal 1 hari sesudah tanggal mulai!", "error");
      return;
    }

    // Check H-2 Rule
    const h2LimitMs = nowMs + 2 * 24 * 60 * 60 * 1000;
    const isUrgent = startMs < h2LimitMs;

    if (qty > bookingItem.avail) {
      showToast(`Jumlah pesanan (${qty}) melampaui sisa stok tersedia (${bookingItem.avail})!`, "error");
      return;
    }

    // Dynamic Pricing Engine: Weekend rate +15%, discount duration card 10% for rent >= 3 days
    const baseDayRate = bookingItem.price;
    const isWeekend = new Date(startDate).getDay() === 0 || new Date(startDate).getDay() === 6;
    const dayRateMultiplied = isWeekend ? Math.round(baseDayRate * 1.15) : baseDayRate;
    
    let baseComboTotal = dayRateMultiplied * qty * days;
    let itemsMergedName = bookingItem.name;

    // Smart bundle upgrades added inside checkout session
    if (includeMatras) {
      baseComboTotal += 15000 * qty * days;
      itemsMergedName += " + Matras Spon";
    }
    if (includeSleepingBag) {
      baseComboTotal += 35000 * qty * days;
      itemsMergedName += " + SB Polar";
    }

    // Long rental discount
    const rentDiscount = days >= 3 ? Math.round(baseComboTotal * 0.10) : 0;
    const calculatedTotal = baseComboTotal - rentDiscount;

    const bookingId = "BK" + String(100 + bookings.length + 1).padStart(3, "0");

    const newBooking: Booking = {
      id: bookingId,
      custId: user.id,
      custName: user.name,
      items: itemsMergedName,
      qty,
      start: startDate,
      end: endDate,
      days,
      status: "pending_verification",
      total: calculatedTotal,
      idUploaded: false, // will let customer upload KTP/KTM inside orders screen
      created: new Date().toISOString().split("T")[0],
      note: (note ? note + " " : "") + 
            `[Cabang: ${selectedBranch}]` + 
            (isUrgent ? " (Mendesak H-1 Approval Request)" : ""),
      denda: null,
    };

    setBookings((prev) => [newBooking, ...prev]);
    addActivity(`${user.name} membuat reservasi booking ${bookingId} di ${selectedBranch}`);
    
    // Reset stored draft
    localStorage.removeItem("outrent_booking_draft_2026");

    if (isUrgent) {
      showToast("Booking H-1 Terkirim sebagai PENGAJUAN MENDESAK! Menunggu disetujui admin.", "info");
    } else {
      showToast("Booking berhasil diajukan! Menunggu verifikasi admin.", "success");
    }

    setBookingItem(null);
    setPage("customer_bookings");
  };

  const filtered = items.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || 
                        i.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === "Semua" || i.cat === selectedCat;
    return matchSearch && matchCat;
  });

  // Calendar constraints helper
  const getMinStartDate = () => {
    // Allows H-1 for urgent booking requests
    const h1 = new Date();
    h1.setDate(h1.getDate() + 1);
    return h1.toISOString().split("T")[0];
  };

  return (
    <div className="space-y-8 animate-fade-in sf-pro-font text-stone-200">
      
      {/* Search and Hero Intro Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {selectedBranch} Center
            </span>
            <div className="group relative">
              <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 cursor-pointer">
                <LucideIcon name="ShieldCheck" size={10} />
                Trust: 98/100
              </span>
              <div className="absolute left-0 top-6 w-48 p-2 bg-[#0a130c]/95 backdrop-blur-md border border-white/10 rounded-lg text-[10px] text-stone-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-20">
                Skor kepercayaan berdasarkan riwayat rental.
              </div>
            </div>
          </div>
          <h1 className="heading-jumbo text-3xl sm:text-4xl text-white tracking-wide">
            Katalog Perlengkapan
          </h1>
        </div>

        {/* Multi-Branch Selector */}
        <div className="flex items-center gap-2 bg-white/2 border border-white/5 px-3.5 py-1.5 rounded-xl">
          <span className="text-[11px] text-[#8ca38a] font-bold uppercase tracking-wider">Cabang:</span>
          <select 
            value={selectedBranch}
            onChange={(e) => {
              setSelectedBranch(e.target.value);
              showToast(`Cabang berpindah ke ${e.target.value}`, "info");
            }}
            className="bg-transparent text-stone-200 text-xs font-bold outline-none cursor-pointer focus:text-white"
          >
            <option value="Sembalun Utama" className="bg-[#0a130b] text-stone-200">Sembalun (Main Center)</option>
            <option value="Senaru Basecamp" className="bg-[#0a130b] text-stone-200">Senaru Basecamp</option>
            <option value="Sajang Pos" className="bg-[#0a130b] text-stone-200">Sajang Pos</option>
          </select>
        </div>
      </div>

      {/* Filter and Category Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
        {/* Search Input field */}
        <div className="relative w-full lg:max-w-xs shrink-0">
          <LucideIcon name="Search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8ca38a]" size={15} />
          <input
            type="text"
            placeholder="Cari tenda, carrier, matras, nesting..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/4 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-stone-500 outline-none focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Categories Pills Row */}
        <div className="flex gap-1.5 overflow-x-auto w-full pb-1.5 lg:pb-0 scrollbar-none">
          {CATS.map((cat) => {
            const isSel = selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-4 py-1.5 text-xs font-bold uppercase rounded-xl border transition-all shrink-0 ${
                  isSel
                    ? "bg-emerald-500 text-black border-emerald-400"
                    : "bg-white/5 text-[#8ca38a] border-white/5 hover:text-white"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Listings Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-[#8ca38a] text-sm">
            <LucideIcon name="Package" className="mx-auto text-[#8ca38a] mb-3" size={32} />
            Tidak ada alat camping ditemukan di kategori ini.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="liquid-glass-card flex flex-col overflow-hidden relative"
            >
              {/* Product Header visual representation */}
              <div 
                className="h-32 flex items-center justify-center relative border-b border-white/5"
                style={{
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%)"
                }}
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/20">
                  <LucideIcon name={item.iconName} size={32} />
                </div>
                <div className="absolute top-3.5 right-3.5">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-center border mr-auto sm:mr-0 ${
                    item.status === "tersedia" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    item.status === "dipinjam" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    "bg-red-500/10 text-red-500 border-red-500/20"
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Informative block */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black tracking-widest text-[#8ca38a] uppercase block">
                    Kategori: {item.cat}
                  </span>
                  <h4 className="font-extrabold text-stone-100 text-sm leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-[11.5px] text-[#8ca38a] leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end border-t border-white/5 pt-3.5">
                    <div>
                      <span className="text-[9px] text-[#8ca38a] uppercase font-bold block">Tarif Sewa</span>
                      <span className="heading-caps text-lg font-black text-amber-400">
                        {rupiah(item.price)}
                        <span className="text-[9px] text-[#8ca38a] font-normal lowercase"> / hari</span>
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8ca38a] font-semibold">
                      Stok: <span className="text-white font-bold">{item.avail}</span> / {item.stock} unit
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenBooking(item)}
                    disabled={item.avail <= 0}
                    className={`w-full font-black py-2.5 rounded-xl text-xs uppercase heading-caps tracking-widest transition-all flex items-center justify-center gap-2 ${
                      item.avail > 0
                        ? "bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-950/40"
                        : "bg-white/5 border border-white/5 text-[#8ca38a] cursor-not-allowed"
                    }`}
                  >
                    {item.avail > 0 ? (
                      <>
                        <LucideIcon name="Tent" size={14} /> BOOKING SEKARANG
                      </>
                    ) : "UNIT HABIS DISEWA"}
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Advanced Booking checkout modal popup drawer */}
      {bookingItem && (
        <div className="fixed inset-0 bg-[#020503]/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300">
          <div className="bg-[#0a130c]/98 border-t sm:border border-white/15 rounded-t-3xl sm:rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up flex flex-col pb-8 sm:pb-0">
            
            {/* iOS Bottom Sheet style drag indicator */}
            <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-2 mt-3 block sm:hidden" />
            
            {/* Header popup */}
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/2">
              <h2 className="heading-caps font-black text-white text-sm tracking-wider flex items-center gap-2">
                <LucideIcon name="Calendar" className="text-emerald-400" size={15} />
                Booking & Reservasi Alat
              </h2>
              <button
                onClick={() => setBookingItem(null)}
                className="p-1.5 px-2.5 rounded bg-white/5 border border-white/10 text-stone-400 hover:text-white"
                aria-label="Close"
              >
                <LucideIcon name="X" size={16} />
              </button>
            </div>

            {/* Progress indicator */}
            <div className="px-6 pt-4">
              <div className="flex items-center justify-between text-[10px] font-extrabold text-stone-400 bg-white/2 border border-white/5 py-2 px-3 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${step >= 1 ? "bg-emerald-500 text-black font-black" : "bg-white/5 text-stone-500"}`}>1</span>
                  <span className={step === 1 ? "text-emerald-400" : ""}>Jadwal</span>
                </div>
                <div className="h-[1px] flex-1 bg-white/5 mx-2" />
                <div className="flex items-center gap-1.5">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${step >= 2 ? "bg-emerald-500 text-black font-black" : "bg-white/5 text-stone-500"}`}>2</span>
                  <span className={step === 2 ? "text-emerald-400" : ""}>Rekomendasi</span>
                </div>
                <div className="h-[1px] flex-1 bg-white/5 mx-2" />
                <div className="flex items-center gap-1.5">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${step >= 3 ? "bg-emerald-500 text-black font-black" : "bg-white/5 text-stone-500"}`}>3</span>
                  <span className={step === 3 ? "text-emerald-400" : ""}>Selesai</span>
                </div>
              </div>
            </div>

            {/* Product summary card */}
            <div className="px-6 pt-3">
              <div className="bg-white/2 border border-white/5 p-3 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/20">
                    <LucideIcon name={bookingItem.iconName} size={20} />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8ca38a] uppercase font-bold block leading-none mb-1">{bookingItem.cat} • {selectedBranch}</span>
                    <h4 className="font-extrabold text-white text-xs leading-none">{bookingItem.name}</h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-amber-400 uppercase heading-caps block leading-none">
                    {rupiah(bookingItem.price)}<span className="text-[9px] text-[#8ca38a] font-normal lowercase">/hr</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              
              {/* STEP 1: JADWAL & JUMLAH */}
              {step === 1 && (
                <div className="space-y-4 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-[#8ca38a] uppercase block mb-1">
                        Mulai Sewa
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        min={getMinStartDate()}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-stone-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#8ca38a] uppercase block mb-1">
                        Pengembalian
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        min={startDate || getMinStartDate()}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-stone-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-[#8ca38a] uppercase block mb-1">
                        Jumlah Unit ({qty} unit)
                      </label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => setQty(Math.max(1, qty - 1))}
                          className="bg-white/5 hover:bg-white/10 text-stone-300 font-extrabold px-3 h-9 rounded-l-xl border-y border-l border-white/10 transition-all text-xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={bookingItem.avail}
                          value={qty}
                          onChange={(e) => setQty(Math.min(bookingItem.avail, Math.max(1, Number(e.target.value))))}
                          className="w-full bg-stone-900 border-y border-white/10 text-xs text-center text-stone-200 outline-none focus:border-emerald-500 h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setQty(Math.min(bookingItem.avail, qty + 1))}
                          className="bg-white/5 hover:bg-white/10 text-stone-300 font-extrabold px-3 h-9 rounded-r-xl border-y border-r border-white/10 transition-all text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#8ca38a] uppercase block mb-1">
                        Basecamp Pengambilan
                      </label>
                      <div className="bg-stone-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white font-bold h-9 flex items-center gap-2">
                        <LucideIcon name="MapPin" size={13} className="text-emerald-400" /> {selectedBranch}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setBookingItem(null)}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-stone-300 font-bold px-4 py-2.5 rounded-xl text-xs uppercase"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!startDate || !endDate) {
                          showToast("Harap tentukan tanggal sewa!", "error");
                          return;
                        }
                        const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24));
                        if (days <= 0) {
                          showToast("Kembali sewa minimal 1 hari sesudah mulai sewa!", "error");
                          return;
                        }
                        setStep(2);
                      }}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider"
                    >
                      Selanjutnya <LucideIcon name="ArrowRight" size={12} className="ml-1" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SMART RECOMMENDATIONS */}
              {step === 2 && (
                <div className="space-y-4 text-left">
                  <span className="text-[10px] text-emerald-400 uppercase font-black tracking-widest block flex items-center gap-1.5">
                    <LucideIcon name="Gift" size={12} /> Rekomendasi Tambah Alat Hemat:
                  </span>
                  
                  <div className="space-y-2">
                    {/* Item 1 */}
                    <div
                      onClick={() => setIncludeMatras(!includeMatras)}
                      className={`border p-3 rounded-xl cursor-pointer flex items-center justify-between transition-all ${includeMatras ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/2 border-white/5 text-stone-300 hover:bg-white/5"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded flex items-center justify-center border text-[9px] ${includeMatras ? "bg-emerald-500 border-emerald-400 text-black font-bold" : "border-white/20 bg-stone-900"}`}>
                          {includeMatras && (
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Matras Cacing Ringan</p>
                          <p className="text-[10px] text-[#8ca38a]">Alas thermal punggung nyaman (+Rp 15.000/hr)</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-amber-400">+{rupiah(15000)}</span>
                    </div>

                    {/* Item 2 */}
                    <div
                      onClick={() => setIncludeSleepingBag(!includeSleepingBag)}
                      className={`border p-3 rounded-xl cursor-pointer flex items-center justify-between transition-all ${includeSleepingBag ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/2 border-white/5 text-stone-300 hover:bg-white/5"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded flex items-center justify-center border text-[9px] ${includeSleepingBag ? "bg-emerald-500 border-emerald-400 text-black font-bold" : "border-white/20 bg-stone-900"}`}>
                          {includeSleepingBag && (
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Sleeping Bag Polar Hangat</p>
                          <p className="text-[10px] text-[#8ca38a]">Sangat penting di puncak dingin (+Rp 35.000/hr)</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-amber-400">+{rupiah(35000)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#8ca38a] uppercase block mb-1">
                      Catatan atau Ukuran (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Contoh: Titip jemput subuh, request tenda warna kuning dsb..."
                      className="w-full bg-stone-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <div className="pt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-stone-300 font-bold px-4 py-2.5 rounded-xl text-xs uppercase"
                    >
                      Kembali
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider"
                    >
                      Lanjut Review <LucideIcon name="ArrowRight" size={12} className="ml-1" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: SUMMARY & AGREEMENT */}
              {step === 3 && (
                <div className="space-y-4 text-left">
                  {startDate && endDate && (() => {
                    const startMs = new Date(startDate).getTime();
                    const endMs = new Date(endDate).getTime();
                    const days = Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24));

                    const startLimitMs = new Date().getTime() + 2 * 24 * 60 * 60 * 1000;
                    const isUrgent = startMs < startLimitMs;

                    const baseDayRate = bookingItem.price;
                    const isWeekend = new Date(startDate).getDay() === 0 || new Date(startDate).getDay() === 6;
                    const dayRateMultiplied = isWeekend ? Math.round(baseDayRate * 1.15) : baseDayRate;
                    
                    let baseComboTotal = dayRateMultiplied * qty * days;
                    if (includeMatras) baseComboTotal += 15000 * qty * days;
                    if (includeSleepingBag) baseComboTotal += 35000 * qty * days;

                    const rentDiscount = days >= 3 ? Math.round(baseComboTotal * 0.10) : 0;
                    const calculatedTotal = baseComboTotal - rentDiscount;

                    return (
                      <div className="space-y-4">
                        {isUrgent && (
                          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold p-3 rounded-xl text-[10px] leading-relaxed flex items-center justify-between">
                            <span className="flex items-center gap-1.5"><LucideIcon name="AlertTriangle" size={12} /> Sewa Mendesak H-1 (Butuh Verifikasi Manual)</span>
                          </div>
                        )}

                        {/* Invoice summary cards */}
                        <div className="bg-emerald-500/[0.03] border border-emerald-500/15 rounded-xl p-3.5 space-y-2">
                          <div className="flex justify-between items-center text-[10px] text-stone-400 font-bold uppercase pb-1.5 border-b border-white/5">
                            <span>REKAP PEMBAYARAN ({days} HARI)</span>
                            <span className="text-emerald-400">#BK-PREV</span>
                          </div>

                          <div className="flex justify-between items-center text-xs text-stone-200">
                            <span>Sewa Alat Utama (×{qty})</span>
                            <span>{rupiah(dayRateMultiplied * qty * days)}</span>
                          </div>

                          {(includeMatras || includeSleepingBag) && (
                            <div className="flex justify-between items-center text-xs text-stone-300">
                              <span>Addons Upgrade</span>
                              <span>+{rupiah(((includeMatras ? 15000 : 0) + (includeSleepingBag ? 35000 : 0)) * qty * days)}</span>
                            </div>
                          )}

                          {isWeekend && (
                            <div className="flex justify-between items-center text-[10px] text-amber-400 font-bold">
                              <span>Surcharge Weekend (+15%)</span>
                              <span>Aktif</span>
                            </div>
                          )}

                          {days >= 3 && (
                            <div className="flex justify-between items-center text-[10px] text-emerald-400 font-black uppercase">
                              <span>Diskon Multi-hari (-10%)</span>
                              <span>-{rupiah(rentDiscount)}</span>
                            </div>
                          )}

                          <div className="border-t border-white/5 pt-2 flex justify-between items-center">
                            <div>
                              <span className="block text-[9px] text-emerald-400 font-black uppercase tracking-wider">TOTAL BENDA</span>
                              <span className="text-[9px] text-[#8ca38a]">Wajib serah kartu KTP</span>
                            </div>
                            <span className="heading-caps text-md font-black text-emerald-400 text-lg">
                              {rupiah(calculatedTotal)}
                            </span>
                          </div>
                        </div>

                        {/* Agreement Checkboxes */}
                        <div className="bg-white/2 border border-white/5 p-3 rounded-xl space-y-2">
                          <p className="text-[9.5px] leading-relaxed text-[#8ca38a] font-mono">
                            Dengan kirim reservasi ini, saya bersedia meletakkan identitas asli KTP/KTM di loket, daki aman, dan bertanggungjawab atas keutuhan unit.
                          </p>
                          <label className="flex items-start gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={acceptedAgreement}
                              onChange={(e) => setAcceptedAgreement(e.target.checked)}
                              className="mt-0.5 rounded text-emerald-500 bg-stone-900 border-white/10"
                              required
                            />
                            <span className="text-[11px] text-stone-200 font-extrabold leading-tight">
                              Saya setuju, sedia jaminan fisik KTP & taat aturan.
                            </span>
                          </label>
                        </div>

                        {/* Submit */}
                        <div className="pt-2 flex gap-3">
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="bg-white/5 hover:bg-white/10 text-stone-300 font-bold px-4 py-2.5 rounded-xl text-xs uppercase"
                          >
                            Kembali
                          </button>
                          <button
                            type="button"
                            onClick={handleConfirmBooking}
                            disabled={!acceptedAgreement}
                            className={`flex-1 font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest shadow-lg ${
                              acceptedAgreement
                                ? "bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-950/40"
                                : "bg-stone-800 text-stone-500 cursor-not-allowed border border-white/5"
                            }`}
                          >
                            KIRIM BOOKING <LucideIcon name="Tent" size={14} className="ml-1" />
                          </button>
                        </div>
                      </div>
                    );
                   })()}
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
export default CustomerCatalog;
