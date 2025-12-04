import { useState } from "react";
import { uuidToBytes32 } from "../api";
import { contract } from "../api";

export default function RevokePage() {
  const [uuid, setUuid] = useState("");
  const [message, setMessage] = useState("Sertifikayı iptal etmek için UUID'yi girin.");
  const [loading, setLoading] = useState(false);

  async function handleRevoke() {
    if (!uuid.trim()) {
      setMessage("❌ Lütfen UUID girin.");
      return;
    }

    try {
      setLoading(true);
      setMessage("⏳ İşlem yapılıyor...");

      const idBytes32 = uuidToBytes32(uuid);
      const tx = await contract.revoke(idBytes32);
      await tx.wait();

      setMessage(
        `✔ Sertifika başarıyla iptal edildi!\nTx: ${tx.hash}`
      );
      setUuid("");
    } catch (err) {
      setMessage(`❌ Hata: ${err.message || "Bilinmeyen hata"}`);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle =
    "w-full px-4 py-3 border rounded-lg mb-4 shadow-sm focus:ring-2 focus:ring-red-400 outline-none transition";

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-700">Sertifikayı İptal Et</h2>

      <input
        className={inputStyle}
        placeholder="UUID"
        value={uuid}
        onChange={(e) => setUuid(e.target.value)}
        disabled={loading}
      />

      <button
        onClick={handleRevoke}
        disabled={loading}
        className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow disabled:bg-gray-400"
      >
        {loading ? "İptal Ediliyor..." : "Sertifikayı İptal Et"}
      </button>

      <pre className="mt-6 bg-gray-100 p-4 rounded-lg whitespace-pre-wrap text-sm shadow-inner">
        {message}
      </pre>
    </div>
  );
}
