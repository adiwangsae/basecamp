/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Item, Booking, User, ActivityLog, SystemNotification } from "./types";

export const CATS = ["Semua", "Tenda", "Tas", "Tidur", "Masak", "Aksesoris"];

export const INIT_ITEMS: Item[] = [
  {
    id: 1,
    name: "Tenda Dome 4 Person",
    cat: "Tenda",
    price: 75000,
    stock: 6,
    avail: 5,
    iconName: "Tent",
    status: "tersedia",
    desc: "Tenda Gunung Kapasitas 4 Orang, konstruksi double layer waterproof PU 3000mm, sangat tangguh menahan badai dan hujan lebat. Frame fiber berkualitas tinggi.",
  },
  {
    id: 2,
    name: "Carrier 60L Deuter Futura",
    cat: "Tas",
    price: 50000,
    stock: 8,
    avail: 7,
    iconName: "Backpack",
    status: "tersedia",
    desc: "Tas Carrier ergonomis Deuter 60 Liter, sistem ventilasi jalur punggung Aircomfort, sebaran bebas pegal, kompartemen basah/kering mandiri.",
  },
  {
    id: 3,
    name: "Sleeping Bag Polar -5°C",
    cat: "Tidur",
    price: 35000,
    stock: 12,
    avail: 9,
    iconName: "Flame",
    status: "tersedia",
    desc: "Sleeping Bag mummy dengan lapisan thermal luar penahan angin dan polar fleece tebal di bagian dalam, mampu menahan suhu dingin hingga -5°C ekstrem.",
  },
  {
    id: 4,
    name: "Kompor Portable Windproof Primus",
    cat: "Masak",
    price: 30000,
    stock: 5,
    avail: 5,
    iconName: "Zap",
    status: "tersedia",
    desc: "Kompor gas portable multifungsi dilengkapi pelindung angin built-in kelopak bunga. Pembakaran efisien, dudukan stabil stainless steel.",
  },
  {
    id: 5,
    name: "Headlamp LED 350lm Waterproof",
    cat: "Aksesoris",
    price: 20000,
    stock: 15,
    avail: 12,
    iconName: "Sparkles",
    status: "tersedia",
    desc: "Lampu kepala LED ultra-terang 350 lumen, sensor gerak lambaian tangan, sertifikasi rating IPX6 waterproof, baterai rechargeable via Type-C.",
  },
  {
    id: 6,
    name: "Matras Lipat Gunung Premium",
    cat: "Tidur",
    price: 15000,
    stock: 10,
    avail: 8,
    iconName: "Layers",
    status: "tersedia",
    desc: "Matras camping lipat bahan IXPE foam tebal dengan foil reflektor panas tubuh, sangat efektif menghalau dingin tanah gunung malam hari.",
  },
  {
    id: 7,
    name: "Trekking Pole Carbon Ultralight",
    cat: "Aksesoris",
    price: 25000,
    stock: 8,
    avail: 6,
    iconName: "Compass",
    status: "tersedia",
    desc: "Tongkat daki berbahan serat karbon ultra ringan berbobot hanya 190g per stick, mekanisme pengunci klip cepat, grip busa EVA anti-keringat.",
  },
  {
    id: 8,
    name: "Cooking Set Nesting Aluminium 3p",
    cat: "Masak",
    price: 20000,
    stock: 6,
    avail: 4,
    iconName: "Coffee",
    status: "tersedia",
    desc: "Nesting memasak isi 3 item bahan aluminium anodized food-grade. Dilengkapi wajan penggorengan, panci sup, teko air mini, serta handle lipat silicone anti-panas.",
  },
  {
    id: 9,
    name: "Tenda Dome 2 Person Elite",
    cat: "Tenda",
    price: 60000,
    stock: 4,
    avail: 2,
    iconName: "Tent",
    status: "dipinjam",
    desc: "Tenda premium 2 orang ultralight cocok bagi petualang solo atau pasangan daki cepat. Frame alloy aluminium super kokoh.",
  },
];

