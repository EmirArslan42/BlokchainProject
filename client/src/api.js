import { ethers, keccak256, toUtf8Bytes } from "ethers";
import abi from "./abi/CertificateRegistry.json";

const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
const wallet = new ethers.Wallet(import.meta.env.VITE_PRIVATE_KEY, provider);

let CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

if (CONTRACT_ADDRESS && CONTRACT_ADDRESS.startsWith("/")) {
  const res = await fetch(CONTRACT_ADDRESS);
  CONTRACT_ADDRESS = await res.text();
}

export const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, wallet);

export function uuidToBytes32(uuid) {
  return keccak256(toUtf8Bytes(uuid));
}

export function generateHolderHash(ogrNo, fullName, salt) {
  const normalized = `${ogrNo}|${fullName.toUpperCase().trim()}|${salt}`;
  return keccak256(toUtf8Bytes(normalized));
}

export async function issueCertificate(idBytes32, holderHash, title, issuer, expiresAt) {
  const tx = await contract.issue(idBytes32, holderHash, title, issuer, expiresAt);
  await tx.wait();
  return tx.hash;
}

export async function verifyCertificate(idBytes32, holderHash) {
  return await contract.verify(idBytes32, holderHash);
}
