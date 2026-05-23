/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Item, ItemStatus } from "../types";
import { LucideIcon } from "./LucideIcon";

interface AdminBarangProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  addActivity: (action: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

const AVAILABLE_ICONS = [
  { name: "Tent", label: "Tenda" },
  { name: "Backpack", label: "Tas Carrier" },
  { name: "Flame", label: "Api Unggun / SB" },
  { name: "Zap", label: "Kompor Listrik" },
  { name: "Sparkles", label: "Headlamp" },
  { name: "Layers", label: "Matras" },
  { name: "Compass", label: "Navigasi / Stick" },
  { name: "Coffee", label: "Nesting Masak" },
];

export const AdminBarang: React.FC<AdminBarangProps> = ({
  items,
  setItems,
  addActivity,
  showToast,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newItem, setNewItem] = useState({
    name: "",
    cat: "Tenda",
    price: "",
    stock: "",
    iconName: "Tent",
    desc: "",
  });

  const rupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.stock || !newItem.desc) {
      showToast("Harap isi semua input data barang!", "error");
      return;
    }

    const priceNum = Number(newItem.price);
    const stockNum = Number(newItem.stock);

    if (isNaN(priceNum) || priceNum <= 0) {
      showToast("Harga sewa harus lebih dari nol!", "error");
      return;
    }

    if (isNaN(stockNum) || stockNum <= 0) {
      showToast("Jumlah stok harus lebih dari nol!", "error");
      return;
    }

    const newlyCreatedItem: Item = {
      id: Date.now(),
      name: newItem.name,
      cat: newItem.cat,
      price: priceNum,
      stock: stockNum,
      avail: stockNum,
      iconName: newItem.iconName,
      status: "tersedia",
      desc: newItem.desc,
    };

    setItems((prev) => [...prev, newlyCreatedItem]);
    addActivity(`Menambahkan produk baru: ${newItem.name}`);
    showToast("Produk berhasil ditambahkan ke katalog!", "success");

    // reset
    setNewItem({
      name: "",
      cat: "Tenda",
      price: "",
      stock: "",
      iconName: "Tent",
      desc: "",
    });
    setModalOpen(false);
  };

  const handleDeleteItem = (id: number, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus barang "${name}"?`)) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      addActivity(`Menghapus produk: ${name}`);
      showToast("Barang ditarik dari katalog!", "success");
    }
  };

  const handleToggleMaintenance = (id: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const nextStatus: ItemStatus = i.status === "maintenance" ? "tersedia" : "maintenance";
          const nextAvail = nextStatus === "maintenance" ? 0 : i.stock;
          showToast(`Status ${i.name} diubah ke ${nextStatus === "maintenance" ? "Maintenance" : "Tersedia"}`, "info");
          addActivity(`Mengubah status ${i.name} menjadi ${nextStatus}`);
          return { ...i, status: nextStatus, avail: nextAvail };
        }
        return i;
      })
    );
  };

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in px-4 sm:px-6">
      
      {/* Top action block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <h1 className="heading-jumbo text-3xl sm:text-4xl text-white tracking-wide">
            Manajemen Barang
          </h1>
          <div className="group relative hidden sm:block">
            <LucideIcon name="Info" size={16} className="text-[#8ca38a] cursor-pointer" />
            <div className="absolute left-0 top-6 w-56 p-2.5 bg-[#0a130c]/95 backdrop-blur-md border border-white/10 rounded-xl text-[10px] text-stone-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-20">
              Kelola stok peralatan, perbaikan, dan harga sewa.
            </div>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold px-5 py-2.5 rounded-xl text-xs uppercase heading-caps tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40"
        >
          <LucideIcon name="Plus" size={16} />
          TAMBAH BARANG BARU
        </button>
      </div>

      {/* Control bar */}
      <div className="glass-card-glow border border-white/5 p-4 rounded-xl flex items-center">
        <div className="relative flex-1 max-w-sm">
          <LucideIcon name="Search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8ca38a]" size={16} />
          <input
            type="text"
            placeholder="Cari nama barang atau kategori alat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/4 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-stone-500 outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Listing Grid / Table */}
      <div className="glass-card-glow border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5 text-[10px] text-[#8ca38a] font-black uppercase tracking-wider heading-caps bg-white/2">
                <th className="py-4 px-4 w-12 text-center">Ico</th>
                <th className="py-4 px-4">Nama Inventaris Alat</th>
                <th className="py-4 px-4">Kategori</th>
                <th className="py-4 px-4 text-emerald-400">Harga / Hari</th>
                <th className="py-4 px-4 text-center">Stok Total</th>
                <th className="py-4 px-4 text-center">Tersedia</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-6 text-center">Tindakan Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-stone-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#8ca38a] text-sm">
                    Barang tidak ditemukan. Periksa kata kunci pencarian Anda.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-emerald-400">
                        <LucideIcon name={item.iconName} size={20} />
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-white">
                      <div>
                        {item.name}
                        <span className="block text-[10px] font-medium text-[#8ca38a] mt-0.5 max-w-[280px] line-clamp-1">
                          {item.desc}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-stone-400 font-semibold uppercase tracking-wider">
                      {item.cat}
                    </td>
                    <td className="py-4 px-4 font-black text-amber-400 text-sm">
                      {rupiah(item.price)}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-white">
                      {item.stock}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-black text-sm ${item.avail > 0 ? "text-emerald-400" : "text-red-500"}`}>
                        {item.avail}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        item.status === "tersedia" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        item.status === "dipinjam" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex gap-2 justify-center">
                        <button
                          onClick={() => handleToggleMaintenance(item.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 border ${
                            item.status === "maintenance"
                              ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20"
                          }`}
                          title="Tandai perbaikan berkala"
                        >
                          <LucideIcon name="Shield" size={11} />
                          {item.status === "maintenance" ? "AKTIFKAN" : "SERVICE"}
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 p-1.5 rounded-lg transition-colors"
                          title="Hapus permanen barang"
                        >
                          <LucideIcon name="Trash2" size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Layout Support */}
        <div className="lg:hidden block p-4 space-y-4">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[#8ca38a] text-sm">
              Barang tidak ditemukan. Periksa kata kunci pencarian Anda.
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3.5 relative">
                
                {/* Header card info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-emerald-400 shrink-0">
                    <LucideIcon name={item.iconName} size={20} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <span className="text-[9px] text-emerald-400 uppercase font-black tracking-widest">{item.cat}</span>
                    <h5 className="font-extrabold text-white text-xs truncate leading-tight">{item.name}</h5>
                    <p className="text-[10px] text-[#8ca38a] truncate mt-0.5">{item.desc}</p>
                  </div>
                </div>

                {/* Sub features stats */}
                <div className="grid grid-cols-3 gap-2 py-1.5 border-y border-white/5 text-center bg-white/1 text-xs">
                  <div>
                    <span className="block text-[8px] text-[#8ca38a] font-bold uppercase">Harga/hr</span>
                    <strong className="text-amber-400 text-[11px]">{rupiah(item.price)}</strong>
                  </div>
                  <div>
                    <span className="block text-[8px] text-[#8ca38a] font-bold uppercase">Stok Gudang</span>
                    <strong className="text-stone-300 text-[11px]">{item.stock} Unit</strong>
                  </div>
                  <div>
                    <span className="block text-[8px] text-[#8ca38a] font-bold uppercase">Sisa Ready</span>
                    <strong className={`${item.avail > 0 ? "text-emerald-400" : "text-red-500"} text-[11px]`}>
                      {item.avail} Unit
                    </strong>
                  </div>
                </div>

                {/* Actions row footer */}
                <div className="flex justify-between items-center pt-1">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider border ${
                      item.status === "tersedia" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      item.status === "dipinjam" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleMaintenance(item.id)}
                      className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 border w-full ${
                        item.status === "maintenance"
                          ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      <LucideIcon name="Shield" size={14} />
                      {item.status === "maintenance" ? "Aktifkan" : "Service"}
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id, item.name)}
                      className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 p-3 rounded-xl transition-colors flex items-center justify-center"
                      title="Hapus permanen barang"
                    >
                      <LucideIcon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>

      {/* Modern High-End Add Item Drawer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[#020503]/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300">
          <div className="bg-[#0a130c]/98 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up pb-8 sm:pb-0">
            
            {/* iOS Bottom Sheet style drag indicator */}
            <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-2 mt-3 block sm:hidden" />
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/2">
              <h2 className="heading-caps font-black text-white text-lg tracking-wider flex items-center gap-2">
                <LucideIcon name="Plus" className="text-emerald-400" size={18} />
                Daftarkan Barang
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 px-2.5 rounded bg-white/5 border border-white/5 text-stone-400 hover:text-white"
                aria-label="Close"
              >
                <LucideIcon name="X" size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              
              <div>
                <label className="text-[11px] font-bold text-[#8ca38a] uppercase tracking-wider block mb-1">
                  Nama Perlengkapan Outdoor
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dome Tent Eiger 4P, Tas Osprey Atmos 50L..."
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full bg-white/4 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-[#8ca38a] uppercase tracking-wider block mb-1">
                    Kategori Alat
                  </label>
                  <select
                    value={newItem.cat}
                    onChange={(e) => setNewItem({ ...newItem, cat: e.target.value })}
                    className="w-full bg-stone-900 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-stone-200 outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="Tenda">Tenda</option>
                    <option value="Tas">Tas</option>
                    <option value="Tidur">Tidur</option>
                    <option value="Masak">Masak</option>
                    <option value="Aksesoris">Aksesoris</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#8ca38a] uppercase tracking-wider block mb-1">
                    Representasi Icon
                  </label>
                  <select
                    value={newItem.iconName}
                    onChange={(e) => setNewItem({ ...newItem, iconName: e.target.value })}
                    className="w-full bg-stone-900 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-stone-200 outline-none focus:border-emerald-500"
                  >
                    {AVAILABLE_ICONS.map((ico) => (
                      <option key={ico.name} value={ico.name}>
                        {ico.label} ({ico.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-[#8ca38a] uppercase tracking-wider block mb-1">
                    Harga Sewa (Rp / Hari)
                  </label>
                  <input
                    type="number"
                    placeholder="75000, 35000..."
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full bg-white/4 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#8ca38a] uppercase tracking-wider block mb-1">
                    Jumlah Stok Unit
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 10, 5..."
                    value={newItem.stock}
                    onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                    className="w-full bg-white/4 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#8ca38a] uppercase tracking-wider block mb-1">
                  Deskripsi & Spesifikasi Produk
                </label>
                <textarea
                  rows={3}
                  placeholder="Lapisi info spesifikasi, material, atau kelengkapan set aksesoris..."
                  value={newItem.desc}
                  onChange={(e) => setNewItem({ ...newItem, desc: e.target.value })}
                  className="w-full bg-white/4 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-emerald-500 transition-colors resize-none"
                  required
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-stone-300 font-bold px-4 py-2.5 rounded-xl text-xs uppercase transition-all"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all"
                >
                  SIMPAN BARANG
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
};
export default AdminBarang;
