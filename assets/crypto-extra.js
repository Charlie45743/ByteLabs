/* crypto-extra.js — BLAKE2b and Argon2id implemented from the RFC specs (RFC 7693, RFC 9106).
   Pure JS using BigInt for exact 64-bit arithmetic. Verified in this project against the
   official BLAKE2b keyed KAT vectors and the RFC 9106 Argon2id test vector (H0 + final tag). */
(function () {
  "use strict";

  const MASK64 = (1n << 64n) - 1n;
  const IV = [
    0x6a09e667f3bcc908n, 0xbb67ae8584caa73bn, 0x3c6ef372fe94f82bn, 0xa54ff53a5f1d36f1n,
    0x510e527fade682d1n, 0x9b05688c2b3e6c1fn, 0x1f83d9abfb41bd6bn, 0x5be0cd19137e2179n
  ];
  const SIGMA = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
    [11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4],
    [7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8],
    [9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13],
    [2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9],
    [12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11],
    [13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10],
    [6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5],
    [10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3]
  ];

  function rotr64(x, n) { return ((x >> n) | (x << (64n - n))) & MASK64; }

  function readWordsLE(bytes, offset, count) {
    const out = new Array(count);
    for (let i = 0; i < count; i++) {
      let w = 0n;
      for (let j = 7; j >= 0; j--) w = (w << 8n) | BigInt(bytes[offset + i * 8 + j]);
      out[i] = w;
    }
    return out;
  }

  function blake2bMix(v, a, b, c, d, x, y) {
    v[a] = (v[a] + v[b] + x) & MASK64;
    v[d] = rotr64(v[d] ^ v[a], 32n);
    v[c] = (v[c] + v[d]) & MASK64;
    v[b] = rotr64(v[b] ^ v[c], 24n);
    v[a] = (v[a] + v[b] + y) & MASK64;
    v[d] = rotr64(v[d] ^ v[a], 16n);
    v[c] = (v[c] + v[d]) & MASK64;
    v[b] = rotr64(v[b] ^ v[c], 63n);
  }

  function blake2bCompress(h, block, counter, last) {
    const m = readWordsLE(block, 0, 16);
    const v = new Array(16);
    for (let i = 0; i < 8; i++) v[i] = h[i];
    for (let i = 0; i < 8; i++) v[8 + i] = IV[i];
    v[12] ^= counter & MASK64;
    v[13] ^= (counter >> 64n) & MASK64;
    if (last) v[14] ^= MASK64;
    for (let r = 0; r < 12; r++) {
      const s = SIGMA[r];
      blake2bMix(v, 0, 4, 8, 12, m[s[0]], m[s[1]]);
      blake2bMix(v, 1, 5, 9, 13, m[s[2]], m[s[3]]);
      blake2bMix(v, 2, 6, 10, 14, m[s[4]], m[s[5]]);
      blake2bMix(v, 3, 7, 11, 15, m[s[6]], m[s[7]]);
      blake2bMix(v, 0, 5, 10, 15, m[s[8]], m[s[9]]);
      blake2bMix(v, 1, 6, 11, 12, m[s[10]], m[s[11]]);
      blake2bMix(v, 2, 7, 8, 13, m[s[12]], m[s[13]]);
      blake2bMix(v, 3, 4, 9, 14, m[s[14]], m[s[15]]);
    }
    for (let i = 0; i < 8; i++) h[i] = (h[i] ^ v[i] ^ v[i + 8]) & MASK64;
  }

  // One-shot BLAKE2b. key is optional (0-64 bytes), outLen 1-64.
  function blake2b(input, outLen, key) {
    outLen = outLen || 64;
    const keyLen = key ? key.length : 0;
    let full;
    if (keyLen > 0) {
      const kb = new Uint8Array(128);
      kb.set(key);
      full = new Uint8Array(kb.length + input.length);
      full.set(kb); full.set(input, kb.length);
    } else {
      full = input;
    }
    const h = IV.slice();
    h[0] = h[0] ^ (0x01010000n ^ (BigInt(keyLen) << 8n) ^ BigInt(outLen));

    let counter = 0n;
    const total = full.length;
    if (total === 0) {
      blake2bCompress(h, new Uint8Array(128), 0n, true);
    } else {
      let offset = 0;
      while (offset < total) {
        const remaining = total - offset;
        const isLast = remaining <= 128;
        const chunkLen = isLast ? remaining : 128;
        const block = new Uint8Array(128);
        block.set(full.subarray(offset, offset + chunkLen));
        counter += BigInt(chunkLen);
        blake2bCompress(h, block, counter, isLast);
        offset += chunkLen;
      }
    }
    const out = new Uint8Array(outLen);
    for (let i = 0; i < outLen; i++) out[i] = Number((h[i >> 3] >> BigInt(8 * (i % 8))) & 0xffn);
    return out;
  }

  // ---- Argon2 (built on the BLAKE2b above) ----
  function le32(n) { const b = new Uint8Array(4); b[0] = n & 255; b[1] = (n >>> 8) & 255; b[2] = (n >>> 16) & 255; b[3] = (n >>> 24) & 255; return b; }
  function concatBytes(parts) {
    let len = 0; for (const p of parts) len += p.length;
    const out = new Uint8Array(len); let o = 0;
    for (const p of parts) { out.set(p, o); o += p.length; }
    return out;
  }
  function bytesToWords128(bytes) { return readWordsLE(bytes, 0, 128); }
  function wordsToBytes128(words) {
    const out = new Uint8Array(1024);
    for (let i = 0; i < 128; i++) { let w = words[i]; for (let j = 0; j < 8; j++) { out[i * 8 + j] = Number(w & 0xffn); w >>= 8n; } }
    return out;
  }

  // Variable-length hash H' (RFC 9106 section 3.2 / "Blake2b-long").
  function hPrime(input, T) {
    if (T <= 64) return blake2b(concatBytes([le32(T), input]), T);
    const r = Math.ceil(T / 32) - 2;
    const out = new Uint8Array(T);
    let V = blake2b(concatBytes([le32(T), input]), 64);
    out.set(V.subarray(0, 32), 0);
    let filled = 32;
    for (let i = 2; i <= r; i++) { V = blake2b(V, 64); out.set(V.subarray(0, 32), filled); filled += 32; }
    const lastLen = T - 32 * r;
    out.set(blake2b(V, lastLen), filled);
    return out;
  }

  function fBlaMka(x, y) { const lo = (z) => z & 0xffffffffn; return (x + y + 2n * lo(x) * lo(y)) & MASK64; }
  function GB(v, a, b, c, d) {
    v[a] = fBlaMka(v[a], v[b]); v[d] = rotr64(v[d] ^ v[a], 32n);
    v[c] = fBlaMka(v[c], v[d]); v[b] = rotr64(v[b] ^ v[c], 24n);
    v[a] = fBlaMka(v[a], v[b]); v[d] = rotr64(v[d] ^ v[a], 16n);
    v[c] = fBlaMka(v[c], v[d]); v[b] = rotr64(v[b] ^ v[c], 63n);
  }
  function applyPRound(v) {
    GB(v, 0, 4, 8, 12); GB(v, 1, 5, 9, 13); GB(v, 2, 6, 10, 14); GB(v, 3, 7, 11, 15);
    GB(v, 0, 5, 10, 15); GB(v, 1, 6, 11, 12); GB(v, 2, 7, 8, 13); GB(v, 3, 4, 9, 14);
  }

  const ZERO_BLOCK = new Array(128).fill(0n);

  // Argon2's core compression: fillBlock(prev, ref, oldContent, withXor).
  // withXor=false, oldContent unused -> this IS Argon2's G(X,Y) = P(X^Y) ^ (X^Y).
  function fillBlock(prevBlock, refBlock, oldNext, withXor) {
    const R = new Array(128);
    for (let i = 0; i < 128; i++) R[i] = refBlock[i] ^ prevBlock[i];
    const tmp = R.slice();
    if (withXor) for (let i = 0; i < 128; i++) tmp[i] ^= oldNext[i];
    for (let i = 0; i < 8; i++) { const row = R.slice(16 * i, 16 * i + 16); applyPRound(row); for (let j = 0; j < 16; j++) R[16 * i + j] = row[j]; }
    for (let i = 0; i < 8; i++) {
      const idx = []; for (let k = 0; k < 8; k++) { idx.push(2 * i + 16 * k); idx.push(2 * i + 1 + 16 * k); }
      const col = idx.map((x) => R[x]); applyPRound(col); for (let j = 0; j < 16; j++) R[idx[j]] = col[j];
    }
    const out = new Array(128);
    for (let i = 0; i < 128; i++) out[i] = (R[i] ^ tmp[i]) & MASK64;
    return out;
  }
  function argon2G(X, Y) { return fillBlock(X, Y, ZERO_BLOCK, false); }

  function indexAlpha(segmentLength, laneLen, pass, slice, i, J1, sameLane) {
    let refAreaSize;
    if (pass === 0) {
      if (slice === 0) refAreaSize = i - 1;
      else if (sameLane) refAreaSize = slice * segmentLength + i - 1;
      else refAreaSize = slice * segmentLength + (i === 0 ? -1 : 0);
    } else if (sameLane) refAreaSize = laneLen - segmentLength + i - 1;
    else refAreaSize = laneLen - segmentLength + (i === 0 ? -1 : 0);

    const areaSize = BigInt(refAreaSize);
    const j1 = BigInt(J1 >>> 0);
    let rel = (j1 * j1) >> 32n;
    rel = areaSize - 1n - ((areaSize * rel) >> 32n);
    let startPos = 0n;
    if (pass !== 0) startPos = slice === 3 ? 0n : BigInt((slice + 1) * segmentLength);
    return Number((startPos + rel) % BigInt(laneLen));
  }

  // type: 0 = Argon2d, 1 = Argon2i, 2 = Argon2id
  function argon2Core(opts) {
    const { password, salt, secret, ad, m, t, p, tagLen, type } = {
      secret: new Uint8Array(0), ad: new Uint8Array(0), type: 2, ...opts
    };
    const version = 19;
    const segmentLength = Math.floor(m / (4 * p));
    if (segmentLength < 2) throw new Error("Memory cost is too small for this parallelism (need at least 8*p KiB).");
    const laneLen = segmentLength * 4;
    const mPrime = laneLen * p;

    const H0 = blake2b(concatBytes([
      le32(p), le32(tagLen), le32(m), le32(t), le32(version), le32(type),
      le32(password.length), password, le32(salt.length), salt,
      le32(secret.length), secret, le32(ad.length), ad
    ]), 64);

    const B = new Array(mPrime);
    const idx = (lane, col) => lane * laneLen + col;
    for (let lane = 0; lane < p; lane++) {
      B[idx(lane, 0)] = bytesToWords128(hPrime(concatBytes([H0, le32(0), le32(lane)]), 1024));
      B[idx(lane, 1)] = bytesToWords128(hPrime(concatBytes([H0, le32(1), le32(lane)]), 1024));
    }

    const dataIndependent = (pass, slice) => type === 1 || (type === 2 && pass === 0 && slice < 2);

    for (let pass = 0; pass < t; pass++) {
      for (let slice = 0; slice < 4; slice++) {
        for (let lane = 0; lane < p; lane++) {
          const diAddr = dataIndependent(pass, slice);
          const startIdx = (pass === 0 && slice === 0) ? 2 : 0;
          let inputBlock = null, addrBlock = null;
          if (diAddr) {
            inputBlock = ZERO_BLOCK.slice();
            inputBlock[0] = BigInt(pass); inputBlock[1] = BigInt(lane); inputBlock[2] = BigInt(slice);
            inputBlock[3] = BigInt(mPrime); inputBlock[4] = BigInt(t); inputBlock[5] = BigInt(type); inputBlock[6] = 0n;
            // The reference implementation generates the first address block up front when the
            // segment starts at index 2 (pass 0, slice 0) — the loop below never hits i%128===0
            // for that first window since it starts past it.
            if (startIdx === 2) { inputBlock[6] += 1n; addrBlock = argon2G(ZERO_BLOCK, argon2G(ZERO_BLOCK, inputBlock)); }
          }
          for (let i = startIdx; i < segmentLength; i++) {
            const col = slice * segmentLength + i;
            const curIdx = idx(lane, col);
            const prevCol = col === 0 ? laneLen - 1 : col - 1;
            const prevIdx = idx(lane, prevCol);
            let J1, J2;
            if (diAddr) {
              if (i % 128 === 0) { inputBlock[6] += 1n; addrBlock = argon2G(ZERO_BLOCK, argon2G(ZERO_BLOCK, inputBlock)); }
              const pos = i % 128;
              J1 = Number(addrBlock[pos] & 0xffffffffn); J2 = Number((addrBlock[pos] >> 32n) & 0xffffffffn);
            } else {
              const prevBlk = B[prevIdx];
              J1 = Number(prevBlk[0] & 0xffffffffn); J2 = Number((prevBlk[0] >> 32n) & 0xffffffffn);
            }
            const refLane = (pass === 0 && slice === 0) ? lane : (((J2 % p) + p) % p);
            const sameLane = refLane === lane;
            const refCol = indexAlpha(segmentLength, laneLen, pass, slice, i, J1, sameLane);
            const refIdx = idx(refLane, refCol);
            B[curIdx] = fillBlock(B[prevIdx], B[refIdx], B[curIdx], pass > 0);
          }
        }
      }
    }

    const finalBlock = B[idx(0, laneLen - 1)].slice();
    for (let lane = 1; lane < p; lane++) { const blk = B[idx(lane, laneLen - 1)]; for (let i = 0; i < 128; i++) finalBlock[i] ^= blk[i]; }
    return hPrime(wordsToBytes128(finalBlock), tagLen);
  }

  function argon2id(opts) { return argon2Core(Object.assign({ type: 2 }, opts)); }
  function argon2i(opts) { return argon2Core(Object.assign({ type: 1 }, opts)); }
  function argon2d(opts) { return argon2Core(Object.assign({ type: 0 }, opts)); }

  window.CL_CRYPTO = { blake2b, argon2id, argon2i, argon2d, argon2Core };
})();
