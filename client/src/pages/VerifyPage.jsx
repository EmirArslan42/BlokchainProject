import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode";
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
  const [loading, setLoading] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const pdfRef = useRef();
  const qrCanvasRef = useRef();

  // QR kod oluşturma
  useEffect(() => {
    if (certificateData && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, certificateData.qrData, {
        width: 150,
        margin: 2,
        color: { dark: "#000", light: "#fff" }
      }).catch(err => console.error("QR Code hatası:", err));
    }
  }, [certificateData]);

  async function handleVerify() {
    if (!uuid.trim() || !ogrNo.trim() || !adSoyad.trim()) {
      setMessage("❌ Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      setLoading(true);
      setMessage("⏳ Doğrulanıyor...");
      setCertificateData(null);

      const idBytes32 = uuidToBytes32(uuid);
      const salt = "SABIT_SALT_123";
      const holderHash = generateHolderHash(ogrNo, adSoyad, salt);

      const res = await verifyCertificate(idBytes32, holderHash);
      const [valid, revoked, issuedAt, expiresAt, title, issuer] = res;

      if (!valid && issuedAt === 0n) {
        setMessage("❌ Sertifika bulunamadı. UUID veya kişisel bilgiler yanlış olabilir.");
      } else if (revoked) {
        setMessage("⚠ Sertifika iptal edilmiş. Artık geçerli değildir.");
      } else if (valid) {
        const issuedDate = new Date(Number(issuedAt) * 1000).toLocaleDateString("tr-TR");
        const expiresDate = expiresAt === 0n ? "Süresiz" : new Date(Number(expiresAt) * 1000).toLocaleDateString("tr-TR");
        
        setCertificateData({
          uuid,
          title,
          issuer,
          ogrNo,
          adSoyad,
          issuedDate,
          expiresDate,
          qrData: `UUID: ${uuid}\nBaşlık: ${title}\nKurum: ${issuer}`
        });

        setMessage(`✔ SERTIFIKA GEÇERLİ\n\nBaşlık: ${title}\nKurum: ${issuer}\nVerilme Tarihi: ${issuedDate}\nBitiş Tarihi: ${expiresDate}`);
      } else {
        setMessage("❌ Doğrulama başarısız. Kişisel bilgiler eşleşmiyor.");
      }
    } catch (err) {
      const errorMsg = err.reason || err.message || "Bilinmeyen hata";
      setMessage(`❌ Hata: ${errorMsg}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function downloadPDF() {
    try {
      if (!pdfRef.current) return;
      
      const canvas = await html2canvas(pdfRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const imgWidth = 210; // A4 width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Sertifika_${certificateData.ogrNo}.pdf`);
    } catch (err) {
      setMessage(`❌ PDF indirme hatası: ${err.message}`);
    }
  }

  const inputStyle =
    "w-full px-4 py-3 border rounded-lg mb-4 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition disabled:bg-gray-200";

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-700">Sertifika Doğrula</h2>

      <input
        className={inputStyle}
        placeholder="UUID"
        value={uuid}
        onChange={(e) => setUuid(e.target.value)}
        disabled={loading}
      />

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

      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow disabled:bg-gray-400"
      >
        {loading ? "Doğrulanıyor..." : "Doğrula"}
      </button>

      {certificateData && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div ref={pdfRef} className="bg-white p-6 mb-4 rounded">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-green-700">✔ SERTIFIKA</h3>
            </div>
            
            <div className="space-y-3 text-sm mb-4">
              <p><strong>Başlık:</strong> {certificateData.title}</p>
              <p><strong>Kurum:</strong> {certificateData.issuer}</p>
              <p><strong>Ad Soyad:</strong> {certificateData.adSoyad}</p>
              <p><strong>Öğrenci No:</strong> {certificateData.ogrNo}</p>
              <p><strong>Verilme Tarihi:</strong> {certificateData.issuedDate}</p>
              <p><strong>Bitiş Tarihi:</strong> {certificateData.expiresDate}</p>
              <p className="text-xs font-mono break-all"><strong>UUID:</strong> {certificateData.uuid}</p>
            </div>

            <div className="flex justify-center">
              <canvas ref={qrCanvasRef}></canvas>
            </div>
          </div>

          <button
            onClick={downloadPDF}
            className="w-full py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            📥 PDF İndir
          </button>
        </div>
      )}

      <pre className="mt-6 bg-gray-100 p-4 rounded-lg whitespace-pre-wrap text-sm shadow-inner">
        {message}
      </pre>
    </div>
  );
}
