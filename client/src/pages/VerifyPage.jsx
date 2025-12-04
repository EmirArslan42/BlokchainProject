import { useState } from "react";
import {
  uuidToBytes32,
  generateHolderHash,
  verifyCertificate
} from "../api";

export default function VerifyPage() {
  const [uuid, setUuid] = useState("");
  const [ogrNo, setOgrNo] = useState("");
  const [adSoyad, setAdSoyad] = useState("");
  const [message, setMessage] = useState("Sertifika doğrulamak için bilgileri doldurun.");

  async function handleVerify() {
    try {
      const idBytes32 = uuidToBytes32(uuid);
      const salt = "SABIT_SALT_123";
      const holderHash = generateHolderHash(ogrNo, adSoyad, salt);

      const res = await verifyCertificate(idBytes32, holderHash);
      const [valid, revoked, issuedAt, expiresAt, title, issuer] = res;

      if (!valid && issuedAt === 0n) {
        setMessage("❌ Sertifika bulunamadı.");
      } else if (revoked) {
        setMessage("⚠ Sertifika iptal edilmiş.");
      } else if (valid) {
        setMessage(
          `✔ Geçerli Sertifika\nBaşlık: ${title}\nKurum: ${issuer}\nVerilme: ${issuedAt}\nBitiş: ${expiresAt}`
        );
      } else {
        setMessage("❌ Doğrulama başarısız.");
      }
    } catch (err) {
      setMessage("Hata: " + err.message);
    }
  }

  const inputStyle =
    "w-full px-4 py-3 border rounded-lg mb-4 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition";

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-700">Sertifika Doğrula</h2>

      <input
        className={inputStyle}
        placeholder="UUID"
        value={uuid}
        onChange={(e) => setUuid(e.target.value)}
      />

      <input
        className={inputStyle}
        placeholder="Öğrenci No"
        value={ogrNo}
        onChange={(e) => setOgrNo(e.target.value)}
      />

      <input
        className={inputStyle}
        placeholder="Ad Soyad"
        value={adSoyad}
        onChange={(e) => setAdSoyad(e.target.value)}
      />

      <button
        onClick={handleVerify}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow"
      >
        Doğrula
      </button>

      <pre className="mt-6 bg-gray-100 p-4 rounded-lg whitespace-pre-wrap text-sm shadow-inner">
        {message}
      </pre>
    </div>
  );
}
