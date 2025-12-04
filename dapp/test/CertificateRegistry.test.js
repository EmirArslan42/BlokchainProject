const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateRegistry", function () {
  let certificateRegistry;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Signers'ı al
    [owner, addr1, addr2] = await ethers.getSigners();

    // Contract'ı deploy et
    const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
    certificateRegistry = await CertificateRegistry.deploy();
    await certificateRegistry.waitForDeployment();
  });

  describe("Issue Certificate", function () {
    it("Sertifika başarıyla oluşturulmalı", async function () {
      const id = ethers.id("test-uuid-1");
      const holderHash = ethers.id("holder-hash-1");
      const title = "Blockchain Kursu";
      const issuer = "ABC Üniversitesi";
      const expiresAt = 0; // Süresiz

      const tx = await certificateRegistry.issue(id, holderHash, title, issuer, expiresAt);
      await tx.wait();

      // Sertifikayı kontrol et
      const cert = await certificateRegistry.certificates(id);
      expect(cert.title).to.equal(title);
      expect(cert.issuer).to.equal(issuer);
      expect(cert.holderHash).to.equal(holderHash);
      expect(cert.revoked).to.be.false;
    });

    it("Aynı ID ile iki kez sertifika oluşturulamaz", async function () {
      const id = ethers.id("test-uuid-2");
      const holderHash = ethers.id("holder-hash-2");
      const title = "Test Kursu";
      const issuer = "Test Enstitüsü";
      const expiresAt = 0;

      await certificateRegistry.issue(id, holderHash, title, issuer, expiresAt);

      // İkinci kez oluşturmaya çalış - başarısız olmalı
      await expect(
        certificateRegistry.issue(id, holderHash, title, issuer, expiresAt)
      ).to.be.revertedWith("Already issued");
    });

    it("CertificateIssued olayı yayılmalı", async function () {
      const id = ethers.id("test-uuid-3");
      const holderHash = ethers.id("holder-hash-3");
      const title = "Yeni Kurs";
      const issuer = "Yeni Enstitüsü";
      const expiresAt = 0;

      const tx = await certificateRegistry.issue(id, holderHash, title, issuer, expiresAt);
      const receipt = await tx.wait();

      // Event kontrol et
      expect(receipt.logs.length).to.be.greaterThan(0);
    });
  });

  describe("Verify Certificate", function () {
    it("Geçerli sertifika doğrulanmalı", async function () {
      const id = ethers.id("test-uuid-4");
      const holderHash = ethers.id("holder-hash-4");
      const title = "Doğrulama Testi";
      const issuer = "Test Kurum";
      const expiresAt = 0;

      await certificateRegistry.issue(id, holderHash, title, issuer, expiresAt);

      const [valid, revoked, issuedAt, expiresAtResult, titleResult, issuerResult] =
        await certificateRegistry.verify(id, holderHash);

      expect(valid).to.be.true;
      expect(revoked).to.be.false;
      expect(titleResult).to.equal(title);
      expect(issuerResult).to.equal(issuer);
    });

    it("Yanlış holderHash ile doğrulama başarısız olmalı", async function () {
      const id = ethers.id("test-uuid-5");
      const correctHash = ethers.id("holder-hash-5");
      const wrongHash = ethers.id("wrong-hash");
      const title = "Test";
      const issuer = "Test";
      const expiresAt = 0;

      await certificateRegistry.issue(id, correctHash, title, issuer, expiresAt);

      const [valid] = await certificateRegistry.verify(id, wrongHash);
      expect(valid).to.be.false;
    });

    it("Olmayan sertifika bulunamamalı", async function () {
      const id = ethers.id("non-existent");
      const holderHash = ethers.id("hash");

      const [valid, revoked, issuedAt] = await certificateRegistry.verify(id, holderHash);
      expect(valid).to.be.false;
      expect(revoked).to.be.false;
      expect(issuedAt).to.equal(0);
    });

    it("Süresi dolmuş sertifika doğrulanamamalı", async function () {
      const id = ethers.id("test-uuid-6");
      const holderHash = ethers.id("holder-hash-6");
      const title = "Süreli Sertifika";
      const issuer = "Test Kurum";
      
      // Geçmişteki bir tarih (unix timestamp)
      const expiresAt = Math.floor(Date.now() / 1000) - 86400; // 1 gün öncesi

      await certificateRegistry.issue(id, holderHash, title, issuer, expiresAt);

      const [valid] = await certificateRegistry.verify(id, holderHash);
      expect(valid).to.be.false;
    });
  });

  describe("Revoke Certificate", function () {
    it("Sertifika başarıyla iptal edilmeli", async function () {
      const id = ethers.id("test-uuid-7");
      const holderHash = ethers.id("holder-hash-7");
      const title = "İptal Testi";
      const issuer = "Test Kurum";
      const expiresAt = 0;

      await certificateRegistry.issue(id, holderHash, title, issuer, expiresAt);

      // İptal et
      const tx = await certificateRegistry.revoke(id);
      await tx.wait();

      // Kontrol et
      const cert = await certificateRegistry.certificates(id);
      expect(cert.revoked).to.be.true;
    });

    it("İptal edilen sertifika doğrulanamamalı", async function () {
      const id = ethers.id("test-uuid-8");
      const holderHash = ethers.id("holder-hash-8");
      const title = "İptal Doğrulama";
      const issuer = "Test Kurum";
      const expiresAt = 0;

      await certificateRegistry.issue(id, holderHash, title, issuer, expiresAt);
      await certificateRegistry.revoke(id);

      const [valid, revoked] = await certificateRegistry.verify(id, holderHash);
      expect(valid).to.be.false;
      expect(revoked).to.be.true;
    });

    it("Olmayan sertifika iptal edilemez", async function () {
      const id = ethers.id("non-existent");

      await expect(certificateRegistry.revoke(id)).to.be.revertedWith("Not found");
    });

    it("CertificateRevoked olayı yayılmalı", async function () {
      const id = ethers.id("test-uuid-9");
      const holderHash = ethers.id("holder-hash-9");
      const title = "Event Testi";
      const issuer = "Test Kurum";
      const expiresAt = 0;

      await certificateRegistry.issue(id, holderHash, title, issuer, expiresAt);

      const tx = await certificateRegistry.revoke(id);
      const receipt = await tx.wait();

      expect(receipt.logs.length).to.be.greaterThan(0);
    });
  });

  describe("Edge Cases", function () {
    it("Boş string ile sertifika oluşturulabilmeli", async function () {
      const id = ethers.id("test-uuid-10");
      const holderHash = ethers.id("holder-hash-10");
      const title = "";
      const issuer = "";
      const expiresAt = 0;

      const tx = await certificateRegistry.issue(id, holderHash, title, issuer, expiresAt);
      await tx.wait();

      const cert = await certificateRegistry.certificates(id);
      expect(cert.title).to.equal("");
      expect(cert.issuer).to.equal("");
    });

    it("Çok büyük string ile sertifika oluşturulabilmeli", async function () {
      const id = ethers.id("test-uuid-11");
      const holderHash = ethers.id("holder-hash-11");
      const longString = "a".repeat(1000);
      const expiresAt = 0;

      const tx = await certificateRegistry.issue(id, holderHash, longString, longString, expiresAt);
      await tx.wait();

      const cert = await certificateRegistry.certificates(id);
      expect(cert.title).to.equal(longString);
    });
  });
});
