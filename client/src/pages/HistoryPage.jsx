import { useState, useEffect } from "react";
import { contract } from "../api";

export default function HistoryPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Blockchain işlemleri yükleniyor...");

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      setMessage("⏳ İşlemler yükleniyor...");

      // Contract events'i dinle
      const issuedEvents = await contract.queryFilter(contract.filters.CertificateIssued());
      const revokedEvents = await contract.queryFilter(contract.filters.CertificateRevoked());

      const allEvents = [
        ...issuedEvents.map((event) => ({
          type: "Oluşturuldu",
          id: event.args[0],
          timestamp: Number(event.args[1]),
          txHash: event.transactionHash,
          color: "green",
        })),
        ...revokedEvents.map((event) => ({
          type: "İptal Edildi",
          id: event.args[0],
          timestamp: Number(event.args[1]),
          txHash: event.transactionHash,
          color: "red",
        })),
      ];

      // Tarihe göre sırala (en yeni önce)
      allEvents.sort((a, b) => b.timestamp - a.timestamp);

      if (allEvents.length === 0) {
        setMessage("📋 Henüz işlem yoktur.");
      } else {
        setEvents(allEvents);
        setMessage(`✔ Toplam ${allEvents.length} işlem bulundu.`);
      }
    } catch (err) {
      const errorMsg = err.reason || err.message || "Bilinmeyen hata";
      setMessage(`❌ Hata: ${errorMsg}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-700">İşlem Geçmişi</h2>

      <button
        onClick={loadEvents}
        disabled={loading}
        className="w-full py-2 mb-4 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition disabled:bg-gray-400"
      >
        {loading ? "Yükleniyor..." : "Yenile"}
      </button>

      <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-center text-gray-500">{message}</p>
        ) : (
          <div className="space-y-2">
            {events.map((event, idx) => (
              <div
                key={idx}
                className={`p-3 rounded border-l-4 ${
                  event.color === "green"
                    ? "bg-green-50 border-green-400"
                    : "bg-red-50 border-red-400"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm">
                      {event.type === "Oluşturuldu" ? "✔" : "⚠"} {event.type}
                    </p>
                    <p className="text-xs text-gray-600 font-mono break-all">
                      ID: {event.id.substring(0, 20)}...
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(event.timestamp * 1000).toLocaleDateString("tr-TR")}
                  </span>
                </div>
                <a
                  href={`#`}
                  className="text-xs text-blue-500 hover:underline font-mono"
                  title={event.txHash}
                >
                  TX: {event.txHash.substring(0, 10)}...
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
