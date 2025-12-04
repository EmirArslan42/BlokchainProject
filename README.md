Blockchain Tabanlı Sertifika Doğrulama Sistemi
Bu proje, Docker üzerinde çalışan Ganache + Hardhat + React mimarisi ile dijital sertifikaların oluşturulması, doğrulanması ve iptal edilmesini sağlayan bir blockchain sistemidir. Amaç, merkeziyetsiz bir yapıda güvenilir ve doğrulanabilir sertifika yönetimi oluşturmaktır.

Özellikler:
1. Docker Compose ile çok bileşenli mimari
2. Yerel Blockchain (Ganache)
3. Akıllı Kontrat (Hardhat) – Issue / Verify / Revoke
4. Web Arayüzü (React + Vite)
5. KVKK uyumlu hash tabanlı veri modeli
6. PDF çıktısı oluşturma
7. QR kod ile doğrulama bilgisi
```
📁 Proje Yapısı
project-root/
│
├── dapp/                     
│   ├── contracts/
│   │   └── CertificateRegistry.sol
│   ├── scripts/
│   │   └── deploy.js
│   └── hardhat.config.js
│
├── client/                   
│   ├── src/
│   │   ├── pages/
│   │   │   ├── IssuePage.jsx
│   │   │   ├── VerifyPage.jsx
│   │   │   └── RevokePage.jsx
│   │   ├── api.js
│   │   └── App.jsx
│   └── vite.config.js
│
└── docker-compose.yml        
```
 1. ADIM: Docker ile Projeyi Başlatma
Docker Compose ile tüm sistemi başlatın
```
docker compose up --build
```

Bu işlem üç konteyner başlatır:

Servis	Açıklama
ganache	Yerel blockchain ağı
hardhat	Akıllı kontrat derleme/deploy
client	React Web Arayüzü

Container durumunu kontrol edin
```
docker ps
```
2. ADIM: Akıllı Kontratı Deploy Etme (Hardhat Container İçinde)
1️⃣ Hardhat container’a giriş
```
docker exec -it blockchain_project-hardhat-1 bash
```
2️⃣ Kontratı derleyin
```
npx hardhat compile
```
3️⃣ Kontratı Ganache ağına deploy edin
```
npx hardhat run scripts/deploy.js --network localhost
```

Ekranda şöyle bir çıktı görünür:
```
Registry: 0xABC1234...
```
Bu adresi React projesinin .env dosyasına ekleyin:
```
VITE_CONTRACT_ADDRESS=0xABC1234...
VITE_RPC_URL=http://ganache:8545
VITE_PRIVATE_KEY=<ganache-private-key>
```
 3. ADIM: Web Arayüzünü Kullanma

React arayüzü çalışır durumda olacaktır:
```
 http://localhost:5173
```
Arayüz 3 temel sayfadan oluşur:

1) Sertifika Oluşturma (Issue Page)

Form alanları:
```
Öğrenci No

Ad Soyad

Sertifika Başlığı

Kurum

Bitiş Tarihi
```
1) Sertifika Oluşturma (Issue Page)

Form gönderildiğinde sistem aşağıdaki adımları gerçekleştirir:

UUID otomatik olarak üretilir.

Hash oluşturulur:
```
holderHash = keccak256(ogrNo + "|" + adSoyad.toUpperCase().trim() + "|" + salt)
```

issue() fonksiyonu çağrılır.

Sertifika blockchain’e kaydedilir.

Oluşan Transaction Hash ekranda gösterilir.

2) Sertifika Doğrulama (Verify Page)
Girilen bilgiler:
```
UUID

Öğrenci No

Ad Soyad

Doğrulama sonucunda ekranda gösterilir:

Sertifika geçerli mi?

Son kullanma tarihi dolmuş mu?

Sertifika iptal edilmiş mi?
```
Ekstra özellikler:

QR Kod oluşturma

PDF sertifika çıktısı alma

3) Sertifika İptal (Revoke Page)
Girilen bilgi:

UUID

İşlem sonucu:

revoke() fonksiyonu çağrılır.

Sertifika anında iptal edilir.

İptal edildi bilgisi ve transaction hash kullanıcıya gösterilir.

KVKK Uyumlu Veri Modeli

Blockchain’e kişisel veri ASLA yazılmaz.
Yalnızca hash’lenmiş kimlik bilgisi tutulur.

Hash üretimi:
```
holderHash = keccak256(ogrNo + "|" + adSoyad.toUpperCase().trim() + "|" + salt)
```

Blockchain’e yazılan alanlar:
Alan	Açıklama
id	UUID → bytes32 formatında saklanır
holderHash	Kimlik + salt → keccak256 hash
title	Sertifika adı
issuer	Kurumu/veren birim
expiresAt	Sertifika geçerlilik süresi (0 = süresiz)

 4. ADIM: Test Senaryoları
✔ Sertifika Oluşturma Testi

Issue formunu doldurun

TX hash göründüğünde sertifika oluşturulmuştur

✔ Sertifika Doğrulama Testi

UUID + bilgiler girilir

verify() sonucu arayüzde görünür

QR kod üretilir

PDF indirilebilir

✔ Sertifika İptal Testi

UUID girilir

revoke() çağrılır

Sertifika artık geçersiz olacaktır

🎥 Demo Videosu 

[Demo Videosunu İzle](./demo/221229061_Emir_Arslan_Blockchain_Demo.mp4)
