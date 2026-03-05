"use client";

import { useState } from "react";
import type { SneakerLookupResult } from "@/types/vault";

interface Props {
  onClose: () => void;
  onAdd: (entry: Record<string, unknown>) => void;
}

export function AddShoeModal({ onClose, onAdd }: Props) {
  const [step, setStep] = useState<"search" | "confirm">("search");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<(SneakerLookupResult & { affiliateLinks?: unknown[] }) | null>(null);
  const [searchResults, setSearchResults] = useState<SneakerLookupResult[]>([]);
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState<"DS" | "VNDS" | "Used">("DS");
  const [pricePaid, setPricePaid] = useState("");

  const handleLookup = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setSearchResults([]);

    try {
      const val = input.trim();
      const isUPC = /^\d{12,13}$/.test(val);
      const isSKU = /^[A-Z0-9]{4,}-[A-Z0-9]{3,}$/i.test(val);

      let url = "";
      if (isUPC) url = `/api/vault/lookup?upc=${encodeURIComponent(val)}`;
      else if (isSKU) url = `/api/vault/lookup?sku=${encodeURIComponent(val)}`;
      else url = `/api/vault/lookup?q=${encodeURIComponent(val)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setError("No sneaker found. Try a different code or name.");
        return;
      }

      if (data.results) {
        setSearchResults(data.results);
      } else if (data.result) {
        setResult(data.result);
        setStep("confirm");
      }
    } catch {
      setError("Lookup failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (!result || !size || !pricePaid) return;
    onAdd({
      sneakerName: result.name,
      brand: result.brand,
      colorway: result.colorway,
      sku: result.sku,
      upc: result.upc,
      imageUrl: result.imageUrl,
      size,
      condition,
      pricePaid: parseFloat(pricePaid),
      marketValue: result.marketPrice || result.retailPrice || parseFloat(pricePaid),
      affiliateLinks: result.affiliateLinks || [],
    });
    onClose();
  };

  const conditionOptions = ["DS", "VNDS", "Used"] as const;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl w-full max-w-md p-7">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] text-[#555] tracking-[0.2em] uppercase mb-1">
              {step === "search" ? "Step 1 of 2" : "Step 2 of 2"}
            </p>
            <h2 className="text-lg font-black uppercase tracking-wider text-white">
              {step === "search" ? "Find Your Shoe" : "Add to Vault"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#555] hover:text-white text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {step === "search" && (
          <>
            <div className="mb-5">
              <label className="block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-2">
                UPC, Style Code, or Sneaker Name
              </label>
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                  placeholder="DD1391-100, Panda Dunk, 195867204537..."
                  autoFocus
                  className="flex-1 bg-black border border-[#2a2a2a] rounded-lg px-3 py-3 text-[13px] text-white placeholder-[#333] outline-none focus:border-[#444] transition-colors"
                />
                <button
                  onClick={handleLookup}
                  disabled={loading || !input.trim()}
                  className="px-4 py-3 bg-black border border-[#333] rounded-lg text-[11px] font-bold uppercase tracking-widest text-white hover:border-white transition-colors disabled:opacity-40"
                >
                  {loading ? "..." : "Find"}
                </button>
              </div>
              {error && <p className="text-[#ff4444] text-[12px] mt-2">{error}</p>}
            </div>

            {searchResults.length > 0 && (
              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                {searchResults.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setResult(s as typeof result); setSearchResults([]); setStep("confirm"); }}
                    className="flex items-center gap-3 p-3 bg-black border border-[#1e1e1e] rounded-lg text-left hover:border-[#444] transition-colors"
                  >
                    {s.imageUrl && (
                      <img src={s.imageUrl} alt={s.name} className="w-11 h-11 object-contain rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white truncate">{s.name}</p>
                      <p className="text-[11px] text-[#555]">{s.colorway} · {s.sku}</p>
                    </div>
                    {s.marketPrice && (
                      <span className="text-[13px] font-bold text-white ml-auto">${s.marketPrice}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <p className="text-[11px] text-[#444] mt-4 leading-relaxed">
              Scan the barcode on the shoe box or enter the style code from the tag. Prices from SneakerDB.
            </p>
          </>
        )}

        {step === "confirm" && result && (
          <>
            {/* Preview */}
            <div className="flex gap-3 items-center p-4 bg-black border border-[#1e1e1e] rounded-xl mb-5">
              {result.imageUrl ? (
                <img src={result.imageUrl} alt={result.name} className="w-16 h-16 object-contain rounded-lg" />
              ) : (
                <div className="w-16 h-16 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-2xl">👟</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-white truncate">{result.name}</p>
                <p className="text-[11px] text-[#666]">{result.colorway}</p>
                <p className="text-[11px] text-[#444]">{result.sku}</p>
                {result.marketPrice && (
                  <p className="text-[12px] text-gray-400 font-semibold mt-1">~${result.marketPrice} market</p>
                )}
              </div>
              <button
                onClick={() => setStep("search")}
                className="text-[11px] text-[#555] underline hover:text-white transition-colors ml-2 shrink-0"
              >
                Change
              </button>
            </div>

            {/* Size + Price */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-2">Size</label>
                <input
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="10.5"
                  className="w-full bg-black border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder-[#333] outline-none focus:border-[#444]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-2">Price Paid ($)</label>
                <input
                  value={pricePaid}
                  onChange={(e) => setPricePaid(e.target.value)}
                  placeholder={result.retailPrice?.toString() || "180"}
                  type="number"
                  className="w-full bg-black border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder-[#333] outline-none focus:border-[#444]"
                />
              </div>
            </div>

            {/* Condition */}
            <div className="mb-6">
              <label className="block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-2">Condition</label>
              <div className="flex gap-2">
                {conditionOptions.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCondition(c)}
                    className={`flex-1 py-2 text-[12px] font-bold uppercase tracking-widest rounded-lg border transition-colors ${
                      condition === c
                        ? "bg-white text-black border-white"
                        : "bg-black text-[#555] border-[#2a2a2a] hover:border-[#444]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!size || !pricePaid}
              className="w-full py-3.5 bg-white text-black text-[13px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Add to Vault
            </button>
          </>
        )}
      </div>
    </div>
  );
}
