/* app.js — step-based workbench. Depends on CL (lib.js) and CL_DATA (data.js). */
(function () {
  "use strict";

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const hasSubtle = !!(window.crypto && window.crypto.subtle);

  // -------------------------------------------------------------------------
  // Operations. Each: { id, name, cat, params?, run(input, p), about, example, ignoresInput, warn }
  // -------------------------------------------------------------------------
  const OPS = [
    // Encoding
    { id: "base64-encode", name: "To Base64", cat: "Encoding", run: (s) => CL.bytesToBase64(CL.utf8Bytes(s)), about: "Encodes text as Base64. Safe for email, URLs and JSON. Not encryption.", example: { in: "Hi", out: "SGk=" } },
    { id: "base64-decode", name: "From Base64", cat: "Encoding", run: (s) => CL.bytesToText(CL.base64ToBytes(s)), about: "Decodes Base64 back into text." },
    { id: "base64url-encode", name: "To Base64 URL", cat: "Encoding", run: (s) => CL.bytesToBase64Url(CL.utf8Bytes(s)), about: "URL-safe Base64 (uses - and _, no padding)." },
    { id: "base64url-decode", name: "From Base64 URL", cat: "Encoding", run: (s) => CL.bytesToText(CL.base64UrlToBytes(s)), about: "Decodes URL-safe Base64." },
    { id: "base32-encode", name: "To Base32", cat: "Encoding", run: (s) => CL.base32Encode(CL.utf8Bytes(s)), about: "Base32 (RFC 4648) uses A–Z and 2–7. Case-insensitive.", example: { in: "foobar", out: "MZXW6YTBOI======" } },
    { id: "base32-decode", name: "From Base32", cat: "Encoding", run: (s) => CL.bytesToText(CL.base32Decode(s)), about: "Decodes Base32 back into text." },
    { id: "base58-encode", name: "To Base58", cat: "Encoding", run: (s) => CL.base58Encode(CL.utf8Bytes(s)), about: "Base58 (Bitcoin alphabet) — like Base64 but drops easily confused characters.", example: { in: "hello world", out: "StV1DL6CwTryKyV" } },
    { id: "base58-decode", name: "From Base58", cat: "Encoding", run: (s) => CL.bytesToText(CL.base58Decode(s)), about: "Decodes Base58 back into text." },
    { id: "base85-encode", name: "To Base85", cat: "Encoding", run: (s) => CL.base85Encode(CL.utf8Bytes(s)), about: "Base85 (Ascii85) — packs 4 bytes into 5 printable characters, denser than Base64. Used in Adobe PostScript/PDF and git binary patches.", example: { in: "Man ", out: "9jqo^" } },
    { id: "base85-decode", name: "From Base85", cat: "Encoding", run: (s) => CL.bytesToText(CL.base85Decode(s)), about: "Decodes Base85 (Ascii85) back into text." },
    { id: "punycode-encode", name: "To Punycode", cat: "Encoding", run: (s) => CL.punycodeEncode(s), about: "Encodes a domain name to ASCII-Compatible Encoding (RFC 3492), the way browsers actually send internationalized domains over DNS. Only non-ASCII dot-separated labels get an xn-- prefix.", example: { in: "münchen.de", out: "xn--mnchen-3ya.de" } },
    { id: "punycode-decode", name: "From Punycode", cat: "Encoding", run: (s) => CL.punycodeDecode(s), about: "Decodes an xn-- Punycode domain back to Unicode. Note: real browsers deliberately do NOT do this automatically in script-visible APIs — it's exactly the kind of conversion that enables homoglyph domain spoofing, see the Learn lesson on that.", example: { in: "xn--mnchen-3ya.de", out: "münchen.de" } },
    { id: "to-hexdump", name: "To Hexdump", cat: "Encoding", run: (s) => CL.toHexdump(CL.utf8Bytes(s)), about: "xxd-style dump with byte offsets, hex and an ASCII column." },
    { id: "from-hexdump", name: "From Hexdump", cat: "Encoding", run: (s) => CL.bytesToText(CL.fromHexdump(s)), about: "Rebuilds text from a hexdump, ignoring offsets and the ASCII column." },
    { id: "hex-encode", name: "To Hex", cat: "Encoding", run: (s) => CL.bytesToHex(CL.utf8Bytes(s), true), about: "Shows each byte as two hex digits.", example: { in: "A", out: "41" } },
    { id: "hex-decode", name: "From Hex", cat: "Encoding", run: (s) => CL.bytesToText(CL.hexToBytes(s)), about: "Reads hex digits back into text. Spaces are ignored." },
    { id: "binary-encode", name: "To Binary", cat: "Encoding", run: (s) => CL.bytesToBinary(CL.utf8Bytes(s)), about: "Shows each byte as eight bits.", example: { in: "A", out: "01000001" } },
    { id: "binary-decode", name: "From Binary", cat: "Encoding", run: (s) => CL.bytesToText(CL.binaryToBytes(s)), about: "Reads 8-bit binary groups back into text." },
    { id: "decimal-encode", name: "To Decimal", cat: "Encoding", run: (s) => CL.decimalEncode(s), about: "Character codes in base 10, space separated.", example: { in: "ABC", out: "65 66 67" } },
    { id: "decimal-decode", name: "From Decimal", cat: "Encoding", run: (s) => CL.decimalDecode(s), about: "Turns decimal character codes back into text." },
    { id: "octal-encode", name: "To Octal", cat: "Encoding", run: (s) => CL.octalEncode(s), about: "Character codes in base 8." },
    { id: "octal-decode", name: "From Octal", cat: "Encoding", run: (s) => CL.octalDecode(s), about: "Turns octal codes back into text." },
    { id: "url-encode", name: "URL Encode", cat: "Encoding", run: (s) => encodeURIComponent(s), about: "Percent-encodes characters unsafe in a URL.", example: { in: "a b", out: "a%20b" } },
    { id: "url-decode", name: "URL Decode", cat: "Encoding", run: (s) => decodeURIComponent(s), about: "Reverses percent-encoding." },
    { id: "html-encode", name: "HTML Encode", cat: "Encoding", run: (s) => CL.htmlEncode(s), about: "Escapes &, <, >, quotes for safe HTML.", example: { in: "<b>", out: "&lt;b&gt;" } },
    { id: "html-decode", name: "HTML Decode", cat: "Encoding", run: (s) => CL.htmlDecode(s), about: "Turns HTML entities back into characters." },
    { id: "unicode-escape", name: "To \\u Escapes", cat: "Encoding", run: (s) => CL.unicodeEscape(s), about: "Escapes every character as \\uXXXX.", example: { in: "Ab", out: "\\u0041\\u0062" } },
    { id: "unicode-unescape", name: "From \\u Escapes", cat: "Encoding", run: (s) => CL.unicodeUnescape(s), about: "Decodes \\uXXXX escapes." },
    { id: "json-escape", name: "JSON String Escape", cat: "Encoding", run: (s) => CL.jsonEscape(s), about: "Escapes quotes, backslashes and newlines so text fits inside a JSON string." },
    { id: "json-unescape", name: "JSON String Unescape", cat: "Encoding", run: (s) => CL.jsonUnescape(s), about: "Turns JSON string escapes back into raw text." },
    { id: "morse-encode", name: "To Morse", cat: "Encoding", run: (s) => CL.morseEncode(s), about: "Letters and digits to Morse; words split by /.", example: { in: "SOS", out: "... --- ..." } },
    { id: "morse-decode", name: "From Morse", cat: "Encoding", run: (s) => CL.morseDecode(s), about: "Dots and dashes back into text." },
    { id: "nato-encode", name: "To NATO Phonetic", cat: "Encoding", run: (s) => CL.natoEncode(s), about: "Alpha, Bravo, Charlie… spelling.", example: { in: "SOS", out: "Sierra Oscar Sierra" } },

    // Ciphers
    { id: "rot13", name: "ROT13", cat: "Ciphers", run: (s) => CL.caesar(s, 13), about: "Rotates letters by 13. Applying twice restores the text.", example: { in: "Hello", out: "Uryyb" } },
    { id: "rot47", name: "ROT47", cat: "Ciphers", run: (s) => CL.rot47(s), about: "Rotates printable ASCII by 47. Its own inverse." },
    { id: "caesar", name: "Caesar Cipher", cat: "Ciphers", params: [{ name: "shift", label: "Shift", type: "number", def: 3 }], run: (s, p) => CL.caesar(s, parseInt(p.shift, 10) || 0), about: "Shifts letters by a fixed amount." },
    { id: "atbash", name: "Atbash Cipher", cat: "Ciphers", run: (s) => CL.atbash(s), about: "Mirrors the alphabet (A↔Z). Its own inverse.", example: { in: "abc", out: "zyx" } },
    { id: "a1z26-encode", name: "A1Z26 Encode", cat: "Ciphers", run: (s) => CL.a1z26Encode(s), about: "Letters to their position number (A=1).", example: { in: "abc", out: "1 2 3" } },
    { id: "a1z26-decode", name: "A1Z26 Decode", cat: "Ciphers", run: (s) => CL.a1z26Decode(s), about: "Numbers back into letters." },
    { id: "vigenere-encode", name: "Vigenère Encode", cat: "Ciphers", params: [{ name: "key", label: "Key", type: "text", def: "KEY" }], run: (s, p) => CL.vigenereEncode(s, p.key), about: "Shifts each letter by a repeating keyword.", example: { in: "ATTACK", out: "KXRKGI" } },
    { id: "vigenere-decode", name: "Vigenère Decode", cat: "Ciphers", params: [{ name: "key", label: "Key", type: "text", def: "KEY" }], run: (s, p) => CL.vigenereDecode(s, p.key), about: "Reverses a Vigenère cipher with the same key." },
    { id: "railfence-encode", name: "Rail Fence Encode", cat: "Ciphers", params: [{ name: "rails", label: "Rails", type: "number", def: 3 }], run: (s, p) => CL.railFenceEncode(s, parseInt(p.rails, 10) || 2), about: "A transposition cipher — writes the text in a zigzag across N rails, then reads each rail off in order. Unlike every other cipher here, it scrambles position rather than substituting letters, so letter frequencies stay unchanged.", example: { in: "WEAREDISCOVEREDFLEEATONCE", out: "WECRLTEERDSOEEFEAOCAIVDEN" } },
    { id: "railfence-decode", name: "Rail Fence Decode", cat: "Ciphers", params: [{ name: "rails", label: "Rails", type: "number", def: 3 }], run: (s, p) => CL.railFenceDecode(s, parseInt(p.rails, 10) || 2), about: "Reverses a Rail Fence cipher — you need the same rail count used to encode." },
    { id: "xor", name: "XOR", cat: "Ciphers", params: [{ name: "key", label: "Key", type: "text", def: "key" }, { name: "mode", label: "Direction", type: "select", def: "enc", options: [{ v: "enc", t: "Text → Hex" }, { v: "dec", t: "Hex → Text" }] }], run: (s, p) => (p.mode === "dec" ? CL.xorFromHex(s, p.key) : CL.xorHexOut(s, p.key)), about: "XORs bytes with a repeating key. Encrypt text to hex, or decrypt hex back to text." },
    { id: "caesar-brute", name: "Caesar Brute Force", cat: "Ciphers", run: (s) => {
        const results = CL.caesarBruteForce(s, 26);
        const lines = results.map((r) => "shift " + String(r.shift).padStart(2, " ") + "  " + r.preview.slice(0, 76));
        return "Ranked by how much each shift reads like English — check the top few by eye:\n\n" + lines.join("\n");
      }, about: "Tries all 26 Caesar shifts and ranks them by English letter frequency and common-word matches. A ranked shortlist for you to eyeball, not a guaranteed single answer." },
    { id: "xor-brute", name: "XOR Brute Force", cat: "Ciphers", params: [{ name: "mode", label: "Input is", type: "select", def: "hex", options: [{ v: "hex", t: "Hex" }, { v: "text", t: "Text" }] }], run: (s, p) => {
        const results = CL.xorBruteForce(s, p.mode === "hex", 20);
        const lines = results.map((r, i) => "#" + (i + 1) + "  key 0x" + r.keyHex + "  " + r.preview.slice(0, 70).replace(/[\r\n]/g, " "));
        return "Top 20 single-byte XOR keys, ranked by how much they read like English — check the top few by eye:\n\n" + lines.join("\n");
      }, about: "Tries all 256 single-byte XOR keys and ranks them by how English-like the result is. A ranked shortlist for you to eyeball, not a guaranteed single answer — see the XOR lesson." },

    // Bitwise
    { id: "bit-and", name: "AND", cat: "Bitwise", params: [{ name: "key", label: "Key", type: "text", def: "key" }], run: (s, p) => CL.bitAndHex(s, p.key), about: "Bitwise AND with a repeating key, output as hex. A bit is 1 only if both inputs are 1." },
    { id: "bit-or", name: "OR", cat: "Bitwise", params: [{ name: "key", label: "Key", type: "text", def: "key" }], run: (s, p) => CL.bitOrHex(s, p.key), about: "Bitwise OR with a repeating key, output as hex. A bit is 1 if either input is 1." },
    { id: "bit-not", name: "NOT", cat: "Bitwise", run: (s) => CL.bitNot(s), about: "Flips every bit, output as hex. No key needed — applying it twice restores the original." },
    { id: "mod-add", name: "ADD (mod 256)", cat: "Bitwise", params: [{ name: "key", label: "Key", type: "text", def: "key" }], run: (s, p) => CL.modAddHex(s, p.key), about: "Adds a repeating key to each byte, wrapping at 256, output as hex. Reversed by SUB with the same key." },
    { id: "mod-sub", name: "SUB (mod 256)", cat: "Bitwise", params: [{ name: "key", label: "Key", type: "text", def: "key" }], run: (s, p) => CL.modSubHex(s, p.key), about: "Subtracts a repeating key from each byte, wrapping at 256, output as hex. Reverses ADD with the same key." },
    { id: "bit-shift-left", name: "Bit Shift Left", cat: "Bitwise", params: [{ name: "amount", label: "Bits", type: "number", def: 1 }], run: (s, p) => CL.bitShift(s, parseInt(p.amount, 10) || 0, "left"), about: "Shifts the bits of each byte left independently, output as hex. Bits shifted past the top are discarded — not reversible." },
    { id: "bit-shift-right", name: "Bit Shift Right", cat: "Bitwise", params: [{ name: "amount", label: "Bits", type: "number", def: 1 }], run: (s, p) => CL.bitShift(s, parseInt(p.amount, 10) || 0, "right"), about: "Shifts the bits of each byte right independently, output as hex. Bits shifted past the bottom are discarded — not reversible." },
    { id: "bit-rotate-left", name: "Rotate Bits Left", cat: "Bitwise", params: [{ name: "amount", label: "Bits", type: "number", def: 1 }], run: (s, p) => CL.rotateBits(s, parseInt(p.amount, 10) || 0, "left"), about: "Rotates the 8 bits of each byte left independently, output as hex. No bits are lost — Rotate Right by the same amount reverses it." },
    { id: "bit-rotate-right", name: "Rotate Bits Right", cat: "Bitwise", params: [{ name: "amount", label: "Bits", type: "number", def: 1 }], run: (s, p) => CL.rotateBits(s, parseInt(p.amount, 10) || 0, "right"), about: "Rotates the 8 bits of each byte right independently, output as hex. No bits are lost — Rotate Left by the same amount reverses it." },

    // Hashing
    { id: "md5", name: "MD5", cat: "Hashing", run: (s) => CL.md5(CL.utf8Bytes(s)), about: "128-bit hash. One-way. Broken for security — checksums only.", warn: true },
    { id: "sha1", name: "SHA-1", cat: "Hashing", run: (s) => CL.shaHex("SHA-1", CL.utf8Bytes(s)), about: "160-bit hash. One-way. Deprecated for security.", warn: true },
    { id: "sha256", name: "SHA-256", cat: "Hashing", run: (s) => CL.shaHex("SHA-256", CL.utf8Bytes(s)), about: "256-bit SHA-2 hash. One-way. A good default." },
    { id: "sha384", name: "SHA-384", cat: "Hashing", run: (s) => CL.shaHex("SHA-384", CL.utf8Bytes(s)), about: "384-bit SHA-2 hash. One-way." },
    { id: "sha512", name: "SHA-512", cat: "Hashing", run: (s) => CL.shaHex("SHA-512", CL.utf8Bytes(s)), about: "512-bit SHA-2 hash. One-way." },
    { id: "crc32", name: "CRC-32", cat: "Hashing", run: (s) => CL.crc32(CL.utf8Bytes(s)), about: "32-bit checksum for detecting accidental changes. Not for security." },
    { id: "hmac-sha256", name: "HMAC-SHA256", cat: "Hashing", params: [{ name: "key", label: "Key", type: "text", def: "key" }], run: (s, p) => CL.hmacHex("SHA-256", p.key, s), about: "Keyed hash — proves a message came from someone who knows the key." },
    { id: "hmac-sha512", name: "HMAC-SHA512", cat: "Hashing", params: [{ name: "key", label: "Key", type: "text", def: "key" }], run: (s, p) => CL.hmacHex("SHA-512", p.key, s), about: "Keyed hash using SHA-512." },
    { id: "blake2b-256", name: "BLAKE2b-256", cat: "Hashing", run: (s) => CL.bytesToHex(CL_CRYPTO.blake2b(CL.utf8Bytes(s), 32), false), about: "256-bit BLAKE2b hash — faster than SHA-2 in software, used by WireGuard and others. One-way." },
    { id: "blake2b-512", name: "BLAKE2b-512", cat: "Hashing", run: (s) => CL.bytesToHex(CL_CRYPTO.blake2b(CL.utf8Bytes(s), 64), false), about: "512-bit BLAKE2b hash, full-width output. One-way." },
    { id: "pbkdf2", name: "PBKDF2", cat: "Hashing", slow: true,
      params: [
        { name: "salt", label: "Salt", type: "text", def: "somesalt" },
        { name: "iterations", label: "Iterations", type: "number", def: 100000 },
        { name: "hash", label: "Hash", type: "select", def: "SHA-256", options: [{ v: "SHA-256", t: "SHA-256" }, { v: "SHA-384", t: "SHA-384" }, { v: "SHA-512", t: "SHA-512" }] },
        { name: "keylen", label: "Output bytes", type: "number", def: 32 }
      ],
      run: async (s, p) => {
        if (!hasSubtle) throw new Error("Needs a secure context — open this site via http://localhost.");
        const key = await crypto.subtle.importKey("raw", CL.utf8Bytes(s), "PBKDF2", false, ["deriveBits"]);
        const iterations = Math.min(2000000, Math.max(1, parseInt(p.iterations, 10) || 100000));
        const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: CL.utf8Bytes(p.salt || ""), iterations, hash: p.hash || "SHA-256" }, key, (Math.min(64, Math.max(4, parseInt(p.keylen, 10) || 32))) * 8);
        return CL.bytesToHex(new Uint8Array(bits), false);
      },
      about: "Derives a key from the input (as a password) using PBKDF2, a standard iterated password hash backed by your browser's native crypto. OWASP recommends 600,000+ iterations with SHA-256 for real accounts." },
    { id: "argon2id", name: "Argon2id", cat: "Hashing", slow: true,
      params: [
        { name: "salt", label: "Salt (min 8 characters)", type: "text", def: "somesalt" },
        { name: "memory", label: "Memory (KiB, max 512)", type: "number", def: 256 },
        { name: "iterations", label: "Iterations (max 3)", type: "number", def: 2 },
        { name: "keylen", label: "Output bytes", type: "number", def: 32 }
      ],
      run: (s, p) => {
        const salt = CL.utf8Bytes(p.salt || "");
        if (salt.length < 8) throw new Error("Argon2id needs a salt of at least 8 bytes.");
        const m = Math.min(512, Math.max(8, parseInt(p.memory, 10) || 256));
        const t = Math.min(3, Math.max(1, parseInt(p.iterations, 10) || 2));
        const tagLen = Math.min(64, Math.max(4, parseInt(p.keylen, 10) || 32));
        const tag = CL_CRYPTO.argon2id({ password: CL.utf8Bytes(s), salt, m, t, p: 1, tagLen });
        return CL.bytesToHex(tag, false);
      },
      about: "Argon2id — the modern, memory-hard password hash recommended by OWASP. This runs single-threaded in pure JavaScript, so memory and iterations are capped low here to stay responsive; real deployments use far higher cost (OWASP suggests 19+ MiB) via a server-side library." },

    // Text
    { id: "uppercase", name: "Upper case", cat: "Text", run: (s) => s.toUpperCase(), about: "All letters to upper case." },
    { id: "lowercase", name: "Lower case", cat: "Text", run: (s) => s.toLowerCase(), about: "All letters to lower case." },
    { id: "reverse", name: "Reverse text", cat: "Text", run: (s) => Array.from(s).reverse().join(""), about: "Reverses characters (Unicode-aware)." },
    { id: "reverse-lines", name: "Reverse lines", cat: "Text", run: (s) => s.split(/\r?\n/).reverse().join("\n"), about: "Reverses the order of lines." },
    { id: "sort-lines", name: "Sort lines", cat: "Text", params: [{ name: "order", label: "Order", type: "select", def: "asc", options: [{ v: "asc", t: "A → Z" }, { v: "desc", t: "Z → A" }, { v: "num", t: "Numeric" }, { v: "len", t: "By length" }] }], run: (s, p) => { const l = s.split(/\r?\n/); if (p.order === "num") l.sort((a, b) => parseFloat(a) - parseFloat(b)); else if (p.order === "len") l.sort((a, b) => a.length - b.length); else { l.sort(); if (p.order === "desc") l.reverse(); } return l.join("\n"); }, about: "Sorts lines alphabetically, numerically or by length." },
    { id: "reverse-words", name: "Reverse words", cat: "Text", run: (s) => s.split(/(\s+)/).reverse().join(""), about: "Reverses the order of words while keeping spacing." },
    { id: "swap-case", name: "Swap case", cat: "Text", run: (s) => s.replace(/[a-z]/gi, (c) => (c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase())), about: "Turns lower case to upper and vice-versa." },
    { id: "trim-lines", name: "Trim lines", cat: "Text", run: (s) => s.split(/\r?\n/).map((l) => l.trim()).join("\n"), about: "Removes leading and trailing whitespace from each line." },
    { id: "slugify", name: "Slugify", cat: "Text", run: (s) => CL.stripAccents(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""), about: "Makes a URL-friendly slug.", example: { in: "Héllo World!", out: "hello-world" } },
    { id: "dedupe-lines", name: "Unique lines", cat: "Text", run: (s) => { const seen = new Set(); return s.split(/\r?\n/).filter((l) => (seen.has(l) ? false : seen.add(l))).join("\n"); }, about: "Removes duplicate lines, keeping the first." },
    { id: "remove-empty", name: "Remove empty lines", cat: "Text", run: (s) => s.split(/\r?\n/).filter((l) => l.trim() !== "").join("\n"), about: "Drops blank lines." },
    { id: "remove-whitespace", name: "Remove whitespace", cat: "Text", run: (s) => s.replace(/\s+/g, ""), about: "Strips all spaces, tabs and newlines." },
    { id: "line-numbers", name: "Add line numbers", cat: "Text", run: (s) => s.split(/\r?\n/).map((l, i) => (i + 1) + "  " + l).join("\n"), about: "Prefixes each line with its number." },
    { id: "change-case", name: "Change case", cat: "Text", params: [{ name: "mode", label: "Style", type: "select", def: "title", options: [{ v: "upper", t: "UPPER CASE" }, { v: "lower", t: "lower case" }, { v: "title", t: "Title Case" }, { v: "camel", t: "camelCase" }, { v: "snake", t: "snake_case" }, { v: "kebab", t: "kebab-case" }] }], run: (s, p) => CL.changeCase(s, p.mode), about: "Converts between common naming styles." },
    { id: "strip-accents", name: "Strip accents", cat: "Text", run: (s) => CL.stripAccents(s), about: "Removes diacritics, turning café into cafe.", example: { in: "café", out: "cafe" } },
    { id: "find-replace", name: "Find & Replace", cat: "Text", params: [{ name: "find", label: "Find", type: "text", def: "" }, { name: "replace", label: "Replace with", type: "text", def: "" }, { name: "mode", label: "Match", type: "select", def: "plain", options: [{ v: "plain", t: "Plain text" }, { v: "regex", t: "Regex" }] }], run: (s, p) => { if (!p.find) return s; if (p.mode === "regex") return s.replace(new RegExp(p.find, "g"), p.replace); return s.split(p.find).join(p.replace); }, about: "Replaces text. Choose plain or regular-expression matching." },
    { id: "json-format", name: "JSON Beautify", cat: "Text", run: (s) => JSON.stringify(JSON.parse(s), null, 2), about: "Pretty-prints JSON. Errors on invalid input." },
    { id: "json-minify", name: "JSON Minify", cat: "Text", run: (s) => JSON.stringify(JSON.parse(s)), about: "Removes whitespace from JSON." },
    { id: "line-endings", name: "Convert line endings", cat: "Text", params: [{ name: "to", label: "Convert to", type: "select", def: "lf", options: [{ v: "lf", t: "LF (Unix/Mac)" }, { v: "crlf", t: "CRLF (Windows)" }] }], run: (s, p) => CL.convertLineEndings(s, p.to), about: "Normalises line endings to LF or CRLF." },
    { id: "strip-html", name: "Strip HTML tags", cat: "Text", run: (s) => CL.stripHtmlTags(s), about: "Removes anything between < and >, leaving just the text content.", example: { in: "<b>Hi</b>", out: "Hi" } },
    { id: "word-wrap", name: "Word wrap", cat: "Text", params: [{ name: "width", label: "Width (chars)", type: "number", def: 80 }], run: (s, p) => CL.wordWrap(s, parseInt(p.width, 10) || 80), about: "Breaks long lines at word boundaries near the given width." },

    // Data
    { id: "jwt-decode", name: "JWT Inspect", cat: "Data", run: (s) => { const p = CL.parseJwt(s.trim()); return "// header\n" + JSON.stringify(p.header, null, 2) + "\n\n// payload\n" + JSON.stringify(p.payload, null, 2) + "\n\n// signature\n" + p.signature; }, about: "Splits a JWT and shows its header and payload. They are only encoded, not encrypted." },
    { id: "entropy", name: "Entropy", cat: "Data", run: (s) => { const e = CL.entropy(CL.utf8Bytes(s)); return e.toFixed(4) + " bits per byte (0 = uniform, 8 = random)"; }, about: "Shannon entropy of the input bytes — high values suggest compressed or encrypted data." },
    { id: "extract", name: "Extract", cat: "Data", params: [{ name: "mode", label: "Find", type: "select", def: "emails", options: [{ v: "emails", t: "Email addresses" }, { v: "urls", t: "URLs" }, { v: "ipv4", t: "IPv4 addresses" }, { v: "numbers", t: "Numbers" }] }], run: (s, p) => CL.extract(s, p.mode), about: "Pulls out every match (emails, URLs, IPs or numbers), one per line." },
    { id: "unix-encode", name: "Date to Unix Time", cat: "Data", run: (s) => CL.dateToUnix(s), about: "Converts a date such as 2024-01-31 into a Unix timestamp (seconds)." },
    { id: "unix-decode", name: "Unix Time to Date", cat: "Data", run: (s) => CL.unixToDate(s), about: "Converts a Unix timestamp (seconds) into an ISO date.", example: { in: "0", out: "1970-01-01T00:00:00.000Z" } },
    { id: "change-base", name: "Change number base", cat: "Data", params: [{ name: "from", label: "From base", type: "select", def: "10", options: [{ v: "2", t: "Binary (2)" }, { v: "8", t: "Octal (8)" }, { v: "10", t: "Decimal (10)" }, { v: "16", t: "Hex (16)" }] }, { name: "to", label: "To base", type: "select", def: "16", options: [{ v: "2", t: "Binary (2)" }, { v: "8", t: "Octal (8)" }, { v: "10", t: "Decimal (10)" }, { v: "16", t: "Hex (16)" }] }], run: (s, p) => CL.changeBase(s, parseInt(p.from, 10), parseInt(p.to, 10)), about: "Converts a whole number between bases (handles very large numbers).", example: { in: "255 (10→16)", out: "ff" } },
    { id: "letter-frequency", name: "Letter frequency", cat: "Data", run: (s) => CL.letterFrequency(s), about: "Counts each A–Z letter — the first step in breaking substitution ciphers." },
    { id: "text-stats", name: "Text statistics", cat: "Data", run: (s) => { const w = s.trim() ? s.trim().split(/\s+/).length : 0; const l = s ? s.split(/\r?\n/).length : 0; return "Characters: " + s.length + "\nWords: " + w + "\nLines: " + l + "\nBytes (UTF-8): " + CL.utf8Bytes(s).length + "\nEntropy: " + CL.entropy(CL.utf8Bytes(s)).toFixed(3) + " bits/byte"; }, about: "A quick summary: characters, words, lines, bytes and entropy." },

    // Random (ignore input)
    { id: "gen-uuid", name: "UUID", cat: "Random", ignoresInput: true, run: () => CL.uuid(), about: "A random version-4 UUID from secure randomness." },
    { id: "gen-password", name: "Password", cat: "Random", ignoresInput: true, params: [{ name: "len", label: "Length", type: "number", def: 16 }], run: (s, p) => CL.password(parseInt(p.len, 10) || 16), about: "A strong random password." },
    { id: "gen-hex", name: "Random Hex", cat: "Random", ignoresInput: true, params: [{ name: "bytes", label: "Bytes", type: "number", def: 16 }], run: (s, p) => CL.bytesToHex(CL.randomBytes(parseInt(p.bytes, 10) || 16), false), about: "Random hex string." },
    { id: "gen-base64", name: "Random Base64", cat: "Random", ignoresInput: true, params: [{ name: "bytes", label: "Bytes", type: "number", def: 16 }], run: (s, p) => CL.bytesToBase64(CL.randomBytes(parseInt(p.bytes, 10) || 16)), about: "Random Base64 string." },
    { id: "gen-bytes", name: "Random Bytes", cat: "Random", ignoresInput: true, params: [{ name: "count", label: "Count", type: "number", def: 32 }], run: (s, p) => CL.bytesToHex(CL.randomBytes(parseInt(p.count, 10) || 32), true), about: "Random bytes shown as spaced hex." }
  ];
  const OP_BY_ID = Object.fromEntries(OPS.map((o) => [o.id, o]));
  const COMMON = ["base64-encode", "base64-decode", "hex-encode", "hex-decode", "url-encode", "url-decode", "sha256", "rot13"];
  const CAT_ORDER = ["Encoding", "Ciphers", "Bitwise", "Hashing", "Text", "Data", "Random"];

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  let steps = [];         // [{ opId, params, enabled }]
  let uidCounter = 1;

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  let toastTimer;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.remove("hidden"); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add("hidden"), 1700); }
  async function copyText(text) { try { await navigator.clipboard.writeText(text); toast("Copied"); } catch (e) { toast("Copy failed"); } }
  function download(name, text) { const b = new Blob([text], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name; a.click(); URL.revokeObjectURL(a.href); }
  function bytesLen(s) { return CL.utf8Bytes(s).length; }
  function escapeHtml(s) { return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }

  function showView(name) {
    $$(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + name));
    $$(".nav-item").forEach((n) => n.classList.toggle("active", n.dataset.view === name));
    if (name === "learn") renderMap();
  }

  // -------------------------------------------------------------------------
  // Operations list
  // -------------------------------------------------------------------------
  function renderOps(filter) {
    const list = $("#op-list");
    list.innerHTML = "";
    const q = (filter || "").toLowerCase().trim();
    const match = (o) => o.name.toLowerCase().includes(q) || o.cat.toLowerCase().includes(q);

    const addBtn = (o) => {
      const b = document.createElement("button");
      b.className = "op-btn";
      b.title = o.about || "";
      b.draggable = true;
      b.innerHTML = `<span>${escapeHtml(o.name)}</span><span class="plus">+</span>`;
      b.addEventListener("click", () => addStep(o.id));
      b.addEventListener("dragstart", (e) => { drag = { kind: "new", opId: o.id }; b.classList.add("dragging"); if (e.dataTransfer) e.dataTransfer.effectAllowed = "copy"; });
      b.addEventListener("dragend", () => { drag = null; b.classList.remove("dragging"); clearDropMarker(); $("#steps-scroll").classList.remove("drag-over"); });
      list.appendChild(b);
    };
    const group = (title, ops) => {
      if (!ops.length) return;
      const h = document.createElement("div"); h.className = "op-group-title"; h.textContent = title; list.appendChild(h);
      ops.forEach(addBtn);
    };

    if (!q) group("Common", COMMON.map((id) => OP_BY_ID[id]));
    CAT_ORDER.forEach((cat) => group(cat, OPS.filter((o) => o.cat === cat && match(o))));
    if (q && !$(".op-btn", list)) { const p = document.createElement("p"); p.className = "muted small"; p.style.padding = "8px 9px"; p.textContent = "No operations match."; list.appendChild(p); }
  }

  // -------------------------------------------------------------------------
  // Steps
  // -------------------------------------------------------------------------
  function defaultParams(op) {
    const p = {};
    (op.params || []).forEach((pr) => { p[pr.name] = pr.def; });
    return p;
  }
  function newStep(opId) {
    const op = OP_BY_ID[opId];
    return { uid: uidCounter++, opId, params: defaultParams(op), enabled: true, slowResult: null, slowKey: null };
  }
  function addStep(opId) {
    steps.push(newStep(opId));
    renderSteps(); bake();
    showView("workbench");
  }

  let drag = null; // { kind: "new", opId } while dragging from ops, or { kind: "move", index } while reordering
  function renderSteps() {
    const ol = $("#steps");
    ol.innerHTML = "";
    $("#steps-empty").style.display = steps.length ? "none" : "block";

    steps.forEach((step, i) => {
      const op = OP_BY_ID[step.opId];
      const li = document.createElement("li");
      li.className = "step" + (step.enabled ? "" : " disabled");
      li.draggable = false;
      li.dataset.index = i;

      const head = document.createElement("div");
      head.className = "step-head";
      head.innerHTML = `
        <span class="step-drag" title="Drag to reorder" draggable="false">⋮⋮</span>
        <span class="step-num">${i + 1}</span>
        <span class="step-name">${escapeHtml(op.name)}</span>`;
      const toggle = document.createElement("input");
      toggle.type = "checkbox"; toggle.className = "step-toggle"; toggle.checked = step.enabled; toggle.title = "Enable / disable";
      toggle.addEventListener("change", () => { step.enabled = toggle.checked; li.classList.toggle("disabled", !step.enabled); bake(); });
      const remove = document.createElement("button");
      remove.className = "step-remove"; remove.textContent = "×"; remove.title = "Remove step";
      remove.addEventListener("click", () => { steps.splice(i, 1); renderSteps(); bake(); });
      head.appendChild(toggle); head.appendChild(remove);
      li.appendChild(head);

      if (op.params && op.params.length) {
        const box = document.createElement("div");
        box.className = "step-params";
        op.params.forEach((pr) => {
          const wrap = document.createElement("div"); wrap.className = "param";
          const lab = document.createElement("label"); lab.textContent = pr.label; wrap.appendChild(lab);
          let field;
          if (pr.type === "select") {
            field = document.createElement("select");
            pr.options.forEach((o) => { const opt = document.createElement("option"); opt.value = o.v; opt.textContent = o.t; field.appendChild(opt); });
            field.value = step.params[pr.name];
            field.addEventListener("change", () => { step.params[pr.name] = field.value; bake(); });
          } else {
            field = document.createElement("input");
            field.type = pr.type === "number" ? "number" : "text";
            field.value = step.params[pr.name];
            field.addEventListener("input", () => { step.params[pr.name] = field.value; scheduleBake(); });
          }
          wrap.appendChild(field); box.appendChild(wrap);
        });
        li.appendChild(box);
      }

      if (op.slow) {
        const row = document.createElement("div");
        row.className = "step-compute";
        const btn = document.createElement("button");
        btn.className = "mini step-compute-btn"; btn.textContent = "Compute";
        const status = document.createElement("span");
        status.className = "step-compute-status muted small";
        status.textContent = step.slowResult ? "Last result: " + step.slowResult.slice(0, 40) + (step.slowResult.length > 40 ? "…" : "") : "Not computed yet — this step is too heavy to run on every keystroke.";
        btn.addEventListener("click", async () => {
          btn.disabled = true; btn.textContent = "Computing…";
          await new Promise((r) => setTimeout(r, 0)); // let the button repaint before the heavy synchronous work
          try {
            const pre = await runPipeline(steps.slice(0, i));
            if (pre.pausedAt >= 0) { toast("Compute step " + (pre.pausedAt + 1) + " first."); return; }
            if (pre.error) { toast(pre.error); return; }
            const result = String(await Promise.resolve(op.run(op.ignoresInput ? "" : pre.value, step.params)));
            step.slowResult = result;
            step.slowKey = JSON.stringify({ v: op.ignoresInput ? "" : pre.value, p: step.params });
          } catch (e) {
            toast(op.name + ": " + e.message);
          } finally {
            btn.disabled = false;
          }
          renderSteps(); bake();
        });
        row.appendChild(btn); row.appendChild(status);
        li.appendChild(row);
      }

      const handle = $(".step-drag", head);
      handle.addEventListener("mousedown", () => { li.draggable = true; });
      li.addEventListener("dragstart", () => { drag = { kind: "move", index: i }; li.classList.add("dragging"); });
      li.addEventListener("dragend", () => { li.classList.remove("dragging"); li.draggable = false; drag = null; clearDropMarker(); $("#steps-scroll").classList.remove("drag-over"); });

      ol.appendChild(li);
    });
  }

  // Drop-position helpers for the steps list (drag ops in, or reorder existing steps)
  function stepsDropIndex(clientY) {
    const stepEls = $$("#steps .step");
    for (let i = 0; i < stepEls.length; i++) {
      const r = stepEls[i].getBoundingClientRect();
      if (clientY < r.top + r.height / 2) return i;
    }
    return stepEls.length;
  }
  function clearDropMarker() {
    $$("#steps .step").forEach((s) => s.classList.remove("drop-before"));
    const ol = $("#steps"); if (ol) ol.classList.remove("drop-end");
  }
  function showDropMarker(idx) {
    clearDropMarker();
    const stepEls = $$("#steps .step");
    if (idx >= stepEls.length) $("#steps").classList.add("drop-end");
    else stepEls[idx].classList.add("drop-before");
  }
  function initStepsDnd() {
    const scroll = $("#steps-scroll");
    scroll.addEventListener("dragover", (e) => {
      if (!drag) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = drag.kind === "new" ? "copy" : "move";
      scroll.classList.add("drag-over");
      showDropMarker(stepsDropIndex(e.clientY));
    });
    scroll.addEventListener("dragleave", (e) => { if (e.target === scroll) { scroll.classList.remove("drag-over"); clearDropMarker(); } });
    scroll.addEventListener("drop", (e) => {
      if (!drag) return;
      e.preventDefault();
      const idx = stepsDropIndex(e.clientY);
      if (drag.kind === "new") {
        steps.splice(idx, 0, newStep(drag.opId));
      } else {
        const from = drag.index, item = steps[from];
        steps.splice(from, 1);
        steps.splice(idx > from ? idx - 1 : idx, 0, item);
      }
      drag = null; scroll.classList.remove("drag-over"); clearDropMarker();
      renderSteps(); bake();
    });
  }

  // Instant bake. A sequence number guards against out-of-order async results
  // so fast typing through async hashes never shows stale output.
  let bakeSeq = 0;
  function scheduleBake() { bake(); }

  // Runs the given steps in order (a snapshot array, not the live `steps` variable —
  // see call sites). "Slow" steps (Argon2id, PBKDF2 — too heavy to run on every
  // keystroke) use their cached result if it still matches the current upstream
  // value/params, otherwise the pipeline stops there (pausedAt) until the user
  // clicks that step's Compute button.
  async function runPipeline(stepsSnapshot) {
    let value = $("#input").value;
    for (let idx = 0; idx < stepsSnapshot.length; idx++) {
      const step = stepsSnapshot[idx];
      if (!step.enabled) continue;
      const op = OP_BY_ID[step.opId];
      if (op.slow) {
        const key = JSON.stringify({ v: op.ignoresInput ? "" : value, p: step.params });
        if (step.slowKey === key && step.slowResult != null) { value = step.slowResult; continue; }
        return { value, pausedAt: idx, error: "" };
      }
      try { value = String(await Promise.resolve(op.run(op.ignoresInput ? "" : value, step.params))); }
      catch (e) { return { value, pausedAt: -1, error: op.name + ": " + e.message }; }
    }
    return { value, pausedAt: -1, error: "" };
  }

  async function bake() {
    const mine = ++bakeSeq;
    const snapshot = steps.slice();
    const result = await runPipeline(snapshot);
    if (mine !== bakeSeq) return; // a newer keystroke already started baking
    const { value, error, pausedAt } = result;
    $("#bake-notice").textContent = pausedAt >= 0 ? `Paused before step ${pausedAt + 1} (${OP_BY_ID[snapshot[pausedAt].opId].name}) — click its Compute button to continue.` : "";
    $("#output").value = error ? "" : value;
    $("#output-stats").textContent = error ? "" : `${value.length} chars · ${bytesLen(value)} bytes`;
    $("#bake-error").textContent = error;
  }

  // Suggest a decode step based on what the input looks like.
  const SUGGEST_OP = { base64: "base64-decode", base64url: "base64url-decode", hex: "hex-decode", binary: "binary-decode", morse: "morse-decode", url: "url-decode", json: "json-format", jwt: "jwt-decode" };
  function renderSuggestions() {
    const box = $("#wb-suggestions");
    box.innerHTML = "";
    const val = $("#input").value;
    if (!val.trim()) return;
    const found = CL.detect(val).filter((r) => r.action && SUGGEST_OP[r.action]).slice(0, 3);
    found.forEach((r) => {
      const op = OP_BY_ID[SUGGEST_OP[r.action]];
      const b = document.createElement("button");
      b.className = "suggestion";
      b.textContent = `Looks like ${r.label} — add ${op.name}`;
      b.addEventListener("click", () => addStep(op.id));
      box.appendChild(b);
    });
  }

  function updateInputStats() {
    const v = $("#input").value;
    const words = v.trim() ? v.trim().split(/\s+/).length : 0;
    const lines = v ? v.split(/\r?\n/).length : 0;
    $("#input-stats").textContent = `${v.length} chars · ${words} words · ${lines} lines`;
  }

  // -------------------------------------------------------------------------
  // Analyze
  // -------------------------------------------------------------------------
  let anHashSeq = 0;
  function initAnalyze() {
    const input = $("#an-input");
    const run = () => { renderDetect(input.value); renderStats(input.value); renderHashes(input.value); renderHistogram(input.value); renderCharTable(input.value); };
    input.addEventListener("input", run);

    const cmp = () => {
      const a = $("#cmp-a").value.trim().toLowerCase(), b = $("#cmp-b").value.trim().toLowerCase(), el = $("#cmp-result");
      if (!a || !b) { el.className = "cmp-result muted"; el.textContent = "Enter two hashes to compare."; return; }
      if (a === b) { el.className = "cmp-result cmp-match"; el.textContent = "Match — the two hashes are identical."; }
      else { el.className = "cmp-result cmp-diff"; el.textContent = "Different — these hashes do not match."; }
    };
    $("#cmp-a").addEventListener("input", cmp); $("#cmp-b").addEventListener("input", cmp);
    run();
  }

  // ---- Byte distribution: 32 buckets of 8 consecutive byte values each ----
  function renderHistogram(val) {
    const box = $("#an-histogram"), tip = $("#an-hist-tooltip");
    box.innerHTML = "";
    if (!val) { tip.classList.add("hidden"); return; }
    const counts = CL.byteHistogram(CL.utf8Bytes(val));
    const bucketed = [];
    for (let i = 0; i < 256; i += 8) bucketed.push(counts.slice(i, i + 8).reduce((s, x) => s + x, 0));
    const max = Math.max(1, ...bucketed);
    bucketed.forEach((count, i) => {
      const lo = i * 8, hi = lo + 7;
      const bar = document.createElement("div");
      bar.className = "hist-bar" + (count === 0 ? " empty" : "");
      bar.tabIndex = 0;
      const fill = document.createElement("span");
      // A non-zero bucket keeps a small minimum height so rare-but-present bytes stay
      // visible — only truly absent byte ranges (count 0) render as nothing.
      const pct = count === 0 ? 0 : Math.max(6, Math.round((count / max) * 100));
      fill.style.height = pct + "%";
      bar.appendChild(fill);
      const show = (e) => {
        tip.innerHTML = `<span class="hex">0x${lo.toString(16).padStart(2, "0")}–0x${hi.toString(16).padStart(2, "0")}</span>${count.toLocaleString()} byte${count === 1 ? "" : "s"}`;
        tip.classList.remove("hidden");
        const x = e.clientX !== undefined ? e.clientX : bar.getBoundingClientRect().left;
        const y = e.clientY !== undefined ? e.clientY : bar.getBoundingClientRect().top;
        tip.style.left = Math.min(x + 12, window.innerWidth - 180) + "px";
        tip.style.top = Math.max(10, y - 34) + "px";
      };
      bar.addEventListener("pointermove", show);
      bar.addEventListener("focus", show);
      bar.addEventListener("pointerenter", show);
      bar.addEventListener("pointerleave", () => tip.classList.add("hidden"));
      bar.addEventListener("blur", () => tip.classList.add("hidden"));
      box.appendChild(bar);
    });
  }

  // ---- Character inspector table ----
  function renderCharTable(val) {
    const box = $("#an-chars");
    if (!val) { box.innerHTML = '<p class="muted small">Enter text to inspect.</p>'; return; }
    const { chars, truncated } = CL.inspectChars(val, 200);
    const table = document.createElement("table");
    table.className = "char-table";
    table.innerHTML = "<thead><tr><th>#</th><th>Char</th><th>Code point</th><th>Decimal</th><th>UTF-8 bytes</th><th>HTML entity</th></tr></thead>";
    const tbody = document.createElement("tbody");
    chars.forEach((c) => {
      const tr = document.createElement("tr");
      const glyphClass = "char-glyph" + (c.decimal < 32 || c.decimal === 127 ? " ctrl" : "");
      tr.innerHTML = `<td>${c.index}</td><td><span class="${glyphClass}"></span></td><td>${c.codePoint}</td><td>${c.decimal}</td><td>${c.utf8Hex}</td><td></td>`;
      tr.children[1].firstChild.textContent = c.display;
      tr.children[5].textContent = c.html;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    box.innerHTML = "";
    box.appendChild(table);
    if (truncated) { const note = document.createElement("p"); note.className = "muted small"; note.style.marginTop = "8px"; note.textContent = "Showing the first 200 characters."; box.appendChild(note); }
  }


  // Reuses the exact same operation the Workbench would run (via SUGGEST_OP), so the
  // preview shown here is guaranteed to match what "Open in The Lab" actually produces.
  function renderDetect(val) {
    const box = $("#detect-results");
    const results = CL.detect(val);
    if (!results.length) { box.innerHTML = '<p class="muted small">Nothing recognised yet.</p>'; return; }
    box.innerHTML = "";
    results.forEach((r) => {
      const pct = Math.round(r.score * 100);
      const row = document.createElement("div"); row.className = "detect-row";
      const main = document.createElement("div"); main.className = "detect-main";
      main.innerHTML = `<span class="detect-label">${escapeHtml(r.label)}</span><span class="bar"><span style="width:${pct}%"></span></span><span class="pct">${pct}%</span>`;
      row.appendChild(main);

      const opId = r.action && SUGGEST_OP[r.action];
      if (opId) {
        const op = OP_BY_ID[opId];
        try {
          const preview = String(op.run(val, defaultParams(op)));
          const short = preview.length > 100 ? preview.slice(0, 100) + "…" : preview;
          const pv = document.createElement("div"); pv.className = "detect-preview";
          const code = document.createElement("code"); code.textContent = short || "(empty)";
          pv.appendChild(code); row.appendChild(pv);

          const actions = document.createElement("div"); actions.className = "detect-actions";
          const btn = document.createElement("button"); btn.className = "mini"; btn.textContent = "Open in The Lab";
          btn.addEventListener("click", () => {
            $("#input").value = val; steps = [newStep(op.id)];
            renderSteps(); bake(); updateInputStats(); showView("workbench");
          });
          actions.appendChild(btn); row.appendChild(actions);
        } catch (e) { /* the heuristic matched but decoding failed — show the label without a preview */ }
      }
      box.appendChild(row);
    });
  }

  function lineEndingStyle(val) {
    const crlf = /\r\n/.test(val), loneLf = /(^|[^\r])\n/.test(val), loneCr = /\r(?!\n)/.test(val);
    if (crlf && (loneLf || loneCr)) return "Mixed";
    if (crlf) return "CRLF (Windows)";
    if (loneLf) return "LF (Unix/Mac)";
    if (loneCr) return "CR (old Mac)";
    return "None (single line)";
  }

  function renderStats(val) {
    const bytes = CL.utf8Bytes(val);
    let letters = 0, digits = 0, spaces = 0, symbols = 0;
    for (const ch of val) { if (/[a-z]/i.test(ch)) letters++; else if (/[0-9]/.test(ch)) digits++; else if (/\s/.test(ch)) spaces++; else symbols++; }
    const words = val.trim() ? val.trim().split(/\s+/).length : 0;
    const lines = val ? val.split(/\r?\n/).length : 0;
    const ent = CL.entropy(bytes);
    const rows = [
      ["Characters", val.length], ["Bytes (UTF-8)", bytes.length], ["Words", words], ["Lines", lines],
      ["Line endings", val ? lineEndingStyle(val) : "—"],
      ["Unique chars", new Set(Array.from(val)).size], ["Letters", letters], ["Digits", digits],
      ["Symbols", symbols], ["Whitespace", spaces], ["Printable", Math.round(CL.printableRatio(bytes) * 100) + "%"],
      ["Entropy", ent.toFixed(3) + " / 8 bits"]
    ];
    $("#an-stats").innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${escapeHtml(String(v))}</dd>`).join("");
    $("#an-entropy-bar").style.width = (ent / 8 * 100) + "%";
  }

  async function renderHashes(val) {
    const my = ++anHashSeq;
    const box = $("#an-hashes");
    if (!val) { box.innerHTML = '<p class="muted small">Enter text to hash.</p>'; return; }
    const bytes = CL.utf8Bytes(val);
    const items = [["MD5", CL.md5(bytes)]];
    if (hasSubtle) {
      for (const algo of ["SHA-1", "SHA-256", "SHA-512"]) items.push([algo, await CL.shaHex(algo, bytes)]);
    }
    items.push(["CRC-32", CL.crc32(bytes)]);
    if (my !== anHashSeq) return;
    box.innerHTML = "";
    items.forEach(([name, hash]) => {
      const row = document.createElement("div"); row.className = "hash-row";
      row.innerHTML = `<span class="hash-name">${name}</span><code class="hash-val">${hash}</code>`;
      const b = document.createElement("button"); b.className = "mini"; b.textContent = "Copy"; b.addEventListener("click", () => copyText(hash));
      row.appendChild(b); box.appendChild(row);
    });
  }

  // -------------------------------------------------------------------------
  // Learn — Duolingo-style progression map (each lesson unlocks the next)
  // -------------------------------------------------------------------------
  function lessonProgress() { try { return JSON.parse(localStorage.getItem("bytelabs.lessons") || "{}"); } catch (e) { return {}; } }
  function saveLessonProgress(p) { localStorage.setItem("bytelabs.lessons", JSON.stringify(p)); }
  function lessonState(index, done) {
    const order = CL_DATA.LESSON_ORDER;
    if (done[order[index]]) return "done";
    if (index === 0 || done[order[index - 1]]) return "current";
    return "locked";
  }
  function lockSvg() { return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'; }

  function renderMap() {
    const map = $("#lesson-map"); if (!map) return;
    const order = CL_DATA.LESSON_ORDER, done = lessonProgress();
    const total = order.length, completed = order.filter((id) => done[id]).length;
    $("#lesson-progress").innerHTML =
      `<div class="lp-bar"><span style="width:${total ? (completed / total * 100) : 0}%"></span></div>` +
      `<div class="lp-text">${completed} of ${total} lessons complete</div>`;
    map.innerHTML = "";
    order.forEach((id, i) => {
      const lesson = CL_DATA.LESSONS.find((l) => l.id === id);
      const state = lessonState(i, done);
      const node = document.createElement("button");
      node.className = "map-node " + state + " pos-" + (i % 4);
      node.disabled = state === "locked";
      const icon = state === "done" ? "✓" : state === "locked" ? lockSvg() : (i + 1);
      node.innerHTML = `<span class="node-circle">${icon}</span><span class="node-label">${escapeHtml(lesson.title)}</span>`;
      if (state !== "locked") node.addEventListener("click", () => openLesson(id));
      map.appendChild(node);
    });
  }

  function openLesson(id) {
    const lesson = CL_DATA.LESSONS.find((l) => l.id === id);
    const view = $("#lesson-view");
    view.innerHTML = lesson.body;
    if (lesson.demo && lesson.demo.type !== "none") buildDemo(view, lesson.demo);
    if (lesson.quiz) buildQuiz(view, lesson);
    $("#lesson-modal").classList.remove("hidden");
    view.scrollTop = 0;
  }
  function closeLesson() { $("#lesson-modal").classList.add("hidden"); }

  const DEMO_FIELD2 = { xor: "Key", vigenere: "Key", caesar: "Shift", regex: "Pattern (regex)", railfence: "Rails" };
  function buildDemo(view, demo) {
    const wrap = document.createElement("div"); wrap.className = "demo";
    wrap.innerHTML = "<h4>Try it yourself</h4>";
    const in1 = document.createElement("input"); in1.className = "field mono"; in1.placeholder = "type here…";
    wrap.appendChild(in1);
    let in2 = null;
    if (DEMO_FIELD2[demo.type]) {
      const lab = document.createElement("label"); lab.className = "lbl"; lab.textContent = DEMO_FIELD2[demo.type]; wrap.appendChild(lab);
      in2 = document.createElement("input"); in2.className = "field mono";
      in2.value = demo.type === "caesar" || demo.type === "railfence" ? "3" : demo.type === "regex" ? "\\d+" : "key";
      wrap.appendChild(in2);
    }
    const outLbl = document.createElement("label"); outLbl.className = "lbl"; outLbl.textContent = "Result"; wrap.appendChild(outLbl);
    const out = document.createElement("div"); out.className = "demo-out"; wrap.appendChild(out);
    view.appendChild(wrap);
    const run = async () => { let res = ""; try { res = await demoCompute(demo.type, in1.value, in2 ? in2.value : ""); } catch (e) { res = e.message; } out.textContent = res; };
    in1.addEventListener("input", run); if (in2) in2.addEventListener("input", run);
  }
  async function demoCompute(t, v, k) {
    switch (t) {
      case "base64": return CL.bytesToBase64(CL.utf8Bytes(v));
      case "hex": return CL.bytesToHex(CL.utf8Bytes(v), true);
      case "url": return encodeURIComponent(v);
      case "rot13": return CL.caesar(v, 13);
      case "caesar": return CL.caesar(v, parseInt(k, 10) || 0);
      case "base32": return CL.base32Encode(CL.utf8Bytes(v));
      case "base58": return CL.base58Encode(CL.utf8Bytes(v));
      case "morse": return CL.morseEncode(v);
      case "atbash": return CL.atbash(v);
      case "entropy": return CL.entropy(CL.utf8Bytes(v)).toFixed(3) + " bits per byte";
      case "frequency": return CL.letterFrequency(v);
      case "crc": return "CRC-32: " + CL.crc32(CL.utf8Bytes(v));
      case "xor": return CL.xorHexOut(v, k);
      case "vigenere": return CL.vigenereEncode(v, k);
      case "railfence": return CL.railFenceEncode(v, parseInt(k, 10) || 2);
      case "regex": { const m = v.match(new RegExp(k, "g")); return m ? m.join("\n") : "(no matches)"; }
      case "jwt": return JSON.stringify(CL.parseJwt(v.trim()).payload, null, 2);
      case "hash": return hasSubtle ? await CL.shaHex("SHA-256", CL.utf8Bytes(v)) : CL.md5(CL.utf8Bytes(v)) + " (MD5)";
      default: return "";
    }
  }

  function buildQuiz(view, lesson) {
    const q = document.createElement("div"); q.className = "quiz";
    q.innerHTML = `<h4>Check your understanding</h4><div class="quiz-q">${escapeHtml(lesson.quiz.q)}</div>`;
    lesson.quiz.options.forEach((opt, i) => {
      const b = document.createElement("button"); b.className = "quiz-opt"; b.textContent = opt;
      b.addEventListener("click", () => {
        if (i === lesson.quiz.answer) { $$(".quiz-opt", q).forEach((x) => (x.disabled = true)); b.classList.add("right"); completeLesson(lesson.id, q); }
        else { b.classList.add("wrong"); b.disabled = true; }
      });
      q.appendChild(b);
    });
    view.appendChild(q);
  }
  function completeLesson(id, q) {
    const p = lessonProgress(); const firstTime = !p[id]; p[id] = true; saveLessonProgress(p);
    const order = CL_DATA.LESSON_ORDER, nextId = order[order.indexOf(id) + 1];
    const done = document.createElement("div"); done.className = "quiz-done";
    done.innerHTML = `<div class="quiz-done-msg">Lesson complete!${firstTime && nextId ? " You've unlocked the next one." : ""}</div>`;
    const cont = document.createElement("button"); cont.className = "btn lime";
    cont.textContent = nextId ? "Next lesson →" : "Back to map";
    cont.addEventListener("click", () => { closeLesson(); renderMap(); if (nextId) openLesson(nextId); });
    done.appendChild(cont); q.appendChild(done);
    done.scrollIntoView({ behavior: "smooth", block: "nearest" });
    renderMap(); toast("Lesson complete");
  }

  function initLearn() {
    renderMap();
    $("#lesson-close").addEventListener("click", closeLesson);
    $("#lesson-modal").addEventListener("click", (e) => { if (e.target.id === "lesson-modal") closeLesson(); });
  }

  // -------------------------------------------------------------------------
  // Challenges
  // -------------------------------------------------------------------------
  let chalFilter = "all";
  function loadDone() { try { return JSON.parse(localStorage.getItem("bytelabs.challenges") || "{}"); } catch (e) { return {}; } }
  function saveDone(d) { localStorage.setItem("bytelabs.challenges", JSON.stringify(d)); }

  function initChallenges() {
    const levels = ["all", "easy", "medium", "hard"];
    const fbox = $("#chal-filters");
    levels.forEach((lv) => {
      const b = document.createElement("button"); b.textContent = lv[0].toUpperCase() + lv.slice(1); if (lv === chalFilter) b.classList.add("active");
      b.addEventListener("click", () => { chalFilter = lv; $$("#chal-filters button").forEach((x) => x.classList.remove("active")); b.classList.add("active"); renderChallenges(); });
      fbox.appendChild(b);
    });
    renderChallenges();
  }
  function renderChallenges() {
    const wrap = $("#challenge-list"); const done = loadDone(); wrap.innerHTML = "";
    const all = CL_DATA.CHALLENGES;
    $("#challenge-progress").textContent = `${Object.keys(done).filter((k) => done[k]).length} of ${all.length} solved`;
    all.filter((c) => chalFilter === "all" || c.level === chalFilter).forEach((c) => {
      const card = document.createElement("div"); card.className = "challenge" + (done[c.id] ? " done" : "");
      card.innerHTML = `
        <div class="chal-top"><h3>${c.title}</h3>
          <span class="tag ${c.level}">${c.level}${done[c.id] ? '</span> <span class="badge">solved' : ""}</span></div>
        <div class="prompt">${c.prompt}</div>
        <div class="task">${escapeHtml(c.task)}</div>
        <input class="field mono" placeholder="your answer…" />
        <div class="row"><button class="btn">Check</button><button class="mini reveal">Hint</button></div>
        <div class="feedback"></div>`;
      const input = $("input", card), fb = $(".feedback", card);
      const check = () => {
        if (input.value.trim() === c.answer) {
          fb.innerHTML = '<span class="cmp-match">Correct.</span>'; const d = loadDone(); d[c.id] = true; saveDone(d); renderChallenges();
        } else fb.innerHTML = '<span class="cmp-diff">Not quite — try again.</span>';
      };
      $(".btn", card).addEventListener("click", check);
      $(".reveal", card).addEventListener("click", () => { fb.textContent = c.hint || "No hint for this one."; });
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); });
      wrap.appendChild(card);
    });
  }

  // -------------------------------------------------------------------------
  // Settings
  // -------------------------------------------------------------------------
  const DEFAULTS = { theme: "light", font: "14", wrap: false, anim: true };
  function loadSettings() { try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem("bytelabs.settings") || "{}")); } catch (e) { return Object.assign({}, DEFAULTS); } }
  function applySettings(s) {
    document.documentElement.setAttribute("data-theme", s.theme);
    document.documentElement.style.setProperty("--editor-font", s.font + "px");
    $$(".editor").forEach((e) => e.classList.toggle("wrap", s.wrap));
    document.body.classList.toggle("no-anim", !s.anim);
    $("#set-theme").value = s.theme; $("#set-font").value = s.font; $("#set-wrap").checked = s.wrap; $("#set-anim").checked = s.anim;
  }
  function initSettings() {
    applySettings(loadSettings());
    const save = () => {
      const ns = { theme: $("#set-theme").value, font: $("#set-font").value, wrap: $("#set-wrap").checked, anim: $("#set-anim").checked };
      localStorage.setItem("bytelabs.settings", JSON.stringify(ns)); applySettings(ns);
    };
    ["set-theme", "set-font", "set-wrap", "set-anim"].forEach((id) => $("#" + id).addEventListener("change", save));
    $("#set-reset").addEventListener("click", () => { localStorage.removeItem("bytelabs.settings"); applySettings(Object.assign({}, DEFAULTS)); toast("Settings reset"); });
  }

  // -------------------------------------------------------------------------
  // Search palette
  // -------------------------------------------------------------------------
  let paletteItems = [], paletteActive = 0;
  function buildIndex() {
    const items = [];
    OPS.forEach((o) => items.push({ label: o.name, kind: o.cat, run: () => { addStep(o.id); } }));
    CL_DATA.LESSONS.forEach((l) => items.push({ label: l.title, kind: "Lesson", run: () => {
      showView("learn");
      const idx = CL_DATA.LESSON_ORDER.indexOf(l.id);
      if (lessonState(idx, lessonProgress()) === "locked") toast("Finish the earlier lessons first");
      else openLesson(l.id);
    } }));
    CL_DATA.CHALLENGES.forEach((c) => items.push({ label: c.title, kind: "Challenge", run: () => showView("challenges") }));
    const views = { workbench: "The Lab", analyze: "Analyse", learn: "Lessons", challenges: "Challenges", settings: "Settings" };
    Object.keys(views).forEach((v) => items.push({ label: "Go to " + views[v], kind: "View", run: () => showView(v) }));
    return items;
  }
  function openPalette() { $("#palette").classList.remove("hidden"); const i = $("#palette-input"); i.value = ""; i.focus(); filterPalette(""); }
  function closePalette() { $("#palette").classList.add("hidden"); }
  function filterPalette(q) {
    const query = q.toLowerCase();
    paletteItems = buildIndex().filter((i) => i.label.toLowerCase().includes(query)).slice(0, 40);
    paletteActive = 0;
    const ul = $("#palette-results"); ul.innerHTML = "";
    paletteItems.forEach((i, n) => {
      const li = document.createElement("li"); if (n === 0) li.classList.add("active");
      li.innerHTML = `<span>${escapeHtml(i.label)}</span><span class="kind">${i.kind}</span>`;
      li.addEventListener("click", () => { i.run(); closePalette(); });
      ul.appendChild(li);
    });
  }
  function movePalette(dir) {
    const lis = $$("#palette-results li"); if (!lis.length) return;
    lis[paletteActive] && lis[paletteActive].classList.remove("active");
    paletteActive = (paletteActive + dir + lis.length) % lis.length;
    lis[paletteActive].classList.add("active"); lis[paletteActive].scrollIntoView({ block: "nearest" });
  }

  // -------------------------------------------------------------------------
  // Init
  // -------------------------------------------------------------------------
  function init() {
    $$(".nav-item").forEach((n) => n.addEventListener("click", () => showView(n.dataset.view)));

    renderOps("");
    $("#op-count").textContent = OPS.length + " ops";
    $("#op-filter").addEventListener("input", (e) => renderOps(e.target.value));
    $("#clear-steps").addEventListener("click", () => { steps = []; renderSteps(); bake(); });
    renderSteps();
    initStepsDnd();

    const onInput = () => { updateInputStats(); renderSuggestions(); bake(); };
    $("#input").addEventListener("input", onInput);
    $("#btn-clear-input").addEventListener("click", () => { $("#input").value = ""; onInput(); });
    $("#btn-paste").addEventListener("click", async () => { try { $("#input").value = await navigator.clipboard.readText(); onInput(); } catch (e) { toast("Clipboard not available"); } });
    $("#btn-load").addEventListener("click", () => $("#file-input-wb").click());
    $("#file-input-wb").addEventListener("change", async (e) => { const f = e.target.files[0]; if (!f) return; $("#input").value = await f.text(); onInput(); });
    $("#btn-copy").addEventListener("click", () => copyText($("#output").value));
    $("#btn-download").addEventListener("click", () => download("bytelabs-output.txt", $("#output").value));
    $("#btn-to-input").addEventListener("click", () => { $("#input").value = $("#output").value; onInput(); });

    initAnalyze(); initLearn(); initChallenges(); initSettings();

    $("#open-search").addEventListener("click", openPalette);
    $("#palette-input").addEventListener("input", (e) => filterPalette(e.target.value));
    $("#palette").addEventListener("click", (e) => { if (e.target.id === "palette") closePalette(); });

    document.addEventListener("keydown", (e) => {
      const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if (e.key === "Escape" && !$("#lesson-modal").classList.contains("hidden")) { closeLesson(); return; }
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "/")) { e.preventDefault(); openPalette(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); download("bytelabs-output.txt", $("#output").value); return; }
      if (!$("#palette").classList.contains("hidden")) {
        if (e.key === "Escape") closePalette();
        else if (e.key === "ArrowDown") { e.preventDefault(); movePalette(1); }
        else if (e.key === "ArrowUp") { e.preventDefault(); movePalette(-1); }
        else if (e.key === "Enter") { e.preventDefault(); if (paletteItems[paletteActive]) { paletteItems[paletteActive].run(); closePalette(); } }
        return;
      }
      if (!inField && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); if (steps.length) { steps.pop(); renderSteps(); bake(); } }
    });

    updateInputStats(); bake();
    showView("workbench");
  }

  document.addEventListener("DOMContentLoaded", () => {
    try {
      init();
    } catch (e) {
      console.error("ByteLabs failed to start:", e);
    }
  });
})();