export const INIT_BOOKINGS: Booking[] = [
  {
    id: "BK001",
    custId: 2,
    custName: "Andi Pratama",
    items: "Tenda Dome 4 Person",
    qty: 1,
    start: "2026-05-24",
    end: "2026-05-27",
    days: 3,
    status: "pending_verification",
    total: 225000,
    idUploaded: true,
    created: "2026-05-21",
    note: "Tolong siapkan tenda warna hijau jika tersedia.",
    denda: null,
  },
  {
    id: "BK002",
    custId: 3,
    custName: "Sari Dewi",
    items: "Carrier 60L Deuter Futura + SB Polar",
    qty: 1,
    start: "2026-05-25",
    end: "2026-05-28",
    days: 3,
    status: "verified",
    total: 255000,
    idUploaded: true,
    created: "2026-05-20",
    note: "Sudah saya transfer via Bank Mandiri.",
    denda: null,
  },
  {
    id: "BK003",
    custId: 4,
    custName: "Budi Santoso",
    items: "Kompor Portable Windproof Primus",
    qty: 1,
    start: "2026-05-22",
    end: "2026-05-24",
    days: 2,
    status: "ready_pickup",
    total: 60000,
    idUploaded: true,
    created: "2026-05-19",
    note: "Bayar di toko pas pengambilan.",
    denda: null,
  },
  {
    id: "BK004",
    custId: 5,
    custName: "Maya Putri",
    items: "Trekking Pole Carbon Ultralight",
    qty: 2,
    start: "2026-05-19",
    end: "2026-05-22",
    days: 3,
    status: "rented",
    total: 150000,
    idUploaded: true,
    created: "2026-05-17",
    note: "Barang dalam kondisi sangat mulus.",
    denda: null,
  },
  {
    id: "BK005",
    custId: 6,
    custName: "Rizki Fajar",
    items: "Headlamp LED 350lm (3 Pcs)",
    qty: 3,
    start: "2026-05-15",
    end: "2026-05-18",
    days: 3,
    status: "completed",
    total: 180000,
    idUploaded: true,
    created: "2026-05-14",
    note: "Sudah lunas, pengembalian tepat waktu.",
    denda: null,
  },
  {
    id: "BK006",
    custId: 7,
    custName: "Lila Novita",
    items: "Sleeping Bag Polar -5°C",
    qty: 1,
    start: "2026-05-14",
    end: "2026-05-17",
    days: 3,
    status: "late",
    total: 105000,
    idUploaded: true,
    created: "2026-05-12",
    note: "Terlambat mengembalikan, dikenakan denda keterlambatan.",
    denda: 70000,
  },
];

export const INIT_USERS: User[] = [
  { id: 1, name: "Gede Adi Wangsa", email: "admin@basecamp.id", role: "admin", pass: "admin123" },
  { id: 2, name: "Andi Pratama", email: "andi@mail.com", role: "customer", pass: "123456", phone: "08123456789" },
  { id: 3, name: "Sari Dewi", email: "sari@mail.com", role: "customer", pass: "123456", phone: "08987654321" },
  { id: 4, name: "Budi Santoso", email: "budi@mail.com", role: "customer", pass: "123456", phone: "08112233445" },
];

export const INIT_ACTIVITIES: ActivityLog[] = [
  {
    id: 1,
    user: "Gede Adi Wangsa",
    role: "admin",
    action: "Menyetujui Booking #BK002 (Sari Dewi)",
    timestamp: "21 Menit Lalu",
  },
  {
    id: 2,
    user: "Gede Adi Wangsa",
    role: "admin",
    action: "Menambahkan unit Tenda Dome 4 Person",
    timestamp: "1 Jam Lalu",
  },
  {
    id: 3,
    user: "Andi Pratama",
    role: "customer",
    action: "Melakukan booking barang #BK001",
    timestamp: "2 Jam Lalu",
  },
  {
    id: 4,
    user: "System",
    role: "system",
    action: "Mendeteksi keterlambatan otomatis Booking #BK006",
    timestamp: "4 Jam Lalu",
  },
];

export const MONTHS_DATA = [
  { name: "Jan", tx: 14, rev: 1350000 },
  { name: "Feb", tx: 22, rev: 2100000 },
  { name: "Mar", tx: 18, rev: 1850000 },
  { name: "Apr", tx: 31, rev: 2950000 },
  { name: "Mei", tx: 25, rev: 2470000 },
];

export const saveState = (items: Item[], bookings: Booking[], activities: ActivityLog[]) => {
  localStorage.setItem("bc_items", JSON.stringify(items));
  localStorage.setItem("bc_bookings", JSON.stringify(bookings));
  localStorage.setItem("bc_activities", JSON.stringify(activities));
};

export const loadState = () => {
  const localItems = localStorage.getItem("bc_items");
  const localBookings = localStorage.getItem("bc_bookings");
  const localActivities = localStorage.getItem("bc_activities");

  return {
    items: localItems ? JSON.parse(localItems) : null,
    bookings: localBookings ? JSON.parse(localBookings) : null,
    activities: localActivities ? JSON.parse(localActivities) : null,
  };
};
