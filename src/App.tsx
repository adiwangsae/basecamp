/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, Item, Booking, ActivityLog, SystemNotification } from "./types";
import {
  INIT_ITEMS,
  INIT_BOOKINGS,
  INIT_USERS,
  INIT_ACTIVITIES,
  loadState,
  saveState,
} from "./data";

// Subcomponents
import { StarryBackground } from "./components/StarryBackground";
import { Header } from "./components/Header";
import { LucideIcon } from "./components/LucideIcon";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminBarang } from "./components/AdminBarang";
import { AdminVerifications } from "./components/AdminVerifications";
import { AdminHistory } from "./components/AdminHistory";
import { CustomerCatalog } from "./components/CustomerCatalog";
import { CustomerBookings } from "./components/CustomerBookings";
import { CustomerProfile } from "./components/CustomerProfile";
import { LandingPage } from "./components/LandingPage";

export default function App() {
  /* ─── Persistent States ──────────────────────────────────────── */
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<string>("landing");

  const [items, setItems] = useState<Item[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [notifs, setNotifs] = useState<SystemNotification[]>([
    {
      id: 1,
      text: "Booking Antrean #BK001 menunggu verifikasi identitas",
      type: "warn",
      read: false,
      created_at: "Baru saja",
    },
    {
      id: 2,
      text: "Sistem mendeteksi keterlambatan pengembalian Booking #BK006",
      type: "danger",
      read: false,
      created_at: "3 Jam Lalu",
    },
    {
      id: 3,
      text: "Tenda Dome 2 unit berhasil dilepas servis maintenance",
      type: "success",
      read: true,
      created_at: "1 Hari Lalu",
    },
  ]);

  /* ─── UI Temporary States ────────────────────────────────────── */
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  
  // Auth Forms
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPass, setRegPass] = useState("");

  /* ─── Initializer & LocalStorage Sync ────────────────────────── */
  useEffect(() => {
    // Attempt local state loading
    const local = loadState();
    
    if (local.items) setItems(local.items);
    else setItems(INIT_ITEMS);

    if (local.bookings) setBookings(local.bookings);
    else setBookings(INIT_BOOKINGS);

    if (local.activities) setActivities(local.activities);
    else setActivities(INIT_ACTIVITIES);

    // Session recall
    const activeSession = localStorage.getItem("bc_active_user");
    if (activeSession) {
      const recalledUser: User = JSON.parse(activeSession);
      setUser(recalledUser);
      setPage(recalledUser.role === "admin" ? "admin_dashboard" : "customer_catalog");
    }
  }, []);

  // Sync state upgrades to LocalStorage
  useEffect(() => {
    if (items.length > 0 || bookings.length > 0) {
      saveState(items, bookings, activities);
    }
  }, [items, bookings, activities]);

  /* ─── UI Helper Utility Actions ─────────────────────────────── */
  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const addActivity = (action: string) => {
    const freshLog: ActivityLog = {
      id: Date.now(),
      user: user ? user.name : "Pengendali",
      role: user ? user.role : "customer",
      action,
      timestamp: "Baru saja",
    };
    setActivities((prev) => [freshLog, ...prev]);
  };

  /* ─── Auth Handlers ────────────────────────────────────────── */
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPass) {
      showToast("Gagal: Email dan password harus diisi!", "error");
      return;
    }

    // Match users
    const matched = INIT_USERS.find(
      (u) => u.email.toLowerCase() === loginEmail.toLowerCase() && u.pass === loginPass
    );

    if (matched) {
      setUser(matched);
      localStorage.setItem("bc_active_user", JSON.stringify(matched));
      setPage(matched.role === "admin" ? "admin_dashboard" : "customer_catalog");
      showToast(`Selamat datang kembali, ${matched.name}! • Basecamp Outdoor`, "success");
      addActivity(`${matched.name} berhasil log in ke sistem`);
    } else {
      showToast("Email atau sandi keliru! Silakan coba lagi.", "error");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPass || !regPhone) {
      showToast("Gagal: Harap isi semua rincian bidang registrasi!", "error");
      return;
    }

    const createdUser: User = {
      id: Date.now(),
      name: regName,
      email: regEmail,
      role: "customer",
      pass: regPass,
      phone: regPhone,
    };

    // Store state & login
    setUser(createdUser);
    localStorage.setItem("bc_active_user", JSON.stringify(createdUser));
    setPage("customer_catalog");
    showToast(`Akun berhasil terdaftar! Selamat bergabung ${regName}`, "success");
    addActivity(`Registrasi akun pelanggan baru oleh: ${regName}`);

    // clear values
    setRegName("");
    setRegEmail("");
    setRegPhone("");
    setRegPass("");
  };

  const handleLogout = () => {
    if (user) {
      addActivity(`${user.name} keluar dari sistem`);
    }
    setUser(null);
    localStorage.removeItem("bc_active_user");
    setPage("landing");
    showToast("Anda telah berhasil logout/keluar dari akun.", "info");
  };

  /* ─── Auto Demonstration fill-up links ─────────────────────── */
  const fillDemoAccount = (role: "admin" | "customer") => {
    if (role === "admin") {
      setLoginEmail("admin@basecamp.id");
      setLoginPass("admin123");
      showToast("Formulir terisi: Akun Administrator Demo!", "info");
    } else {
      setLoginEmail("andi@mail.com");
      setLoginPass("123456");
      showToast("Formulir terisi: Akun Customer Demo!", "info");
    }
  };

  return (
    <div className="min-h-screen w-full max-w-[100vw] bg-[#050a06] text-[#eef5ec] antialiased select-none font-sans overflow-x-hidden relative">
      
      {/* Immersive background star mountain overlay */}
      {page === "landing" || page === "login_screen" ? (
        <StarryBackground />
      ) : null}

      {/* Primary content router */}
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        
        {/* LANDING PAGE SCREEN */}
        {page === "landing" && (
          <LandingPage
            setPage={setPage}
            setAuthTab={setAuthTab}
            fillDemoAccount={fillDemoAccount}
          />
        )}

        {/* AUTHENTICATION PATH SCREENS */}
        {page === "login_screen" && (
          <div className="flex-1 flex flex-col justify-center px-6 py-12 relative">
            <div className="max-w-md w-full mx-auto space-y-6">
              
              {/* Logo block */}
              <div 
                onClick={() => setPage("landing")}
                className="text-center space-y-2 cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center mx-auto shadow-xl group-hover:scale-105 transition-transform border border-emerald-400/25">
                  <LucideIcon name="Tent" className="text-emerald-100" size={24} />
                </div>
                <div>
                  <h3 className="heading-caps font-black tracking-widest text-white text-2xl leading-none">
                    BASECAMP
                  </h3>
                  <p className="text-[10px] text-[#8ca38a] uppercase tracking-wider font-bold">
                    Teknologi Manajemen Rental
                  </p>
                </div>
              </div>

              {/* Credentials tabs panel inside Card */}
              <div className="bg-[#0b140d]/92 backdrop-blur-2xl border border-white/10 rounded-2xl p-6.5 shadow-2xl relative">
                
                {/* Tabs clickers */}
                <div className="flex bg-white/5 border border-white/5 rounded-xl p-1 mb-6">
                  <button
                    onClick={() => setAuthTab("login")}
                    className={`flex-1 py-2 rounded-lg text-xs uppercase heading-caps font-black tracking-wider transition-all ${
                      authTab === "login" 
                        ? "bg-emerald-500 text-black" 
                        : "text-[#8ca38a] hover:text-stone-200"
                    }`}
                  >
                    Masuk Akun
                  </button>
                  <button
                    onClick={() => setAuthTab("register")}
                    className={`flex-1 py-2 rounded-lg text-xs uppercase heading-caps font-black tracking-wider transition-all ${
                      authTab === "register" 
                        ? "bg-emerald-500 text-black" 
                        : "text-[#8ca38a] hover:text-stone-200"
                    }`}
                  >
                    Daftar Baru
                  </button>
                </div>

                {/* Forms Render */}
                {authTab === "login" ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    
                    <div>
                      <label className="text-[10px] font-bold text-[#8ca38a] uppercase tracking-wider block mb-1">
                        Surel / Alamat Email
                      </label>
                      <input
                        type="email"
                        placeholder="andi@mail.com, admin@basecamp.id..."
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full bg-stone-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-emerald-500 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#8ca38a] uppercase tracking-wider block mb-1">
                        Sandi Keamanan
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        className="w-full bg-stone-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-emerald-500 transition-colors"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold py-3 rounded-xl text-xs uppercase tracking-widest transition-all mt-4"
                    >
                      MASUK OPERASIONAL SYSTEM
                    </button>

                    {/* Demonstration Quick Selector triggers */}
                    <div className="pt-4 border-t border-white/5 space-y-2.5">
                      <span className="text-[9px] font-black text-[#8ca38a] uppercase tracking-widest block text-center">
                        AUTOPILOT DEMO CREDS (KLIK UNTUK AUTOFILL)
                      </span>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => fillDemoAccount("customer")}
                          className="bg-white/3 border border-white/5 hover:border-emerald-500/20 text-[#8ca38a] hover:text-white text-[10px] font-semibold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5"
                        >
                          <LucideIcon name="User" size={12} /> Pelanggan Demo
                        </button>
                        <button
                          type="button"
                          onClick={() => fillDemoAccount("admin")}
                          className="bg-white/3 border border-white/5 hover:border-amber-500/20 text-[#8ca38a] hover:text-white text-[10px] font-semibold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5"
                        >
                          <LucideIcon name="ShieldCheck" size={12} /> Administrator Demo
                        </button>
                      </div>
                    </div>

                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    
                    <div>
                      <label className="text-[10px] font-bold text-[#8ca38a] uppercase block mb-1">
                        Nama Lengkap Sesuai KTP
                      </label>
                      <input
                        type="text"
                        placeholder="Andi Pratama, Sari Dewi..."
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full bg-stone-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#8ca38a] uppercase block mb-1">
                        Alamat Email Aktif
                      </label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-stone-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#8ca38a] uppercase block mb-1">
                        Kontak Handphone / Whatsapp
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 08123456789"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full bg-stone-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#8ca38a] uppercase block mb-1">
                        Sandi Akun (Min. 6 Karakter)
                      </label>
                      <input
                        type="password"
                        placeholder="Buat sandi tangguh..."
                        value={regPass}
                        onChange={(e) => setRegPass(e.target.value)}
                        className="w-full bg-stone-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold py-3 rounded-xl text-xs uppercase tracking-widest transition-all mt-4"
                    >
                      Daftarkan Sekarang
                    </button>

                  </form>
                )}

              </div>

              {/* Back to landing selector link */}
              <div className="text-center">
                <button
                  onClick={() => setPage("landing")}
                  className="text-xs text-[#8ca38a] hover:text-white font-medium transition-colors flex items-center justify-center gap-1.5 mx-auto"
                >
                  <LucideIcon name="ArrowLeft" size={12} /> Batalkan & Kembali ke Beranda
                </button>
              </div>

            </div>
          </div>
        )}

        {/* SECURE PROTECTED LOGIN AREA SYSTEM ROUTES */}
        {user && (
          <div className="flex flex-col flex-1">
            
            {/* Header navigations mapping */}
            <Header
              user={user}
              currentPage={page}
              setPage={setPage}
              notifs={notifs}
              setNotifs={setNotifs}
              handleLogout={handleLogout}
            />

            {/* Content Display Body Area */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 md:py-8 relative">
              
              {/* ADMIN VIEWS ROUTING */}
              {user.role === "admin" && (
                <>
                  {page === "admin_dashboard" && (
                    <AdminDashboard
                      items={items}
                      bookings={bookings}
                      setBookings={setBookings}
                      activities={activities}
                      addActivity={addActivity}
                      showToast={showToast}
                      setPage={setPage}
                    />
                  )}
                  {page === "admin_items" && (
                    <AdminBarang
                      items={items}
                      setItems={setItems}
                      addActivity={addActivity}
                      showToast={showToast}
                    />
                  )}
                  {page === "admin_verifications" && (
                    <AdminVerifications
                      bookings={bookings}
                      setBookings={setBookings}
                      items={items}
                      setItems={setItems}
                      addActivity={addActivity}
                      showToast={showToast}
                    />
                  )}
                  {page === "admin_history" && (
                    <AdminHistory
                      bookings={bookings}
                      activities={activities}
                    />
                  )}
                </>
              )}

              {/* CUSTOMER VIEWS ROUTING */}
              {user.role === "customer" && (
                <>
                  {page === "customer_catalog" && (
                    <CustomerCatalog
                      items={items}
                      bookings={bookings}
                      setBookings={setBookings}
                      user={user}
                      addActivity={addActivity}
                      showToast={showToast}
                      setPage={setPage}
                    />
                  )}
                  {page === "customer_bookings" && (
                    <CustomerBookings
                      bookings={bookings}
                      setBookings={setBookings}
                      user={user}
                      showToast={showToast}
                    />
                  )}
                  {page === "customer_profile" && (
                    <CustomerProfile
                      user={user}
                      setUser={setUser}
                      bookings={bookings}
                      showToast={showToast}
                    />
                  )}
                </>
              )}

            </main>

          </div>
        )}

      </div>

      {/* Global alert Toast elements notification screen overlay */}
      {toast && (
        <div 
          className={`fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 p-4 rounded-xl flex items-center gap-2.5 shadow-2xl border transition-all animate-scale-up ${
            toast.type === "error" 
              ? "bg-red-950/95 text-red-100 border-red-500/20" 
              : toast.type === "info" 
                ? "bg-sky-950/95 text-[#eef5ec] border-sky-500/20"
                : "bg-[#0b1a0d]/98 text-emerald-100 border-emerald-500/20"
          }`}
        >
          <LucideIcon 
            name={toast.type === "error" ? "AlertTriangle" : toast.type === "info" ? "Info" : "CheckCircle"} 
            className={toast.type === "error" ? "text-red-400" : toast.type === "info" ? "text-sky-400" : "text-emerald-400"} 
            size={18} 
          />
          <span className="text-xs font-bold font-sans tracking-wide">
            {toast.msg}
          </span>
        </div>
      )}

    </div>
  );
}
