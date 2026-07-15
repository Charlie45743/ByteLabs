/* lib.js — pure helpers with no DOM. Attached to window.CL. */
(function () {
  "use strict";

  const te = new TextEncoder();
  const td = new TextDecoder();

  function utf8Bytes(str) { return te.encode(str); }
  function bytesToText(bytes) { return td.decode(bytes); }

  // ----- Base64 (works on raw bytes so binary survives) -----
  function bytesToBase64(bytes) {
    let bin = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(bin);
  }
  function base64ToBytes(b64) {
    const clean = b64.replace(/\s+/g, "");
    const bin = atob(clean);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  // ----- Hex -----
  function bytesToHex(bytes, spaced) {
    let s = "";
    for (let i = 0; i < bytes.length; i++) {
      s += bytes[i].toString(16).padStart(2, "0");
      if (spaced && i < bytes.length - 1) s += " ";
    }
    return s;
  }
  function hexToBytes(hex) {
    const clean = hex.replace(/[^0-9a-fA-F]/g, "");
    if (clean.length % 2 !== 0) throw new Error("Hex needs an even number of digits.");
    const out = new Uint8Array(clean.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.substr(i * 2, 2), 16);
    return out;
  }

  // ----- Binary (8-bit) -----
  function bytesToBinary(bytes) {
    const parts = [];
    for (let i = 0; i < bytes.length; i++) parts.push(bytes[i].toString(2).padStart(8, "0"));
    return parts.join(" ");
  }
  function binaryToBytes(str) {
    const clean = str.replace(/[^01]/g, "");
    if (clean.length % 8 !== 0) throw new Error("Binary length must be a multiple of 8 bits.");
    const out = new Uint8Array(clean.length / 8);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.substr(i * 8, 8), 2);
    return out;
  }

  // ----- HTML entities -----
  function htmlEncode(str) {
    return str.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function htmlDecode(str) {
    const map = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&#x27;": "'", "&nbsp;": " " };
    return str
      .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
      .replace(/&[a-z]+;/gi, (m) => (map[m] !== undefined ? map[m] : m));
  }

  // ----- ROT / Caesar -----
  function caesar(str, shift) {
    const s = ((shift % 26) + 26) % 26;
    return str.replace(/[a-z]/gi, function (c) {
      const base = c <= "Z" ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + s) % 26) + base);
    });
  }

  // ----- Morse -----
  const MORSE = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
    I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
    Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
    Y: "-.--", Z: "--..", 0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-",
    5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----.", ".": ".-.-.-",
    ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.",
    "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...", ";": "-.-.-.",
    "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-", '"': ".-..-.", "@": ".--.-."
  };
  const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));
  function morseEncode(str) {
    return str.toUpperCase().split("").map(function (c) {
      if (c === " ") return "/";
      return MORSE[c] || "";
    }).filter(Boolean).join(" ");
  }
  function morseDecode(str) {
    return str.trim().split(/\s+/).map(function (t) {
      if (t === "/") return " ";
      return MORSE_REV[t] || "";
    }).join("");
  }

  // ----- MD5 (works on bytes) -----
  const MD5_K = [];
  for (let i = 0; i < 64; i++) MD5_K.push(Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296));
  const MD5_S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
  function md5(bytes) {
    function rol(x, c) { return (x << c) | (x >>> (32 - c)); }
    const origBits = bytes.length * 8;
    const withOne = bytes.length + 1;
    const padLen = (56 - (withOne % 64) + 64) % 64;
    const total = withOne + padLen + 8;
    const buf = new Uint8Array(total);
    buf.set(bytes);
    buf[bytes.length] = 0x80;
    const lo = origBits >>> 0;
    const hi = Math.floor(origBits / 4294967296) >>> 0;
    buf[total - 8] = lo & 255; buf[total - 7] = (lo >>> 8) & 255; buf[total - 6] = (lo >>> 16) & 255; buf[total - 5] = (lo >>> 24) & 255;
    buf[total - 4] = hi & 255; buf[total - 3] = (hi >>> 8) & 255; buf[total - 2] = (hi >>> 16) & 255; buf[total - 1] = (hi >>> 24) & 255;

    let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
    const M = new Int32Array(16);
    for (let off = 0; off < total; off += 64) {
      for (let i = 0; i < 16; i++) {
        M[i] = buf[off + i * 4] | (buf[off + i * 4 + 1] << 8) | (buf[off + i * 4 + 2] << 16) | (buf[off + i * 4 + 3] << 24);
      }
      let A = a0, B = b0, C = c0, D = d0;
      for (let i = 0; i < 64; i++) {
        let F, g;
        if (i < 16) { F = (B & C) | (~B & D); g = i; }
        else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
        else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
        else { F = C ^ (B | ~D); g = (7 * i) % 16; }
        F = (F + A + MD5_K[i] + M[g]) | 0;
        A = D; D = C; C = B;
        B = (B + rol(F, MD5_S[((i >> 4) * 4) + (i % 4)])) | 0;
      }
      a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
    }
    function word(n) {
      let s = "";
      for (let i = 0; i < 4; i++) s += ((n >>> (i * 8)) & 255).toString(16).padStart(2, "0");
      return s;
    }
    return word(a0) + word(b0) + word(c0) + word(d0);
  }

  // ----- SHA via Web Crypto (returns hex) -----
  async function shaHex(algo, bytes) {
    if (!(window.crypto && window.crypto.subtle)) {
      throw new Error("SHA hashing needs a secure context (open the site via http://localhost).");
    }
    const buf = await window.crypto.subtle.digest(algo, bytes);
    return bytesToHex(new Uint8Array(buf), false);
  }

  // ----- Shannon entropy (bits per byte, 0..8) -----
  function entropy(bytes) {
    if (!bytes.length) return 0;
    const counts = new Array(256).fill(0);
    for (let i = 0; i < bytes.length; i++) counts[bytes[i]]++;
    let e = 0;
    for (let i = 0; i < 256; i++) {
      if (!counts[i]) continue;
      const p = counts[i] / bytes.length;
      e -= p * Math.log2(p);
    }
    return e;
  }

  // ----- Magic bytes -----
  const SIGNATURES = [
    { hex: "89504E47", label: "PNG image" },
    { hex: "FFD8FF", label: "JPEG image" },
    { hex: "47494638", label: "GIF image" },
    { hex: "25504446", label: "PDF document" },
    { hex: "504B0304", label: "ZIP / Office / JAR archive" },
    { hex: "504B0506", label: "ZIP (empty archive)" },
    { hex: "52617221", label: "RAR archive" },
    { hex: "1F8B", label: "GZIP archive" },
    { hex: "425A68", label: "BZIP2 archive" },
    { hex: "377ABCAF271C", label: "7-Zip archive" },
    { hex: "494433", label: "MP3 (ID3)" },
    { hex: "000001BA", label: "MPEG video" },
    { hex: "7F454C46", label: "ELF executable" },
    { hex: "4D5A", label: "Windows executable (PE)" },
    { hex: "CAFEBABE", label: "Java class file" },
    { hex: "3C3F786D6C", label: "XML document" },
    { hex: "7B", label: "Likely JSON (starts with {)" }
  ];
  function magicBytes(bytes) {
    const head = bytesToHex(bytes.subarray(0, 8), false).toUpperCase();
    for (const s of SIGNATURES) if (head.startsWith(s.hex)) return s.label;
    return "Unknown / plain data";
  }

  // ----- Detection: guess what a string is -----
  function printableRatio(bytes) {
    if (!bytes.length) return 0;
    let p = 0;
    for (let i = 0; i < bytes.length; i++) { const b = bytes[i]; if ((b >= 32 && b < 127) || b === 9 || b === 10 || b === 13) p++; }
    return p / bytes.length;
  }
  function detect(str) {
    const s = str.trim();
    const results = [];
    if (!s) return results;
    const noWs = s.replace(/\s+/g, "");
    const push = (label, score, action) => results.push({ label, score: Math.max(0, Math.min(1, score)), action });

    // JWT — verify the header actually decodes to JSON with an "alg"
    if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/.test(s)) {
      try { const p = parseJwt(s); push("JWT (JSON Web Token)", p.header && p.header.alg ? 0.98 : 0.8, "jwt"); }
      catch (e) { push("JWT-like token", 0.5); }
    }
    // JSON
    if (/^[\[{]/.test(s) && /[\]}]$/.test(s)) {
      try { JSON.parse(s); push("JSON", 0.97, "json"); } catch (e) { push("JSON (invalid)", 0.4); }
    }
    // XML / HTML
    if (/^<[a-zA-Z?!]/.test(s) && />/.test(s)) push("XML / HTML markup", 0.85);
    // UUID
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) push("UUID", 0.98);
    // Email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) push("Email address", 0.9);
    // URL
    if (/^https?:\/\/[^\s]+$/i.test(s)) push("URL", 0.92);
    // IPv4
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(s) && s.split(".").every((o) => +o <= 255)) push("IPv4 address", 0.95);
    // MAC address
    if (/^([0-9a-f]{2}[:-]){5}[0-9a-f]{2}$/i.test(s)) push("MAC address", 0.95);
    // Hash by length (hex only, no spaces)
    if (/^[0-9a-fA-F]+$/.test(s)) {
      const byLen = { 32: "MD5 or NTLM hash", 40: "SHA-1 hash", 56: "SHA-224 hash", 64: "SHA-256 hash", 96: "SHA-384 hash", 128: "SHA-512 hash" };
      if (byLen[s.length]) push(byLen[s.length], 0.9);
    }
    // Hex bytes (general) — rank higher when it decodes to printable text
    if (/^[0-9a-fA-F\s]+$/.test(s) && noWs.length % 2 === 0 && noWs.length >= 4) {
      try { push("Hexadecimal bytes", 0.68 + 0.22 * printableRatio(hexToBytes(noWs)), "hex"); } catch (e) {}
    }
    // Binary
    if (/^[01\s]+$/.test(s) && noWs.length % 8 === 0 && noWs.length >= 8) push("Binary (8-bit)", 0.85, "binary");
    // Morse
    if (/^[.\-\s/]+$/.test(s) && /[.\-]/.test(s)) push("Morse code", 0.82, "morse");
    // URL encoding
    if (/%[0-9a-fA-F]{2}/.test(s)) push("URL-encoded text", 0.78, "url");
    // Base64 — only claim it if the decoded bytes are mostly printable text;
    // otherwise any alphanumeric string of the right length would qualify.
    if (/^[A-Za-z0-9+/]+={0,2}$/.test(noWs) && noWs.length % 4 === 0 && noWs.length >= 8) {
      try { const ratio = printableRatio(base64ToBytes(noWs)); if (ratio >= 0.6) push("Base64", 0.5 + 0.4 * ratio, "base64"); } catch (e) {}
    }
    // Base64 URL-safe — its alphabet (adds - and _) overlaps heavily with ordinary
    // slugs and identifiers, so this needs a stricter printable-output bar than plain
    // Base64 to avoid flagging things like "my-file-name-here".
    if (/^[A-Za-z0-9_-]+$/.test(noWs) && noWs.length >= 8 && (/[-_]/.test(noWs) || noWs.length % 4 !== 0)) {
      try { const ratio = printableRatio(base64UrlToBytes(noWs)); if (ratio >= 0.85) push("Base64 URL-safe", 0.5 + 0.4 * ratio, "base64url"); } catch (e) {}
    }
    // Note: Base32 detection was removed. Its alphabet (A-Z, 2-7) overlaps almost
    // entirely with ordinary words and hex-like strings, so a charset-only check flagged
    // most plain text as "possibly Base32" — a false positive, not a real signal.

    // keep the best score per label, most confident first
    const best = {};
    for (const r of results) if (!best[r.label] || best[r.label].score < r.score) best[r.label] = r;
    return Object.values(best).sort((a, b) => b.score - a.score);
  }

  function parseJwt(token) {
    const parts = token.split(".");
    if (parts.length < 2) throw new Error("Not a JWT.");
    const b64url = (s) => s.replace(/-/g, "+").replace(/_/g, "/");
    const header = JSON.parse(bytesToText(base64ToBytes(b64url(parts[0]))));
    const payload = JSON.parse(bytesToText(base64ToBytes(b64url(parts[1]))));
    return { header, payload, signature: parts[2] || "" };
  }

  // ----- Random via crypto -----
  function randomBytes(n) {
    const a = new Uint8Array(n);
    window.crypto.getRandomValues(a);
    return a;
  }
  function uuid() {
    if (window.crypto.randomUUID) return window.crypto.randomUUID();
    const b = randomBytes(16);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = bytesToHex(b, false);
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }
  function password(len) {
    const sets = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+";
    const bytes = randomBytes(len);
    let out = "";
    for (let i = 0; i < len; i++) out += sets[bytes[i] % sets.length];
    return out;
  }
  function randomIpv4() {
    const b = randomBytes(4);
    return Array.from(b).join(".");
  }
  // Rejection sampling keeps each face uniformly 1-in-6 — a plain byte % 6 would be
  // very slightly biased toward low faces, since 256 isn't a multiple of 6.
  function rollDice(count) {
    const n = Math.max(1, count | 0);
    const rolls = [];
    while (rolls.length < n) {
      const b = randomBytes(1)[0];
      if (b >= 252) continue;
      rolls.push((b % 6) + 1);
    }
    return rolls.join(" ");
  }
  const LOREM_WORDS = ("lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore " +
    "et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo " +
    "consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint " +
    "occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum").split(" ");
  // Rejection sampling for a uniform pick, same reasoning as rollDice: a plain
  // byte % n is very slightly biased whenever 256 isn't a multiple of n.
  function randomIndex(n) {
    const limit = 256 - (256 % n);
    while (true) { const b = randomBytes(1)[0]; if (b < limit) return b % n; }
  }
  function loremIpsum(wordCount) {
    const n = Math.max(1, wordCount | 0);
    const words = [];
    for (let i = 0; i < n; i++) words.push(LOREM_WORDS[randomIndex(LOREM_WORDS.length)]);
    let out = words.join(" ");
    out = out.charAt(0).toUpperCase() + out.slice(1);
    // Sprinkle sentence breaks roughly every 8-14 words so it reads like prose, not one run-on line.
    const parts = out.split(" ");
    let sinceBreak = 0;
    for (let i = 0; i < parts.length - 1; i++) {
      sinceBreak++;
      if (sinceBreak > 7 + (i % 6)) { parts[i] += "."; parts[i + 1] = parts[i + 1].charAt(0).toUpperCase() + parts[i + 1].slice(1); sinceBreak = 0; }
    }
    return parts.join(" ") + ".";
  }
  function randomMac() {
    const bytes = [Math.floor(Math.random() * 256) & 0xfe]; // clear the multicast bit for a locally-plausible unicast MAC
    for (let i = 0; i < 5; i++) bytes.push(Math.floor(Math.random() * 256));
    return bytes.map((b) => b.toString(16).padStart(2, "0")).join(":");
  }
  function randomHexColor() { return "#" + Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, "0"); }
  function randomIntInRange(minStr, maxStr) {
    const min = parseInt(minStr, 10), max = parseInt(maxStr, 10);
    if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) throw new Error("Enter a valid min <= max.");
    return String(min + Math.floor(Math.random() * (max - min + 1)));
  }
  function randomFloatInRange(minStr, maxStr) {
    const min = parseFloat(minStr), max = parseFloat(maxStr);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) throw new Error("Enter a valid min <= max.");
    return String(min + Math.random() * (max - min));
  }
  function coinFlip() { return Math.random() < 0.5 ? "Heads" : "Tails"; }
  const CARD_RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const CARD_SUITS = ["♠", "♥", "♦", "♣"];
  function randomCard() { return CARD_RANKS[Math.floor(Math.random() * 13)] + CARD_SUITS[Math.floor(Math.random() * 4)]; }
  function shuffleLines(str) {
    const lines = str.split(/\r\n|\r|\n/);
    for (let i = lines.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = lines[i]; lines[i] = lines[j]; lines[j] = t; }
    return lines.join("\n");
  }
  function randomBoolean() { return Math.random() < 0.5 ? "true" : "false"; }

  // ----- Base64 URL-safe -----
  function bytesToBase64Url(bytes) {
    return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function base64UrlToBytes(s) {
    let t = s.replace(/-/g, "+").replace(/_/g, "/");
    while (t.length % 4) t += "=";
    return base64ToBytes(t);
  }

  // ----- Base32 (RFC 4648) -----
  const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  function base32Encode(bytes) {
    let bits = 0, value = 0, out = "";
    for (let i = 0; i < bytes.length; i++) {
      value = (value << 8) | bytes[i]; bits += 8;
      while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5; }
    }
    if (bits > 0) out += B32[(value << (5 - bits)) & 31];
    while (out.length % 8 !== 0) out += "=";
    return out;
  }
  function base32Decode(str) {
    const clean = str.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
    let bits = 0, value = 0; const out = [];
    for (const c of clean) {
      const idx = B32.indexOf(c);
      if (idx < 0) continue;
      value = (value << 5) | idx; bits += 5;
      if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
    }
    return new Uint8Array(out);
  }

  // ----- Simple ciphers -----
  function atbash(str) {
    return str.replace(/[a-z]/gi, function (c) {
      const base = c <= "Z" ? 65 : 97;
      return String.fromCharCode(base + (25 - (c.charCodeAt(0) - base)));
    });
  }
  function rot47(str) {
    return str.replace(/[\x21-\x7e]/g, (c) => String.fromCharCode(33 + ((c.charCodeAt(0) - 33 + 47) % 94)));
  }
  function a1z26Encode(str) {
    return str.toLowerCase().split("").map(function (c) {
      const code = c.charCodeAt(0);
      if (code >= 97 && code <= 122) return String(code - 96);
      if (c === " ") return "/";
      return "";
    }).filter((x) => x !== "").join(" ");
  }
  function a1z26Decode(str) {
    return str.trim().split(/\s+/).map(function (t) {
      if (t === "/") return " ";
      const n = parseInt(t, 10);
      return (n >= 1 && n <= 26) ? String.fromCharCode(96 + n) : "";
    }).join("");
  }
  function vigenere(str, key, dir) {
    const k = (key || "").toLowerCase().replace(/[^a-z]/g, "");
    if (!k.length) return str;
    let ki = 0;
    return str.replace(/[a-z]/gi, function (c) {
      const base = c <= "Z" ? 65 : 97;
      const shift = k.charCodeAt(ki % k.length) - 97;
      ki++;
      const x = c.charCodeAt(0) - base;
      const y = (((x + dir * shift) % 26) + 26) % 26;
      return String.fromCharCode(base + y);
    });
  }
  function vigenereEncode(s, k) { return vigenere(s, k, 1); }
  function vigenereDecode(s, k) { return vigenere(s, k, -1); }

  // ----- Beaufort cipher: c = k - p (mod 26), reciprocal like Atbash/ROT13 -----
  function beaufort(str, key) {
    const k = (key || "").toLowerCase().replace(/[^a-z]/g, "");
    if (!k.length) return str;
    let ki = 0;
    return str.replace(/[a-z]/gi, function (c) {
      const base = c <= "Z" ? 65 : 97;
      const shift = k.charCodeAt(ki % k.length) - 97;
      ki++;
      const x = c.charCodeAt(0) - base;
      const y = ((shift - x) % 26 + 26) % 26;
      return String.fromCharCode(base + y);
    });
  }

  // ----- Affine cipher: E(x) = a*x + b (mod 26); a must be coprime with 26 -----
  function egcd(a, b) { if (b === 0) return [a, 1, 0]; const [g, x1, y1] = egcd(b, a % b); return [g, y1, x1 - Math.floor(a / b) * y1]; }
  function modInverse(a, m) {
    const [g, x] = egcd(((a % m) + m) % m, m);
    if (g !== 1) throw new Error("Key 'a' must share no common factor with 26 (try 1,3,5,7,9,11,15,17,19,21,23,25).");
    return ((x % m) + m) % m;
  }
  function affineEncode(str, a, b) {
    return str.replace(/[a-z]/gi, (c) => {
      const base = c <= "Z" ? 65 : 97;
      const x = c.charCodeAt(0) - base;
      return String.fromCharCode((((a * x + b) % 26) + 26) % 26 + base);
    });
  }
  function affineDecode(str, a, b) {
    const aInv = modInverse(a, 26);
    return str.replace(/[a-z]/gi, (c) => {
      const base = c <= "Z" ? 65 : 97;
      const y = c.charCodeAt(0) - base;
      return String.fromCharCode((((aInv * (y - b)) % 26 + 26 * 30) % 26) + base);
    });
  }

  // ----- Polybius square (5x5 grid, I/J share a cell) -----
  const POLYBIUS_SQ = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
  function polybiusEncode(str) {
    const pairs = str.toUpperCase().replace(/[^A-Z]/g, "").split("").map((c) => {
      const idx = POLYBIUS_SQ.indexOf(c === "J" ? "I" : c);
      if (idx < 0) return "";
      return String(Math.floor(idx / 5) + 1) + String((idx % 5) + 1);
    });
    return pairs.join(" ");
  }
  function polybiusDecode(str) {
    const digits = str.replace(/[^1-5]/g, "");
    if (digits.length % 2 !== 0) throw new Error("Polybius input needs an even number of digits (row+column pairs).");
    let out = "";
    for (let i = 0; i < digits.length; i += 2) {
      const row = parseInt(digits[i], 10) - 1, col = parseInt(digits[i + 1], 10) - 1;
      out += POLYBIUS_SQ[row * 5 + col];
    }
    return out;
  }

  // ----- Bacon cipher: each letter as 5 bits (A=0, B=1), written as A/B symbols -----
  function baconEncode(str) {
    return str.toUpperCase().replace(/[^A-Z]/g, "").split("").map((c) => {
      const v = c.charCodeAt(0) - 65;
      return v.toString(2).padStart(5, "0").replace(/0/g, "A").replace(/1/g, "B");
    }).join(" ");
  }
  function baconDecode(str) {
    const clean = str.toUpperCase().replace(/[^AB]/g, "");
    if (clean.length % 5 !== 0) throw new Error("Bacon input needs a multiple of 5 A/B symbols per letter.");
    const groups = clean.match(/.{5}/g) || [];
    return groups.map((g) => String.fromCharCode(65 + parseInt(g.replace(/A/g, "0").replace(/B/g, "1"), 2))).join("");
  }

  // ----- Trithemius cipher: Caesar whose shift grows by 1 with each letter's position -----
  function trithemiusEncode(str) {
    let pos = 0;
    return str.replace(/[a-z]/gi, (c) => {
      const base = c <= "Z" ? 65 : 97;
      const x = c.charCodeAt(0) - base;
      const out = String.fromCharCode((((x + pos) % 26) + 26) % 26 + base);
      pos++;
      return out;
    });
  }
  function trithemiusDecode(str) {
    let pos = 0;
    return str.replace(/[a-z]/gi, (c) => {
      const base = c <= "Z" ? 65 : 97;
      const x = c.charCodeAt(0) - base;
      const out = String.fromCharCode((((x - pos) % 26) + 26) % 26 + base);
      pos++;
      return out;
    });
  }

  // ----- Gronsfeld cipher: Vigenere with a numeric key instead of a letter keyword -----
  function gronsfeldEncode(str, key) {
    const digits = (key || "").replace(/\D/g, "");
    if (!digits.length) throw new Error("Gronsfeld needs a numeric key (digits only).");
    let ki = 0;
    return str.replace(/[a-z]/gi, (c) => {
      const base = c <= "Z" ? 65 : 97;
      const x = c.charCodeAt(0) - base;
      const shift = digits.charCodeAt(ki % digits.length) - 48;
      ki++;
      return String.fromCharCode((((x + shift) % 26) + 26) % 26 + base);
    });
  }
  function gronsfeldDecode(str, key) {
    const digits = (key || "").replace(/\D/g, "");
    if (!digits.length) throw new Error("Gronsfeld needs a numeric key (digits only).");
    let ki = 0;
    return str.replace(/[a-z]/gi, (c) => {
      const base = c <= "Z" ? 65 : 97;
      const x = c.charCodeAt(0) - base;
      const shift = digits.charCodeAt(ki % digits.length) - 48;
      ki++;
      return String.fromCharCode((((x - shift) % 26) + 26) % 26 + base);
    });
  }

  // ----- Autokey cipher: Vigenere whose key is extended by the plaintext itself, so it
  // never repeats short like a fixed keyword does. -----
  function autokeyEncode(str, key) {
    if (!/[a-z]/i.test(key || "")) throw new Error("Autokey needs an alphabetic keyword.");
    const keyLetters = key.toUpperCase().replace(/[^A-Z]/g, "").split("");
    const plainLetters = str.toUpperCase().replace(/[^A-Z]/g, "").split("");
    const stream = keyLetters.concat(plainLetters);
    let li = 0;
    return str.replace(/[a-z]/gi, (c) => {
      const base = c <= "Z" ? 65 : 97;
      const x = c.charCodeAt(0) - base;
      const k = stream[li].charCodeAt(0) - 65;
      li++;
      return String.fromCharCode((((x + k) % 26) + 26) % 26 + base);
    });
  }
  function autokeyDecode(str, key) {
    if (!/[a-z]/i.test(key || "")) throw new Error("Autokey needs an alphabetic keyword.");
    const keyLetters = key.toUpperCase().replace(/[^A-Z]/g, "").split("");
    const recovered = [];
    let ki = 0;
    return str.replace(/[a-z]/gi, (c) => {
      const base = c <= "Z" ? 65 : 97;
      const y = c.charCodeAt(0) - base;
      const kChar = ki < keyLetters.length ? keyLetters[ki] : recovered[ki - keyLetters.length];
      const k = kChar.charCodeAt(0) - 65;
      const p = (((y - k) % 26) + 26) % 26;
      recovered.push(String.fromCharCode(p + 65));
      ki++;
      return String.fromCharCode(p + base);
    });
  }

  // ----- Nihilist cipher: standard Polybius-square coordinates plus a repeating numeric
  // key (itself derived from a keyword through the same grid), added digit-pair-wise. -----
  function polybiusValue(c) {
    const idx = POLYBIUS_SQ.indexOf(c === "J" ? "I" : c);
    if (idx < 0) return null;
    return (Math.floor(idx / 5) + 1) * 10 + ((idx % 5) + 1);
  }
  function nihilistEncode(str, key) {
    const keyVals = (key || "").toUpperCase().replace(/[^A-Z]/g, "").split("").map(polybiusValue).filter((v) => v !== null);
    if (!keyVals.length) throw new Error("Nihilist needs an alphabetic keyword.");
    const plainVals = str.toUpperCase().replace(/[^A-Z]/g, "").split("").map(polybiusValue).filter((v) => v !== null);
    return plainVals.map((v, i) => v + keyVals[i % keyVals.length]).join(" ");
  }
  function nihilistDecode(str, key) {
    const keyVals = (key || "").toUpperCase().replace(/[^A-Z]/g, "").split("").map(polybiusValue).filter((v) => v !== null);
    if (!keyVals.length) throw new Error("Nihilist needs an alphabetic keyword.");
    const nums = str.trim().split(/\s+/).filter(Boolean).map(Number);
    if (nums.some((n) => !Number.isInteger(n))) throw new Error("Nihilist ciphertext should be space-separated numbers.");
    return nums.map((n, i) => {
      const v = n - keyVals[i % keyVals.length];
      const row = Math.floor(v / 10) - 1, col = (v % 10) - 1;
      if (row < 0 || row > 4 || col < 0 || col > 4) throw new Error("A decoded coordinate fell outside the 5x5 grid - check the key and ciphertext.");
      return POLYBIUS_SQ[row * 5 + col];
    }).join("");
  }

  // ----- Keyword cipher: monoalphabetic substitution seeded by a keyword (dedupe its
  // letters, then fill in the rest of the alphabet in order). -----
  function keywordAlphabet(key) {
    const seen = new Set();
    const letters = [];
    (key || "").toUpperCase().replace(/[^A-Z]/g, "").split("").forEach((c) => { if (!seen.has(c)) { seen.add(c); letters.push(c); } });
    for (let i = 0; i < 26; i++) { const c = String.fromCharCode(65 + i); if (!seen.has(c)) { seen.add(c); letters.push(c); } }
    return letters.join("");
  }
  function keywordCipherEncode(str, key) {
    const cipherAlpha = keywordAlphabet(key);
    return str.replace(/[a-z]/gi, (c) => {
      const base = c <= "Z" ? 65 : 97;
      const x = c.charCodeAt(0) - base;
      const out = cipherAlpha[x];
      return base === 65 ? out : out.toLowerCase();
    });
  }
  function keywordCipherDecode(str, key) {
    const cipherAlpha = keywordAlphabet(key);
    return str.replace(/[a-z]/gi, (c) => {
      const base = c <= "Z" ? 65 : 97;
      const idx = cipherAlpha.indexOf(c.toUpperCase());
      const out = String.fromCharCode(65 + idx);
      return base === 65 ? out : out.toLowerCase();
    });
  }

  // ----- ROT18: ROT13 on letters plus ROT5 on digits in one pass. Reciprocal, like ROT13
  // and ROT47 - running it twice restores the original. -----
  function rot18(str) {
    return str.replace(/[a-z0-9]/gi, (c) => {
      if (/[0-9]/.test(c)) return String.fromCharCode(((c.charCodeAt(0) - 48 + 5) % 10) + 48);
      const base = c <= "Z" ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
    });
  }

  // ----- Playfair cipher: digraph substitution on a keyed 5x5 grid (I/J merged). Doubled
  // letters within a pair and an odd final letter are padded with 'X', same as the
  // historical cipher - so decode isn't guaranteed byte-identical when that padding fired. -----
  function playfairGrid(key) {
    const seen = new Set();
    const letters = [];
    (key || "").toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "").split("").forEach((c) => { if (!seen.has(c)) { seen.add(c); letters.push(c); } });
    for (let i = 0; i < 26; i++) {
      const c = String.fromCharCode(65 + i);
      if (c === "J") continue;
      if (!seen.has(c)) { seen.add(c); letters.push(c); }
    }
    return letters;
  }
  function playfairPos(grid, c) {
    const i = grid.indexOf(c === "J" ? "I" : c);
    return { row: Math.floor(i / 5), col: i % 5 };
  }
  function playfairDigraphs(str) {
    const letters = str.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "").split("");
    const pairs = [];
    let i = 0;
    while (i < letters.length) {
      const a = letters[i];
      const b = letters[i + 1];
      if (b === undefined) { pairs.push([a, "X"]); i += 1; }
      else if (a === b) { pairs.push([a, "X"]); i += 1; }
      else { pairs.push([a, b]); i += 2; }
    }
    return pairs;
  }
  function playfairEncode(str, key) {
    if (!/[a-z]/i.test(key || "")) throw new Error("Playfair needs an alphabetic keyword.");
    const grid = playfairGrid(key);
    const pairs = playfairDigraphs(str);
    return pairs.map(([a, b]) => {
      const pa = playfairPos(grid, a), pb = playfairPos(grid, b);
      if (pa.row === pb.row) return grid[pa.row * 5 + (pa.col + 1) % 5] + grid[pb.row * 5 + (pb.col + 1) % 5];
      if (pa.col === pb.col) return grid[((pa.row + 1) % 5) * 5 + pa.col] + grid[((pb.row + 1) % 5) * 5 + pb.col];
      return grid[pa.row * 5 + pb.col] + grid[pb.row * 5 + pa.col];
    }).join("");
  }
  function playfairDecode(str, key) {
    if (!/[a-z]/i.test(key || "")) throw new Error("Playfair needs an alphabetic keyword.");
    const grid = playfairGrid(key);
    const letters = str.toUpperCase().replace(/[^A-Z]/g, "").split("");
    if (letters.length % 2 !== 0) throw new Error("Playfair ciphertext should have an even number of letters.");
    let out = "";
    for (let i = 0; i < letters.length; i += 2) {
      const a = letters[i], b = letters[i + 1];
      const pa = playfairPos(grid, a), pb = playfairPos(grid, b);
      if (pa.row === pb.row) out += grid[pa.row * 5 + (pa.col + 4) % 5] + grid[pb.row * 5 + (pb.col + 4) % 5];
      else if (pa.col === pb.col) out += grid[((pa.row + 4) % 5) * 5 + pa.col] + grid[((pb.row + 4) % 5) * 5 + pb.col];
      else out += grid[pa.row * 5 + pb.col] + grid[pb.row * 5 + pa.col];
    }
    return out;
  }

  // ----- Rail Fence cipher (transposition, not substitution) -----
  function railFenceEncode(str, rails) {
    const n = Math.max(2, parseInt(rails, 10) || 2);
    const chars = Array.from(str);
    const period = 2 * (n - 1);
    const rows = Array.from({ length: n }, () => []);
    for (let i = 0; i < chars.length; i++) {
      const pos = i % period;
      const row = pos < n ? pos : period - pos;
      rows[row].push(chars[i]);
    }
    return rows.map((r) => r.join("")).join("");
  }
  function railFenceDecode(str, rails) {
    const n = Math.max(2, parseInt(rails, 10) || 2);
    const chars = Array.from(str);
    const len = chars.length;
    const period = 2 * (n - 1);
    const rowOf = new Array(len);
    for (let i = 0; i < len; i++) {
      const pos = i % period;
      rowOf[i] = pos < n ? pos : period - pos;
    }
    const rowLengths = new Array(n).fill(0);
    for (let i = 0; i < len; i++) rowLengths[rowOf[i]]++;
    const rowStart = new Array(n);
    let acc = 0;
    for (let r = 0; r < n; r++) { rowStart[r] = acc; acc += rowLengths[r]; }
    const rowPos = new Array(n).fill(0);
    const out = new Array(len);
    for (let i = 0; i < len; i++) {
      const r = rowOf[i];
      out[i] = chars[rowStart[r] + rowPos[r]];
      rowPos[r]++;
    }
    return out.join("");
  }

  // ----- Columnar Transposition cipher (key-based, keyword sets column read order) -----
  function columnarKeyOrder(key) {
    const k = (key || "").toUpperCase().replace(/[^A-Z]/g, "");
    if (!k.length) throw new Error("This operation needs a keyword (letters only).");
    return { k, order: k.split("").map((c, i) => ({ c, i })).sort((a, b) => (a.c < b.c ? -1 : a.c > b.c ? 1 : a.i - b.i)).map((x) => x.i) };
  }
  function columnarEncode(str, key) {
    const { k, order } = columnarKeyOrder(key);
    const cols = k.length;
    const rows = Math.ceil(str.length / cols);
    let out = "";
    for (const colIdx of order) {
      for (let r = 0; r < rows; r++) {
        const pos = r * cols + colIdx;
        if (pos < str.length) out += str[pos];
      }
    }
    return out;
  }
  function columnarDecode(str, key) {
    const { k, order } = columnarKeyOrder(key);
    const cols = k.length;
    const rows = Math.ceil(str.length / cols);
    const fullCols = str.length % cols === 0 ? cols : str.length % cols;
    const colLen = order.map((colIdx) => (colIdx < fullCols ? rows : rows - 1));
    const grid = new Array(cols);
    let pos = 0;
    order.forEach((colIdx, i) => {
      const len = colLen[i];
      grid[colIdx] = str.slice(pos, pos + len).split("");
      pos += len;
    });
    let out = "";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[c][r] !== undefined) out += grid[c][r];
      }
    }
    return out;
  }

  // ----- XOR (repeating key) -----
  function xorHexOut(str, key) {
    const data = utf8Bytes(str), k = utf8Bytes(key || "");
    if (!k.length) throw new Error("XOR needs a key.");
    const out = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) out[i] = data[i] ^ k[i % k.length];
    return bytesToHex(out, false);
  }
  function xorFromHex(str, key) {
    const data = hexToBytes(str), k = utf8Bytes(key || "");
    if (!k.length) throw new Error("XOR needs a key.");
    const out = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) out[i] = data[i] ^ k[i % k.length];
    return bytesToText(out);
  }

  // ----- Decimal / Octal / Unicode escapes -----
  function decimalEncode(str) { return Array.from(str).map((c) => c.codePointAt(0)).join(" "); }
  function decimalDecode(str) { return str.trim().split(/\s+/).filter(Boolean).map((n) => String.fromCodePoint(parseInt(n, 10))).join(""); }
  function octalEncode(str) { return Array.from(str).map((c) => c.codePointAt(0).toString(8)).join(" "); }
  function octalDecode(str) { return str.trim().split(/\s+/).filter(Boolean).map((n) => String.fromCodePoint(parseInt(n, 8))).join(""); }
  function unicodeEscape(str) { let o = ""; for (let i = 0; i < str.length; i++) o += "\\u" + str.charCodeAt(i).toString(16).padStart(4, "0"); return o; }
  function unicodeUnescape(str) { return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))); }

  // ----- NATO phonetic (encode) -----
  const NATO = {
    A: "Alpha", B: "Bravo", C: "Charlie", D: "Delta", E: "Echo", F: "Foxtrot", G: "Golf",
    H: "Hotel", I: "India", J: "Juliett", K: "Kilo", L: "Lima", M: "Mike", N: "November",
    O: "Oscar", P: "Papa", Q: "Quebec", R: "Romeo", S: "Sierra", T: "Tango", U: "Uniform",
    V: "Victor", W: "Whiskey", X: "Xray", Y: "Yankee", Z: "Zulu", 0: "Zero", 1: "One",
    2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six", 7: "Seven", 8: "Eight", 9: "Nine"
  };
  function natoEncode(str) {
    return str.toUpperCase().split("").map((c) => (NATO[c] || (c === " " ? "" : c))).filter(Boolean).join(" ");
  }

  // ----- CRC32 -----
  const CRC_TABLE = (function () {
    const t = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(bytes) {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff];
    return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, "0");
  }
  function adler32(bytes) {
    let a = 1, b = 0;
    const MOD = 65521;
    for (let i = 0; i < bytes.length; i++) { a = (a + bytes[i]) % MOD; b = (b + a) % MOD; }
    return (((b << 16) | a) >>> 0).toString(16).padStart(8, "0");
  }
  // CRC-16/ARC (poly 0xA001 reflected, init 0x0000, no output xor) - a common, simple
  // CRC-16 variant, used e.g. inside Modbus and ZIP-family formats.
  function crc16(bytes) {
    let crc = 0x0000;
    for (let i = 0; i < bytes.length; i++) {
      crc ^= bytes[i];
      for (let b = 0; b < 8; b++) crc = (crc & 1) ? (crc >>> 1) ^ 0xa001 : crc >>> 1;
    }
    return (crc & 0xffff).toString(16).padStart(4, "0");
  }
  // Computes the Luhn check digit for a digit string, returning the full valid number.
  function luhnAppend(str) {
    const digits = str.replace(/\D/g, "");
    if (!digits.length) throw new Error("Enter a string of digits.");
    const nums = digits.split("").map(Number);
    let sum = 0;
    for (let i = 0; i < nums.length; i++) {
      let d = nums[nums.length - 1 - i];
      if (i % 2 === 0) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
    }
    const check = (10 - (sum % 10)) % 10;
    return digits + check;
  }
  // CRC-8/SMBUS: polynomial 0x07, init 0x00, not reflected, no final XOR.
  function crc8(bytes) {
    let crc = 0x00;
    for (const byte of bytes) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) crc = (crc & 0x80) ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
    }
    return crc.toString(16).padStart(2, "0");
  }
  function fletcher16(bytes) {
    let sum1 = 0, sum2 = 0;
    for (const b of bytes) { sum1 = (sum1 + b) % 255; sum2 = (sum2 + sum1) % 255; }
    return (((sum2 << 8) | sum1) >>> 0).toString(16).padStart(4, "0");
  }
  function fletcher32(bytes) {
    const padded = bytes.length % 2 ? Array.from(bytes).concat([0]) : Array.from(bytes);
    let sum1 = 0, sum2 = 0;
    for (let i = 0; i < padded.length; i += 2) {
      const word = (padded[i] << 8) | padded[i + 1];
      sum1 = (sum1 + word) % 65535; sum2 = (sum2 + sum1) % 65535;
    }
    return (((sum2 << 16) | sum1) >>> 0).toString(16).padStart(8, "0");
  }
  function fnv1a32(bytes) {
    let hash = 0x811c9dc5;
    for (const b of bytes) { hash ^= b; hash = Math.imul(hash, 0x01000193) >>> 0; }
    return hash.toString(16).padStart(8, "0");
  }
  function fnv1a64(bytes) {
    let hash = 0xcbf29ce484222325n;
    const prime = 0x100000001b3n, mask = (1n << 64n) - 1n;
    for (const b of bytes) { hash ^= BigInt(b); hash = (hash * prime) & mask; }
    return hash.toString(16).padStart(16, "0");
  }
  function djb2(bytes) {
    let hash = 5381;
    for (const b of bytes) hash = (Math.imul(hash, 33) + b) >>> 0;
    return hash.toString(16).padStart(8, "0");
  }
  function sdbm(bytes) {
    let hash = 0;
    for (const b of bytes) hash = (b + (hash << 6) + (hash << 16) - hash) >>> 0;
    return hash.toString(16).padStart(8, "0");
  }
  function checksum8(bytes) {
    let sum = 0;
    for (const b of bytes) sum = (sum + b) & 0xff;
    return sum.toString(16).padStart(2, "0");
  }
  // Generic HMAC construction (RFC 2104) over any synchronous (bytes -> hex) hash function,
  // used here to give MD5 an HMAC variant since Web Crypto's SubtleCrypto only signs with
  // the SHA family, not MD5.
  function hmacGeneric(hashHexFn, blockSize, keyBytes, msgBytes) {
    let key = keyBytes;
    if (key.length > blockSize) key = hexToBytes(hashHexFn(key));
    if (key.length < blockSize) { const padded = new Uint8Array(blockSize); padded.set(key); key = padded; }
    const oKeyPad = new Uint8Array(blockSize), iKeyPad = new Uint8Array(blockSize);
    for (let i = 0; i < blockSize; i++) { oKeyPad[i] = key[i] ^ 0x5c; iKeyPad[i] = key[i] ^ 0x36; }
    const inner = hexToBytes(hashHexFn(new Uint8Array([...iKeyPad, ...msgBytes])));
    return hashHexFn(new Uint8Array([...oKeyPad, ...inner]));
  }
  function hmacMd5Hex(keyStr, msgStr) { return hmacGeneric(md5, 64, utf8Bytes(keyStr), utf8Bytes(msgStr)); }
  // RFC 1071 Internet Checksum: one's-complement sum of 16-bit words with end-around
  // carry, then complemented - the checksum inside every IPv4, TCP and UDP header.
  function internetChecksum(bytes) {
    let sum = 0;
    for (let i = 0; i < bytes.length; i += 2) {
      const word = (bytes[i] << 8) | (bytes[i + 1] || 0);
      sum += word;
      while (sum > 0xffff) sum = (sum & 0xffff) + (sum >>> 16);
    }
    return ((~sum) & 0xffff).toString(16).padStart(4, "0");
  }
  function xor8Checksum(bytes) {
    let x = 0;
    for (const b of bytes) x ^= b;
    return x.toString(16).padStart(2, "0");
  }

  // ----- HMAC via Web Crypto -----
  async function hmacHex(algo, keyStr, msgStr) {
    if (!(window.crypto && window.crypto.subtle)) throw new Error("HMAC needs a secure context (http://localhost).");
    const key = await window.crypto.subtle.importKey("raw", utf8Bytes(keyStr), { name: "HMAC", hash: algo }, false, ["sign"]);
    const sig = await window.crypto.subtle.sign("HMAC", key, utf8Bytes(msgStr));
    return bytesToHex(new Uint8Array(sig), false);
  }

  // ----- Text utilities -----
  var COMBINING = new RegExp("[\\u0300-\\u036f]", "g");
  function stripAccents(str) { return str.normalize("NFD").replace(COMBINING, ""); }
  function jsonEscape(str) { const s = JSON.stringify(str); return s.slice(1, -1); }
  function jsonUnescape(str) { try { return JSON.parse('"' + str + '"'); } catch (e) { throw new Error("Invalid JSON string escapes."); } }
  function changeCase(str, mode) {
    const words = str.match(/[A-Za-z0-9]+/g) || [];
    switch (mode) {
      case "upper": return str.toUpperCase();
      case "lower": return str.toLowerCase();
      case "title": return str.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
      case "camel": return words.map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join("");
      case "snake": return words.map((w) => w.toLowerCase()).join("_");
      case "kebab": return words.map((w) => w.toLowerCase()).join("-");
      default: return str;
    }
  }
  const EXTRACT_PATTERNS = {
    emails: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
    urls: /https?:\/\/[^\s"'<>]+/g,
    ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    numbers: /-?\d+(?:\.\d+)?/g
  };
  function extract(str, mode) { const re = EXTRACT_PATTERNS[mode]; if (!re) return ""; const m = str.match(re); return m ? m.join("\n") : ""; }

  // ----- Levenshtein edit distance -----
  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  }

  // ----- URL breakdown, via the browser's own tested parser -----
  function parseUrl(str) {
    const u = new URL(str.trim());
    const params = Array.from(u.searchParams.entries()).map(([k, v]) => `    ${k} = ${v}`).join("\n");
    return `Protocol:   ${u.protocol}\nHost:       ${u.hostname}${u.port ? "\nPort:       " + u.port : ""}\nPath:       ${u.pathname || "/"}${u.search ? "\nQuery:      " + u.search : ""}${params ? "\n" + params : ""}${u.hash ? "\nFragment:   " + u.hash : ""}`;
  }

  // ----- More text utilities -----
  function convertLineEndings(str, to) { const unix = str.replace(/\r\n/g, "\n").replace(/\r/g, "\n"); return to === "crlf" ? unix.replace(/\n/g, "\r\n") : unix; }
  function stripHtmlTags(str) { return str.replace(/<[^>]*>/g, ""); }
  function wordWrap(str, width) {
    const w = Math.max(10, width | 0);
    return str.split("\n").map(function (line) {
      if (line.length <= w) return line;
      const words = line.split(" "); const out = []; let cur = "";
      words.forEach(function (word) {
        if ((cur + " " + word).trim().length > w && cur) { out.push(cur); cur = word; }
        else cur = (cur ? cur + " " : "") + word;
      });
      if (cur) out.push(cur);
      return out.join("\n");
    }).join("\n");
  }
  function removeLineNumbers(str) {
    return str.split(/\r\n|\r|\n/).map((l) => l.replace(/^\s*\d+\s*[:.)\-]?\s{0,2}/, "")).join("\n");
  }
  function tabsToSpaces(str, width) { const w = parseInt(width, 10) || 4; return str.replace(/\t/g, " ".repeat(w)); }
  function spacesToTabs(str, width) { const w = parseInt(width, 10) || 4; return str.replace(new RegExp(" ".repeat(w), "g"), "\t"); }
  // Deduplicates words case-insensitively while keeping original spacing between the
  // words that remain (unlike the line-level "Unique lines" operation).
  function removeDuplicateWords(str) {
    const seen = new Set();
    return str.split(/(\s+)/).filter((tok) => {
      if (/^\s+$/.test(tok)) return true;
      const key = tok.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).join("").replace(/ {2,}/g, " ").trim();
  }
  function pigLatinEncode(str) {
    return str.replace(/[A-Za-z]+/g, (word) => {
      if (/^[aeiouAEIOU]/.test(word)) return word + "way";
      const lead = (word.match(/^[^aeiouAEIOU]+/) || [""])[0];
      return word.slice(lead.length) + lead + "ay";
    });
  }
  const LEET_MAP = { a: "4", e: "3", i: "1", o: "0", s: "5", t: "7", l: "1", g: "9", b: "8" };
  const LEET_UNMAP = { 4: "a", 3: "e", 1: "i", 0: "o", 5: "s", 7: "t", 9: "g", 8: "b" };
  function leetEncode(str) { return str.replace(/[a-zA-Z]/g, (c) => LEET_MAP[c.toLowerCase()] || c); }
  // Best-effort only: digits map back to one letter each, but leet substitution isn't
  // one-to-one (both 1 and l become "1"), so this can't perfectly undo every encoding.
  function leetDecode(str) { return str.replace(/[0-9]/g, (c) => LEET_UNMAP[c] || c); }
  function padLeft(str, width, ch) {
    const w = parseInt(width, 10) || 0, c = (ch && ch[0]) || " ";
    return str.length >= w ? str : c.repeat(w - str.length) + str;
  }
  function padRight(str, width, ch) {
    const w = parseInt(width, 10) || 0, c = (ch && ch[0]) || " ";
    return str.length >= w ? str : str + c.repeat(w - str.length);
  }
  function centerText(str, width, ch) {
    const w = parseInt(width, 10) || 0, c = (ch && ch[0]) || " ";
    if (str.length >= w) return str;
    const total = w - str.length, left = Math.floor(total / 2);
    return c.repeat(left) + str + c.repeat(total - left);
  }
  function repeatText(str, times) { return str.repeat(Math.max(0, parseInt(times, 10) || 0)); }
  function truncateText(str, length) {
    const n = parseInt(length, 10) || 0;
    if (str.length <= n) return str;
    return str.slice(0, Math.max(0, n - 3)) + "...";
  }
  function wrapInQuotes(str, quote) { const q = quote || "\""; return q + str + q; }
  function stripSurroundingQuotes(str) {
    const s = str.trim();
    if (s.length >= 2 && s[0] === s[s.length - 1] && /['"`]/.test(s[0])) return s.slice(1, -1);
    return s;
  }
  function alternatingCase(str) {
    let upper = false;
    return str.replace(/[a-zA-Z]/g, (c) => { const out = upper ? c.toUpperCase() : c.toLowerCase(); upper = !upper; return out; });
  }
  function removeNumbers(str) { return str.replace(/[0-9]/g, ""); }
  function removePunctuation(str) { return str.replace(/[!-/:-@[-`{-~]/g, ""); }
  function insertAtPosition(str, position, text) {
    const pos = Math.max(0, Math.min(str.length, parseInt(position, 10) || 0));
    return str.slice(0, pos) + (text || "") + str.slice(pos);
  }

  // ----- Unix time -----
  function dateToUnix(str) { const t = Date.parse(str.trim()); if (isNaN(t)) throw new Error("Unrecognised date. Try e.g. 2024-01-31 or an ISO date."); return String(Math.floor(t / 1000)); }
  function unixToDate(str) { const n = parseInt(str.trim(), 10); if (isNaN(n)) throw new Error("Enter a whole number of seconds."); return new Date(n * 1000).toISOString(); }

  // ----- IPv4 <-> 32-bit integer -----
  function ipToInt(str) {
    const parts = str.trim().split(".");
    if (parts.length !== 4) throw new Error("Not a valid IPv4 address — expected 4 dot-separated numbers.");
    let n = 0;
    for (const p of parts) {
      if (!/^\d+$/.test(p)) throw new Error("Invalid IPv4 octet: " + p);
      const v = parseInt(p, 10);
      if (v < 0 || v > 255) throw new Error("IPv4 octets must be 0-255, got: " + v);
      n = n * 256 + v;
    }
    return String(n >>> 0);
  }
  function intToIp(str) {
    const n = Number(str.trim());
    if (!Number.isInteger(n) || n < 0 || n > 4294967295) throw new Error("Enter a whole number from 0 to 4294967295.");
    const v = n >>> 0;
    return [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255].join(".");
  }
  // Computes network/broadcast/usable-range for a CIDR block, e.g. "192.168.1.10/24".
  function subnetInfo(str) {
    const parts = str.trim().split("/");
    if (parts.length !== 2) throw new Error("Enter an address in CIDR form, e.g. 192.168.1.10/24.");
    const prefix = parseInt(parts[1], 10);
    if (!/^\d+$/.test(parts[1]) || prefix < 0 || prefix > 32) throw new Error("Prefix must be a whole number from 0 to 32.");
    const ip = parseInt(ipToInt(parts[0]), 10);
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    const network = (ip & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const totalHosts = Math.pow(2, 32 - prefix);
    const usable = prefix >= 31 ? 0 : totalHosts - 2;
    const firstHost = usable > 0 ? intToIp(String(network + 1)) : intToIp(String(network));
    const lastHost = usable > 0 ? intToIp(String(broadcast - 1)) : intToIp(String(broadcast));
    return `Network:    ${intToIp(String(network))}/${prefix}\nMask:       ${intToIp(String(mask))}\nBroadcast:  ${intToIp(String(broadcast))}\nUsable:     ${usable} host(s)\nRange:      ${firstHost} - ${lastHost}`;
  }

  // ----- Color format conversion (hex / rgb() / hsl()) -----
  function parseColor(str) {
    const s = str.trim();
    let m;
    if ((m = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i))) {
      let h = m[1];
      if (h.length === 3) h = h.split("").map((c) => c + c).join("");
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    if ((m = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,[^)]+)?\)$/i))) {
      return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
    }
    if ((m = s.match(/^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,[^)]+)?\)$/i))) {
      return hslToRgbColor([parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)]);
    }
    throw new Error("Unrecognised color format. Try #rrggbb, rgb(r,g,b) or hsl(h,s%,l%).");
  }
  function rgbToHexColor([r, g, b]) { return "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join(""); }
  function rgbToHslColor([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }
  function hslToRgbColor([h, s, l]) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
  function convertColor(str, to) {
    const rgb = parseColor(str);
    if (to === "hex") return rgbToHexColor(rgb);
    if (to === "hsl") { const [h, s, l] = rgbToHslColor(rgb); return `hsl(${h}, ${s}%, ${l}%)`; }
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  }

  // ----- IPv6 expand/compress -----
  function expandIpv6(str) {
    const s = str.trim();
    if (!/^[0-9a-fA-F:]+$/.test(s)) throw new Error("Not a valid IPv6 address.");
    let parts;
    if (s.includes("::")) {
      const [left, right] = s.split("::");
      const leftParts = left ? left.split(":") : [];
      const rightParts = right ? right.split(":") : [];
      const missing = 8 - leftParts.length - rightParts.length;
      if (missing < 0) throw new Error("Too many groups for a valid IPv6 address.");
      parts = [...leftParts, ...Array(missing).fill("0"), ...rightParts];
    } else {
      parts = s.split(":");
    }
    if (parts.length !== 8) throw new Error("IPv6 address must have 8 groups (or use :: once).");
    return parts.map((p) => p.padStart(4, "0")).join(":");
  }
  function compressIpv6(str) {
    const full = expandIpv6(str).split(":");
    const trimmed = full.map((p) => p.replace(/^0+(?=.)/, ""));
    let bestStart = -1, bestLen = 0, curStart = -1, curLen = 0;
    for (let i = 0; i < 8; i++) {
      if (trimmed[i] === "0") {
        if (curStart === -1) curStart = i;
        curLen++;
        if (curLen > bestLen) { bestLen = curLen; bestStart = curStart; }
      } else { curStart = -1; curLen = 0; }
    }
    if (bestLen < 2) return trimmed.join(":");
    const before = trimmed.slice(0, bestStart).join(":");
    const after = trimmed.slice(bestStart + bestLen).join(":");
    return before + "::" + after;
  }
  // ----- MAC address formatter -----
  function formatMac(str, style) {
    const hex = str.replace(/[^0-9a-fA-F]/g, "").toLowerCase();
    if (hex.length !== 12) throw new Error("A MAC address needs 12 hex digits.");
    const pairs = hex.match(/.{2}/g);
    if (style === "dash") return pairs.join("-");
    if (style === "dot") return [pairs.slice(0, 2).join(""), pairs.slice(2, 4).join(""), pairs.slice(4, 6).join("")].join(".");
    if (style === "plain") return hex;
    return pairs.join(":");
  }
  // ----- More text-mining extractors, alongside the extract() operation -----
  function extractHexColors(str) { return (str.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) || []).join("\n"); }
  function extractHashtags(str) { return (str.match(/#[A-Za-z0-9_]+/g) || []).join("\n"); }
  function extractMacAddresses(str) { return (str.match(/\b[0-9a-fA-F]{2}([:-][0-9a-fA-F]{2}){5}\b/g) || []).join("\n"); }
  function extractDomain(str) {
    const m = str.match(/https?:\/\/([^/\s:]+)/);
    if (m) return m[1];
    const m2 = str.match(/\b([a-z0-9-]+\.[a-z0-9-]+(?:\.[a-z]{2,})+)\b/i);
    if (m2) return m2[1];
    throw new Error("No domain found.");
  }
  function maskEmail(str) {
    return str.replace(/([a-zA-Z0-9._%+-])[a-zA-Z0-9._%+-]*(@[a-zA-Z0-9.-]+)/g, (m, first, domain) => first + "***" + domain);
  }
  function extractHashes(str) {
    return (str.match(/\b[0-9a-fA-F]{32}\b|\b[0-9a-fA-F]{40}\b|\b[0-9a-fA-F]{64}\b/g) || []).join("\n");
  }
  // IPv6 addresses are notoriously hard to match with a single regex correctly, so this
  // grabs plausible hex:colon tokens first, then keeps only the ones the expandIpv6()
  // validator above actually accepts - reusing real parsing logic instead of trying to
  // encode IPv6's grammar a second time as a regex.
  function extractIpv6(str) {
    const candidates = str.match(/\b[0-9a-fA-F:]*::?[0-9a-fA-F:]*\b/g) || [];
    const valid = candidates.filter((c) => { if (!c.includes(":")) return false; try { expandIpv6(c); return true; } catch (e) { return false; } });
    return [...new Set(valid)].join("\n");
  }
  function extractBase64Blobs(str) { return (str.match(/[A-Za-z0-9+/]{16,}={0,2}/g) || []).join("\n"); }
  // ----- CSV <-> JSON -----
  function parseCsvLine(line) {
    const out = [];
    let cur = "", inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQuotes) {
        if (c === "\"" && line[i + 1] === "\"") { cur += "\""; i++; }
        else if (c === "\"") inQuotes = false;
        else cur += c;
      } else if (c === "\"") inQuotes = true;
      else if (c === ",") { out.push(cur); cur = ""; }
      else cur += c;
    }
    out.push(cur);
    return out;
  }
  function csvToJson(str) {
    const lines = str.split(/\r\n|\r|\n/).filter((l) => l.length);
    if (lines.length < 1) throw new Error("Empty CSV.");
    const headers = parseCsvLine(lines[0]);
    const rows = lines.slice(1).map((line) => {
      const vals = parseCsvLine(line);
      const obj = {};
      headers.forEach((h, i) => { obj[h] = vals[i] !== undefined ? vals[i] : ""; });
      return obj;
    });
    return JSON.stringify(rows, null, 2);
  }
  function csvField(v) {
    const s = String(v);
    return /[",\n]/.test(s) ? "\"" + s.replace(/"/g, "\"\"") + "\"" : s;
  }
  function jsonToCsv(str) {
    const data = JSON.parse(str);
    if (!Array.isArray(data) || !data.length) throw new Error("Expected a non-empty JSON array of objects.");
    const headers = Object.keys(data[0]);
    const lines = [headers.join(",")];
    data.forEach((row) => lines.push(headers.map((h) => csvField(row[h])).join(",")));
    return lines.join("\n");
  }
  // ----- Query string builder (complements parseUrl's query-string reading) -----
  function buildQueryString(str) {
    const parts = str.split(/\r\n|\r|\n/).filter((l) => l.trim().length).map((line) => {
      const idx = line.indexOf("=");
      const k = idx === -1 ? line.trim() : line.slice(0, idx).trim();
      const v = idx === -1 ? "" : line.slice(idx + 1).trim();
      return encodeURIComponent(k) + "=" + encodeURIComponent(v);
    });
    return "?" + parts.join("&");
  }
  // ----- Unix time: seconds <-> milliseconds -----
  function unixSecToMs(str) {
    const n = parseInt(str.trim(), 10);
    if (!Number.isInteger(n)) throw new Error("Enter a Unix timestamp in seconds.");
    return String(n * 1000);
  }
  function unixMsToSec(str) {
    const n = parseInt(str.trim(), 10);
    if (!Number.isInteger(n)) throw new Error("Enter a Unix timestamp in milliseconds.");
    return String(Math.floor(n / 1000));
  }
  // ----- Date difference, in whole days -----
  function dateDifference(str, str2) {
    const a = new Date(str.trim() + "T00:00:00Z"), b = new Date((str2 || "").trim() + "T00:00:00Z");
    if (isNaN(a) || isNaN(b)) throw new Error("Enter two dates as YYYY-MM-DD.");
    const days = Math.round((b - a) / 86400000);
    return String(days) + " day" + (Math.abs(days) === 1 ? "" : "s");
  }
  // ----- Word frequency table (word-level, unlike the character-level letterFrequency) -----
  function wordFrequency(str) {
    const words = str.toLowerCase().match(/[a-z0-9']+/g) || [];
    const counts = {};
    words.forEach((w) => { counts[w] = (counts[w] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([w, c]) => `${w}: ${c}`).join("\n");
  }

  // ----- Base58 -----
  const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  function base58Encode(bytes) {
    let zeros = 0; while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
    const digits = [0];
    for (let i = zeros; i < bytes.length; i++) {
      let carry = bytes[i];
      for (let j = 0; j < digits.length; j++) { carry += digits[j] << 8; digits[j] = carry % 58; carry = (carry / 58) | 0; }
      while (carry > 0) { digits.push(carry % 58); carry = (carry / 58) | 0; }
    }
    let out = ""; for (let i = 0; i < zeros; i++) out += "1";
    for (let i = digits.length - 1; i >= 0; i--) out += B58[digits[i]];
    return out;
  }
  function base58Decode(str) {
    const s = str.trim(); let zeros = 0; while (zeros < s.length && s[zeros] === "1") zeros++;
    const bytes = [0];
    for (let i = zeros; i < s.length; i++) {
      const val = B58.indexOf(s[i]); if (val < 0) throw new Error("Invalid Base58 character: " + s[i]);
      let carry = val;
      for (let j = 0; j < bytes.length; j++) { carry += bytes[j] * 58; bytes[j] = carry & 0xff; carry >>= 8; }
      while (carry > 0) { bytes.push(carry & 0xff); carry >>= 8; }
    }
    const out = []; for (let i = 0; i < zeros; i++) out.push(0);
    for (let i = bytes.length - 1; i >= 0; i--) out.push(bytes[i]);
    return new Uint8Array(out);
  }

  // ----- Generic base-N byte-string codec (same big-integer approach as Base58 above) -----
  function makeBaseNEncode(alphabet) {
    const base = alphabet.length;
    return function (bytes) {
      let zeros = 0; while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
      const digits = [0];
      for (let i = zeros; i < bytes.length; i++) {
        let carry = bytes[i];
        for (let j = 0; j < digits.length; j++) { carry += digits[j] << 8; digits[j] = carry % base; carry = (carry / base) | 0; }
        while (carry > 0) { digits.push(carry % base); carry = (carry / base) | 0; }
      }
      let out = ""; for (let i = 0; i < zeros; i++) out += alphabet[0];
      for (let i = digits.length - 1; i >= 0; i--) out += alphabet[digits[i]];
      return out;
    };
  }
  function makeBaseNDecode(alphabet) {
    const base = alphabet.length;
    return function (str) {
      const s = str.trim(); let zeros = 0; while (zeros < s.length && s[zeros] === alphabet[0]) zeros++;
      const bytes = [0];
      for (let i = zeros; i < s.length; i++) {
        const val = alphabet.indexOf(s[i]); if (val < 0) throw new Error("Invalid character: " + s[i]);
        let carry = val;
        for (let j = 0; j < bytes.length; j++) { carry += bytes[j] * base; bytes[j] = carry & 0xff; carry >>= 8; }
        while (carry > 0) { bytes.push(carry & 0xff); carry >>= 8; }
      }
      const out = []; for (let i = 0; i < zeros; i++) out.push(0);
      for (let i = bytes.length - 1; i >= 0; i--) out.push(bytes[i]);
      return new Uint8Array(out);
    };
  }
  const B36_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
  const B62_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const base36Encode = makeBaseNEncode(B36_ALPHABET), base36Decode = makeBaseNDecode(B36_ALPHABET);
  const base62Encode = makeBaseNEncode(B62_ALPHABET), base62Decode = makeBaseNDecode(B62_ALPHABET);
  // Crockford's Base32: digits + letters, with I/L/O/U dropped (too easy to confuse with 1/1/0/V).
  const CROCKFORD32_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const crockford32Encode = makeBaseNEncode(CROCKFORD32_ALPHABET), crockford32Decode = makeBaseNDecode(CROCKFORD32_ALPHABET);
  // Z85 (ZeroMQ RFC 32/Z85): same big-integer per-4-byte-chunk approach as Base85 above,
  // just a different 85-character alphabet and no all-zero "z" shortcut.
  const Z85_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#";
  function z85Encode(bytes) {
    let out = "";
    for (let i = 0; i < bytes.length; i += 4) {
      const chunk = bytes.subarray(i, i + 4);
      const padLen = 4 - chunk.length;
      const padded = new Uint8Array(4);
      padded.set(chunk);
      let n = ((padded[0] << 24) | (padded[1] << 16) | (padded[2] << 8) | padded[3]) >>> 0;
      const digits = [0, 0, 0, 0, 0];
      for (let d = 4; d >= 0; d--) { digits[d] = n % 85; n = Math.floor(n / 85); }
      let group = digits.map((d) => Z85_ALPHABET[d]).join("");
      if (padLen > 0) group = group.slice(0, 5 - padLen);
      out += group;
    }
    return out;
  }
  function z85Decode(str) {
    const clean = str.replace(/\s/g, "");
    const bytesOut = [];
    let i = 0;
    while (i < clean.length) {
      let group = clean.slice(i, i + 5);
      const padLen = 5 - group.length;
      if (padLen > 0) group = group.padEnd(5, Z85_ALPHABET[84]);
      let n = 0;
      for (let k = 0; k < 5; k++) {
        const code = Z85_ALPHABET.indexOf(group[k]);
        if (code < 0) throw new Error("Invalid Z85 character: " + group[k]);
        n = n * 85 + code;
      }
      n = n >>> 0;
      const b = [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
      for (let k = 0; k < 4 - padLen; k++) bytesOut.push(b[k]);
      i += 5 - padLen;
    }
    return new Uint8Array(bytesOut);
  }
  // ----- BCD (Binary-Coded Decimal): each decimal digit as its own 4-bit nibble -----
  function bcdEncode(str) {
    const digits = str.replace(/\D/g, "");
    if (!digits.length) throw new Error("Enter a string of digits.");
    const padded = digits.length % 2 ? digits + "0" : digits;
    let out = "";
    for (let i = 0; i < padded.length; i += 2) out += parseInt(padded[i], 10).toString(16) + parseInt(padded[i + 1], 10).toString(16);
    return out;
  }
  function bcdDecode(hex) {
    const clean = hex.replace(/[^0-9a-fA-F]/g, "");
    let out = "";
    for (const c of clean) {
      const v = parseInt(c, 16);
      if (v > 9) throw new Error("BCD nibbles must be 0-9 (found " + c + ").");
      out += v;
    }
    return out;
  }
  // ----- MIME encoded-word (RFC 2047, "B" = Base64 encoding) -----
  function mimeWordEncode(str) { return "=?UTF-8?B?" + bytesToBase64(utf8Bytes(str)) + "?="; }
  function mimeWordDecode(str) {
    const m = str.trim().match(/^=\?([^?]+)\?B\?([^?]*)\?=$/i);
    if (!m) throw new Error("Not a valid MIME encoded-word (expected =?charset?B?...?=).");
    return bytesToText(base64ToBytes(m[2]));
  }
  // ----- UTF-7 (RFC 2152): safe ASCII passes through, '+' escapes as '+-', everything
  // else is shifted into Base64-encoded UTF-16BE runs wrapped in '+...-'. -----
  const UTF7_DIRECT = /[A-Za-z0-9'(),\-./:? \t\r\n]/;
  function utf7Encode(str) {
    let out = "";
    let i = 0;
    while (i < str.length) {
      const c = str[i];
      if (c === "+") { out += "+-"; i++; continue; }
      if (UTF7_DIRECT.test(c)) { out += c; i++; continue; }
      let j = i;
      const units = [];
      while (j < str.length && !UTF7_DIRECT.test(str[j]) && str[j] !== "+") { units.push(str.charCodeAt(j)); j++; }
      const bytes = new Uint8Array(units.length * 2);
      units.forEach((u, k) => { bytes[k * 2] = (u >> 8) & 0xff; bytes[k * 2 + 1] = u & 0xff; });
      const b64 = bytesToBase64(bytes).replace(/=+$/, "");
      out += "+" + b64 + "-";
      i = j;
    }
    return out;
  }
  function utf7Decode(str) {
    let out = "";
    let i = 0;
    while (i < str.length) {
      if (str[i] === "+") {
        if (str[i + 1] === "-") { out += "+"; i += 2; continue; }
        let j = i + 1;
        while (j < str.length && str[j] !== "-") j++;
        const b64 = str.slice(i + 1, j);
        const bytes = base64ToBytes(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
        for (let k = 0; k + 1 < bytes.length; k += 2) out += String.fromCharCode((bytes[k] << 8) | bytes[k + 1]);
        i = j + 1;
        continue;
      }
      out += str[i]; i++;
    }
    return out;
  }
  // ----- Bijective base-26 (spreadsheet-style column letters: A,B,...Z,AA,AB,...) -----
  function toBijective26(str) {
    let n = parseInt(str.trim(), 10);
    if (!Number.isInteger(n) || n < 1) throw new Error("Enter a whole number of 1 or more.");
    let s = "";
    while (n > 0) { n--; s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26); }
    return s;
  }
  function fromBijective26(str) {
    const s = str.trim().toUpperCase();
    if (!/^[A-Z]+$/.test(s)) throw new Error("Enter letters A-Z only.");
    let n = 0;
    for (const c of s) n = n * 26 + (c.charCodeAt(0) - 64);
    return String(n);
  }
  // ----- Unary: n as n repeated '1' characters. Capped to keep the output sane. -----
  function unaryEncode(str) {
    const n = parseInt(str.trim(), 10);
    if (!Number.isInteger(n) || n < 0) throw new Error("Enter a non-negative whole number.");
    if (n > 1000) throw new Error("Keep it under 1000 for unary - it gets long fast.");
    return "1".repeat(n);
  }
  function unaryDecode(str) { return String((str.match(/1/g) || []).length); }

  // ----- Roman numerals (standard subtractive notation, 1-3999) -----
  const ROMAN_TABLE = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
  function toRoman(str) {
    const n = parseInt(str.trim(), 10);
    if (!Number.isInteger(n) || n < 1 || n > 3999) throw new Error("Enter a whole number from 1 to 3999 (standard Roman numerals have no way to write 0 or larger numbers).");
    let out = "", x = n;
    for (const [v, sym] of ROMAN_TABLE) { while (x >= v) { out += sym; x -= v; } }
    return out;
  }
  function fromRoman(str) {
    const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    const s = str.trim().toUpperCase();
    if (!s.length || /[^IVXLCDM]/.test(s)) throw new Error("Only the letters I, V, X, L, C, D, M are valid Roman numerals.");
    let total = 0;
    for (let i = 0; i < s.length; i++) {
      const cur = map[s[i]], next = map[s[i + 1]];
      total += (next && cur < next) ? -cur : cur;
    }
    return String(total);
  }

  // ----- Base85 (Ascii85) -----
  function base85Encode(bytes) {
    let out = "";
    for (let i = 0; i < bytes.length; i += 4) {
      const chunk = bytes.subarray(i, i + 4);
      const padLen = 4 - chunk.length;
      const padded = new Uint8Array(4);
      padded.set(chunk);
      let n = ((padded[0] << 24) | (padded[1] << 16) | (padded[2] << 8) | padded[3]) >>> 0;
      if (n === 0 && padLen === 0) { out += "z"; continue; }
      const digits = [0, 0, 0, 0, 0];
      for (let d = 4; d >= 0; d--) { digits[d] = n % 85; n = Math.floor(n / 85); }
      let group = digits.map((d) => String.fromCharCode(d + 33)).join("");
      if (padLen > 0) group = group.slice(0, 5 - padLen);
      out += group;
    }
    return out;
  }
  function base85Decode(str) {
    const clean = str.replace(/<~|~>|\s/g, "");
    const bytesOut = [];
    let i = 0;
    while (i < clean.length) {
      if (clean[i] === "z") { bytesOut.push(0, 0, 0, 0); i++; continue; }
      let group = clean.slice(i, i + 5);
      const padLen = 5 - group.length;
      if (padLen > 0) group = group.padEnd(5, "u");
      let n = 0;
      for (let k = 0; k < 5; k++) {
        const code = group.charCodeAt(k) - 33;
        if (code < 0 || code > 84) throw new Error("Invalid Base85 character: " + group[k]);
        n = n * 85 + code;
      }
      n = n >>> 0;
      const b = [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
      for (let k = 0; k < 4 - padLen; k++) bytesOut.push(b[k]);
      i += 5 - padLen;
    }
    return new Uint8Array(bytesOut);
  }

  // ----- Base45 (RFC 9285) - the encoding behind EU COVID certificate QR codes -----
  const B45_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
  function base45Encode(bytes) {
    let out = "";
    for (let i = 0; i < bytes.length; i += 2) {
      if (i + 1 < bytes.length) {
        let n = bytes[i] * 256 + bytes[i + 1];
        const d0 = n % 45; n = Math.floor(n / 45);
        const d1 = n % 45; n = Math.floor(n / 45);
        out += B45_ALPHABET[d0] + B45_ALPHABET[d1] + B45_ALPHABET[n];
      } else {
        let n = bytes[i];
        const d0 = n % 45; n = Math.floor(n / 45);
        out += B45_ALPHABET[d0] + B45_ALPHABET[n];
      }
    }
    return out;
  }
  function base45Decode(str) {
    const clean = str.trim();
    const bytesOut = [];
    let i = 0;
    while (i < clean.length) {
      const remaining = clean.length - i;
      if (remaining >= 3) {
        const d0 = B45_ALPHABET.indexOf(clean[i]), d1 = B45_ALPHABET.indexOf(clean[i + 1]), d2 = B45_ALPHABET.indexOf(clean[i + 2]);
        if (d0 < 0 || d1 < 0 || d2 < 0) throw new Error("Invalid Base45 character.");
        const n = d0 + d1 * 45 + d2 * 45 * 45;
        if (n > 0xffff) throw new Error("Invalid Base45 triplet.");
        bytesOut.push((n >> 8) & 0xff, n & 0xff);
        i += 3;
      } else if (remaining === 2) {
        const d0 = B45_ALPHABET.indexOf(clean[i]), d1 = B45_ALPHABET.indexOf(clean[i + 1]);
        if (d0 < 0 || d1 < 0) throw new Error("Invalid Base45 character.");
        const n = d0 + d1 * 45;
        if (n > 0xff) throw new Error("Invalid Base45 pair.");
        bytesOut.push(n & 0xff);
        i += 2;
      } else {
        throw new Error("Base45 input has an invalid length.");
      }
    }
    return new Uint8Array(bytesOut);
  }

  // ----- Punycode (RFC 3492 bootstring, applied per dot-separated label like real IDNs) -----
  const PUNY_BASE = 36, PUNY_TMIN = 1, PUNY_TMAX = 26, PUNY_SKEW = 38, PUNY_DAMP = 700, PUNY_INITIAL_BIAS = 72, PUNY_INITIAL_N = 128;
  function punyAdapt(delta, numpoints, firsttime) {
    delta = firsttime ? Math.floor(delta / PUNY_DAMP) : Math.floor(delta / 2);
    delta += Math.floor(delta / numpoints);
    let k = 0;
    while (delta > Math.floor(((PUNY_BASE - PUNY_TMIN) * PUNY_TMAX) / 2)) {
      delta = Math.floor(delta / (PUNY_BASE - PUNY_TMIN));
      k += PUNY_BASE;
    }
    return k + Math.floor(((PUNY_BASE - PUNY_TMIN + 1) * delta) / (delta + PUNY_SKEW));
  }
  function punyDigitToBasic(d) { return d < 26 ? d + 97 : d - 26 + 48; }
  function punyBasicToDigit(cp) {
    if (cp >= 48 && cp <= 57) return cp - 48 + 26;
    if (cp >= 97 && cp <= 122) return cp - 97;
    if (cp >= 65 && cp <= 90) return cp - 65;
    return -1;
  }
  function bootstringEncode(input) {
    const codePoints = Array.from(input).map((c) => c.codePointAt(0));
    let n = PUNY_INITIAL_N, delta = 0, bias = PUNY_INITIAL_BIAS;
    const basic = codePoints.filter((c) => c < 0x80);
    let output = basic.map((c) => String.fromCodePoint(c)).join("");
    let h = basic.length;
    const b = basic.length;
    if (b > 0) output += "-";
    while (h < codePoints.length) {
      let m = Infinity;
      for (const c of codePoints) if (c >= n && c < m) m = c;
      delta += (m - n) * (h + 1);
      n = m;
      for (const c of codePoints) {
        if (c < n) delta++;
        if (c === n) {
          let q = delta;
          for (let k = PUNY_BASE; ; k += PUNY_BASE) {
            const t = k <= bias ? PUNY_TMIN : k >= bias + PUNY_TMAX ? PUNY_TMAX : k - bias;
            if (q < t) break;
            output += String.fromCharCode(punyDigitToBasic(t + ((q - t) % (PUNY_BASE - t))));
            q = Math.floor((q - t) / (PUNY_BASE - t));
          }
          output += String.fromCharCode(punyDigitToBasic(q));
          bias = punyAdapt(delta, h + 1, h === b);
          delta = 0;
          h++;
        }
      }
      delta++;
      n++;
    }
    return output;
  }
  function bootstringDecode(input) {
    let n = PUNY_INITIAL_N, i = 0, bias = PUNY_INITIAL_BIAS;
    const lastDelim = input.lastIndexOf("-");
    const output = [];
    let inputIdx = 0;
    if (lastDelim > 0) {
      for (let k = 0; k < lastDelim; k++) {
        const cp = input.charCodeAt(k);
        if (cp >= 0x80) throw new Error("Invalid Punycode: non-ASCII character before the last hyphen.");
        output.push(cp);
      }
      inputIdx = lastDelim + 1;
    }
    while (inputIdx < input.length) {
      const oldi = i;
      let w = 1;
      for (let k = PUNY_BASE; ; k += PUNY_BASE) {
        if (inputIdx >= input.length) throw new Error("Invalid Punycode: unexpected end of input.");
        const digit = punyBasicToDigit(input.charCodeAt(inputIdx++));
        if (digit === -1) throw new Error("Invalid Punycode: bad digit character.");
        i += digit * w;
        const t = k <= bias ? PUNY_TMIN : k >= bias + PUNY_TMAX ? PUNY_TMAX : k - bias;
        if (digit < t) break;
        w *= PUNY_BASE - t;
      }
      bias = punyAdapt(i - oldi, output.length + 1, oldi === 0);
      n += Math.floor(i / (output.length + 1));
      i %= output.length + 1;
      output.splice(i, 0, n);
      i++;
    }
    return output.map((cp) => String.fromCodePoint(cp)).join("");
  }
  function punycodeEncode(str) {
    return str.split(".").map(function (label) {
      if (/^[\x00-\x7f]*$/.test(label)) return label;
      return "xn--" + bootstringEncode(label);
    }).join(".");
  }
  function punycodeDecode(str) {
    return str.split(".").map(function (label) {
      if (!/^xn--/i.test(label)) return label;
      return bootstringDecode(label.slice(4));
    }).join(".");
  }

  // ----- Quoted-Printable (RFC 2045, simplified — no soft line-wrap on encode, but decode
  // handles "=\n"/"=\r\n" soft breaks so it round-trips real-world QP too) -----
  function qpEncode(str) {
    const bytes = utf8Bytes(str);
    let out = "";
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      if (b === 0x3d) out += "=3D";
      else if (b === 10) out += "\n";
      else if (b === 13) continue;
      else if ((b >= 33 && b <= 126) || b === 32 || b === 9) out += String.fromCharCode(b);
      else out += "=" + b.toString(16).toUpperCase().padStart(2, "0");
    }
    return out;
  }
  function qpDecode(str) {
    const clean = str.replace(/=\r?\n/g, "");
    const bytes = [];
    for (let i = 0; i < clean.length; i++) {
      if (clean[i] === "=" && i + 2 < clean.length && /^[0-9A-Fa-f]{2}$/.test(clean.slice(i + 1, i + 3))) {
        bytes.push(parseInt(clean.slice(i + 1, i + 3), 16));
        i += 2;
      } else {
        bytes.push(clean.charCodeAt(i));
      }
    }
    return bytesToText(new Uint8Array(bytes));
  }

  // ----- Hexdump (xxd style) -----
  function toHexdump(bytes) {
    let out = "";
    for (let i = 0; i < bytes.length; i += 16) {
      const slice = bytes.subarray(i, i + 16);
      const off = i.toString(16).padStart(8, "0");
      let hex = "";
      for (let j = 0; j < slice.length; j++) { hex += slice[j].toString(16).padStart(2, "0"); if (j % 2 === 1) hex += " "; }
      let ascii = ""; for (let j = 0; j < slice.length; j++) ascii += slice[j] >= 32 && slice[j] < 127 ? String.fromCharCode(slice[j]) : ".";
      out += off + ": " + hex.padEnd(40, " ") + " " + ascii + "\n";
    }
    return out;
  }
  function fromHexdump(str) {
    let hex = "";
    str.split(/\r?\n/).forEach(function (line) {
      if (!line.trim()) return;
      let rest = line;
      const colon = rest.indexOf(":");
      if (colon >= 0 && /^[0-9a-fA-F]+$/.test(rest.slice(0, colon).trim())) rest = rest.slice(colon + 1);
      const hexPart = rest.trim().split(/\s{2,}/)[0] || "";
      hex += hexPart.replace(/[^0-9a-fA-F]/g, "");
    });
    return hexToBytes(hex);
  }

  // ----- Number base conversion -----
  function changeBase(str, from, to) {
    const s = str.trim().toLowerCase().replace(/\s+/g, "");
    if (!s) return "";
    const digits = "0123456789abcdefghijklmnopqrstuvwxyz";
    let val = 0n; const f = BigInt(from);
    for (const ch of s) { const d = digits.indexOf(ch); if (d < 0 || d >= from) throw new Error("Digit '" + ch + "' is not valid in base " + from); val = val * f + BigInt(d); }
    if (val === 0n) return "0";
    let out = ""; const t = BigInt(to);
    while (val > 0n) { out = digits[Number(val % t)] + out; val = val / t; }
    return out;
  }

  // ----- Letter frequency (for cipher analysis) -----
  function letterFrequency(str) {
    const counts = {}; let total = 0;
    for (const ch of str.toUpperCase()) { if (ch >= "A" && ch <= "Z") { counts[ch] = (counts[ch] || 0) + 1; total++; } }
    if (!total) return "No A–Z letters found.";
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ": " + v + "  (" + (v / total * 100).toFixed(1) + "%)").join("\n");
  }

  // ----- Character inspector -----
  function inspectChars(str, limit) {
    const out = [];
    let i = 0;
    for (const ch of str) {
      if (out.length >= (limit || 200)) break;
      const cp = ch.codePointAt(0);
      const bytes = utf8Bytes(ch);
      out.push({
        index: i,
        char: ch,
        display: cp === 32 ? "␠" : cp === 9 ? "␉" : cp === 10 ? "␊" : cp === 13 ? "␍" : (cp < 32 ? "�" : ch),
        codePoint: "U+" + cp.toString(16).toUpperCase().padStart(4, "0"),
        decimal: cp,
        utf8Hex: bytesToHex(bytes, true),
        byteLen: bytes.length,
        html: cp > 126 || cp < 32 ? "&#" + cp + ";" : ch
      });
      i++;
    }
    return { chars: out, truncated: Array.from(str).length > out.length };
  }

  // ----- Byte histogram (256 buckets, one per byte value) -----
  function byteHistogram(bytes) {
    const counts = new Array(256).fill(0);
    for (let i = 0; i < bytes.length; i++) counts[bytes[i]]++;
    return counts;
  }

  // ----- Bitwise operations with a repeating key -----
  function bitwiseWithKey(bytes, keyBytes, fn) {
    if (!keyBytes.length) throw new Error("This operation needs a key.");
    const out = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) out[i] = fn(bytes[i], keyBytes[i % keyBytes.length]);
    return out;
  }
  function bitAndHex(str, key) { return bytesToHex(bitwiseWithKey(utf8Bytes(str), utf8Bytes(key), (a, b) => a & b), false); }
  function bitOrHex(str, key) { return bytesToHex(bitwiseWithKey(utf8Bytes(str), utf8Bytes(key), (a, b) => a | b), false); }
  function bitXorHex(str, key) { return bytesToHex(bitwiseWithKey(utf8Bytes(str), utf8Bytes(key), (a, b) => a ^ b), false); }
  function modAddHex(str, key) { return bytesToHex(bitwiseWithKey(utf8Bytes(str), utf8Bytes(key), (a, b) => (a + b) & 0xff), false); }
  function modSubHex(str, key) { return bytesToHex(bitwiseWithKey(utf8Bytes(str), utf8Bytes(key), (a, b) => (a - b) & 0xff), false); }
  function bitNot(str) {
    const bytes = utf8Bytes(str), out = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) out[i] = (~bytes[i]) & 0xff;
    return bytesToHex(out, false);
  }
  // Each byte shifted independently; bits shifted past the edge are discarded (not carried
  // into the neighbouring byte).
  function bitShift(str, amount, dir) {
    const bytes = utf8Bytes(str), out = new Uint8Array(bytes.length), n = ((amount % 8) + 8) % 8;
    for (let i = 0; i < bytes.length; i++) out[i] = dir === "left" ? (bytes[i] << n) & 0xff : (bytes[i] >>> n) & 0xff;
    return bytesToHex(out, false);
  }
  // Rotates the 8 bits within each byte independently (no bits are lost).
  function rotateBits(str, amount, dir) {
    const bytes = utf8Bytes(str), out = new Uint8Array(bytes.length), n = ((amount % 8) + 8) % 8;
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      out[i] = dir === "left" ? ((b << n) | (b >>> (8 - n))) & 0xff : ((b >>> n) | (b << (8 - n))) & 0xff;
    }
    return bytesToHex(out, false);
  }
  // Gray code: adjacent values differ by exactly one bit. Applied per byte.
  function grayEncodeHex(str) {
    const bytes = utf8Bytes(str), out = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ (bytes[i] >> 1);
    return bytesToHex(out, false);
  }
  function grayDecodeHex(hex) {
    const bytes = hexToBytes(hex), out = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      let n = 0;
      for (let mask = bytes[i]; mask; mask >>= 1) n ^= mask;
      out[i] = n;
    }
    return bytesToText(out);
  }
  // Reverses byte order — converts hex bytes between big-endian and little-endian.
  function endianSwap(hex) {
    const bytes = hexToBytes(hex);
    return bytesToHex(new Uint8Array(Array.from(bytes).reverse()), true);
  }
  // Counts set (1) bits per byte, plus a total across the whole input.
  function popcount(str) {
    const bytes = utf8Bytes(str);
    let total = 0;
    const perByte = Array.from(bytes).map((b) => {
      let n = 0, x = b;
      while (x) { n += x & 1; x >>= 1; }
      total += n;
      return n;
    });
    return perByte.join(" ") + "  (total: " + total + " of " + bytes.length * 8 + " bits set)";
  }
  // Mirrors the bit order within each byte (bit 0 <-> bit 7, etc).
  function reverseBitsHex(str) {
    const bytes = utf8Bytes(str), out = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      let b = bytes[i], r = 0;
      for (let k = 0; k < 8; k++) { r = (r << 1) | (b & 1); b >>= 1; }
      out[i] = r & 0xff;
    }
    return bytesToHex(out, false);
  }
  // Swaps the high and low 4-bit nibble within each byte. Its own inverse.
  function swapNibblesHex(str) {
    const bytes = utf8Bytes(str), out = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) out[i] = ((bytes[i] << 4) | (bytes[i] >> 4)) & 0xff;
    return bytesToHex(out, false);
  }
  function bitNandHex(str, key) { return bytesToHex(bitwiseWithKey(utf8Bytes(str), utf8Bytes(key), (a, b) => (~(a & b)) & 0xff), false); }
  function bitNorHex(str, key) { return bytesToHex(bitwiseWithKey(utf8Bytes(str), utf8Bytes(key), (a, b) => (~(a | b)) & 0xff), false); }
  function bitXnorHex(str, key) { return bytesToHex(bitwiseWithKey(utf8Bytes(str), utf8Bytes(key), (a, b) => (~(a ^ b)) & 0xff), false); }
  // Each byte shifted right with its own sign bit preserved (arithmetic, not logical).
  function arithShiftRightHex(str, amount) {
    const bytes = utf8Bytes(str), out = new Uint8Array(bytes.length), n = ((parseInt(amount, 10) || 0) % 8 + 8) % 8;
    for (let i = 0; i < bytes.length; i++) {
      const signed = bytes[i] > 127 ? bytes[i] - 256 : bytes[i];
      out[i] = (signed >> n) & 0xff;
    }
    return bytesToHex(out, false);
  }
  function parityBit(str) {
    const bytes = utf8Bytes(str);
    let ones = 0;
    for (const b of bytes) { let x = b; while (x) { ones += x & 1; x >>= 1; } }
    return (ones % 2 === 0) ? "0 (even)" : "1 (odd)";
  }
  function toTwosComplement(str, bits) {
    const w = parseInt(bits, 10) || 8;
    const n = parseInt(str.trim(), 10);
    if (!Number.isInteger(n)) throw new Error("Enter a whole number.");
    const max = 2 ** (w - 1) - 1, min = -(2 ** (w - 1));
    if (n < min || n > max) throw new Error(`Value out of range for ${w}-bit two's complement (${min} to ${max}).`);
    const unsigned = n < 0 ? n + 2 ** w : n;
    return unsigned.toString(16).padStart(Math.ceil(w / 4), "0");
  }
  function fromTwosComplement(hex, bits) {
    const w = parseInt(bits, 10) || 8;
    const n = parseInt(hex.replace(/\s/g, ""), 16);
    if (!Number.isInteger(n)) throw new Error("Enter a valid hex value.");
    const half = 2 ** (w - 1);
    return String(n >= half ? n - 2 ** w : n);
  }
  // Bit position is counted from the LSB of the last byte (bit 0 = least significant bit
  // of the whole value), matching how the value would be read as one big number.
  function toggleBitHex(hex, position) {
    const bytes = hexToBytes(hex), pos = parseInt(position, 10) || 0;
    const byteIdx = bytes.length - 1 - Math.floor(pos / 8), bitIdx = pos % 8;
    if (byteIdx < 0 || byteIdx >= bytes.length) throw new Error("Bit position is outside the input's range.");
    const out = new Uint8Array(bytes);
    out[byteIdx] ^= (1 << bitIdx);
    return bytesToHex(out, false);
  }
  function countLeadingZerosHex(hex, bits) {
    const w = parseInt(bits, 10) || 8;
    const n = parseInt(hex.replace(/\s/g, ""), 16);
    if (!Number.isInteger(n)) throw new Error("Enter a valid hex value.");
    if (n === 0) return String(w);
    return String(w - n.toString(2).length);
  }
  function bitLength(str) {
    const n = parseInt(str.trim(), 10);
    if (!Number.isInteger(n) || n < 0) throw new Error("Enter a non-negative whole number.");
    return String(n === 0 ? 0 : n.toString(2).length);
  }

  // ----- English-likeness scoring, shared by both brute-force tools -----
  // Standard published English letter frequencies (percent), Wikipedia / Cornell CS.
  const ENGLISH_FREQ = { A: 8.2, B: 1.5, C: 2.8, D: 4.3, E: 12.7, F: 2.2, G: 2.0, H: 6.1, I: 7.0, J: 0.15,
    K: 0.77, L: 4.0, M: 2.4, N: 6.7, O: 7.5, P: 1.9, Q: 0.095, R: 6.0, S: 6.3, T: 9.1, U: 2.8, V: 0.98,
    W: 2.4, X: 0.15, Y: 2.0, Z: 0.074 };
  // Lower is a better match to English letter distribution. Text with no A-Z letters at
  // all (e.g. pure binary) can't be judged this way, hence Infinity.
  function chiSquaredEnglish(str) {
    const counts = {}; let total = 0;
    for (const ch of str.toUpperCase()) { if (ch >= "A" && ch <= "Z") { counts[ch] = (counts[ch] || 0) + 1; total++; } }
    if (!total) return Infinity;
    let chi2 = 0;
    for (const letter in ENGLISH_FREQ) {
      const expected = (ENGLISH_FREQ[letter] / 100) * total;
      const observed = counts[letter] || 0;
      chi2 += ((observed - expected) ** 2) / expected;
    }
    return chi2;
  }
  function letterRatio(str) { const letters = (str.match(/[A-Za-z]/g) || []).length; return str.length ? letters / str.length : 0; }

  // Whole-word matches of very common English words. This is a far stronger signal than
  // letter-frequency alone: a wrong key that's a small bit-delta off the real one can
  // still produce text with a plausible *letter* distribution (single-letter substitution
  // patterns often preserve rough frequency), but it is extremely unlikely to contain
  // several correctly-spelled common words by chance.
  const COMMON_WORDS = new Set(["the", "and", "of", "to", "in", "is", "you", "that", "it", "he", "was",
    "for", "on", "are", "as", "with", "his", "they", "at", "be", "this", "have", "from", "or", "one",
    "had", "by", "word", "but", "not", "what", "all", "were", "we", "when", "your", "can", "said",
    "there", "each", "which", "she", "do", "how", "their", "if", "will", "up", "other", "about", "out",
    "many", "then", "them", "these", "so", "some", "her", "would", "make", "like", "him", "into", "time",
    "has", "look", "two", "more", "write", "go", "see", "number", "no", "way", "could", "people", "than"]);
  function commonWordScore(str) {
    const words = str.toLowerCase().match(/[a-z]+/g) || [];
    let hits = 0;
    for (const w of words) if (COMMON_WORDS.has(w)) hits++;
    return hits;
  }

  // A candidate is only worth ranking by letter distribution once it's plausibly *prose* —
  // both mostly printable AND mostly made of letters. Printability alone isn't enough: a
  // wrong key can decode to a few stray letters buried in symbols/digits, and chi-squared
  // on a handful of letters is statistical noise that can look deceptively low. Requiring
  // real letter density is what actually separates English text from symbol soup. Among
  // plausible candidates, more correctly-spelled common words wins first (a much stronger
  // signal than letter frequency), and chi-squared only breaks remaining ties.
  function rankByEnglishLikeness(results) {
    return results.sort((a, b) => {
      const aOk = a.printable >= 0.85 && a.letters >= 0.6, bOk = b.printable >= 0.85 && b.letters >= 0.6;
      if (aOk !== bOk) return aOk ? -1 : 1;
      if (a.words !== b.words) return b.words - a.words;
      return a.score - b.score;
    });
  }

  // ----- Brute force: single-byte XOR -----
  // Tries every key 0-255, ranks by how much the result reads like English prose.
  function xorBruteForce(hexOrText, isHex, topN) {
    const bytes = isHex ? hexToBytes(hexOrText) : utf8Bytes(hexOrText);
    const results = [];
    for (let key = 0; key < 256; key++) {
      const out = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ key;
      let preview; try { preview = bytesToText(out); } catch (e) { preview = "(not valid UTF-8)"; }
      results.push({ key, keyHex: key.toString(16).padStart(2, "0"), printable: printableRatio(out), letters: letterRatio(preview), words: commonWordScore(preview), score: chiSquaredEnglish(preview), preview });
    }
    return rankByEnglishLikeness(results).slice(0, topN || 10);
  }

  // ----- Brute force: Caesar shift, ranked by English letter-frequency fit -----
  function caesarBruteForce(str, topN) {
    const results = [];
    for (let shift = 0; shift < 26; shift++) {
      const preview = caesar(str, -shift);
      results.push({ shift, printable: 1, letters: letterRatio(preview), words: commonWordScore(preview), score: chiSquaredEnglish(preview), preview });
    }
    return rankByEnglishLikeness(results).slice(0, topN || 26);
  }

  // =====================================================================
  // Additional operations
  // =====================================================================

  // ----- Braille (Grade 1: letters, digits via number-sign prefix, and spaces) -----
  const BRAILLE_BITS = { a: 1, b: 3, c: 9, d: 25, e: 17, f: 11, g: 27, h: 19, i: 10, j: 26, k: 5, l: 7, m: 13,
    n: 29, o: 21, p: 15, q: 31, r: 23, s: 14, t: 30, u: 37, v: 39, w: 58, x: 45, y: 61, z: 53 };
  const BRAILLE_REV = Object.fromEntries(Object.entries(BRAILLE_BITS).map(([k, v]) => [v, k]));
  const BRAILLE_DIGIT_LETTERS = "jabcdefghi"; // index = digit
  function brailleEncode(str) {
    let out = "";
    for (const ch of str.toLowerCase()) {
      if (ch === " ") { out += String.fromCodePoint(0x2800); continue; }
      if (ch >= "0" && ch <= "9") {
        out += String.fromCodePoint(0x283c);
        out += String.fromCodePoint(0x2800 + BRAILLE_BITS[BRAILLE_DIGIT_LETTERS[Number(ch)]]);
        continue;
      }
      if (BRAILLE_BITS[ch] === undefined) throw new Error("Braille here only supports letters, digits and spaces - '" + ch + "' isn't supported.");
      out += String.fromCodePoint(0x2800 + BRAILLE_BITS[ch]);
    }
    return out;
  }
  function brailleDecode(str) {
    const chars = Array.from(str).filter((c) => c !== " " && c !== "\n");
    let out = "", numberMode = false;
    for (const ch of chars) {
      const code = ch.codePointAt(0);
      if (code === 0x2800) { out += " "; numberMode = false; continue; }
      if (code === 0x283c) { numberMode = true; continue; }
      const letter = BRAILLE_REV[code - 0x2800];
      if (letter === undefined) throw new Error("'" + ch + "' isn't a supported Braille (grade 1) cell.");
      if (numberMode) { out += String(BRAILLE_DIGIT_LETTERS.indexOf(letter)); numberMode = false; }
      else out += letter;
    }
    return out;
  }

  // ----- EBCDIC (IBM code page 037 subset: letters, digits and space) -----
  function ebcdicByteForChar(c) {
    if (c === " ") return 0x40;
    if (c >= "0" && c <= "9") return 0xf0 + (c.charCodeAt(0) - 48);
    const isUpper = c !== c.toLowerCase();
    const idx = "abcdefghijklmnopqrstuvwxyz".indexOf(c.toLowerCase());
    if (idx < 0) return null;
    const base = idx < 9 ? 0x81 + idx : idx < 18 ? 0x91 + (idx - 9) : 0xa2 + (idx - 18);
    return isUpper ? base + 0x40 : base;
  }
  const EBCDIC_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
  const EBCDIC_ENCODE_MAP = {}, EBCDIC_DECODE_MAP = {};
  for (const c of EBCDIC_CHARS) { const b = ebcdicByteForChar(c); EBCDIC_ENCODE_MAP[c] = b; EBCDIC_DECODE_MAP[b] = c; }
  function ebcdicEncode(str) {
    let out = "";
    for (const c of str) {
      const b = EBCDIC_ENCODE_MAP[c];
      if (b === undefined) throw new Error("EBCDIC (cp037 subset) here only supports letters, digits and spaces - '" + c + "' isn't supported.");
      out += b.toString(16).padStart(2, "0");
    }
    return out;
  }
  function ebcdicDecode(hex) {
    const clean = hex.replace(/[^0-9a-fA-F]/g, "");
    if (clean.length % 2 !== 0) throw new Error("EBCDIC hex needs an even number of digits.");
    let out = "";
    for (let i = 0; i < clean.length; i += 2) {
      const b = parseInt(clean.substr(i, 2), 16);
      const c = EBCDIC_DECODE_MAP[b];
      if (c === undefined) throw new Error("Byte " + clean.substr(i, 2) + " isn't a supported EBCDIC (cp037 subset) code.");
      out += c;
    }
    return out;
  }

  // ----- Ternary (base 3), using the same big-integer codec as Base36/Base62 above -----
  const TERNARY_ALPHABET = "012";
  const ternaryEncode = makeBaseNEncode(TERNARY_ALPHABET), ternaryDecode = makeBaseNDecode(TERNARY_ALPHABET);

  // ----- T9 predictive-text keypad encoding -----
  const T9_MAP = { a: "2", b: "22", c: "222", d: "3", e: "33", f: "333", g: "4", h: "44", i: "444",
    j: "5", k: "55", l: "555", m: "6", n: "66", o: "666", p: "7", q: "77", r: "777", s: "7777",
    t: "8", u: "88", v: "888", w: "9", x: "99", y: "999", z: "9999" };
  const T9_REV = Object.fromEntries(Object.entries(T9_MAP).map(([k, v]) => [v, k]));
  function t9Encode(str) {
    return str.toLowerCase().split("").map((c) => {
      if (c === " ") return "0";
      if (T9_MAP[c] === undefined) throw new Error("T9 encoding here only supports letters and spaces - '" + c + "' isn't supported.");
      return T9_MAP[c];
    }).join(" ");
  }
  function t9Decode(str) {
    return str.trim().split(/\s+/).filter(Boolean).map((tok) => {
      if (tok === "0") return " ";
      if (T9_REV[tok] === undefined) throw new Error("'" + tok + "' isn't a valid T9 key sequence.");
      return T9_REV[tok];
    }).join("");
  }

  // ----- Byte<->emoji lookup table. A simple 256-entry substitution (not bit-compatible
  // with any external "base100"-style spec) - every byte maps to one emoji one-to-one. -----
  const EMOJI_TABLE = Array.from({ length: 256 }, (_, i) => String.fromCodePoint(0x1f400 + i));
  const EMOJI_REV = Object.fromEntries(EMOJI_TABLE.map((e, i) => [e, i]));
  function byteEmojiEncode(str) { return Array.from(utf8Bytes(str)).map((b) => EMOJI_TABLE[b]).join(""); }
  function byteEmojiDecode(str) {
    const chars = Array.from(str);
    const bytes = new Uint8Array(chars.length);
    chars.forEach((ch, i) => {
      const v = EMOJI_REV[ch];
      if (v === undefined) throw new Error("'" + ch + "' isn't in the byte-emoji table.");
      bytes[i] = v;
    });
    return bytesToText(bytes);
  }

  // ----- ADFGVX cipher: WWI German field cipher. Each letter/digit is fractionated into
  // a pair from {A,D,F,G,V,X} via a keyed 6x6 grid, then the resulting letter-string is
  // scrambled with a keyed columnar transposition (reusing the same transposition already
  // used by the plain Columnar Transposition cipher above). -----
  function adfgvxGrid(key) {
    const seen = new Set();
    const letters = [];
    (key || "").toUpperCase().replace(/[^A-Z0-9]/g, "").split("").forEach((c) => { if (!seen.has(c)) { seen.add(c); letters.push(c); } });
    for (const c of "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") if (!seen.has(c)) { seen.add(c); letters.push(c); }
    return letters;
  }
  const ADFGVX_LABELS = "ADFGVX";
  function adfgvxEncode(str, gridKey, transKey) {
    const grid = adfgvxGrid(gridKey);
    const clean = str.toUpperCase().replace(/[^A-Z0-9]/g, "");
    let fractionated = "";
    for (const c of clean) {
      const idx = grid.indexOf(c);
      fractionated += ADFGVX_LABELS[Math.floor(idx / 6)] + ADFGVX_LABELS[idx % 6];
    }
    return columnarEncode(fractionated, transKey);
  }
  function adfgvxDecode(str, gridKey, transKey) {
    const grid = adfgvxGrid(gridKey);
    const cipherLetters = str.toUpperCase().replace(/[^ADFGVX]/g, "");
    const fractionated = columnarDecode(cipherLetters, transKey);
    if (fractionated.length % 2 !== 0) throw new Error("ADFGVX ciphertext should decode to an even number of A/D/F/G/V/X letters.");
    let out = "";
    for (let i = 0; i < fractionated.length; i += 2) {
      const row = ADFGVX_LABELS.indexOf(fractionated[i]), col = ADFGVX_LABELS.indexOf(fractionated[i + 1]);
      out += grid[row * 6 + col];
    }
    return out;
  }

  // ----- Porta cipher: a reciprocal Vigenere-family cipher built from 13 self-inverse
  // tableaux (one per pair of key letters) - encrypting twice with the same key restores
  // the original text, like Atbash or Beaufort. -----
  function portaShift(c, keyLetter) {
    const base = c <= "Z" ? 65 : 97;
    const x = c.charCodeAt(0) - base;
    const k = Math.floor((keyLetter.toUpperCase().charCodeAt(0) - 65) / 2);
    const y = x < 13 ? 13 + ((x + k) % 13) : (x - 13 - k + 169) % 13;
    return String.fromCharCode(y + base);
  }
  function portaEncode(str, key) {
    if (!/[a-z]/i.test(key || "")) throw new Error("Porta needs an alphabetic keyword.");
    const k = key.toUpperCase().replace(/[^A-Z]/g, "");
    let ki = 0;
    return str.replace(/[a-z]/gi, (c) => { const out = portaShift(c, k[ki % k.length]); ki++; return out; });
  }
  function portaDecode(str, key) { return portaEncode(str, key); }

  // ----- Scytale cipher: the ancient Greek transposition cipher - text is written down
  // the faces of an imaginary n-sided rod, then read off row by row. -----
  function scytaleEncode(str, diameter) {
    const n = Math.max(2, parseInt(diameter, 10) || 2);
    const chars = Array.from(str);
    const rows = Math.ceil(chars.length / n);
    let out = "";
    for (let c = 0; c < n; c++) for (let r = 0; r < rows; r++) { const pos = r * n + c; if (pos < chars.length) out += chars[pos]; }
    return out;
  }
  function scytaleDecode(str, diameter) {
    const n = Math.max(2, parseInt(diameter, 10) || 2);
    const chars = Array.from(str);
    const len = chars.length;
    const rows = Math.ceil(len / n);
    const lastRowLen = len - (rows - 1) * n;
    const colLen = new Array(n).fill(rows);
    for (let c = lastRowLen; c < n; c++) colLen[c] = rows - 1;
    const grid = new Array(n);
    let pos = 0;
    for (let c = 0; c < n; c++) { grid[c] = chars.slice(pos, pos + colLen[c]); pos += colLen[c]; }
    let out = "";
    for (let r = 0; r < rows; r++) for (let c = 0; c < n; c++) if (grid[c][r] !== undefined) out += grid[c][r];
    return out;
  }

  // ----- Generic monoalphabetic substitution cipher with a user-supplied 26-letter alphabet -----
  function substitutionEncode(str, alphabet) {
    const alpha = (alphabet || "").toUpperCase().replace(/[^A-Z]/g, "");
    if (alpha.length !== 26 || new Set(alpha).size !== 26) throw new Error("Substitution alphabet must contain all 26 letters, each exactly once.");
    return str.replace(/[a-z]/gi, (c) => { const base = c <= "Z" ? 65 : 97; const out = alpha[c.toUpperCase().charCodeAt(0) - 65]; return base === 65 ? out : out.toLowerCase(); });
  }
  function substitutionDecode(str, alphabet) {
    const alpha = (alphabet || "").toUpperCase().replace(/[^A-Z]/g, "");
    if (alpha.length !== 26 || new Set(alpha).size !== 26) throw new Error("Substitution alphabet must contain all 26 letters, each exactly once.");
    return str.replace(/[a-z]/gi, (c) => { const base = c <= "Z" ? 65 : 97; const idx = alpha.indexOf(c.toUpperCase()); return base === 65 ? String.fromCharCode(65 + idx) : String.fromCharCode(97 + idx); });
  }

  // ----- Caesar Box: writes text into a square grid row by row, reads it out column by
  // column - a transposition cipher simple enough to do by hand with graph paper. -----
  function caesarBoxEncode(str) {
    const chars = Array.from(str.replace(/\s/g, ""));
    const side = Math.ceil(Math.sqrt(chars.length)) || 1;
    let out = "";
    for (let c = 0; c < side; c++) for (let r = 0; r < side; r++) { const pos = r * side + c; if (pos < chars.length) out += chars[pos]; }
    return out;
  }
  function caesarBoxDecode(str) {
    const chars = Array.from(str.replace(/\s/g, ""));
    const side = Math.ceil(Math.sqrt(chars.length)) || 1;
    const rows = Math.ceil(chars.length / side);
    const fullCols = chars.length - side * (rows - 1);
    const colLen = Array.from({ length: side }, (_, c) => (c < fullCols ? rows : rows - 1));
    const grid = new Array(side);
    let pos = 0;
    for (let c = 0; c < side; c++) { grid[c] = chars.slice(pos, pos + colLen[c]); pos += colLen[c]; }
    let out = "";
    for (let r = 0; r < rows; r++) for (let c = 0; c < side; c++) if (grid[c][r] !== undefined) out += grid[c][r];
    return out;
  }

  // ----- Running Key cipher: like Vigenere, but the key is a long piece of text used
  // once straight through (never repeated) instead of a short repeating keyword. -----
  function runningKeyEncode(str, key) {
    if (!/[a-z]/i.test(key || "")) throw new Error("Running key needs alphabetic key text.");
    const keyLetters = key.toUpperCase().replace(/[^A-Z]/g, "").split("");
    let ki = 0;
    return str.replace(/[a-z]/gi, (c) => {
      if (ki >= keyLetters.length) throw new Error("The running key text is shorter than the message - provide at least as many letters as in the message.");
      const base = c <= "Z" ? 65 : 97;
      const x = c.charCodeAt(0) - base;
      const k = keyLetters[ki].charCodeAt(0) - 65;
      ki++;
      return String.fromCharCode(((x + k) % 26) + base);
    });
  }
  function runningKeyDecode(str, key) {
    if (!/[a-z]/i.test(key || "")) throw new Error("Running key needs alphabetic key text.");
    const keyLetters = key.toUpperCase().replace(/[^A-Z]/g, "").split("");
    let ki = 0;
    return str.replace(/[a-z]/gi, (c) => {
      if (ki >= keyLetters.length) throw new Error("The running key text is shorter than the message - provide at least as many letters as in the message.");
      const base = c <= "Z" ? 65 : 97;
      const y = c.charCodeAt(0) - base;
      const k = keyLetters[ki].charCodeAt(0) - 65;
      ki++;
      return String.fromCharCode((((y - k) % 26) + 26) % 26 + base);
    });
  }

  // ----- Tap Code: the prisoner's code, letters as row.column taps on a 5x5 grid (shares
  // this app's Polybius Square convention of merging J into I). -----
  const TAPCODE_SQ = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
  function tapCodeEncode(str) {
    return str.toUpperCase().replace(/[^A-Z]/g, "").split("").map((c) => {
      const i = TAPCODE_SQ.indexOf(c === "J" ? "I" : c);
      return (Math.floor(i / 5) + 1) + "." + ((i % 5) + 1);
    }).join(" ");
  }
  function tapCodeDecode(str) {
    const pairs = str.trim().split(/\s+/).filter(Boolean);
    return pairs.map((p) => {
      const m = p.match(/^(\d)[.\- ]?(\d)$/);
      if (!m) throw new Error("Tap code pairs should look like '1.1 2.3 ...'.");
      const row = parseInt(m[1], 10) - 1, col = parseInt(m[2], 10) - 1;
      if (row < 0 || row > 4 || col < 0 || col > 4) throw new Error("Tap code digits must be 1-5.");
      return TAPCODE_SQ[row * 5 + col];
    }).join("");
  }

  // ----- Bubble Babble: a checksummed binary-to-ASCII encoding (Antti Huima's scheme,
  // used for SSH key fingerprints) that produces pronounceable "words". -----
  const BUBBLEBABBLE_VOWELS = "aeiouy", BUBBLEBABBLE_CONSONANTS = "bcdfghklmnprstvzx";
  function bubbleBabbleEncode(bytes) {
    let seed = 1, out = "x";
    const len = bytes.length;
    const rounds = Math.floor(len / 2) + 1;
    for (let i = 0; i < rounds; i++) {
      if (i + 1 < rounds || len % 2 !== 0) {
        const b1 = bytes[2 * i];
        out += BUBBLEBABBLE_VOWELS[(((b1 >> 6) & 3) + seed) % 6];
        out += BUBBLEBABBLE_CONSONANTS[(b1 >> 2) & 15];
        out += BUBBLEBABBLE_VOWELS[((b1 & 3) + Math.floor(seed / 6)) % 6];
        if (i + 1 < rounds) {
          const b2 = bytes[2 * i + 1];
          out += BUBBLEBABBLE_CONSONANTS[(b2 >> 4) & 15];
          out += "-";
          out += BUBBLEBABBLE_CONSONANTS[b2 & 15];
          seed = (seed * 5 + b1 * 7 + b2) % 36;
        } else {
          out += BUBBLEBABBLE_CONSONANTS[16];
        }
      } else {
        out += BUBBLEBABBLE_VOWELS[seed % 6];
        out += BUBBLEBABBLE_CONSONANTS[16];
        out += BUBBLEBABBLE_VOWELS[Math.floor(seed / 6)];
      }
    }
    return out + "x";
  }
  function bubbleBabbleDecode(str) {
    const clean = Array.from(str.trim().toLowerCase()).filter((c) => c !== "-");
    if (clean[0] !== "x" || clean[clean.length - 1] !== "x") throw new Error("Bubble Babble text should start and end with 'x'.");
    const body = clean.slice(1, -1);
    let pos = 0, seed = 1;
    const bytes = [];
    function readVowel() { const i = BUBBLEBABBLE_VOWELS.indexOf(body[pos]); if (i < 0) throw new Error("Expected a vowel at position " + pos + "."); pos++; return i; }
    function readConsonant() { const i = BUBBLEBABBLE_CONSONANTS.indexOf(body[pos]); if (i < 0) throw new Error("Expected a consonant at position " + pos + "."); pos++; return i; }
    while (pos < body.length) {
      const idx0 = readVowel(), idx1 = readConsonant(), idx2 = readVowel();
      if (idx1 === 16) {
        if (idx0 !== seed % 6 || idx2 !== Math.floor(seed / 6) % 6 || pos !== body.length) throw new Error("Bubble Babble checksum mismatch.");
        break;
      }
      const v0 = ((idx0 - seed) % 6 + 6) % 6;
      const v2 = ((idx2 - Math.floor(seed / 6)) % 6 + 6) % 6;
      const b1 = (v0 << 6) | (idx1 << 2) | v2;
      bytes.push(b1);
      if (pos >= body.length) throw new Error("Truncated Bubble Babble text.");
      if (BUBBLEBABBLE_CONSONANTS.indexOf(body[pos]) === 16 && pos === body.length - 1) { pos++; break; }
      const idx3 = readConsonant(), idx4 = readConsonant();
      const b2 = (idx3 << 4) | idx4;
      bytes.push(b2);
      seed = (seed * 5 + b1 * 7 + b2) % 36;
    }
    return new Uint8Array(bytes);
  }

  // ----- Extra bitwise operations -----
  function hexAnd(a, b) {
    const ba = hexToBytes(a), bb = hexToBytes(b);
    const len = Math.max(ba.length, bb.length);
    const out = new Uint8Array(len);
    for (let i = 0; i < len; i++) out[i] = (ba[ba.length - len + i] || 0) & (bb[bb.length - len + i] || 0);
    return bytesToHex(out, true);
  }
  function hexOr(a, b) {
    const ba = hexToBytes(a), bb = hexToBytes(b);
    const len = Math.max(ba.length, bb.length);
    const out = new Uint8Array(len);
    for (let i = 0; i < len; i++) out[i] = (ba[ba.length - len + i] || 0) | (bb[bb.length - len + i] || 0);
    return bytesToHex(out, true);
  }
  function hexXor(a, b) {
    const ba = hexToBytes(a), bb = hexToBytes(b);
    const len = Math.max(ba.length, bb.length);
    const out = new Uint8Array(len);
    for (let i = 0; i < len; i++) out[i] = (ba[ba.length - len + i] || 0) ^ (bb[bb.length - len + i] || 0);
    return bytesToHex(out, true);
  }
  function hammingDistance(a, b) {
    const ba = hexToBytes(a), bb = hexToBytes(b);
    if (ba.length !== bb.length) throw new Error("Hamming Distance needs two equal-length hex values.");
    let dist = 0;
    for (let i = 0; i < ba.length; i++) { let x = ba[i] ^ bb[i]; while (x) { dist += x & 1; x >>= 1; } }
    return String(dist);
  }
  function setBitHex(hex, position) {
    const bytes = hexToBytes(hex), pos = parseInt(position, 10) || 0;
    const byteIdx = bytes.length - 1 - Math.floor(pos / 8);
    if (byteIdx < 0 || byteIdx >= bytes.length) throw new Error("Bit position is outside the input's range.");
    const out = new Uint8Array(bytes);
    out[byteIdx] |= (1 << (pos % 8));
    return bytesToHex(out, false);
  }
  function clearBitHex(hex, position) {
    const bytes = hexToBytes(hex), pos = parseInt(position, 10) || 0;
    const byteIdx = bytes.length - 1 - Math.floor(pos / 8);
    if (byteIdx < 0 || byteIdx >= bytes.length) throw new Error("Bit position is outside the input's range.");
    const out = new Uint8Array(bytes);
    out[byteIdx] &= ~(1 << (pos % 8));
    return bytesToHex(out, false);
  }
  function rotateBytesLeft(hex, amount) {
    const bytes = Array.from(hexToBytes(hex));
    if (!bytes.length) return "";
    const n = ((parseInt(amount, 10) || 0) % bytes.length + bytes.length) % bytes.length;
    return bytesToHex(new Uint8Array(bytes.slice(n).concat(bytes.slice(0, n))), true);
  }
  function rotateBytesRight(hex, amount) {
    const bytes = Array.from(hexToBytes(hex));
    if (!bytes.length) return "";
    const n = ((parseInt(amount, 10) || 0) % bytes.length + bytes.length) % bytes.length;
    return bytesToHex(new Uint8Array(bytes.slice(bytes.length - n).concat(bytes.slice(0, bytes.length - n))), true);
  }
  function countClearBits(hex) {
    const bytes = hexToBytes(hex);
    let total = bytes.length * 8, set = 0;
    for (const b of bytes) { let x = b; while (x) { set += x & 1; x >>= 1; } }
    return String(total - set) + "  (total: " + (total - set) + " of " + total + " bits clear)";
  }
  function bitExtractHex(hex, start, length) {
    const bytes = hexToBytes(hex);
    let n = 0n;
    for (const b of bytes) n = (n << 8n) | BigInt(b);
    const s = BigInt(parseInt(start, 10) || 0), len = BigInt(Math.max(1, parseInt(length, 10) || 1));
    const mask = (1n << len) - 1n;
    return ((n >> s) & mask).toString(16);
  }

  // ----- Keccak-f[1600] permutation, used by both SHA3 (NIST padding) and the original
  // Keccak/Ethereum variant (different padding byte) - implemented from the public
  // specification and checked against the published empty-string test vectors. -----
  const KECCAK_MASK64 = (1n << 64n) - 1n;
  function keccakRotl64(x, n) {
    n = BigInt(n % 64);
    if (n === 0n) return x & KECCAK_MASK64;
    return ((x << n) | (x >> (64n - n))) & KECCAK_MASK64;
  }
  const KECCAK_RHO = [
    [0, 1, 62, 28, 27], [36, 44, 6, 55, 20], [3, 10, 43, 25, 39], [41, 45, 15, 21, 8], [18, 2, 61, 56, 14]
  ]; // KECCAK_RHO[y][x]
  const KECCAK_RC = (function () {
    const RC = [];
    let lfsr = 0x01;
    function nextBit() { const bit = lfsr & 1; lfsr <<= 1; if (lfsr & 0x100) lfsr ^= 0x171; return bit; }
    for (let round = 0; round < 24; round++) {
      let rc = 0n;
      for (let j = 0; j <= 6; j++) if (nextBit()) rc |= 1n << ((1n << BigInt(j)) - 1n);
      RC.push(rc & KECCAK_MASK64);
    }
    return RC;
  })();
  function keccakF1600(state) {
    for (let round = 0; round < 24; round++) {
      const C = new Array(5);
      for (let x = 0; x < 5; x++) C[x] = state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20];
      const D = new Array(5);
      for (let x = 0; x < 5; x++) D[x] = C[(x + 4) % 5] ^ keccakRotl64(C[(x + 1) % 5], 1);
      for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) state[x + 5 * y] ^= D[x];
      const B = new Array(25);
      for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) {
        const newX = y, newY = (2 * x + 3 * y) % 5;
        B[newX + 5 * newY] = keccakRotl64(state[x + 5 * y], KECCAK_RHO[y][x]);
      }
      for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) {
        state[x + 5 * y] = B[x + 5 * y] ^ ((~B[(x + 1) % 5 + 5 * y] & KECCAK_MASK64) & B[(x + 2) % 5 + 5 * y]);
      }
      state[0] ^= KECCAK_RC[round];
    }
    return state;
  }
  function keccak(rateBits, msgBytes, domainSuffix, outputBytes) {
    const rateBytes = rateBits / 8;
    const state = new Array(25).fill(0n);
    const input = Array.from(msgBytes);
    input.push(domainSuffix);
    while (input.length % rateBytes !== 0) input.push(0);
    input[input.length - 1] ^= 0x80;
    for (let offset = 0; offset < input.length; offset += rateBytes) {
      for (let i = 0; i < rateBytes / 8; i++) {
        let lane = 0n;
        for (let b = 7; b >= 0; b--) lane = (lane << 8n) | BigInt(input[offset + i * 8 + b]);
        state[i] ^= lane;
      }
      keccakF1600(state);
    }
    const out = [];
    while (out.length < outputBytes) {
      for (let i = 0; i < rateBytes / 8 && out.length < outputBytes; i++) {
        let lane = state[i];
        for (let b = 0; b < 8 && out.length < outputBytes; b++) { out.push(Number(lane & 0xffn)); lane >>= 8n; }
      }
      if (out.length < outputBytes) keccakF1600(state);
    }
    return new Uint8Array(out);
  }
  function sha3Hex(bits, msgBytes) {
    const rateBits = 1600 - 2 * bits;
    return bytesToHex(keccak(rateBits, msgBytes, 0x06, bits / 8), false);
  }
  function keccak256Hex(msgBytes) { return bytesToHex(keccak(1088, msgBytes, 0x01, 32), false); }

  // ----- MurmurHash3 (x86, 32-bit), a fast non-cryptographic hash used in hash tables -----
  function murmur3_32(bytes) {
    const c1 = 0xcc9e2d51, c2 = 0x1b873593;
    let h1 = 0;
    const len = bytes.length;
    const nblocks = Math.floor(len / 4);
    for (let i = 0; i < nblocks; i++) {
      let k1 = (bytes[i * 4] | (bytes[i * 4 + 1] << 8) | (bytes[i * 4 + 2] << 16) | (bytes[i * 4 + 3] << 24));
      k1 = Math.imul(k1, c1); k1 = (k1 << 15) | (k1 >>> 17); k1 = Math.imul(k1, c2);
      h1 ^= k1; h1 = (h1 << 13) | (h1 >>> 19); h1 = (Math.imul(h1, 5) + 0xe6546b64) | 0;
    }
    let k1 = 0;
    const tailIndex = nblocks * 4, rem = len & 3;
    if (rem === 3) k1 ^= bytes[tailIndex + 2] << 16;
    if (rem >= 2) k1 ^= bytes[tailIndex + 1] << 8;
    if (rem >= 1) { k1 ^= bytes[tailIndex]; k1 = Math.imul(k1, c1); k1 = (k1 << 15) | (k1 >>> 17); k1 = Math.imul(k1, c2); h1 ^= k1; }
    h1 ^= len; h1 ^= h1 >>> 16; h1 = Math.imul(h1, 0x85ebca6b); h1 ^= h1 >>> 13; h1 = Math.imul(h1, 0xc2b2ae35); h1 ^= h1 >>> 16;
    return (h1 >>> 0).toString(16).padStart(8, "0");
  }

  // ----- CRC-32C (Castagnoli) - the CRC-32 variant used by iSCSI, ext4 and SCTP -----
  function crc32c(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) crc = (crc & 1) ? (crc >>> 1) ^ 0x82f63b78 : crc >>> 1;
    }
    return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, "0");
  }

  // ----- Extra text operations -----
  function regexEscape(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function removeNonPrintable(str) { return str.replace(/[^\x20-\x7e\n\t]/g, ""); }
  function removeNonAscii(str) { return str.replace(/[^\x00-\x7f]/g, ""); }
  function unicodeNormalize(str, form) { return str.normalize(form || "NFC"); }
  function filterLines(str, needle, mode) {
    const lines = str.split(/\r?\n/);
    const keep = mode === "exclude"
      ? lines.filter((l) => !l.includes(needle))
      : lines.filter((l) => l.includes(needle));
    return keep.join("\n");
  }
  const SMART_QUOTE_MAP = { '"': "“", "'": "‘" };
  function smartQuotesEncode(str) {
    let dq = 0, sq = 0;
    return str.replace(/["']/g, (c) => {
      if (c === '"') { dq++; return dq % 2 ? "“" : "”"; }
      sq++; return sq % 2 ? "‘" : "’";
    });
  }
  function smartQuotesDecode(str) { return str.replace(/[“”]/g, '"').replace(/[‘’]/g, "'"); }
  function sentenceCase(str) {
    return str.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase());
  }
  function collapseSpaces(str) { return str.replace(/[ \t]+/g, " "); }
  function stripBom(str) { return str.replace(/^﻿/, ""); }
  function shellQuote(str) { return "'" + str.replace(/'/g, "'\\''") + "'"; }
  function showWhitespace(str) {
    return str.replace(/\t/g, "→").replace(/\r\n/g, "¶\n").replace(/\n/g, "¶\n").replace(/ /g, "·");
  }

  // ----- Extra data operations -----
  function csvToTsv(str) {
    return str.split(/\r?\n/).filter((l) => l.length).map((line) => parseCsvLine(line).map((f) => f.replace(/\t/g, " ")).join("\t")).join("\n");
  }
  function tsvToCsv(str) {
    return str.split(/\r?\n/).filter((l) => l.length).map((line) => line.split("\t").map((f) => (/[",\n]/.test(f) ? '"' + f.replace(/"/g, '""') + '"' : f)).join(",")).join("\n");
  }
  function parseCsvLine(line) {
    const out = []; let cur = "", inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQuotes) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQuotes = false; } else cur += c; }
      else if (c === '"') inQuotes = true;
      else if (c === ",") { out.push(cur); cur = ""; }
      else cur += c;
    }
    out.push(cur);
    return out;
  }
  function describeCronField(field, names) {
    const name = (v) => (names ? names[v] || v : v);
    if (field === "*") return null;
    if (/^\*\/\d+$/.test(field)) return "every " + field.split("/")[1] + (names ? " units" : " minutes/hours");
    if (field.includes(",")) return field.split(",").map(name).join(", ");
    if (field.includes("-")) { const [a, b] = field.split("-"); return name(a) + " through " + name(b); }
    return name(field);
  }
  function cronDescribe(str) {
    const parts = str.trim().split(/\s+/);
    if (parts.length !== 5) throw new Error("Enter a standard 5-field cron expression: minute hour day-of-month month day-of-week.");
    const [min, hour, dom, mon, dow] = parts;
    const MONTHS = { 1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December" };
    const DAYS = { 0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday", 7: "Sunday" };
    const clauses = [];
    const minDesc = describeCronField(min), hourDesc = describeCronField(hour);
    if (minDesc === null && hourDesc === null) clauses.push("every minute");
    else if (hourDesc === null) clauses.push("at " + minDesc + " past every hour");
    else if (minDesc === null) clauses.push("every minute of " + hourDesc);
    else clauses.push("at " + hour.padStart(2, "0") + ":" + min.padStart(2, "0"));
    const domDesc = describeCronField(dom); if (domDesc !== null) clauses.push("on day-of-month " + domDesc);
    const monDesc = describeCronField(mon, MONTHS); if (monDesc !== null) clauses.push("in " + monDesc);
    const dowDesc = describeCronField(dow, DAYS); if (dowDesc !== null) clauses.push("on " + dowDesc);
    return clauses.join(", ");
  }
  function haversineDistance(str, lat2, lon2) {
    const m = str.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
    if (!m) throw new Error("Enter the first point as 'lat, long' in decimal degrees.");
    const lat1 = parseFloat(m[1]), lon1 = parseFloat(m[2]);
    const R = 6371, toRad = (d) => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2) + " km";
  }
  function secondsToDuration(str) {
    let secs = Math.floor(Number(str));
    if (!Number.isFinite(secs) || secs < 0) throw new Error("Enter a non-negative number of seconds.");
    const d = Math.floor(secs / 86400); secs %= 86400;
    const h = Math.floor(secs / 3600); secs %= 3600;
    const m = Math.floor(secs / 60); secs %= 60;
    const parts = [];
    if (d) parts.push(d + "d"); if (h) parts.push(h + "h"); if (m) parts.push(m + "m"); if (secs || !parts.length) parts.push(secs + "s");
    return parts.join(" ");
  }
  function durationToSeconds(str) {
    const re = /(\d+)\s*([dhms])/gi;
    let m, total = 0, matched = false;
    while ((m = re.exec(str))) { matched = true; const n = parseInt(m[1], 10); const unit = m[2].toLowerCase(); total += unit === "d" ? n * 86400 : unit === "h" ? n * 3600 : unit === "m" ? n * 60 : n; }
    if (!matched) throw new Error("Enter a duration like '1h 30m' or '90s'.");
    return String(total);
  }
  function parseEmailHeader(str) {
    const fields = ["From", "To", "Cc", "Subject", "Date", "Message-ID"];
    const out = [];
    for (const f of fields) {
      const m = str.match(new RegExp("^" + f + ":\\s*(.+)$", "im"));
      if (m) out.push(f + ": " + m[1].trim());
    }
    return out.length ? out.join("\n") : "(no recognized header fields found)";
  }
  function luhnValid(digits) {
    const nums = digits.split("").map(Number);
    let sum = 0;
    for (let i = 0; i < nums.length; i++) { let d = nums[nums.length - 1 - i]; if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; } sum += d; }
    return sum % 10 === 0;
  }
  function extractCreditCards(str) {
    const candidates = str.match(/\b(?:\d[ -]?){13,19}\b/g) || [];
    const out = [];
    for (const c of candidates) { const digits = c.replace(/[ -]/g, ""); if (digits.length >= 13 && digits.length <= 19 && luhnValid(digits)) out.push(c); }
    return out.join("\n") || "(none found)";
  }
  function extractPhoneNumbers(str) {
    const matches = str.match(/(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g) || [];
    return matches.join("\n") || "(none found)";
  }
  function extractMentions(str) {
    const matches = str.match(/(?<![\w@])@[a-zA-Z0-9_]{1,30}\b/g) || [];
    return matches.join("\n") || "(none found)";
  }
  function bytesToHuman(str) {
    let n = Number(str);
    if (!Number.isFinite(n) || n < 0) throw new Error("Enter a non-negative number of bytes.");
    const units = ["B", "KB", "MB", "GB", "TB", "PB"];
    let i = 0;
    while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
    return (i === 0 ? String(n) : n.toFixed(2)) + " " + units[i];
  }
  function latLongToDms(str) {
    const m = str.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
    if (!m) throw new Error("Enter as 'lat, long' in decimal degrees, e.g. 40.6892, -74.0445");
    function toDms(deg, posLabel, negLabel) {
      const label = deg >= 0 ? posLabel : negLabel;
      deg = Math.abs(deg);
      const d = Math.floor(deg);
      const minFloat = (deg - d) * 60;
      const mm = Math.floor(minFloat);
      const s = (minFloat - mm) * 60;
      return d + "°" + mm + "'" + s.toFixed(2) + "\"" + label;
    }
    return toDms(parseFloat(m[1]), "N", "S") + " " + toDms(parseFloat(m[2]), "E", "W");
  }
  function dmsToLatLong(str) {
    const re = /(-?\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)\D*([NSEW])/gi;
    const out = [];
    let m;
    while ((m = re.exec(str))) {
      let val = Math.abs(parseFloat(m[1])) + parseFloat(m[2]) / 60 + parseFloat(m[3]) / 3600;
      if (/[SW]/i.test(m[4])) val = -val;
      out.push(val.toFixed(6));
    }
    if (out.length !== 2) throw new Error("Enter as e.g. 40°41'21.12\"N 74°2'40.20\"W");
    return out.join(", ");
  }
  function tempConvert(str, from, to) {
    const n = Number(str);
    if (!Number.isFinite(n)) throw new Error("Enter a number.");
    const c = from === "c" ? n : from === "f" ? (n - 32) * 5 / 9 : n - 273.15;
    const out = to === "c" ? c : to === "f" ? c * 9 / 5 + 32 : c + 273.15;
    return out.toFixed(2);
  }

  // ----- Extra random operations -----
  function randomGaussian(mean, stddev) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    const m = parseFloat(mean) || 0, sd = parseFloat(stddev) || 1;
    return (m + z * sd).toFixed(4);
  }
  function pickLine(str) {
    const lines = str.split(/\r?\n/).filter((l) => l.length);
    if (!lines.length) throw new Error("Enter at least one non-empty line to pick from.");
    const idx = new Uint32Array(1); window.crypto.getRandomValues(idx);
    return lines[idx[0] % lines.length];
  }
  function isPrime(n) {
    if (n < 2) return false;
    if (n % 2 === 0) return n === 2;
    for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
    return true;
  }
  function randomPrimeInRange(min, max) {
    const lo = Math.max(2, parseInt(min, 10) || 2), hi = Math.max(lo, parseInt(max, 10) || 100);
    const candidates = [];
    for (let i = lo; i <= hi; i++) if (isPrime(i)) candidates.push(i);
    if (!candidates.length) throw new Error("No primes in that range.");
    const idx = new Uint32Array(1); window.crypto.getRandomValues(idx);
    return String(candidates[idx[0] % candidates.length]);
  }
  const RANDOM_EMOJI = ["\u{1f600}", "\u{1f602}", "\u{1f60e}", "\u{1f914}", "\u{1f973}", "\u{1f47d}", "\u{1f680}",
    "\u{1f30d}", "\u{1f3af}", "\u{1f9e0}", "\u{1f52c}", "\u{1f9ea}", "\u{1f381}", "\u{1f3b2}", "\u{1f984}", "\u{1f40d}"];
  function randomEmoji() {
    const idx = new Uint32Array(1); window.crypto.getRandomValues(idx);
    return RANDOM_EMOJI[idx[0] % RANDOM_EMOJI.length];
  }
  const B32_ALPHABET_PLAIN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  function randomBase32(len) {
    const n = parseInt(len, 10) || 16;
    const bytes = new Uint8Array(n); window.crypto.getRandomValues(bytes);
    let out = ""; for (let i = 0; i < n; i++) out += B32_ALPHABET_PLAIN[bytes[i] % 32];
    return out;
  }
  const USERNAME_ADJECTIVES = ["swift", "brave", "quiet", "clever", "bright", "cosmic", "lucky", "mighty", "silent", "sunny", "wild", "gentle", "bold", "calm", "eager"];
  const USERNAME_NOUNS = ["falcon", "otter", "comet", "cedar", "harbor", "ember", "willow", "tiger", "meadow", "raven", "canyon", "quartz", "maple", "lynx", "delta"];
  function randomUsername() {
    const idx = new Uint32Array(3); window.crypto.getRandomValues(idx);
    return USERNAME_ADJECTIVES[idx[0] % USERNAME_ADJECTIVES.length] + "-" + USERNAME_NOUNS[idx[1] % USERNAME_NOUNS.length] + (idx[2] % 100);
  }
  function randomIpv6() {
    const groups = [];
    const bytes = new Uint8Array(16); window.crypto.getRandomValues(bytes);
    for (let i = 0; i < 8; i++) groups.push(((bytes[i * 2] << 8) | bytes[i * 2 + 1]).toString(16));
    return groups.join(":");
  }
  function randomDateInRange(fromStr, toStr) {
    const from = new Date(fromStr).getTime(), to = new Date(toStr).getTime();
    if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) throw new Error("Enter valid 'from' and 'to' dates (YYYY-MM-DD), with 'to' after 'from'.");
    const rand = new Uint32Array(1); window.crypto.getRandomValues(rand);
    const t = from + (rand[0] / 0xffffffff) * (to - from);
    return new Date(t).toISOString().slice(0, 10);
  }
  function weightedBoolean(probability) {
    const p = Math.min(1, Math.max(0, parseFloat(probability)));
    const rand = new Uint32Array(1); window.crypto.getRandomValues(rand);
    return String((rand[0] / 0xffffffff) < p);
  }

  window.CL = {
    utf8Bytes, bytesToText, bytesToBase64, base64ToBytes, bytesToBase64Url, base64UrlToBytes,
    bytesToHex, hexToBytes, bytesToBinary, binaryToBytes, base32Encode, base32Decode, base58Encode, base58Decode,
    base85Encode, base85Decode, base45Encode, base45Decode, base36Encode, base36Decode, base62Encode, base62Decode,
    crockford32Encode, crockford32Decode, z85Encode, z85Decode, bcdEncode, bcdDecode,
    mimeWordEncode, mimeWordDecode, utf7Encode, utf7Decode, toBijective26, fromBijective26, unaryEncode, unaryDecode,
    punycodeEncode, punycodeDecode, qpEncode, qpDecode, toRoman, fromRoman,
    toHexdump, fromHexdump, htmlEncode, htmlDecode, caesar, atbash, rot47, a1z26Encode, a1z26Decode,
    vigenereEncode, vigenereDecode, beaufort, affineEncode, affineDecode, polybiusEncode, polybiusDecode,
    baconEncode, baconDecode, railFenceEncode, railFenceDecode, columnarEncode, columnarDecode,
    trithemiusEncode, trithemiusDecode, gronsfeldEncode, gronsfeldDecode, autokeyEncode, autokeyDecode,
    nihilistEncode, nihilistDecode, keywordCipherEncode, keywordCipherDecode, rot18, playfairEncode, playfairDecode,
    xorHexOut, xorFromHex, decimalEncode, decimalDecode,
    octalEncode, octalDecode, unicodeEscape, unicodeUnescape, natoEncode, morseEncode, morseDecode,
    stripAccents, jsonEscape, jsonUnescape, changeCase, changeBase, letterFrequency, extract, levenshtein, parseUrl, dateToUnix, unixToDate,
    ipToInt, intToIp, subnetInfo, convertColor,
    expandIpv6, compressIpv6, formatMac, extractHexColors, extractHashtags, extractMacAddresses,
    extractDomain, maskEmail, extractHashes, extractIpv6, extractBase64Blobs,
    csvToJson, jsonToCsv, buildQueryString, unixSecToMs, unixMsToSec, dateDifference, wordFrequency,
    convertLineEndings, stripHtmlTags, wordWrap, inspectChars, byteHistogram,
    removeLineNumbers, tabsToSpaces, spacesToTabs, removeDuplicateWords, pigLatinEncode, leetEncode, leetDecode,
    padLeft, padRight, centerText, repeatText, truncateText, wrapInQuotes, stripSurroundingQuotes,
    alternatingCase, removeNumbers, removePunctuation, insertAtPosition,
    bitAndHex, bitOrHex, bitXorHex, modAddHex, modSubHex, bitNot, bitShift, rotateBits, grayEncodeHex, grayDecodeHex,
    endianSwap, popcount, reverseBitsHex, swapNibblesHex,
    bitNandHex, bitNorHex, bitXnorHex, arithShiftRightHex, parityBit, toTwosComplement, fromTwosComplement,
    toggleBitHex, countLeadingZerosHex, bitLength,
    xorBruteForce, caesarBruteForce, chiSquaredEnglish,
    md5, shaHex, hmacHex, crc32, crc16, adler32, luhnAppend, entropy, printableRatio, magicBytes, detect, parseJwt,
    crc8, fletcher16, fletcher32, fnv1a32, fnv1a64, djb2, sdbm, checksum8, hmacMd5Hex, internetChecksum, xor8Checksum,
    randomBytes, uuid, password, randomIpv4, rollDice, loremIpsum,
    randomMac, randomHexColor, randomIntInRange, randomFloatInRange, coinFlip, randomCard, shuffleLines, randomBoolean,

    brailleEncode, brailleDecode, ebcdicEncode, ebcdicDecode, ternaryEncode, ternaryDecode,
    t9Encode, t9Decode, byteEmojiEncode, byteEmojiDecode,
    adfgvxEncode, adfgvxDecode, portaEncode, portaDecode, scytaleEncode, scytaleDecode,
    substitutionEncode, substitutionDecode, caesarBoxEncode, caesarBoxDecode,
    runningKeyEncode, runningKeyDecode, tapCodeEncode, tapCodeDecode, bubbleBabbleEncode, bubbleBabbleDecode,
    hexAnd, hexOr, hexXor, hammingDistance, setBitHex, clearBitHex, rotateBytesLeft, rotateBytesRight,
    countClearBits, bitExtractHex,
    sha3Hex, keccak256Hex, murmur3_32, crc32c,
    regexEscape, removeNonPrintable, removeNonAscii, unicodeNormalize, filterLines,
    smartQuotesEncode, smartQuotesDecode, sentenceCase, collapseSpaces, stripBom, shellQuote, showWhitespace,
    csvToTsv, tsvToCsv, cronDescribe, haversineDistance, secondsToDuration, durationToSeconds,
    parseEmailHeader, extractCreditCards, extractPhoneNumbers, extractMentions, bytesToHuman,
    latLongToDms, dmsToLatLong, tempConvert,
    randomGaussian, pickLine, randomPrimeInRange, randomEmoji, randomBase32, randomUsername,
    randomIpv6, randomDateInRange, weightedBoolean
  };
})();
