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

  // ----- Unix time -----
  function dateToUnix(str) { const t = Date.parse(str.trim()); if (isNaN(t)) throw new Error("Unrecognised date. Try e.g. 2024-01-31 or an ISO date."); return String(Math.floor(t / 1000)); }
  function unixToDate(str) { const n = parseInt(str.trim(), 10); if (isNaN(n)) throw new Error("Enter a whole number of seconds."); return new Date(n * 1000).toISOString(); }

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

  window.CL = {
    utf8Bytes, bytesToText, bytesToBase64, base64ToBytes, bytesToBase64Url, base64UrlToBytes,
    bytesToHex, hexToBytes, bytesToBinary, binaryToBytes, base32Encode, base32Decode, base58Encode, base58Decode,
    toHexdump, fromHexdump, htmlEncode, htmlDecode, caesar, atbash, rot47, a1z26Encode, a1z26Decode,
    vigenereEncode, vigenereDecode, xorHexOut, xorFromHex, decimalEncode, decimalDecode,
    octalEncode, octalDecode, unicodeEscape, unicodeUnescape, natoEncode, morseEncode, morseDecode,
    stripAccents, jsonEscape, jsonUnescape, changeCase, changeBase, letterFrequency, extract, dateToUnix, unixToDate,
    convertLineEndings, stripHtmlTags, wordWrap, inspectChars, byteHistogram,
    bitAndHex, bitOrHex, bitXorHex, modAddHex, modSubHex, bitNot, bitShift, rotateBits,
    xorBruteForce, caesarBruteForce, chiSquaredEnglish,
    md5, shaHex, hmacHex, crc32, entropy, printableRatio, magicBytes, detect, parseJwt, randomBytes, uuid, password
  };
})();
