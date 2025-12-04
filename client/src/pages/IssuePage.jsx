import { useState } from "react";
import {
  uuidToBytes32,
  generateHolderHash,
  issueCertificate
} from "../api";
import { v4 as uuidv4 } from "uuid";

export default function IssuePage() {
  const [ogrNo, setOgrNo] = useState("");
  const [adSoyad, setAdSoyad] = useState("");
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [expiresAt, setExpiresAt] = useState("0");
  const [message, setMessage] = useState("Sertifika oluşturmak için bilgileri doldurun.");
  const [loading, setLoading] = useState(false);

  async function handleIssue() {
    if (!ogrNo.trim() || !adSoyad.trim() || !title.trim() || !issuer.trim()) {
      setMessage("❌ Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      setLoading(true);
      setMessage("⏳ Sertifika oluşturuluyor...");

      const id = uuidv4();
      const idBytes32 = uuidToBytes32(id);
      const salt = "SABIT_SALT_123";
      const holderHash = generateHolderHash(ogrNo, adSoyad, salt);

      const txHash = await issueCertificate(
        idBytes32,
        holderHash,
        title,
        issuer,
        Number(expiresAt)
      );

      setMessage(
        `✔ Sertifika başarıyla oluşturuldu!\n\nUUID: ${id}\nTransaction: ${txHash}\n\nBu UUID'yi başka bir yerde kullanmak üzere saklayın.`
      );
      
      // Formu temizle
      setOgrNo("");
      setAdSoyad("");
      setTitle("");
      setIssuer("");
      setExpiresAt("0");
    } catch (err) {
      const errorMsg = err.reason || err.message || "Bilinmeyen hata";
      setMessage(`❌ Hata: ${errorMsg}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle =
    "w-full px-4 py-3 border rounded-lg mb-4 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition disabled:bg-gray-200";

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-700">Sertifika Oluştur</h2>

      <input
        className={inputStyle}
        placeholder="Öğrenci No"
        value={ogrNo}
        onChange={(e) => setOgrNo(e.target.value)}
        disabled={loading}
      />

      <input
        className={inputStyle}
        placeholder="Ad Soyad"
        value={adSoyad}
        onChange={(e) => setAdSoyad(e.target.value)}
        disabled={loading}
      />

      <input
        className={inputStyle}
        placeholder="Sertifika Başlığı"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
      />

      <input
        className={inputStyle}
        placeholder="Kurum"
        value={issuer}
        onChange={(e) => setIssuer(e.target.value)}
        disabled={loading}
      />

      <input
        className={inputStyle}
        placeholder="Bitiş Tarihi (0 = Süresiz)"
        value={expiresAt}
        onChange={(e) => setExpiresAt(e.target.value)}
        disabled={loading}
      />

      <button
        onClick={handleIssue}
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow disabled:bg-gray-400"
      >
        {loading ? "Oluşturuluyor..." : "Sertifikayı Oluştur"}
      </button>

      <pre className="mt-6 bg-gray-100 p-4 rounded-lg whitespace-pre-wrap text-sm shadow-inner">
        {message}
      </pre>
    </div>
  );
}
