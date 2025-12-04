import { useState } from "react";
import IssuePage from "./pages/IssuePage";
import VerifyPage from "./pages/VerifyPage";
import RevokePage from "./pages/RevokePage";
import HistoryPage from "./pages/HistoryPage";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("issue");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center p-6">
      
      <h1 className="text-3xl font-bold mb-8 text-gray-800 drop-shadow">
        Blockchain Sertifika Sistemi
      </h1>

      <div className="flex gap-4 mb-6 flex-wrap justify-center">
        <button
          onClick={() => setPage("issue")}
          className={`px-6 py-2 rounded-lg text-white font-semibold shadow transition
            ${page === "issue" ? "bg-blue-600" : "bg-gray-500 hover:bg-gray-600"}`}
        >
          Sertifika Oluştur
        </button>

        <button
          onClick={() => setPage("verify")}
          className={`px-6 py-2 rounded-lg text-white font-semibold shadow transition
            ${page === "verify" ? "bg-blue-600" : "bg-gray-500 hover:bg-gray-600"}`}
        >
          Sertifika Doğrula
        </button>

        <button
          onClick={() => setPage("revoke")}
          className={`px-6 py-2 rounded-lg text-white font-semibold shadow transition
            ${page === "revoke" ? "bg-red-600" : "bg-gray-500 hover:bg-gray-600"}`}
        >
          Sertifikayı İptal Et
        </button>

        <button
          onClick={() => setPage("history")}
          className={`px-6 py-2 rounded-lg text-white font-semibold shadow transition
            ${page === "history" ? "bg-purple-600" : "bg-gray-500 hover:bg-gray-600"}`}
        >
          İşlem Geçmişi
        </button>
      </div>

      <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        {page === "issue" ? <IssuePage /> : page === "verify" ? <VerifyPage /> : page === "revoke" ? <RevokePage /> : <HistoryPage />}
      </div>

    </div>
  );
}
