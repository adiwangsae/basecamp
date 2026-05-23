/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { LucideIcon } from "./LucideIcon";

interface LandingPageProps {
  setPage: (page: string) => void;
  setAuthTab: (tab: "login" | "register") => void;
  fillDemoAccount: (role: "admin" | "customer") => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  setPage,
  setAuthTab,
  fillDemoAccount,
}) => {
  const [activeSection, setActiveSection] = useState(0);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [activeTab, setActiveTab] = useState<"booking" | "pricing" | "maintenance" | "conflict">("booking");
  
  // Interactive Availability State
  const [selectedGear, setSelectedGear] = useState("Tenda Dome 4P");
  const [checkStartDate, setCheckStartDate] = useState("2026-05-24");
  const [checkEndDate, setCheckEndDate] = useState("2026-05-26");
  const [availQueryRes, setAvailQueryRes] = useState({
    status: "available",
    msg: "Tersedia! 100% Siap dipinjam.",
    detail: "Stok aktif: 5 unit. Bebas bentrok jadwal pada tanggal terpilih.",
    price: 75000,
    disc: 0,
    total: 150000
  });

  // Bundle Selector State
  const [bundleMain, setBundleMain] = useState("Tenda");
  const [bundleAddons, setBundleAddons] = useState<string[]>([]);

  // Damage Slider Comparison State
  const [sliderPos, setSliderPos] = useState(50);

  // Digital Agreement state
  const [digitalSignedName, setDigitalSignedName] = useState("");
  const [isAgreementAccepted, setIsAgreementAccepted] = useState(false);
  const [isAgreementSigned, setIsAgreementSigned] = useState(false);

  // Reference for the outer scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll offset & cursor glowing coordinates
  const [scrollTop, setScrollTop] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Use IntersectionObserver to highlight current active slide side-dot
  useEffect(() => {
    const sections = scrollContainerRef.current?.querySelectorAll(".snap-scroll-section");
    if (!sections) return;

    const observerOption = {
      root: scrollContainerRef.current,
      threshold: 0.6, // Trigger dot update when 60% of the section is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute("data-index") || "0");
          setActiveSection(index);
        }
      });
    }, observerOption);

    sections.forEach((sec) => observer.observe(sec));

    return () => {
      sections.forEach((sec) => observer.unobserve(sec));
    };
  }, []);

  // Quick anchor scroll helper
  const scrollToSection = (idx: number) => {
    const targetSection = scrollContainerRef.current?.querySelector(`[data-index='${idx}']`);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
      setActiveSection(idx);
    }
  };

  // Perform demo access login
  const triggerDemoLogin = (role: "admin" | "customer") => {
    fillDemoAccount(role);
    setAuthTab("login");
    setPage("login_screen");
  };

  // Calculate dynamic pricing & stock overlap simulator
  const handleCheckAvail = (gear: string, sDate: string, eDate: string) => {
    const days = Math.max(1, Math.ceil((new Date(eDate).getTime() - new Date(sDate).getTime()) / (1000 * 3600 * 24)));
    let basePrice = 75000;
    if (gear === "Carrier 60L") basePrice = 50000;
    if (gear === "Kompor Portable") basePrice = 30000;
    if (gear === "Sleeping Bag") basePrice = 35000;

    // Surcharge and discount calculations
    const isWeekend = new Date(sDate).getDay() === 0 || new Date(sDate).getDay() === 6;
    const rateMul = isWeekend ? 1.15 : 1.0; // Weekend surcharge +15%
    const disRate = days >= 3 ? 0.10 : 0.0; // Long rent discount >3 days 10%
    
    const finalDayRate = Math.round(basePrice * rateMul);
    const subTotal = finalDayRate * days;
    const discountAmount = Math.round(subTotal * disRate);
    const finalTotal = subTotal - discountAmount;

    // Simulate warning logic for dates
    const isConflict = sDate === "2026-05-12" || sDate === "2026-05-13" || sDate === "2026-05-14";

    if (isConflict) {
      setAvailQueryRes({
        status: "conflict",
        msg: `${gear} penuh pada tanggal terpilih!`,
        detail: `Estimasi unit tersedia kembali mulai 15 Mei 2026. Pilih tanggal lain.`,
        price: basePrice,
        disc: 0,
        total: 0
      });
    } else {
      setAvailQueryRes({
        status: "available",
        msg: "Sangat Tersedia! Unit steril siap diambil.",
        detail: `Rincian: Harian ${isWeekend ? "(Weekend Surcharge +15%)" : "(Weekday Normal)"}. ${days >= 3 ? "Paket Bundle Hemat >3 hari aktif (Diskon -10%)" : "Tarif Standar."}`,
        price: finalDayRate,
        disc: discountAmount,
        total: finalTotal
      });
    }
  };

  useEffect(() => {
    handleCheckAvail(selectedGear, checkStartDate, checkEndDate);
  }, [selectedGear, checkStartDate, checkEndDate]);

  // Handle bundle option toggling
  const toggleBundleAddon = (item: string) => {
    if (bundleAddons.includes(item)) {
      setBundleAddons(bundleAddons.filter(a => a !== item));
    } else {
      setBundleAddons([...bundleAddons, item]);
    }
  };

  return (
    <div className="flex flex-col h-screen text-[#eef5ec] overflow-hidden sf-pro-font bg-[#050a06] relative px-4 sm:px-6">
      
      {/* Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute inset-0" 
          style={{
            background: "radial-gradient(ellipse at 50% 0%, #0d1e13 0%, #050a06 65%, #020503 100%)"
          }}
        />

        {/* Custom Subtle Interactive Glow follow cursor */}
        <div 
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.06] bg-emerald-500 blur-[130px] transition-transform duration-300 ease-out pointer-events-none hidden md:block"
          style={{
            transform: `translate(${mousePos.x - 200}px, ${mousePos.y - 200}px)`
          }}
        />

        {/* Stars Layer with Custom Twinkles and Parallax Shift */}
        <div 
          className="absolute inset-0 opacity-40 transition-transform duration-75 ease-out"
          style={{
            transform: `translateY(${scrollTop * 0.12}px)`
          }}
        >
          <div className="absolute top-[8%] left-[5%] w-[1.5px] h-[1.5px] bg-white rounded-full star-twinkle-1" />
          <div className="absolute top-[16%] left-[24%] w-[2px] h-[2px] bg-amber-400 rounded-full star-twinkle-2" />
          <div className="absolute top-[5%] left-[48%] w-[1.5px] h-[1.5px] bg-white rounded-full star-twinkle-3" />
          <div className="absolute top-[21%] left-[68%] w-[2.5px] h-[2.5px] bg-sky-200 rounded-full star-twinkle-1" />
          <div className="absolute top-[12%] left-[82%] w-[2px] h-[2px] bg-white rounded-full star-twinkle-2" />
          <div className="absolute top-[35%] left-[12%] w-[1.5px] h-[1.5px] bg-yellow-100 rounded-full star-twinkle-3" />
          <div className="absolute top-[28%] left-[55%] w-[2px] h-[2px] bg-white rounded-full star-twinkle-1" />
          <div className="absolute top-[42%] left-[76%] w-[2px] h-[2px] bg-white rounded-full star-twinkle-2" />
          <div className="absolute top-[32%] left-[92%] w-[1.5px] h-[1.5px] bg-emerald-300 rounded-full star-twinkle-3" />
          <div className="absolute top-[55%] left-[30%] w-[2px] h-[2px] bg-white rounded-full star-twinkle-1" />
          <div className="absolute top-[48%] left-[88%] w-[2px] h-[2px] bg-amber-300 rounded-full star-twinkle-2" />
        </div>

        {/* Fine Noise Texture simulated via linear opacity overlays */}
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Subtle animated aurora glow with Parallax Shift */}
        <div 
          className="absolute top-[-10%] left-[20%] w-[60vw] h-[35vh] rounded-full blur-[120px] opacity-15 pointer-events-none animate-pulse transition-transform duration-75 ease-out"
          style={{
            background: "radial-gradient(circle, #0e7490 0%, #0369a1 40%, transparent 80%)",
            animationDuration: "14s",
            transform: `translateY(${scrollTop * 0.18}px)`
          }}
        />
        <div 
          className="absolute top-[-15%] right-[15%] w-[50vw] h-[30vh] rounded-full blur-[100px] opacity-10 pointer-events-none animate-pulse transition-transform duration-75 ease-out"
          style={{
            background: "radial-gradient(circle, #059669 0%, #047857 50%, transparent 80%)",
            animationDuration: "18s",
            transform: `translateY(${scrollTop * 0.15}px)`
          }}
        />
      </div>

      {/* FLOATING TRANSPARENT GLASS BRAND NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-3 sm:py-4 px-6 liquid-glass-navbar">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection(0)}>
            <div className="w-8.5 h-8.5 rounded-xl bg-emerald-500/20 border border-emerald-400/25 flex items-center justify-center shadow-lg shadow-emerald-950/30">
              <LucideIcon name="Tent" className="text-emerald-400" size={17} />
            </div>
            <div>
              <span className="heading-caps text-md font-black tracking-widest text-white block leading-none">
                OUTRENT
              </span>
              {/* Removed slogan per request */}
            </div>
          </div>

          {/* Clean Navigation (Max 5-6 Items) */}
          <div className="hidden md:flex items-center gap-7 text-[#8ca38a] text-xs font-bold font-sans">
            <button 
              onClick={() => scrollToSection(1)} 
              className={`hover:text-white transition-colors uppercase tracking-wider ${activeSection === 1 ? "text-emerald-400 font-extrabold" : ""}`}
            >
              Fitur
            </button>
            <button 
              onClick={() => scrollToSection(2)} 
              className={`hover:text-white transition-colors uppercase tracking-wider ${activeSection === 2 ? "text-emerald-400 font-extrabold" : ""}`}
            >
              Alur
            </button>
            <button 
              onClick={() => scrollToSection(3)} 
              className={`hover:text-white transition-colors uppercase tracking-wider ${activeSection === 3 ? "text-emerald-400 font-extrabold" : ""}`}
            >
              Simulasi
            </button>
            <button 
              onClick={() => scrollToSection(4)} 
              className={`hover:text-white transition-colors uppercase tracking-wider ${activeSection === 4 ? "text-emerald-400 font-extrabold" : ""}`}
            >
              Keunggulan
            </button>
            <button 
              onClick={() => scrollToSection(5)} 
              className={`hover:text-white transition-colors uppercase tracking-wider ${activeSection === 5 ? "text-emerald-400 font-extrabold" : ""}`}
            >
              Ulasan
            </button>
          </div>

          {/* Actions Block */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setAuthTab("login");
                setPage("login_screen");
              }}
              className="text-stone-300 hover:text-white text-xs font-bold px-3 py-1.5 transition-all uppercase tracking-wider"
            >
              LOGIN
            </button>
            <button
              onClick={() => {
                setAuthTab("register");
                setPage("login_screen");
              }}
              className="liquid-glass-button bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black font-extrabold px-4.5 py-2 rounded-xl text-xs uppercase tracking-wide shadow-md border border-emerald-500/20"
            >
              DAFTAR
            </button>
          </div>

        </div>
      </nav>

      {/* FLOAT SIDE DOT INDICATOR NAVIGATOR */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-4">
        {[
          "Beranda",
          "Fitur Utama",
          "Alur Rental",
          "Pusat Simulasi",
          "Keunggulan",
          "Showcase Operasional",
          "Akses Portal"
        ].map((title, index) => {
          const isAct = activeSection === index;
          return (
            <button
              key={index}
              onClick={() => scrollToSection(index)}
              className="group flex items-center justify-end gap-3.5 outline-none relative"
              title={title}
            >
              <span className={`text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 transition-all duration-300 absolute right-6 opacity-0 group-hover:opacity-100 pr-1 ${isAct ? "opacity-100 font-black text-white" : ""}`}>
                {title}
              </span>
              <div 
                className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 ${
                  isAct 
                    ? "bg-emerald-400 border-emerald-400 scale-125 shadow-[0_0_10px_#10b981]" 
                    : "bg-white/10 border-white/20 group-hover:bg-white/30"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* MANDATORY SCROLL SNAP VERTICAL CONTAINER */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="snap-scroll-container flex-1 z-10 w-full"
      >
        
        {/* =========================================
            SECTION 1 — HERO SECTION
            ========================================= */}
        <section 
          data-index={0}
          className="snap-scroll-section hero-container px-6 sm:px-8 md:px-12 pt-20 sm:pt-24 pb-12 md:py-0 relative flex flex-col justify-center items-center text-center h-auto min-h-screen md:h-screen md:max-h-screen md:overflow-hidden shrink-0"
        >
          {/* Subtle Silhouette Background */}
          <div className="absolute inset-x-0 bottom-0 pointer-events-none h-[40%] opacity-20 z-0">
            <svg viewBox="0 0 1440 320" className="w-full h-full fill-current text-emerald-950" preserveAspectRatio="none">
              <path d="M0,160 L320,100 L640,200 L960,80 L1280,180 L1440,120 L1440,320 L0,320 Z" />
            </svg>
          </div>

          <div className="max-w-4xl mx-auto w-full space-y-4 sm:space-y-6 relative z-10 sm:-mt-8">
            <h1 className="heading-jumbo text-[2.5rem] leading-[1.05] sm:text-6xl md:text-7xl font-extrabold tracking-tight relative group">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-emerald-100 via-emerald-400 to-emerald-900 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] filter contrast-125">
                Rental Perlengkapan Outdoor
              </span>
              {/* Glossy Overlay for Liquid Glass Effect */}
              <span className="absolute inset-0 z-20 text-transparent bg-clip-text bg-gradient-to-tr from-transparent via-white/40 to-transparent drop-shadow-sm mix-blend-overlay pointer-events-none" aria-hidden="true">
                Rental Perlengkapan Outdoor
              </span>
              <span className="absolute inset-0 z-0 text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-1000" aria-hidden="true">
                Rental Perlengkapan Outdoor
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-[#8ca38a] max-w-xl mx-auto leading-relaxed px-4 sm:px-0">
              Sewa tenda, carrier, sleeping bag, dan perlengkapan outdoor lainnya dalam satu sistem rental yang rapi, praktis, dan mudah digunakan.
            </p>

            <div className="pt-2">
              <button
                onClick={() => {
                  setAuthTab("register");
                  setPage("login_screen");
                }}
                className="liquid-glass-button bg-white/5 text-white font-black px-8 py-3.5 sm:px-10 sm:py-4 rounded-2xl border border-white/20 text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 hover:bg-white/10 backdrop-blur-xl shadow-2xl hover:shadow-emerald-500/10 flex items-center gap-2 mx-auto"
              >
                Mulai Booking
                <LucideIcon name="ChevronRight" size={16} className="text-emerald-400" />
              </button>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 2 — FITUR UTAMA
            ========================================= */}
        <section 
          data-index={1}
          className="snap-scroll-section px-4 sm:px-8 md:px-12 pt-24 pb-16 md:py-0 relative flex flex-col justify-center h-auto min-h-screen md:h-screen md:max-h-screen md:overflow-hidden scroll-mt-12 md:scroll-mt-0"
        >
          <div className="max-w-7xl mx-auto w-full space-y-2 sm:space-y-4">
            
            {/* Minimal Header */}
            <div className="text-left space-y-0.5">
              <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">
                ARSITEKTUR OPERASIONAL
              </span>
              <h2 className="heading-jumbo text-xl sm:text-4xl text-white font-extrabold tracking-wide uppercase">
                EMPAT PILAR INFRASTRUKTUR SISTEM
              </h2>
              <div className="w-10 h-0.5 bg-emerald-500 rounded-full" />
            </div>

            {/* 2x2 Clean Modern Grid Cards */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {[
                {
                  title: "Smart Booking System",
                  desc: "Reservasi online mandiri.",
                  icon: "Calendar",
                  color: "from-emerald-950/40 to-teal-950/20"
                },
                {
                  title: "Tracking Rental Logistik",
                  desc: "Lacak posisi barang real-time.",
                  icon: "Package",
                  color: "from-sky-950/40 to-blue-950/20"
                },
                {
                  title: "Dashboard Realtime",
                  desc: "Panel kendali terpadu admin.",
                  icon: "BarChart3",
                  color: "from-purple-950/40 to-indigo-950/20"
                },
                {
                  title: "Digital Verification",
                  desc: "Validasi file dokumen digital.",
                  icon: "ShieldCheck",
                  color: "from-amber-950/40 to-orange-950/20"
                }
              ].map((fitur, idx) => (
                <div 
                  key={idx}
                  className="liquid-glass-card p-3 flex flex-col justify-start h-auto min-h-[120px] group relative overflow-hidden w-full"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${fitur.color} opacity-20 pointer-events-none`} />
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-400/20 shadow-md mb-2">
                    <LucideIcon name={fitur.icon} size={16} />
                  </div>
                  <div className="space-y-0.5 relative z-10">
                    <h3 className="text-white text-[10px] font-black uppercase tracking-wider">{fitur.title}</h3>
                    <p className="text-[9px] text-[#8ca38a] leading-tight font-light">{fitur.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* =========================================
            SECTION 3 — WORKFLOW RENTAL TIMELINE
            ========================================= */}
        <section 
          data-index={2}
          className="snap-scroll-section px-4 sm:px-8 md:px-12 pt-24 pb-16 md:py-0 relative flex flex-col justify-center bg-black/10 h-auto min-h-screen md:h-screen md:max-h-screen md:overflow-hidden scroll-mt-12 md:scroll-mt-0"
        >
          <div className="max-w-7xl mx-auto w-full space-y-4 sm:space-y-8">
            
            {/* Section Heading */}
            <div className="text-center space-y-1">
              <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">
                TRANSPARANSI PROSES SEGMENTASI
              </span>
              <h2 className="heading-jumbo text-2xl sm:text-4xl text-white font-extrabold tracking-wide uppercase">
                ALUR PERJALANAN LOGISTIK RENTAL
              </h2>
              <div className="w-10 h-0.5 bg-emerald-500 mx-auto rounded-full" />
            </div>

            {/* Horizontal Timeline Flow without messy arrows */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 text-left relative z-10">
              {[
                { step: "01", name: "Booking Online", details: "Pilih tanggal sewa aktif & tentukan logistik.", icon: "FormInput" },
                { step: "02", name: "Verifikasi Berkas", details: "Admin validasi identitas & jaminan.", icon: "SearchCode" },
                { step: "03", name: "Pembayaran Aman", details: "Pelunasan via transfer atau bayar tunai.", icon: "CreditCard" },
                { step: "04", name: "Serah Terima", details: "Cek barang & kelengkapan saat serah terima.", icon: "Tent" },
                { step: "05", name: "Pengembalian", details: "Sterilisasi sanitasi & retur jaminan.", icon: "RotateCcw" },
              ].map((step, idx) => (
                <div 
                  key={idx}
                  className="liquid-glass p-3 rounded-lg relative space-y-1.5 border border-white/5 bg-white/2 hover:border-emerald-500/25 transition-all duration-300 flex flex-col h-auto min-h-[110px]"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                      STEP {step.step}
                    </span>
                    <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <LucideIcon name={step.icon} size={12} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-[10px] uppercase tracking-wider">{step.name}</h4>
                    <p className="text-[9px] text-[#8ca38a] mt-0.5 leading-tight font-light">{step.details}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* =========================================
            SECTION 4 — INTERACTIVE SIMULATION (SMART ENGINE DEMO WIDGETS)
            ========================================= */}
        <section 
          data-index={3}
          className="snap-scroll-section px-4 sm:px-8 md:px-12 py-12 md:pt-24 md:pb-12 relative flex flex-col items-center h-auto min-h-screen md:h-screen md:overflow-hidden scroll-mt-12 md:scroll-mt-0"
        >
          <div className="max-w-6xl mx-auto w-full flex flex-col h-auto md:h-[78vh] max-h-[640px] justify-start md:justify-center">
            
            {/* Layout Box with Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center flex-1 min-h-0 overflow-hidden py-4">
              
              {/* Left Column: Heading + Tabs */}
              <div className="lg:col-span-5 flex flex-col space-y-5 lg:space-y-10">
                <div className="text-left space-y-2">
                  <h2 className="heading-jumbo text-2xl sm:text-3xl lg:text-4xl text-white font-extrabold tracking-wide uppercase">
                    PUSAT SIMULASI
                  </h2>
                  <p className="text-xs sm:text-sm text-[#8ca38a] max-w-sm font-light leading-relaxed">
                    Explore our smart rental engine through interactive logic widgets.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-col gap-2.5 flex-shrink-0">
                  {[
                    { id: "booking", label: "Smart Availability", icon: "CalendarRange" },
                    { id: "pricing", label: "Bundle Recommendation", icon: "Layers" },
                    { id: "maintenance", label: "Damage Assessment", icon: "Sliders" },
                    { id: "conflict", label: "Digital Agreement", icon: "FileSignature" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full text-left p-2 sm:p-2.5 rounded-xl border transition-all text-neutral-200 outline-none flex flex-col sm:flex-row items-center sm:items-start gap-2 ${
                        activeTab === tab.id
                          ? "bg-emerald-500/10 border-emerald-500/35 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                          : "bg-white/3 border-white/5 hover:bg-white/5 text-[#8ca38a]"
                      }`}
                    >
                      <div className={activeTab === tab.id ? "text-emerald-400" : "text-[#8ca38a]"}>
                        <LucideIcon name={tab.icon} size={14} />
                      </div>
                      <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-center sm:text-left">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Display Panel Right */}
              <div className="lg:col-span-7 bg-white/[0.02] border border-white/5 rounded-3xl p-5 md:p-6 flex flex-col relative shadow-2xl overflow-y-auto h-full w-full no-scrollbar max-h-[500px] lg:max-h-full">
                
                {activeTab === "booking" && (
                  <div className="space-y-1.5">
                    <div className="space-y-0.5">
                      <h4 className="text-white font-bold text-[11px] uppercase tracking-wide">Smart Stock & Overlap</h4>
                      <p className="text-[8.5px] text-[#8ca38a] font-light">Simulasi deteksi jadwal dan harga otomatis.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 bg-white/2 p-1.5 sm:p-2 rounded-lg border border-white/5">
                      <div>
                        <label className="text-[7.5px] font-bold text-[#8ca38a] uppercase block mb-0.5">Produk</label>
                        <select 
                          value={selectedGear}
                          onChange={(e) => setSelectedGear(e.target.value)}
                          className="w-full bg-stone-900 border border-white/5 rounded-md px-1.5 py-0.5 text-[9px] text-stone-200 outline-none"
                        >
                          <option value="Tenda Dome 4P">Tenda Dome 4P</option>
                          <option value="Carrier 60L">Carrier 60L Deuter</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[7.5px] font-bold text-[#8ca38a] uppercase block mb-0.5">Mulai</label>
                        <input 
                          type="date"
                          value={checkStartDate}
                          onChange={(e) => setCheckStartDate(e.target.value)}
                          className="w-full bg-stone-900 border border-white/5 rounded-md px-1.5 py-0.5 text-[9px] text-stone-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[7.5px] font-bold text-[#8ca38a] uppercase block mb-0.5">Selesai</label>
                        <input 
                          type="date"
                          value={checkEndDate}
                          onChange={(e) => setCheckEndDate(e.target.value)}
                          className="w-full bg-stone-900 border border-white/5 rounded-md px-1.5 py-0.5 text-[9px] text-stone-200 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {/* Simplified other tabs for brevity if needed or maintain similar structure */}
                <div className="text-[9px] text-[#8ca38a] mt-4 italic">Simulasi lainnya tersedia saat demo.</div>

                {activeTab === "pricing" && (
                  <div className="space-y-4">
                    <div className="space-y-0.5">
                      <span className="text-[8.5px] uppercase font-black tracking-widest text-[#8ca38a]">SMART recommendations</span>
                      <h4 className="text-white font-bold text-[11px] uppercase">Bundle Recommendation Engine</h4>
                      <p className="text-[9px] text-[#8ca38a] font-light">Algoritma relasional cerdas. Ketika pengguna memilih produk utama (Tenda), sistem secara instan menawarkan perlengkapan pendukung esensial.</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {["Tenda", "Tas Carrier", "Kompor"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setBundleMain(cat);
                            setBundleAddons([]);
                          }}
                          className={`px-2.5 py-1 text-[9px] rounded-lg border font-black uppercase tracking-wider flex-1 sm:flex-none text-center ${
                            bundleMain === cat ? "bg-emerald-500 text-black border-emerald-400 font-black" : "bg-white/5 border-white/5 text-[#8ca38a]"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Recommendation Cards Box */}
                    <div className="bg-white/2 border border-white/5 p-1.5 sm:p-2 rounded-xl space-y-1.5">
                      <span className="text-[7.5px] text-[#8ca38a] font-black uppercase tracking-widest block">Rekomendasi Paket Hemat Tambahan Terkait:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                        {bundleMain === "Tenda" && [
                          { name: "Sleeping Bag Polar", price: 35000, desc: "Menghalang beku", icon: "Flame" },
                          { name: "Matras Alumfoil", price: 15000, desc: "Menghalau dingin", icon: "Layers" },
                          { name: "Cooking Nesting", price: 20000, desc: "Satu set kompak", icon: "Coffee" }
                        ].map((add, i) => {
                          const hasAdd = bundleAddons.includes(add.name);
                          return (
                            <div 
                              key={i} 
                              onClick={() => toggleBundleAddon(add.name)}
                              className={`p-1.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between h-auto min-h-[75px] md:min-h-0 md:aspect-video lg:h-16 select-none ${
                                hasAdd ? "border-emerald-500/40 bg-emerald-500/[0.04]" : "border-white/5 bg-stone-950/40 hover:border-white/10"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-[8.5px] font-bold text-white leading-tight">{add.name}</span>
                                <LucideIcon name={hasAdd ? "CheckCircle" : add.icon} size={12} className={hasAdd ? "text-emerald-400" : "text-[#8ca38a]/50"} />
                              </div>
                              <div>
                                <p className="text-[8px] text-[#8ca38a] leading-none mb-0.5 truncate">{add.desc}</p>
                                <span className="text-[8.5px] font-bold text-amber-400">Rp {add.price.toLocaleString("id-ID")}</span>
                              </div>
                            </div>
                          );
                        })}
                        {bundleMain === "Tas Carrier" && [
                          { name: "Raincover 60L Waterproof", price: 10000, desc: "Perlindungan hujan badai", icon: "Shield" },
                          { name: "Trekking Pole Carbon", price: 25000, desc: "Mengurangi beban lutut daki", icon: "Compass" },
                          { name: "Headlamp LED 350lm", price: 20000, desc: "Penerangan daki malam", icon: "Zap" }
                        ].map((add, i) => {
                          const hasAdd = bundleAddons.includes(add.name);
                          return (
                            <div 
                              key={i} 
                              onClick={() => toggleBundleAddon(add.name)}
                              className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between h-auto min-h-[90px] md:min-h-0 md:aspect-auto lg:h-20 select-none ${
                                hasAdd ? "border-emerald-500/40 bg-emerald-500/[0.04]" : "border-white/5 bg-stone-950/40 hover:border-white/10"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-[9px] font-bold text-white leading-tight">{add.name}</span>
                                <LucideIcon name={hasAdd ? "CheckCircle" : add.icon} size={14} className={hasAdd ? "text-emerald-400" : "text-[#8ca38a]/50"} />
                              </div>
                              <div>
                                <p className="text-[8.5px] text-[#8ca38a] leading-none mb-0.5 shadow-none">{add.desc}</p>
                                <span className="text-[9px] font-bold text-amber-400">Rp {add.price.toLocaleString("id-ID")}</span>
                              </div>
                            </div>
                          );
                        })}
                        {bundleMain === "Kompor" && [
                          { name: "Cooking Nesting 3P Set", price: 20000, desc: "Satu set panci teko kemping", icon: "Coffee" },
                          { name: "Gas Kaleng Portable", price: 15000, desc: "Bahan bakar butana murni", icon: "Flame" },
                          { name: "Windshield Lipat Aluminium", price: 10000, desc: "Penghalang angin kompor", icon: "Sparkles" }
                        ].map((add, i) => {
                          const hasAdd = bundleAddons.includes(add.name);
                          return (
                            <div 
                              key={i} 
                              onClick={() => toggleBundleAddon(add.name)}
                              className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between h-auto min-h-[90px] md:min-h-0 md:aspect-auto lg:h-20 select-none ${
                                hasAdd ? "border-emerald-500/40 bg-emerald-500/[0.04]" : "border-white/5 bg-stone-950/40 hover:border-white/10"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-[9px] font-bold text-white leading-tight">{add.name}</span>
                                <LucideIcon name={hasAdd ? "CheckCircle" : add.icon} size={14} className={hasAdd ? "text-emerald-400" : "text-[#8ca38a]/50"} />
                              </div>
                              <div>
                                <p className="text-[8.5px] text-[#8ca38a] leading-none mb-0.5 shadow-none">{add.desc}</p>
                                <span className="text-[9px] font-bold text-amber-400">Rp {add.price.toLocaleString("id-ID")}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "maintenance" && (
                  <div className="space-y-4">
                    <div className="space-y-0.5">
                      <span className="text-[8.5px] uppercase font-black tracking-widest text-[#8ca38a]">DAMAGE EVALUATION</span>
                      <h4 className="text-white font-bold text-[11px] uppercase">Documentation System</h4>
                      <p className="text-[9px] text-[#8ca38a] font-light">Rekam foto terlampir sebelum vs sesudah sewa.</p>
                    </div>

                    {/* Image comparison slider simulator */}
                    <div className="relative w-full h-28 sm:h-32 lg:h-36 rounded-xl overflow-hidden border border-white/10 select-none bg-stone-900">
                      
                      {/* Left Block - Before */}
                      <div className="absolute inset-0 bg-emerald-950/20 flex flex-col items-center justify-center text-center p-2">
                        <LucideIcon name="Tent" size={24} className="text-emerald-400 opacity-60" />
                        <span className="text-[8.5px] font-black uppercase text-emerald-400 mt-1">KONDISI AWAL</span>
                        <p className="text-[8px] text-[#8ca38a] max-w-xs mt-0.5 truncate">Alat utuh & steril.</p>
                      </div>

                      {/* Right Block - After */}
                      <div 
                        className="absolute inset-y-0 right-0 bg-red-950/80 border-l-2 border-amber-500 flex flex-col items-center justify-center text-center p-2 overflow-hidden"
                        style={{ left: `${sliderPos}%` }}
                      >
                        <div className="w-80 flex flex-col items-center">
                          <LucideIcon name="AlertTriangle" size={24} className="text-red-400" />
                          <span className="text-[8.5px] font-black uppercase text-red-400 mt-1">KONDISI RUSAK</span>
                          <p className="text-[8.5px] text-[#8ca38a] max-w-sm mt-0.5">Sobek & denda aktif.</p>
                        </div>
                      </div>

                      {/* Floating Indicator labels */}
                      <span className="hidden sm:block absolute left-4 top-2 bg-emerald-500/25 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[7.5px] font-black uppercase tracking-widest">Awal</span>
                      <span className="hidden sm:block absolute right-4 top-2 bg-red-500/25 border border-red-500/20 px-2 py-0.5 rounded-full text-[7.5px] font-black uppercase tracking-widest">Rusak</span>
                    </div>

                    {/* Controls Range Input slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] text-[#8ca38a] font-bold">
                        <span>AWAL (SEBELUM)</span>
                        <span>SERAH TERIMA (SESUDAH)</span>
                      </div>
                      <input 
                        type="range"
                        min={0}
                        max={100}
                        value={sliderPos}
                        onChange={(e) => setSliderPos(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer h-1 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "conflict" && (
                  <div className="space-y-3">
                    <div className="space-y-0.5">
                      <span className="text-[8.5px] uppercase font-black tracking-widest text-[#8ca38a]">SANKSI & SYARAT</span>
                      <h4 className="text-white font-bold text-[11px] uppercase">Digital Agreement Generator</h4>
                      <p className="text-[9px] text-[#8ca38a] font-light">Sistem otomasi surat perjanjian sewa resmi.</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      
                      {/* Compact Agreement Document */}
                      <div className="bg-[#040805] border border-white/5 p-2 rounded-xl text-[8.5px] font-mono leading-tight space-y-1 h-30 sm:h-36 md:h-40 overflow-y-auto scrollbar-none text-stone-300">
                        <p className="text-center font-bold text-white uppercase text-[9px]">SURAT PERJANJIAN SEWA</p>
                        <p>Yang menyetujui kontrak sewa logistik kelengkapan gunung.</p>
                        <p>Penyewa wajib menjaga kesehatan barang harian dan memulangkannya tepat waktu.</p>
                        <p>Denda kerusakan mutlak diaplikasikan seketika andaikata terbukti ada kerusakan.</p>
                      </div>

                      {/* Signature Box Input */}
                      <div className="bg-stone-900 border border-white/5 p-2 rounded-xl flex flex-col justify-between h-30 sm:h-36 md:h-40">
                        <div className="space-y-0.5">
                          <label className="text-[7.5px] font-black text-[#8ca38a] uppercase block">SIGNATURE (NAMA)</label>
                          <input 
                            type="text"
                            placeholder="Ketik Nama..."
                            value={digitalSignedName}
                            onChange={(e) => {
                              setDigitalSignedName(e.target.value);
                              if (e.target.value.trim().length > 2) {
                                setIsAgreementSigned(true);
                              } else {
                                setIsAgreementSigned(false);
                              }
                            }}
                            className="w-full bg-stone-950 border border-white/5 rounded-md px-1.5 py-0.5 text-[9px] text-white outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="border-t border-dashed border-white/10 pt-0.5 flex items-center justify-between">
                          <span className="text-[8px] text-zinc-500 select-none">Auth:</span>
                          {isAgreementSigned ? (
                            <span className="font-extrabold text-emerald-400 italic text-[9px] font-sans shadow-none flex items-center gap-1">
                              <LucideIcon name="CheckCircle" size={9} className="text-emerald-400" /> {digitalSignedName}
                            </span>
                          ) : (
                            <span className="text-[8px] text-zinc-600 font-medium">Empty</span>
                          )}
                        </div>
                      </div>
                    </div>  </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 5 — KEUNGGULAN SISTEM (BENEFITS)
            ========================================= */}
        <section 
          data-index={4}
          className="snap-scroll-section px-4 sm:px-8 md:px-12 pt-24 pb-16 md:py-0 relative flex flex-col justify-center h-auto min-h-screen md:h-screen md:max-h-screen md:overflow-hidden scroll-mt-12 md:scroll-mt-0"
        >
          <div className="max-w-6xl mx-auto w-full space-y-4 sm:space-y-6">
            
            <div className="text-center space-y-1">
              <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">
                GARANSI DISIPLIN SISTEM
              </span>
              <h2 className="heading-jumbo text-xl sm:text-4xl text-white font-extrabold tracking-wide uppercase">
                EMPAT GARANSI STANDAR BASECAMP
              </h2>
              <div className="w-10 h-0.5 bg-emerald-500 mx-auto mt-1 rounded-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-left">
              {[
                { title: "Minim Human Error", desc: "Komparasi stok & verifikasi.", icon: "EyeOff" },
                { title: "Tracking Barang Presisi", desc: "Setiap alat ID unik.", icon: "Compass" },
                { title: "Histori Rental Lengkap", desc: "Arsip detail transparan.", icon: "FileClock" },
                { title: "Monitoring Stok Kritis", desc: "Indikator dinamis.", icon: "ShieldAlert" },
              ].map((b, idx) => (
                <div key={idx} className="liquid-glass-card p-2 flex flex-col gap-1 h-auto min-h-[80px]">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-400/20">
                    <LucideIcon name={b.icon} size={12} />
                  </div>
                  <div>
                    <h4 className="text-white font-extrabold text-[9px] uppercase tracking-wider">{b.title}</h4>
                    <p className="text-[8px] text-[#8ca38a] mt-0.5 leading-tight font-light">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* =========================================
            SECTION 6 — TESTIMONIAL / OPERATIONAL PREVIEW
            ========================================= */}
        <section 
          data-index={5}
          className="snap-scroll-section px-4 sm:px-8 md:px-12 pt-24 pb-16 md:py-0 relative flex flex-col justify-center h-auto min-h-screen md:h-screen md:max-h-screen md:overflow-hidden scroll-mt-12 md:scroll-mt-0"
        >
          <div className="max-w-5xl mx-auto w-full space-y-4">
            
            <div className="text-left space-y-0.5">
              <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">
                BUKTI NYATA OPERASIONAL
              </span>
              <h2 className="heading-jumbo text-xl sm:text-4xl text-white font-extrabold tracking-wide uppercase">
                ULASAN MITRA LOKAL
              </h2>
              <div className="w-10 h-0.5 bg-emerald-500 rounded-full" />
            </div>

            {/* Testimonial Quote Panel */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white/[0.02] border border-white/5 p-4 sm:p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
              
              <div className="md:col-span-8 space-y-2">
                <blockquote className="text-[11px] sm:text-sm italic font-light text-stone-200 leading-relaxed shadow-none">
                  "Semenjak basecamp kami mendigitalisasi stok dengan OutRent, tidak ada lagi kekacauan pesanan. Data jaminan terdata aman, pelanggan senang, operasional jauh lebih rapi."
                </blockquote>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-white">Gede Mandra</h4>
                  <p className="text-[9px] text-[#8ca38a] uppercase mt-0.5 font-bold">Pemilik Basecamp Sembalun</p>
                </div>
              </div>

              {/* Statistics Showcase Block */}
              <div className="md:col-span-4 grid grid-cols-2 gap-2 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-4 text-center">
                {[
                  { val: "4K+", label: "Transaksi" },
                  { val: "99%", label: "Alat Bersih" },
                  { val: "30m", label: "Verifikasi" },
                  { val: "Zero", label: "Bentrok" },
                ].map((stat, i) => (
                  <div key={i} className="p-2 bg-white/2 rounded-lg">
                    <span className="block text-sm font-black text-emerald-400">{stat.val}</span>
                    <span className="block text-[8px] uppercase tracking-wider text-[#8ca38a] font-bold mt-0.5">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* =========================================
            SECTION 7 — CTA PORTAL & IMMERSIVE FOOTER
            ========================================= */}
        <section 
          data-index={6}
          className="snap-scroll-section px-4 sm:px-8 md:px-12 pt-24 pb-6 md:py-0 relative flex flex-col justify-between h-auto min-h-screen md:h-screen md:max-h-screen md:overflow-hidden scroll-mt-12 md:scroll-mt-0"
        >
          {/* Main Content Middle */}
          <div className="max-w-4xl mx-auto text-center space-y-4 my-auto z-10 relative">
            
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 rounded-xl flex items-center justify-center mx-auto shadow-md">
              <LucideIcon name="ShieldAlert" size={20} />
            </div>

            <h2 className="heading-jumbo text-2xl sm:text-5xl text-white font-extrabold uppercase leading-tight">
              Mulai Digitalisasi<br />
              Manajemen Rental
            </h2>
            
            <p className="text-[10px] sm:text-sm text-[#8ca38a] max-w-lg mx-auto leading-relaxed font-light">
              Gabung komunitas kemping Sembalun hari ini. Dapatkan sistem andal yang nyaman, aman, dan tangguh.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button 
                onClick={() => {
                  setAuthTab("login");
                  setPage("login_screen");
                }}
                className="liquid-glass-button w-full sm:w-auto bg-emerald-500/10 hover:bg-emerald-500 hover:text-black text-emerald-400 border border-emerald-500/20 font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all backdrop-blur-md shadow-lg"
              >
                Masuk Sistem
              </button>
              <button 
                onClick={() => {
                  setAuthTab("register");
                  setPage("login_screen");
                }}
                className="liquid-glass-button w-full sm:w-auto bg-white/5 border border-white/5 hover:bg-white/10 text-white font-extrabold px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all backdrop-blur-md shadow-lg"
              >
                Daftar Pelanggan
              </button>
            </div>
          </div>

          {/* Calm Camping Night Atmosphere Campfire Box at the Base */}
          <div className="w-full max-w-7xl mx-auto border-t border-white/5 pt-6 pb-2.5 flex flex-col md:flex-row justify-between items-center z-10 relative px-6 text-center text-[#8ca38a] text-[10.5px] font-sans">
            
            {/* Campfire Animation At Very bottom */}
            <div className="relative md:absolute md:bottom-[44px] md:left-1/2 md:-translate-x-1/2 flex flex-col items-center select-none pointer-events-none mb-1 md:mb-0 order-first md:order-none">
              {/* Soft Fire Bloom Light */}
              <div 
                className="w-[110px] h-[110px] rounded-full blur-[25px] opacity-50 absolute bottom-[-15px]"
                style={{
                  background: "radial-gradient(circle, #f59e0b 0%, #ea580c 40%, transparent 80%)"
                }}
              />
              {/* Flame Component with sparks */}
              <div className="w-6 h-8 bg-gradient-to-t from-red-600 via-amber-500 to-yellow-300 rounded-b-xl rounded-t-3xl blur-[0.5px] flame-anim relative bottom-[8px] z-10">
                {/* 5 clean micro spark elements */}
                <span className="absolute w-1 h-1 bg-amber-300 rounded-full spark-particle-1 left-1 bottom-1" />
                <span className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full spark-particle-2 left-3 bottom-0" />
                <span className="absolute w-1 h-1 bg-red-400 rounded-full spark-particle-3 left-2 bottom-3" />
                <span className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full spark-particle-5 left-1 bottom-4" />
              </div>
              {/* Logs */}
              <div className="absolute bottom-[6px] w-9 h-1.5 bg-[#4c1d05] rounded-full transform rotate-[20deg]" />
              <div className="absolute bottom-[6px] w-9 h-1.5 bg-[#451a03] rounded-full transform -rotate-[20deg]" />
              <span className="text-[7.5px] uppercase tracking-widest text-[#d97706]/80 font-bold font-sans mt-0.5 animate-pulse z-10">CAMPFIRE LIGHT</span>
            </div>

            <div className="space-y-1.5 text-center md:text-left mb-3 md:mb-0 mt-0 md:mt-0">
              <span className="font-bold font-sans text-white text-[11px] uppercase tracking-wider block drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">Basecamp Rental</span>
              <span className="opacity-80 block text-[9.5px]">Sistem Rental Perlengkapan Outdoor</span>
              <span className="block mt-1 opacity-60">&copy; 2026 Basecamp Rental</span>
            </div>

            <div className="flex flex-col md:flex-row gap-3 font-bold font-sans items-center text-[8px] sm:text-[9px]">
              <button 
                onClick={() => setShowPrivacy(true)} 
                className="liquid-glass-button bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl hover:text-emerald-400 hover:bg-white/10 hover:shadow-[0_0_10px_rgba(16,185,129,0.2)] uppercase tracking-wider transition-all cursor-pointer text-[#8ca38a] font-sans"
              >
                Kebijakan Privasi
              </button>
              <span className="hidden md:block opacity-50 text-[#8ca38a] font-sans">&bull;</span>
              <button 
                onClick={() => setShowPrivacy(true)} 
                className="liquid-glass-button bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl hover:text-emerald-400 hover:bg-white/10 hover:shadow-[0_0_10px_rgba(16,185,129,0.2)] uppercase tracking-wider transition-all cursor-pointer text-[#8ca38a] font-sans"
              >
                Syarat & Ketentuan
              </button>
            </div>

          </div>

        </section>

      </div>

      {/* QUICK FLOATING MULTI-ACTION SELECTION MODAL POPUP FOR DEMO */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-[#020503]/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300">
          <div className="bg-[#0a130c]/98 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up p-6 text-left relative sf-pro-font pb-12 sm:pb-6">
            
            {/* iOS Bottom Sheet style drag indicator */}
            <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-5 block sm:hidden" />
            
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h4 className="heading-caps font-black text-white text-sm tracking-widest uppercase flex items-center gap-2">
                <LucideIcon name="Terminal" className="text-emerald-400" size={15} />
                Akses Uji Coba Demo
              </h4>
              <button 
                onClick={() => setShowDemoModal(false)}
                className="p-1 px-2 text-stone-400 hover:text-white pointer-events-auto rounded bg-white/5 transition-colors"
                aria-label="Close"
              >
                <LucideIcon name="X" size={14} />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <p className="text-xs text-[#8ca38a] leading-relaxed font-light shadow-none">
                Pilih peran simulasi untuk melihat kecerdasan sistem Basecamp secara instan:
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDemoModal(false);
                    triggerDemoLogin("customer");
                  }}
                  className="w-full bg-[#10b981]/10 hover:bg-[#10b981]/15 text-emerald-300 font-black text-[11px] tracking-wider py-3.5 px-4 rounded-xl border border-emerald-500/15 flex items-center justify-between text-left group transition-all"
                >
                  <div className="space-y-0.5">
                    <span className="block font-black uppercase">Masuk Sebagai Pelanggan</span>
                    <span className="block text-[9.5px] text-[#8ca38a] font-normal leading-none lowercase shadow-none">Uji coba simulasi sewa, checkout, & trust score</span>
                  </div>
                  <LucideIcon name="User" size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowDemoModal(false);
                    triggerDemoLogin("admin");
                  }}
                  className="w-full bg-amber-500/10 hover:bg-amber-500/15 text-amber-300 font-black text-[11px] tracking-wider py-3.5 px-4 rounded-xl border border-amber-500/15 flex items-center justify-between text-left group transition-all"
                >
                  <div className="space-y-0.5">
                    <span className="block font-black uppercase">Masuk Sebagai Admin</span>
                    <span className="block text-[9.5px] text-[#8ca38a] font-normal leading-none lowercase shadow-none">Verifikasi data, ubah kelayakan stok, & maintain</span>
                  </div>
                  <LucideIcon name="ShieldCheck" size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-xl p-3 text-[10.5px] text-[#8ca38a] leading-relaxed font-light">
                Info: Anda dapat membuat pesanan sewa di akun Pelanggan, lalu log out dan masuk sebagai Admin untuk menyetujui transaksi tersebut secara utuh.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Privacy Policy & Terms Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-[#020503]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-[#0a130c]/98 border border-emerald-500/10 rounded-2xl w-full max-w-2xl h-[85vh] sm:h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <h2 className="heading-caps font-black text-white text-base tracking-wider flex items-center gap-2">
                <LucideIcon name="Shield" className="text-emerald-400" size={16} />
                Kebijakan Privasi
              </h2>
              <button
                onClick={() => setShowPrivacy(false)}
                className="p-1.5 px-2 rounded bg-white/5 border border-white/5 text-stone-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <LucideIcon name="X" size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-8 overflow-y-auto w-full no-scrollbar font-sans text-stone-300 text-sm leading-relaxed space-y-8">
              
              <div className="text-center space-y-2 pb-2">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block">Update Terakhir: 22 Mei 2026</span>
                <p className="text-xs text-[#8ca38a]">
                  Basecamp Rental berkomitmen untuk menjaga keamanan dan privasi data Anda selama menggunakan sistem kami.
                </p>
              </div>

              <div className="space-y-6 max-w-xl mx-auto">
                <section className="space-y-2.5">
                  <h3 className="text-white font-extrabold text-[13px] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    1. Informasi yang Dikumpulkan
                  </h3>
                  <p className="text-xs text-[#8ca38a]">Sistem kami dapat menyimpan informasi berikut untuk keperluan operasional:</p>
                  <ul className="list-disc list-inside text-xs space-y-1.5 ml-1 text-stone-300">
                    <li>Nama lengkap & email pengguna</li>
                    <li>Nomor WhatsApp aktif</li>
                    <li>Data booking & histori rental</li>
                    <li>Pindaian identitas (KTP/KTM) untuk jaminan</li>
                  </ul>
                </section>

                <section className="space-y-2.5">
                  <h3 className="text-white font-extrabold text-[13px] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    2. Tujuan Penggunaan Data
                  </h3>
                  <p className="text-xs text-[#8ca38a]">Kami menggunakan data Anda hanya untuk tujuan spesifik operasional rental yang meliputi:</p>
                  <ul className="list-disc list-inside text-xs space-y-1.5 ml-1 text-stone-300">
                    <li>Verifikasi keabsahan penyewaan barang</li>
                    <li>Menjaga keamanan transaksi antar kedua belah pihak</li>
                    <li>Komunikasi terkait status booking dan pengingat pengembalian</li>
                  </ul>
                </section>

                <section className="space-y-2.5">
                  <h3 className="text-white font-extrabold text-[13px] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    3. Keamanan Data
                  </h3>
                  <p className="text-xs text-[#8ca38a]">
                    Data Anda disimpan secara aman di dalam sistem kami. Akses terhadap informasi ini dibatasi secara ketat hanya untuk admin yang berwenang. Kami menjamin bahwa identitas Anda tidak akan disebarkan, dijual, atau dibagikan kepada pihak ketiga.
                  </p>
                </section>

                <section className="space-y-2.5">
                  <h3 className="text-white font-extrabold text-[13px] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    4. Perlindungan Upload Identitas
                  </h3>
                  <p className="text-xs text-[#8ca38a]">
                    Pindaian KTP/KTM dan swafoto yang diunggah wajib dilengkapi dengan watermark keamanan. Sistem hanya memproses dokumen ini secara eksklusif untuk jaminan penyewaan barang selama masa aktif pesanan dan tidak akan digunakan di luar kepentingan operasional rental.
                  </p>
                </section>

                <section className="space-y-2.5">
                  <h3 className="text-white font-extrabold text-[13px] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    5. Cookies & Session
                  </h3>
                  <p className="text-xs text-[#8ca38a]">
                    Sistem website Basecamp menggunakan session login lokal ringan (cookies & local storage) agar sistem dapat mengingat profil pengguna dan mempertahankan koneksi saat aplikasi ditutup sementara, demi menjaga kenyamanan transisi pengalaman pengguna.
                  </p>
                </section>

                <section className="space-y-2.5 border-t border-white/5 pt-5 mt-6 pb-4 text-center">
                  <h3 className="text-white font-black text-sm mb-2">Persetujuan Pengguna</h3>
                  <p className="text-xs text-[#8ca38a]/80 italic">
                    Dengan mendaftar, login, dan menggunakan website ini, Anda secara langsung dianggap telah memahami, menyetujui, dan mematuhi seluruh syarat layanan dan kebijakan privasi yang berlaku.
                  </p>
                </section>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default LandingPage;
