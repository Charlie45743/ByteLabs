# ByteLabs

**Live at [charlie45743.github.io/ByteLabs](https://charlie45743.github.io/ByteLabs/)**

ByteLabs is a small, offline toolkit for encoding, hashing, ciphers, and learning how
data is actually represented under the hood. It runs entirely in the browser — no
server, no build step, no accounts, no analytics, and no data ever leaves the page.
Everything you paste, decode, or generate stays on your machine.

It's built around three ideas: a **workbench** for transforming data one clear step at
a time instead of hiding the work behind a black box, an **analyzer** for understanding
what a piece of data actually is before you do anything to it, and a **guided path** for
actually learning the concepts (Base64, hashing, ciphers, encryption, Unicode) rather
than just having tools to run blind.

## What's inside

### The Lab — the workbench

Pick an operation from the left panel (click it, or drag it in) and it's added as a
**step**. Steps run top to bottom, and the output updates live as you type — no "run"
button, no waiting. Steps can be reordered by drag, toggled on/off without deleting
them, and removed individually. Heavy operations (Argon2id, PBKDF2) are marked "slow"
and use an explicit Compute button instead of running on every keystroke, so typing
never stutters.

138 operations across 7 categories:

- **Encoding (43)** — Base64, Base64 URL-safe, Base32, Base36, Base58, Base62, Base85,
  Base45 (RFC 9285, the encoding behind EU COVID certificate QR codes), hex, hexdump,
  binary, decimal, octal, Roman numerals, URL encoding, HTML entities, `\u` escapes,
  JSON string escapes, Morse code, NATO phonetic spelling, Punycode/IDN (RFC 3492, for
  internationalized domain names), and Quoted-Printable (RFC 2045, the MIME email
  encoding) — each with both an encode and a decode direction.
- **Ciphers (22)** — ROT13, ROT47, Caesar (with adjustable shift), Affine (Caesar
  generalized into a full linear equation, with a modular-inverse decoder), Atbash,
  A1Z26, Polybius Square (letters as grid coordinates), Bacon Cipher (a steganographic
  A/B substitution meant to hide inside another text), Vigenère, Beaufort (a reciprocal
  Vigenère variant), Rail Fence and Columnar Transposition (transposition ciphers —
  they scramble position instead of substituting letters), and XOR, plus two
  **brute-force tools**: XOR Brute Force and Caesar Brute Force, which try every
  possible key/shift and rank the results by how much they read like actual English
  (letter-frequency statistics plus common-word matching), showing a ranked shortlist
  rather than a single guess.
- **Bitwise (15)** — AND, OR, NOT, ADD and SUB (mod 256), bit shifts, bit rotates, Gray
  code, Swap Endianness (reverses byte order between big- and little-endian), Swap
  Nibbles, Count Set Bits (Hamming weight), and Reverse Bits, each working with a
  repeating key where relevant.
- **Hashing (15)** — MD5, SHA-1/256/384/512, CRC-32, CRC-16, Adler-32, HMAC-SHA256/512,
  BLAKE2b-256/512, PBKDF2, Argon2id, and a Luhn Checksum (the credit-card-style check
  digit that catches typos and digit transpositions, not fraud). BLAKE2b and Argon2id
  are implemented from scratch in pure JavaScript directly from their RFC
  specifications (RFC 7693 and RFC 9106) and verified against the official published
  test vectors — see `assets/crypto-extra.js`.
- **Text (21)** — case conversion, line sorting/deduplication/reversal, whitespace and
  accent stripping, slugify, find & replace (plain or regex), JSON formatting, line
  ending conversion, HTML tag stripping, and word wrap.
- **Data (14)** — JWT inspection, Shannon entropy, extracting emails/URLs/IPs/numbers
  from text, Unix timestamp conversion, arbitrary base conversion, letter-frequency
  analysis, text statistics, IPv4 ⇄ integer conversion, a color format converter
  (hex/RGB/HSL), a Subnet Info calculator (network/broadcast address and usable host
  range from CIDR notation), Levenshtein Distance (edit-distance similarity between two
  strings), and Parse URL (breaks an address down into protocol/host/port/path/query
  using the browser's own URL parser).
- **Random (8)** — UUIDs, passwords, random IPv4 addresses, a Dice Roll generator (with
  proper rejection sampling so every face is exactly 1-in-6), random hex/Base64/bytes,
  and a Lorem Ipsum generator, all backed by the browser's cryptographically secure
  random source, never `Math.random()`.

### Analyze

Paste anything and see, live: its likely format (with a confidence score and a decode
preview — Base64, hex, binary, URL encoding, JSON, JWTs, UUIDs, emails, IPs, and hashes
are all recognized by actually decoding and checking the result, not just pattern
matching, which keeps false positives low), a character-by-character Unicode
breakdown (code point, UTF-8 bytes, HTML entity — useful for spotting invisible
characters, mismatched encodings, or lookalike characters), a byte-value histogram
showing the data's structure at a glance, running hashes (MD5/SHA-1/256/512/CRC-32),
and a hash comparison tool.

### Learn

A locked progression of **58 lessons** along a winding, illustrated path — Byte, a
bubbling-flask mascot (redrawn as a pixel sprite in the Retro theme and a fish in the
Ocean theme), greets you with your next lesson and cheers you on as you go. Lessons
are grouped into seven named units, each with its own colored banner and progress
count: Encodings, Classical ciphers, Bits & XOR, Hashing & integrity, Encryption,
Passwords & secrets, and Data in practice. Covers encoding (Base64, hex, Roman
numerals and why positional notation replaced them, reading hexdumps, Unicode, emoji
and UTF-16 surrogate pairs, mojibake, homoglyph attacks, Punycode/IDN,
Quoted-Printable/MIME, Base32/Base58/Base36/Base62 and where each one's alphabet
trade-off actually matters, encoding efficiency up to Base85, Base45 and why QR codes
need a different kind of "dense," Morse and variable-length codes, data URIs),
classical substitution and transposition ciphers (Caesar, the Affine cipher's linear
generalization of it, Atbash, the Polybius square, the steganographic Bacon cipher,
keyword-based Columnar Transposition, and the reciprocal Beaufort cipher), Kerckhoffs's
principle, and how to break ciphers with frequency analysis, XOR and the one-time pad,
bitmasks and flags, Hamming weight and error correction, endianness, brute-forcing,
hashing versus checksums (including the Luhn check digit used on credit card numbers),
hash collisions and the birthday problem, Merkle trees, HMAC, symmetric and asymmetric
encryption (AES, RSA, digital signatures, key exchange, TLS), password security
(salting, key derivation with PBKDF2/Argon2, how cracking actually works, judging
real-world password strength, Diceware passphrases, multi-factor authentication),
UUIDs, JWTs, IPv4 addressing and subnetting, Unix time, regular expressions, and
entropy. Most lessons include a live interactive demo and end with a quiz — some with
several questions, all of which must be answered correctly to complete the lesson.

### Challenges

**91 practice puzzles** grouped into six categories (Encoding, Ciphers, Bitwise,
Hashing, Text, Data) with their own progress banners, a difficulty filter
(easy/medium/hard), a keyword search box, and a "Surprise me" button that jumps to
and highlights a random unsolved one. Solvable using the operations in The Lab —
decode a hidden message, break a cipher, compute a hash, spot an email in a sentence,
or actually run the brute-force tools instead of working something out by hand.
Difficulty labels are calibrated to how much a puzzle actually asks of you once
you've found the right tool — multi-step "peel the layers" puzzles that are fully
spelled out in their own prompt sit at medium, not hard. Progress is saved on your
device only.

### Settings

Four themes — **Light**, **Dark**, **Retro** (a phosphor-green CRT terminal: sharp
pixel corners, scanlines, a chunky monospace UI, and Byte redrawn as an 8-bit sprite),
and **Ocean** (deep-sea blues and teals with a soft gradient backdrop, and Byte
reimagined as a fish) — plus editor font size, word wrap, and animations, all stored
in local storage, nothing else.

## Privacy & security posture

No network requests of any kind — no analytics, no CDN scripts, no fonts, no fetch/XHR
anywhere in the codebase. Local storage holds only lesson/challenge progress and UI
settings, never anything you paste or generate. The page ships a strict
Content-Security-Policy (same-origin only, no inline or `eval`'d script). Full write-up
of what was checked lives in the project history; nothing here talks to a server
because there isn't one.

## Running it locally

It's plain HTML/CSS/JavaScript with no build step, so just serve this folder with any
static file server — for example:

    npx serve .

Serve it over `http://localhost` or `https`, not by opening `index.html` directly as a
`file://` URL — the browser needs a secure context for SHA hashing, HMAC, and PBKDF2,
which rely on the Web Crypto API. (Argon2id and BLAKE2b are pure JavaScript and work
regardless.)

## License

MIT — see [LICENSE](LICENSE). You're free to use, modify, and redistribute this,
including commercially, as long as you **give credit**: keep the copyright notice
("Copyright (c) 2026 Charlie45743") in any copy or substantial portion of the code, and
credit **Charlie45743** as the original author if you publish or deploy something built
from it.

## Files

    index.html              markup and layout
    assets/style.css        themes (light, dark, retro, ocean)
    assets/lib.js           pure helpers: encoders, ciphers, hashing, detection, brute force
    assets/crypto-extra.js  BLAKE2b and Argon2id, implemented from RFC 7693 / RFC 9106
    assets/data.js          lesson and challenge content
    assets/app.js           UI wiring: steps, Analyze, Learn, Challenges, Settings

## Keyboard shortcuts

- `Ctrl/⌘ + K` or `Ctrl + /` — search
- `Ctrl/⌘ + S` — download the current output
- `Ctrl/⌘ + Z` — remove the last step
