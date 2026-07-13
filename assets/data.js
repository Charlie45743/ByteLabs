/* data.js — lesson and challenge content. Attached to window.CL_DATA. */
(function () {
  "use strict";

  const LESSONS = [
    {
      id: "base64", title: "What is Base64?",
      body: `
<h3>What is Base64?</h3>
<p>Base64 writes any binary data using 64 "safe" characters: <code>A–Z</code>, <code>a–z</code>,
<code>0–9</code>, <code>+</code> and <code>/</code>. It is <strong>not</strong> encryption — anyone can decode it.</p>
<h4>Why it exists</h4>
<p>Some channels (email, URLs, JSON) only handle text reliably. Base64 turns bytes into plain text so they
survive those channels, then decode back.</p>
<h4>How it works</h4>
<p>Every 3 bytes (24 bits) split into 4 groups of 6 bits. Each 6-bit group (0–63) maps to one character.
<code>=</code> padding fills the end when the length isn't a multiple of 3.</p>
<h4>Common mistake</h4>
<p>Treating it as security. It only changes the alphabet.</p>`,
      demo: { type: "base64" },
      quiz: { q: "Is Base64 encryption?", options: ["Yes, it is secure", "No, it is just an encoding", "Only with a password"], answer: 1 }
    },
    {
      id: "hex", title: "What is Hex?",
      body: `
<h3>What is Hexadecimal?</h3>
<p>Hex is base-16: <code>0–9</code> then <code>a–f</code> for 10–15. One byte is exactly two hex digits,
so hex is a compact way to show raw bytes.</p>
<h4>Why it's used</h4>
<p>Colours (<code>#4a9d82</code>), memory addresses, hashes and file signatures are all shown in hex.</p>
<h4>Example</h4>
<p>The letter <code>A</code> is value 65, which is <code>0x41</code> in hex.</p>`,
      demo: { type: "hex" },
      quiz: { q: "How many hex digits are one byte?", options: ["One", "Two", "Eight"], answer: 1 }
    },
    {
      id: "hexdump", title: "Reading a hexdump",
      body: `
<h3>Reading a hexdump</h3>
<p>A hexdump is how you look at raw bytes when you don't know (or don't trust) what a file claims to be.
It's the classic three-column layout that tools like <code>xxd</code> and every hex editor use.</p>
<h4>The three columns</h4>
<p><strong>Offset</strong> (left): the position of the row's first byte, in hex — row two starts at
<code>00000010</code>, which is byte 16, because each row shows 16 bytes.
<strong>Hex</strong> (middle): the 16 byte values.
<strong>ASCII</strong> (right): the same bytes rendered as text, with a <code>.</code> for anything unprintable.</p>
<h4>Why the ASCII column matters</h4>
<p>Human-readable strings jump out of the right-hand column even in the middle of binary data — that's how you
spot embedded text, file signatures like <code>PNG</code> or <code>PK</code>, URLs inside malware samples, or
leftover secrets in a binary. Reading the ASCII column of a hexdump is often the fastest first look a security
analyst takes at an unknown file.</p>
<h4>Try it</h4>
<p>The demo below shows your text as a hexdump. Type more than 16 characters to see the offset column count up.</p>`,
      demo: { type: "hexdump" },
      quiz: { q: "In a hexdump, what does the leftmost column show?", options: ["A checksum of the row", "The position (offset) of the row's first byte", "The row's ASCII text"], answer: 1 }
    },
    {
      id: "hashing", title: "What is Hashing?",
      body: `
<h3>What is Hashing?</h3>
<p>A hash turns any input into a fixed-size fingerprint. Same input, same output — but you cannot reverse it.</p>
<h4>Properties</h4>
<p>Deterministic, fixed length, one-way, and a tiny input change flips the whole output (the avalanche effect).</p>
<h4>What it's for</h4>
<p>Verifying downloads, storing passwords (with salt), checking data hasn't changed.</p>
<h4>Security note</h4>
<p>MD5 and SHA-1 are broken for security. Prefer SHA-256+, and salt password hashes with a slow algorithm.</p>`,
      demo: { type: "hash" },
      quiz: { q: "Can you recover text from its SHA-256 hash?", options: ["Yes, by reversing", "No, it is one-way", "Only if short"], answer: 1 }
    },
    {
      id: "collisions", title: "Hash collisions & the birthday problem",
      body: `
<h3>Hash collisions & the birthday problem</h3>
<p>A hash squeezes unlimited input into a fixed-size output — SHA-256 always produces 256 bits, no matter how
long the input is. Since there are infinitely more possible inputs than possible outputs, two different
inputs producing the same hash — a <strong>collision</strong> — is mathematically guaranteed to be possible.
The question is only how hard one is to find.</p>
<h4>Why length matters more than you'd guess</h4>
<p>Naively you might expect needing to try close to 2²⁵⁶ inputs to find a collision. The <strong>birthday
problem</strong> says otherwise: in a room of just 23 people, there's already a 50% chance two share a
birthday, out of only 365 possibilities — far fewer people than days. The same math applies to hashes: finding
<em>any</em> collision only takes roughly the <em>square root</em> of the total output space, about 2¹²⁸
attempts for a 256-bit hash, not 2²⁵⁶. This is exactly why hash outputs are sized double what you might
expect for the security level you want.</p>
<h4>When it's happened for real</h4>
<p>MD5 (128-bit) and SHA-1 (160-bit) both have practical, demonstrated collision attacks — researchers have
published two different files with identical hashes for both. That's precisely why the Hashing lesson tells
you not to trust either for security, even though both are still perfectly fine as accidental-corruption
checksums.</p>
<h4>Try it</h4>
<p>The demo hashes your text with SHA-256. Change one character and watch the entire output change — that
avalanche effect is what keeps collisions expensive to search for.</p>`,
      demo: { type: "hash" },
      quiz: [
        { q: "What is a hash collision?", options: ["A hash that fails to compute", "Two different inputs producing the same hash output", "A hash shorter than expected"], answer: 1 },
        { q: "Why does the birthday problem make collisions easier to find than expected?", options: ["It doesn't — it's just a myth", "Finding any collision needs roughly the square root of the output space, not the full space", "Hash functions are actually reversible"], answer: 1 }
      ]
    },
    {
      id: "ciphers", title: "Classic ciphers",
      body: `
<h3>Classic ciphers</h3>
<p>Before computers, messages were hidden with pen-and-paper ciphers. They are easy to break today but great
for learning.</p>
<h4>Caesar / ROT13</h4>
<p>Shift every letter by a fixed number. ROT13 shifts by 13, so running it twice restores the text.</p>
<h4>Atbash</h4>
<p>Mirror the alphabet: A↔Z, B↔Y. It is its own inverse.</p>
<h4>Vigenère</h4>
<p>A Caesar shift that changes per letter, driven by a repeating keyword. Much stronger than a single shift,
but still breakable with enough text.</p>
<h4>Try it</h4>
<p>The demo below applies ROT13.</p>`,
      demo: { type: "rot13" },
      quiz: { q: "What restores ROT13 text?", options: ["A secret key", "Applying ROT13 again", "Base64 decode"], answer: 1 }
    },
    {
      id: "beaufortlesson", title: "The Beaufort cipher: encryption that undoes itself",
      body: `
<h3>A one-letter change with a big consequence</h3>
<p>Vigenère computes each ciphertext letter as <code>plaintext + key</code> (wrapping at 26). The
<strong>Beaufort cipher</strong>, from the same era, flips one sign: <code>key − plaintext</code>. That tiny
formula change produces a cipher with a genuinely different property from everything else in this unit.</p>
<h4>Reciprocal, like Atbash — but keyed</h4>
<p>Atbash is reciprocal (apply it twice, get the original back) but has no key — anyone can decrypt it, which
makes it useless for real secrecy. Vigenère has a key but needs a separate decode step (subtract instead of
add). Beaufort gets <em>both</em>: run the exact same operation with the same key a second time, and you're
back to the plaintext — because subtracting <code>key − (key − plaintext)</code> algebraically simplifies
back to <code>plaintext</code>. One button, one key, works both directions.</p>
<h4>Why that mattered before computers</h4>
<p>A cipher machine or a soldier in the field only needs to implement <em>one</em> procedure instead of two
mirror-image ones — encrypting and decrypting use identical steps. That reciprocal property is exactly why
later rotor machines (including versions of the Enigma family) were built around reciprocal substitution:
it halves the operational complexity of running the system correctly under pressure.</p>
<h4>Same weakness as Vigenère, though</h4>
<p>Reciprocal doesn't mean stronger — Beaufort has the identical key-length weakness as Vigenère, breakable
with the same frequency-analysis approach from a few lessons ago once you know (or guess) the key length.</p>
<h4>Try it</h4>
<p>The demo runs Beaufort with a key. Encrypt some text, then run the <em>output</em> back through with the
same key — you'll land exactly back on the original.</p>`,
      demo: { type: "beaufort" },
      quiz: [
        { q: "What single change turns Vigenère's formula into Beaufort's?", options: ["Using a longer key", "Computing key − plaintext instead of plaintext + key", "Shifting by 13 instead of the key"], answer: 1 },
        { q: "What does 'reciprocal' mean for a cipher like Beaufort?", options: ["It has no key at all", "The same operation with the same key both encrypts and decrypts", "It can only encrypt numbers"], answer: 1 }
      ]
    },
    {
      id: "transposition", title: "Transposition ciphers",
      body: `
<h3>Transposition ciphers</h3>
<p>Every cipher in the last lesson — Caesar, Atbash, Vigenère — is a <strong>substitution</strong> cipher: it
replaces each letter with a different one. A <strong>transposition</strong> cipher does the opposite: every
original letter stays exactly as it is, but their <em>positions</em> get scrambled.</p>
<h4>Rail Fence cipher</h4>
<p>Write the message in a zigzag down and up across a fixed number of "rails," then read each rail off left to
right. <code>ATTACKATDAWN</code> written across 3 rails and read off becomes <code>ACDTAKTANTAW</code> — same
12 letters, same letter counts, totally different order.</p>
<h4>Why this defeats frequency analysis</h4>
<p>The next lesson shows how substitution ciphers fall to letter-frequency analysis, because the letter
<code>E</code> still shows up as often as it does in English — just disguised as a different symbol. A
transposition cipher doesn't have that weakness at all: the letter counts are <em>identical</em> to the
plaintext, since nothing was substituted. It has to be broken a different way — by trying the small number of
plausible rail counts, or by looking for patterns in where common letter pairs land.</p>
<h4>Combining both</h4>
<p>Historical field ciphers, and parts of modern block ciphers, often combine substitution and transposition —
each covers the weakness the other has.</p>
<h4>Try it</h4>
<p>The demo below runs Rail Fence Encode. Try changing the rail count.</p>`,
      demo: { type: "railfence" },
      quiz: { q: "What does a transposition cipher change about the plaintext?", options: ["The letters themselves", "The order the letters appear in", "The character encoding (e.g. ASCII to UTF-8)"], answer: 1 }
    },
    {
      id: "columnar", title: "Columnar transposition & key space",
      body: `
<h3>Columnar transposition</h3>
<p>Rail Fence has a weakness: the only real setting is the rail count, and nobody writes a message across more
than a handful of rails. That means an attacker can just try every rail count by hand — there are barely a
dozen worth checking.</p>
<h4>Adding a keyword</h4>
<p>Columnar transposition fixes this by using a <strong>keyword</strong> instead of a number. Write the message
into rows under the keyword's letters, then read the columns back in the order you'd sort the keyword's letters
alphabetically. The keyword <code>ZEBRAS</code> sorts to <code>A,B,E,R,S,Z</code> — so column 5 (under the "A")
is read first, then column 3 (under the "B"), and so on.</p>
<h4>Why that matters</h4>
<p>A short numeric setting like "3 rails" has only a few dozen reasonable values to brute-force. A keyword has
as much key space as you're willing to type — <code>ZEBRAS</code> alone is already 6! = 720 possible column
orders, and a longer keyword grows factorially. Same core idea as Rail Fence — scrambling position, not
substituting letters — but with a real key instead of a small guessable number.</p>
<h4>Still not enough alone</h4>
<p>Transposition alone is still breakable with enough ciphertext (anagramming columns, spotting likely word
fragments) — which is exactly why real ciphers historically layered transposition <em>and</em> substitution
together rather than relying on either alone.</p>
<h4>Try it</h4>
<p>The demo below runs Columnar Transposition Encode. Try changing the keyword.</p>`,
      demo: { type: "columnar" },
      quiz: { q: "Why is a keyword-based transposition cipher stronger than a fixed rail count?", options: ["It encrypts instead of just scrambling", "The keyword gives far more possible orderings than a small rail number", "It uses a hash function"], answer: 1 }
    },
    {
      id: "encryption", title: "What is Encryption?",
      body: `
<h3>What is Encryption?</h3>
<p>Encryption scrambles data with a key so only someone with the right key can read it. Unlike hashing, it is
reversible — that's the point.</p>
<h4>Symmetric vs Asymmetric</h4>
<p><strong>Symmetric</strong> (AES) uses one shared key for both directions. Fast, but both sides must share it.</p>
<p><strong>Asymmetric</strong> (RSA) uses a public key to encrypt and a private key to decrypt. Slower, but the
public key can be shared freely.</p>
<h4>In practice</h4>
<p>Systems combine them: RSA exchanges a random AES key, then AES encrypts the actual data.</p>`,
      demo: { type: "none" },
      quiz: { q: "Which key decrypts in RSA?", options: ["The public key", "The private key", "Either"], answer: 1 }
    },
    {
      id: "aes", title: "What is AES?",
      body: `
<h3>What is AES?</h3>
<p>AES (Advanced Encryption Standard) is the most widely used symmetric cipher. It works on 128-bit blocks
with keys of 128, 192 or 256 bits.</p>
<h4>Modes matter</h4>
<p>AES needs a "mode of operation". ByteLabs uses <code>AES-GCM</code>, which encrypts <em>and</em> detects
tampering. Each message uses a fresh random IV (initialisation vector), so identical messages don't produce
identical output.</p>
<h4>Key rule</h4>
<p>Never reuse the same key + IV pair in GCM — a fresh random IV must be generated for every message.</p>`,
      demo: { type: "none" },
      quiz: { q: "What does the IV in AES-GCM do?", options: ["It is the password", "It makes each encryption unique", "It stores the result"], answer: 1 }
    },
    {
      id: "rsa", title: "How RSA works",
      body: `
<h3>How RSA works</h3>
<p>RSA is built on a simple asymmetry: multiplying two large prime numbers is fast, but factoring the result
back into those primes is extremely slow. That gap is the entire basis of its security.</p>
<h4>The keys</h4>
<p>A <strong>public key</strong> (safe to share) can encrypt a message. Only the matching
<strong>private key</strong> (kept secret) can decrypt it. Anyone can send you a secret without ever needing a
secret channel to agree on a key first — the classic problem symmetric ciphers can't solve alone.</p>
<h4>Why it's not used for everything</h4>
<p>RSA is slow and can only encrypt small messages (roughly the key size). In practice it's used once, to
securely hand over a random AES key — then AES does the actual work.</p>
<h4>Try it</h4>
<p>In the Workbench, longer text needs to be hashed or chunked before RSA-sized encryption — that's exactly
why the AES+RSA combination exists.</p>`,
      demo: { type: "none" },
      quiz: { q: "Why is factoring hard for RSA's security?", options: ["It isn't, it's easy", "Multiplying primes is fast but factoring the product back is slow", "It requires internet access"], answer: 1 }
    },
    {
      id: "signatures", title: "Digital signatures",
      body: `
<h3>Digital signatures</h3>
<p>A signature does the opposite job of encryption: instead of hiding a message, it proves who sent it and
that it wasn't altered — while leaving the message fully readable.</p>
<h4>How it works</h4>
<p>The sender hashes the message, then encrypts <em>that hash</em> with their <strong>private</strong> key —
the reverse of RSA encryption's usual direction. Anyone can then use the sender's <strong>public</strong> key
to decrypt the signature back into a hash, recompute the hash of the message themselves, and check the two
match.</p>
<h4>Signature vs HMAC</h4>
<p>Both prove authenticity, but HMAC needs a shared secret both sides already have. A signature uses a key
pair, so anyone with the public key can verify it — but only the private-key holder could have created it.
That's why JWTs are commonly signed rather than just HMACed when many parties need to verify them.</p>
<h4>Where you see it</h4>
<p>Software updates, HTTPS certificates, and cryptocurrency transactions are all authenticated with digital
signatures rather than passwords.</p>`,
      demo: { type: "none" },
      quiz: { q: "What does a valid signature prove?", options: ["The message is secret", "The message came from the private-key holder and wasn't altered", "The message is compressed"], answer: 1 }
    },
    {
      id: "keyexchange", title: "Key exchange without sending the key",
      body: `
<h3>Agreeing on a secret in the open</h3>
<p>RSA lets you encrypt a key <em>to</em> someone. <strong>Diffie–Hellman key exchange</strong> solves a
different, cleverer problem: two people who have never met can agree on the same shared secret while an
eavesdropper watching every message they send still can't work it out.</p>
<h4>The intuition (paint mixing)</h4>
<p>Picture mixing paint. Both sides start with a public shared color, then each secretly mixes in their own
private color and sends the <em>result</em> (not the private color) to the other. Each side then mixes their
own private color into what they received. Both end up at the same final mixture — but anyone watching the
exchange only saw the intermediate colors, which aren't enough to reconstruct the final one.</p>
<h4>Why it matters</h4>
<p>This is how HTTPS connections agree on a fresh AES key for every session, without that key ever crossing
the network — even RSA-based key exchange has since been mostly replaced by Diffie–Hellman variants for
exactly this "nothing sensitive was ever transmitted" property (called forward secrecy).</p>`,
      demo: { type: "none" },
      quiz: { q: "What can an eavesdropper see in Diffie–Hellman key exchange?", options: ["The final shared secret directly", "Only intermediate values that aren't enough to derive the secret", "Nothing at all is sent"], answer: 1 }
    },
    {
      id: "tls", title: "TLS & HTTPS in a nutshell",
      body: `
<h3>How HTTPS actually protects a connection</h3>
<p>The padlock in your browser is several of the concepts from these lessons working together in one
handshake, not one single trick.</p>
<h4>The handshake, roughly</h4>
<p>1. Your browser and the server use <strong>key exchange</strong> to agree on a shared secret, without
sending it. 2. The server proves its identity with a <strong>certificate</strong> — a public key
<strong>signed</strong> by a certificate authority your browser already trusts. 3. Both sides derive a fresh
<strong>AES</strong> key from the shared secret for the session. 4. Every message from then on is encrypted
with AES and authenticated (GCM mode does both at once, as covered in the AES lesson).</p>
<h4>Why a new key every time</h4>
<p>A fresh key per session means that even if one session's key were ever somehow exposed, past and future
sessions stay safe — the forward secrecy property from the key exchange lesson.</p>
<h4>What the padlock does <em>not</em> mean</h4>
<p>It confirms the connection is encrypted and the server proved control of that domain's certificate — it
says nothing about whether the site itself is trustworthy or safe.</p>`,
      demo: { type: "none" },
      quiz: { q: "What does a certificate prove in TLS?", options: ["The website has no bugs", "The server's public key is signed by a trusted authority", "The connection is using AES specifically"], answer: 1 }
    },
    {
      id: "salt", title: "Salting passwords",
      body: `
<h3>Why passwords are salted</h3>
<p>If you just hash a password, two people with the same password get the same hash — and attackers can use
pre-computed "rainbow tables" to reverse common ones.</p>
<h4>The fix</h4>
<p>A <strong>salt</strong> is a unique random value added to each password before hashing. Now identical
passwords hash differently, and pre-computed tables become useless.</p>
<h4>Slow on purpose</h4>
<p>Good password hashing also uses a deliberately slow function (bcrypt, scrypt, Argon2, or PBKDF2 with many
iterations) so guessing is expensive.</p>`,
      demo: { type: "none" },
      quiz: { q: "What does a salt prevent?", options: ["Slow logins", "Reusing rainbow tables across users", "Long passwords"], answer: 1 }
    },
    {
      id: "kdf", title: "Key derivation: PBKDF2 & Argon2",
      body: `
<h3>Key derivation functions</h3>
<p>A plain hash (even salted) computes in microseconds — cheap for you, but also cheap for an attacker guessing
millions of passwords per second on stolen hardware. A <strong>key derivation function (KDF)</strong> fixes
this by making hashing deliberately, tunably slow.</p>
<h4>PBKDF2</h4>
<p>Runs the hash function over and over — the <strong>iteration count</strong> controls the cost. OWASP
currently recommends 600,000+ iterations with SHA-256. It's simple and available natively in every browser,
but only costs CPU time, which GPUs and custom hardware can parallelise cheaply.</p>
<h4>Argon2</h4>
<p>The modern standard (winner of the 2015 Password Hashing Competition). Argon2 is <strong>memory-hard</strong>
— it forces the computer to use a large block of memory, not just CPU cycles, which is much more expensive to
parallelise on custom cracking hardware. <strong>Argon2id</strong> is the recommended variant for password
storage.</p>
<h4>Try it</h4>
<p>Both PBKDF2 and Argon2id are in the Workbench's Hashing category. They're marked "slow" — you'll click a
Compute button rather than see them run instantly, because that cost is the entire point.</p>`,
      demo: { type: "none" },
      quiz: { q: "What makes Argon2 harder to attack with custom hardware than PBKDF2?", options: ["It uses a longer password", "It requires a lot of memory, not just CPU time", "It is not published publicly"], answer: 1 }
    },
    {
      id: "cracking", title: "How password cracking actually works",
      body: `
<h3>How password cracking works</h3>
<p>Attackers rarely "decrypt" a password hash — hashing is one-way. Instead they guess, hash each guess, and
compare it to the stolen hash. Cracking speed is a numbers game.</p>
<h4>The toolkit</h4>
<p><strong>Dictionary attacks</strong> try real words and known-breached passwords first — they work
surprisingly often. <strong>Brute force</strong> tries every combination and only becomes practical for short
passwords. <strong>Rainbow tables</strong> are huge precomputed hash lookups — defeated entirely by a unique
salt per password.</p>
<h4>Why speed matters</h4>
<p>An unsalted MD5 hash can be tested billions of times a second on a graphics card. The same password hashed
with Argon2id might only allow a few hundred guesses a second on the same hardware — a difference of six or
seven orders of magnitude.</p>
<h4>What actually helps</h4>
<p>In order of impact: use a unique salt (defeats rainbow tables), use a slow memory-hard KDF like Argon2id
(defeats brute force at scale), and use a long, non-reused password (defeats dictionary attacks). Length beats
complexity — a long passphrase is harder to crack than a short "P@ssw0rd!"-style substitution.</p>`,
      demo: { type: "none" },
      quiz: { q: "What single change defeats precomputed rainbow tables?", options: ["A longer hash algorithm name", "A unique salt per password", "Storing passwords in plain text"], answer: 1 }
    },
    {
      id: "strength-practice", title: "Judging password strength in practice",
      body: `
<h3>Judging strength without guesswork</h3>
<p>Length and character variety are only half the picture — whether a password appears on a breach list
matters more than almost anything else, because that check happens before any brute-force math even applies.</p>
<h4>Two very different numbers</h4>
<p>A random 8-character password might have decent theoretical entropy, yet "password1" — technically similar
length and charset — is cracked essentially instantly, because it's tried from a dictionary first. Theoretical
guess-space size and real-world crack time can diverge enormously.</p>
<h4>What actually moves the needle</h4>
<p>Not being on a common-password list beats everything else combined. After that: length matters more than
substituting a few letters for symbols ("P@ssw0rd" is still weak — it's a well-known substitution pattern,
not real randomness). A random passphrase of 4–5 unrelated words is both stronger and easier to remember than
a short, "clever" one.</p>
<h4>A rough mental model</h4>
<p>Doubling a password's length roughly squares the brute-force search space, while adding one more character
class (say, one symbol) barely moves it. If you can only change one thing, make it longer.</p>`,
      demo: { type: "none" },
      quiz: { q: "Which matters most for real-world password strength?", options: ["Not appearing on a common-password list", "Using at least one number", "Being exactly 8 characters"], answer: 0 }
    },
    {
      id: "diceware", title: "Passphrases & Diceware",
      body: `
<h3>Turning "make it longer" into an actual method</h3>
<p>The last lesson concluded that length beats complexity, and that a random passphrase of unrelated words
beats a short "clever" one. Diceware is a concrete, decades-old recipe for generating exactly that — designed
specifically so the randomness comes from dice, not a human trying to "think random," which people are
provably bad at.</p>
<h4>How it works</h4>
<p>A Diceware word list has exactly 7,776 words (6⁵ — every word maps to a unique sequence of five six-sided
dice rolls). Roll five dice, look up the word, repeat several times, and string the words together:
<code>correct horse battery staple</code> is the famous example. Each word contributes about 12.9 bits of
entropy (log₂ 7776); six words gives roughly 77.5 bits — comfortably beyond what's crackable offline with a
salted, slow hash from the KDF lesson.</p>
<h4>Why dice, specifically</h4>
<p>The security doesn't come from the words being obscure — it comes entirely from the roll being genuinely
random and the word list being large and public. Picking words "randomly" out of your own head is exactly the
failure mode from the earlier lessons: human-chosen "randomness" clusters around familiar, guessable patterns,
the same weakness that makes "P@ssw0rd" a bad password despite looking complex.</p>
<h4>The trade-off that makes it practical</h4>
<p>Four or five real words chain together into something you can actually rehearse and type, unlike a random
string of symbols. That's the whole pitch: comparable or better entropy than a "strong" 12-character random
password, for less memorization effort — provided the word count is high enough and the roll is truly random.</p>`,
      demo: { type: "none" },
      quiz: [
        { q: "Where does a Diceware passphrase's security actually come from?", options: ["The words being obscure or foreign", "The genuinely random dice roll and the size of the public word list", "Mixing upper and lower case"], answer: 1 },
        { q: "Why not just pick 'random' words yourself instead of rolling dice?", options: ["It's slower", "Human-chosen 'random' words aren't actually random — they cluster around familiar patterns", "Self-chosen words are always too long"], answer: 1 }
      ]
    },
    {
      id: "mfa", title: "Multi-factor authentication",
      body: `
<h3>Why a strong password still isn't enough</h3>
<p>Every password lesson so far assumed the password itself is the whole defense. But passwords leak — through
breaches, phishing, or reuse across sites — no matter how strong they are. <strong>Multi-factor
authentication (MFA)</strong> means proving your identity with more than one <em>kind</em> of evidence, so a
leaked password alone isn't enough to get in.</p>
<h4>The three factor categories</h4>
<p><strong>Something you know</strong> — a password or PIN. <strong>Something you have</strong> — a phone
receiving a code, or a hardware key. <strong>Something you are</strong> — a fingerprint or face scan.
Real MFA combines factors from <em>different</em> categories — a password plus a code is two factors; a
password plus a security question is arguably still just one, since both are "something you know."</p>
<h4>Not all second factors are equal</h4>
<p>SMS codes are better than nothing but are vulnerable to SIM-swap attacks, where an attacker convinces a
carrier to move your number to their SIM. Authenticator apps (generating a code from a shared secret and the
current time — a TOTP, time-based one-time password) don't depend on the phone network at all. Hardware
security keys are stronger still: they cryptographically verify the actual website's identity, which makes
them resistant to phishing sites that merely relay a code you type in.</p>
<h4>Where it fits with everything else</h4>
<p>MFA doesn't replace anything from the Passwords unit — salting, slow key derivation, and strong unique
passwords still matter just as much. MFA is a second, independent wall: even a perfectly cracked or leaked
password becomes far less useful to an attacker without it.</p>`,
      demo: { type: "none" },
      quiz: [
        { q: "What makes something genuine multi-factor authentication?", options: ["Two passwords instead of one", "Evidence from more than one factor category (know/have/are)", "A very long password"], answer: 1 },
        { q: "Why are authenticator-app codes generally stronger than SMS codes?", options: ["They're shorter", "They don't depend on the phone network, which SIM-swap attacks exploit", "They never expire"], answer: 1 }
      ]
    },
    {
      id: "hmac", title: "HMAC & message authentication",
      body: `
<h3>Proving a message is genuine</h3>
<p>A plain hash tells you data hasn't changed by accident. An <strong>HMAC</strong> tells you it came from
someone who knows a shared secret key.</p>
<h4>How it works</h4>
<p>HMAC mixes the secret key into the hashing process. Anyone can recompute the HMAC only if they have the key,
so a matching tag proves both integrity and authenticity.</p>
<h4>Where you see it</h4>
<p>Signed cookies, API request signing, and webhook verification all rely on HMAC. Try the HMAC-SHA256
operation in the Workbench.</p>`,
      demo: { type: "none" },
      quiz: { q: "What does HMAC need that a plain hash doesn't?", options: ["A secret key", "The internet", "A longer message"], answer: 0 }
    },
    {
      id: "xor", title: "The XOR cipher",
      body: `
<h3>The XOR cipher</h3>
<p>XOR ("exclusive or") compares two bits and returns 1 only when they differ. Applying the same key twice
cancels out, which makes it reversible: <code>data ⊕ key ⊕ key = data</code>.</p>
<h4>How it's used</h4>
<p>Each byte of the message is XORed with a repeating key. It is the building block inside real stream ciphers,
though a short, reused key is easy to break.</p>
<h4>Why single-byte XOR is weak</h4>
<p>With a one-byte key there are only 256 possibilities — a computer tries them all instantly. Strength comes
from long, random, never-reused keys.</p>`,
      demo: { type: "xor" },
      quiz: { q: "What does XOR with the same key twice do?", options: ["Doubles the encryption", "Returns the original data", "Deletes the data"], answer: 1 }
    },
    {
      id: "otp", title: "The one-time pad",
      body: `
<h3>The one and only unbreakable cipher</h3>
<p>The previous lesson said XOR's strength comes from "long, random, never-reused keys." Push that to the
limit and you get the <strong>one-time pad</strong>: a truly random key <em>as long as the message itself</em>,
used exactly once. It is the only cipher with a mathematical proof of perfect secrecy — with a properly used
pad, the ciphertext gives an attacker literally zero information, no matter how much computing power they have.</p>
<h4>Why it's perfect</h4>
<p>For any ciphertext, <em>every</em> possible plaintext of the same length is equally likely — there's some
key that would produce each one. "ATTACK AT DAWN" and "RETREAT AT TEN" are indistinguishable. There's nothing
to brute-force because every guess is equally consistent with what you see.</p>
<h4>Why almost nobody uses it</h4>
<p>The key must be truly random, as long as all the traffic you'll ever send, delivered to the other side in
secret, and never reused. If you can securely deliver a key that big… you could have just delivered the
message. And <strong>reuse is fatal</strong>: XORing two ciphertexts that share a pad cancels the key out
entirely, leaving one message XORed with the other — this exact mistake broke the Soviet VENONA traffic.</p>
<h4>What we use instead</h4>
<p>Stream ciphers keep the XOR but generate the "pad" from a short key using a deterministic algorithm —
trading perfect secrecy for practicality, which is the basis of everything in the Encryption section ahead.</p>
<h4>Try it</h4>
<p>The demo XORs your text with a key. Imagine the key being random and message-length — that's the pad.</p>`,
      demo: { type: "xor" },
      quiz: { q: "What breaks a one-time pad?", options: ["Enough computing power", "Reusing the pad for a second message", "Messages longer than 100 bytes"], answer: 1 }
    },
    {
      id: "bitwise", title: "AND, OR, NOT, shifts & rotates",
      body: `
<h3>The other bitwise operations</h3>
<p>XOR gets most of the attention because it's reversible with a key, but it's one of several
bit-level building blocks used throughout real cryptography, checksums, and low-level programming.</p>
<h4>AND, OR, NOT</h4>
<p><strong>AND</strong> keeps a bit only if both inputs have it set — it's used to "mask off" specific bits.
<strong>OR</strong> sets a bit if either input has it — used to combine flags. <strong>NOT</strong> flips
every bit. Unlike XOR, AND and OR <em>lose information</em> (you can't undo them with the same key), which is
exactly why XOR — not AND/OR — is the one used for encryption.</p>
<h4>Shifts vs rotates</h4>
<p>A <strong>shift</strong> slides every bit left or right and throws away whatever falls off the end —
it's not reversible, and is mostly used for fast multiply/divide-by-2 tricks and packing data. A
<strong>rotate</strong> does the same slide, but wraps the bits that would fall off back around to the other
side — nothing is lost, so rotating left then right by the same amount always restores the original.
Rotates are a core ingredient inside real hash functions like SHA-256.</p>
<h4>Try it</h4>
<p>In the Workbench's Bitwise category, chain Rotate Bits Left then Rotate Bits Right by the same amount and
watch the output return to hex of the original text.</p>`,
      demo: { type: "none" },
      quiz: { q: "Why is XOR used for encryption instead of AND or OR?", options: ["XOR is faster to compute", "AND and OR lose information and can't be undone", "AND and OR don't work on bytes"], answer: 1 }
    },
    {
      id: "bitmasks", title: "Bitmasks & flags",
      body: `
<h3>Packing 8 yes/no answers into one byte</h3>
<p>The previous lesson called AND a way to "mask off" specific bits without explaining why you'd want to.
Here's the real use: storing many independent true/false settings compactly, by giving each one its own bit
inside a single number — a technique that predates modern computing and is still everywhere.</p>
<h4>Reading flags with AND</h4>
<p>Say bit 0 means "readable," bit 1 means "writable," bit 2 means "executable" — exactly how Unix file
permissions work, one bit group per owner/group/other. To check whether "writable" (bit 1, value
<code>00000010</code>) is set on some permissions byte, AND the byte with <code>00000010</code>: any result
other than zero means that bit was on. Everything else in the byte gets zeroed out by the mask, which is
precisely why it's called a mask.</p>
<h4>Setting and clearing with OR and AND-NOT</h4>
<p>To turn a flag <em>on</em> without disturbing the others, OR the value with the flag's bit. To turn one
<em>off</em>, AND with the inverse of that bit (everything set except the one you want cleared). Both leave
every other bit exactly as it was — the same "don't disturb what you're not touching" property that makes XOR
reversible.</p>
<h4>Where you'll actually see this</h4>
<p>HTTP method routing, terminal color codes, graphics APIs, and network protocol headers all pack multiple
boolean options into one integer this way — it's compact, and testing multiple flags at once is a single fast
AND rather than several separate comparisons.</p>
<h4>Try it</h4>
<p>The demo ANDs your text with a hex mask, byte by byte, and shows the binary result — try mask <code>0f</code>
(keeps only the low 4 bits of each byte) on the letter <code>A</code>.</p>`,
      demo: { type: "bitmask" },
      quiz: [
        { q: "What does ANDing a byte with a mask like 00000010 tell you?", options: ["The byte's total value", "Whether that specific bit is set, with everything else zeroed out", "The byte's ASCII character"], answer: 1 },
        { q: "Why is packing flags into one byte useful?", options: ["It's required by every programming language", "It's compact, and checking several flags becomes one fast AND instead of several comparisons", "It makes the data encrypted"], answer: 1 }
      ]
    },
    {
      id: "hamming", title: "Hamming weight & error detection",
      body: `
<h3>Counting bits to catch transmission errors</h3>
<p>The number of 1-bits in a value is called its <strong>Hamming weight</strong> — a byte like
<code>01000001</code> ('A') has a Hamming weight of 2. It sounds like a trivial thing to count, but it's the
foundation of how computers notice when a bit flips in transit.</p>
<h4>The simplest version: a parity bit</h4>
<p>Add one extra bit to a message, set so the <em>total</em> number of 1-bits (message plus parity) is always
even. If a single bit flips anywhere in transit — a noisy cable, a cosmic ray hitting RAM — the total flips
from even to odd, and the receiving end can tell <em>something</em> broke just by checking the Hamming weight's
parity. This is exactly why it's called a parity bit.</p>
<h4>The catch: detecting isn't correcting</h4>
<p>A single parity bit tells you a bit flipped, but not <em>which</em> one — there's no way to fix it, only to
ask for the data again. Getting from "detect" to "correct" needs more than one parity bit, arranged so their
overlapping coverage of the data bits pins down the exact flipped position — the idea behind
<strong>Hamming codes</strong> (Richard Hamming, 1950), the namesake of Hamming weight. A Hamming(7,4) code
spends 3 parity bits to protect 4 data bits and can pinpoint and correct any single flipped bit automatically.</p>
<h4>Where this runs today</h4>
<p>ECC RAM in servers uses Hamming-code-family error correction to silently fix single-bit memory errors
before they corrupt a running program. RAID storage, QR codes, and deep-space communication (where re-sending
a message can mean a multi-hour round trip) all lean on the same core idea: spend a few extra bits now to
avoid needing a perfect, error-free channel.</p>
<h4>Try it</h4>
<p>The demo counts the set bits in your text, byte by byte, plus a running total — the exact number a parity
scheme checks.</p>`,
      demo: { type: "popcount" },
      quiz: [
        { q: "What does a single parity bit let you do?", options: ["Correct any error automatically", "Detect that a single bit flipped, without knowing which one", "Compress the message"], answer: 1 },
        { q: "What's the key difference a Hamming code adds over a single parity bit?", options: ["It encrypts the data", "Multiple overlapping parity bits let you pinpoint and correct the exact flipped bit", "It makes the message shorter"], answer: 1 }
      ]
    },
    {
      id: "endianness", title: "Endianness: which end is first?",
      body: `
<h3>Endianness: which end is first?</h3>
<p>A number bigger than one byte has to be stored as multiple bytes in some order — and computers have
historically disagreed about which order.</p>
<h4>Big-endian vs little-endian</h4>
<p>The number 0x12345678 (four bytes) can be stored as <code>12 34 56 78</code> — most significant byte
first, called <strong>big-endian</strong>, the same order you'd read the number aloud — or as
<code>78 56 34 12</code> — least significant byte first, called <strong>little-endian</strong>. Both encode
the identical number; only the byte order on disk or on the wire differs.</p>
<h4>Where each one lives</h4>
<p>x86 and ARM (in their default mode) — the CPUs in essentially every desktop, laptop and phone — are
little-endian, so most files and memory dumps you'll ever inspect are too. Network protocols (TCP/IP headers,
and hence the term "network byte order") standardize on big-endian, so any code that reads a raw socket has to
explicitly swap byte order to get the CPU's native form.</p>
<h4>Why this matters for you</h4>
<p>Reading a hex dump or a binary file format spec and getting a wildly wrong number is almost always an
endianness mismatch, not a bug in the data itself. File formats document their byte order explicitly for
exactly this reason — PNG, for instance, mandates big-endian for its integer fields regardless of what CPU
wrote the file.</p>
<h4>Try it</h4>
<p>The demo reverses the byte order of hex you paste in — try <code>12345678</code>.</p>`,
      demo: { type: "endian" },
      quiz: [
        { q: "What does 'little-endian' mean?", options: ["Numbers are stored in a compressed form", "The least significant byte comes first", "The number is signed"], answer: 1 },
        { q: "Which byte order do network protocols conventionally use?", options: ["Little-endian", "Big-endian", "Whichever the sender's CPU prefers"], answer: 1 }
      ]
    },
    {
      id: "bruteforce", title: "Brute-forcing simple ciphers",
      body: `
<h3>Letting the computer try everything</h3>
<p>Single-byte XOR has only 256 possible keys. A Caesar cipher has only 26 possible shifts. Both are small
enough that a computer can simply try <em>every</em> option in a fraction of a second — no cleverness
required, just speed.</p>
<h4>The hard part isn't trying — it's judging</h4>
<p>Trying all 256 XOR keys is trivial. The real challenge is automatically recognising which of the 256
results is actually the right one. ByteLabs' brute force tools score each candidate by how much it reads
like English: mostly printable, mostly letters, matching normal English letter frequency, and — the strongest
signal — containing correctly spelled common words like "the" and "and".</p>
<h4>Be honest about the limits</h4>
<p>This is a heuristic, not a guarantee. A wrong key can occasionally produce text with a plausible letter
distribution purely by chance, especially on short messages, and rank above the true answer. That's why both
brute force tools show a ranked <em>shortlist</em> rather than a single confident answer — the correct result
is reliably near the top, but a human still does the final check by eye. Real password-cracking and
cryptanalysis tools work the same way: narrow the haystack, then verify.</p>
<h4>Try it</h4>
<p>Use XOR Brute Force or Caesar Brute Force in the Workbench on any of the cipher challenges — the true
answer is almost always in the top few lines.</p>`,
      demo: { type: "none" },
      quiz: { q: "Why do the brute force tools show a ranked list instead of one answer?", options: ["To save computing time", "The scoring is a heuristic and can occasionally be wrong, so a human confirms it", "Because there are always multiple correct answers"], answer: 1 }
    },
    {
      id: "uuids", title: "UUIDs: identifiers without a coordinator",
      body: `
<h3>UUIDs: identifiers without a coordinator</h3>
<p>Databases usually hand out IDs by counting: 1, 2, 3… That works fine with one central database, but breaks
down the moment two systems need to generate IDs independently and later combine their data without clashing.
A <strong>UUID</strong> (Universally Unique Identifier) solves this with 128 bits of near-certain uniqueness,
no coordination required.</p>
<h4>The shape</h4>
<p>UUIDs are written as 32 hex digits in five dashed groups —
<code>3fa85f64-5717-4562-b3fc-2c963f66afa6</code>. One hex digit near the middle encodes the
<strong>version</strong> (which generation method was used); this lesson focuses on <strong>version 4</strong>,
the one ByteLabs' generator produces.</p>
<h4>Why random works here</h4>
<p>A v4 UUID is 122 random bits (6 bits are fixed to mark the version and variant). The birthday-problem math
from the hash collisions lesson applies here too: you'd need to generate roughly 2⁶¹ — over 2 billion billion
— UUIDs before a 50% chance of any collision. In practice, that's treated as "never."</p>
<h4>Not every version is random</h4>
<p>Older UUID versions are worth knowing about even though ByteLabs only generates v4: <strong>v1</strong>
encodes the generating computer's MAC address and a timestamp (unique, but leaks information about the
machine and when it ran). Newer <strong>v7</strong> UUIDs deliberately put a timestamp first, so they sort
chronologically — useful as database keys, where pure v4 randomness scatters new rows all over an index and
hurts performance.</p>
<h4>Try it</h4>
<p>Generate a few in the Workbench's Random category (UUID) and paste them side by side — notice the version
digit stays constant while everything else changes.</p>`,
      demo: { type: "none" },
      quiz: [
        { q: "What problem do UUIDs solve that auto-incrementing IDs can't?", options: ["They're shorter to type", "Independent systems can generate IDs with no coordination and no collisions", "They're easier to remember"], answer: 1 },
        { q: "Why might a database prefer UUID v7 over v4 for primary keys?", options: ["v7 is shorter", "v7 embeds a timestamp so IDs sort chronologically, which is friendlier to database indexes", "v7 doesn't need randomness at all"], answer: 1 }
      ]
    },
    {
      id: "jwt", title: "How JWT works",
      body: `
<h3>How JSON Web Tokens work</h3>
<p>A JWT is three Base64url parts joined by dots: <code>header.payload.signature</code>.</p>
<h4>The parts</h4>
<p>The <strong>header</strong> names the signing algorithm. The <strong>payload</strong> carries claims (user, expiry).
The <strong>signature</strong> proves the token wasn't changed.</p>
<h4>Important</h4>
<p>Header and payload are only encoded, not encrypted — anyone can read them. Never put secrets in a payload.</p>`,
      demo: { type: "jwt" },
      quiz: { q: "Is a JWT payload encrypted?", options: ["Yes, fully", "No, only Base64-encoded", "Only the header"], answer: 1 }
    },
    {
      id: "url", title: "How URLs are encoded",
      body: `
<h3>How URLs are encoded</h3>
<p>URLs allow a limited character set. Anything else — spaces, accents, <code>&</code>, <code>?</code> — becomes
<code>%</code> followed by the byte value in hex.</p>
<h4>Example</h4>
<p>A space is <code>%20</code>, and <code>é</code> is <code>%C3%A9</code> (its two UTF-8 bytes).</p>`,
      demo: { type: "url" },
      quiz: { q: "What is %20?", options: ["A space", "The number 20", "A newline"], answer: 0 }
    },
    {
      id: "mime", title: "Quoted-Printable & email encoding",
      body: `
<h3>Quoted-Printable & email encoding</h3>
<p>Email was designed decades ago around plain 7-bit ASCII, and plenty of old infrastructure still assumes it.
Two encodings exist to squeeze arbitrary bytes through that narrow pipe: Base64, and
<strong>Quoted-Printable</strong>.</p>
<h4>How it works</h4>
<p>Bytes that are already safe, printable ASCII pass through completely unchanged. Anything else — accented
letters, emoji, raw binary — becomes <code>=</code> followed by two hex digits. A literal <code>=</code> in the
original text has to be escaped too, as <code>=3D</code>, so a decoder can always tell an escape from a real
equals sign.</p>
<h4>Why not just use Base64 for everything?</h4>
<p>Base64 is denser for mostly non-ASCII content, but it makes plain English completely unreadable in transit —
every byte gets remapped. Quoted-Printable keeps an English email <em>mostly readable as plain text</em> even
before decoding, with only the occasional accented word or symbol escaped. That trade-off is why email clients
still pick between the two depending on the content.</p>
<h4>Try it</h4>
<p>The demo below runs Quoted-Printable encoding. Try a word with an accent, or a literal <code>=</code> sign.</p>`,
      demo: { type: "qp" },
      quiz: { q: "In Quoted-Printable, what happens to a plain ASCII letter like 'A'?", options: ["It passes through unchanged", "It becomes =41", "It gets Base64-encoded"], answer: 0 }
    },
    {
      id: "unicode", title: "How Unicode works",
      body: `
<h3>How Unicode &amp; UTF-8 work</h3>
<p>Unicode gives every character a number (code point); UTF-8 stores those numbers as bytes.</p>
<h4>Why UTF-8 won</h4>
<p>ASCII stays one byte, so English is unchanged, while other characters use 2–4 bytes. Backward compatible and
space efficient.</p>`,
      demo: { type: "hex" },
      quiz: { q: "How many bytes is a plain ASCII letter in UTF-8?", options: ["One", "Two", "Four"], answer: 0 }
    },
    {
      id: "surrogates", title: "Emoji & surrogate pairs",
      body: `
<h3>Why emoji.length is 2 in JavaScript</h3>
<p>Type <code>"😀".length</code> into a JavaScript console and it prints <code>2</code> — for one visible
character. That's not a bug. It's a direct consequence of how JavaScript strings are built, and it trips up
real code (broken string truncation, mangled character counts) constantly.</p>
<h4>Two different "how big is a character" questions</h4>
<p>The Unicode lesson covered UTF-8, which stores each code point as 1–4 <em>bytes</em>. JavaScript strings
use a completely different internal representation called <strong>UTF-16</strong>, which counts in 16-bit
<em>code units</em>, not bytes. Most characters fit in one 16-bit unit. 😀 (code point U+1F600) doesn't — it's
above the range a single 16-bit unit can hold.</p>
<h4>The fix: surrogate pairs</h4>
<p>UTF-16 handles code points that don't fit by spending <em>two</em> 16-bit units on them together — a
"surrogate pair," here <code>D83D DE00</code>. JavaScript's <code>.length</code> counts 16-bit units, so it
sees two, even though a person sees one emoji. The same emoji in UTF-8 (what actually goes over the network)
is 4 bytes: <code>F0 9F 98 80</code> — a different number again, because bytes and 16-bit units aren't the
same unit of measurement.</p>
<h4>Why this actually bites</h4>
<p>Code that slices a string by <code>.length</code> to "truncate to 100 characters" can slice a surrogate
pair in half, corrupting the emoji into two broken replacement characters. The fix is iterating with
<code>Array.from(str)</code> or a <code>for...of</code> loop, both of which are surrogate-pair aware and
count 😀 as the single character it visually is.</p>
<h4>Try it</h4>
<p>The demo shows the UTF-8 hex bytes of whatever you type — paste an emoji and count 4 bytes for the ones
outside the Basic Multilingual Plane.</p>`,
      demo: { type: "hex" },
      quiz: [
        { q: "Why does \"😀\".length equal 2 in JavaScript?", options: ["Emoji are always stored twice for redundancy", "JavaScript counts 16-bit UTF-16 code units, and this emoji needs a 2-unit surrogate pair", "It's a bug in the JavaScript spec"], answer: 1 },
        { q: "What can go wrong when code truncates a string using .length?", options: ["Nothing, it's always safe", "It can slice a surrogate pair in half, corrupting the character", "It becomes case-sensitive"], answer: 1 }
      ]
    },
    {
      id: "mojibake", title: "Mojibake: when encodings collide",
      body: `
<h3>Why text sometimes turns into gibberish</h3>
<p>Bytes have no built-in meaning — the same byte sequence is read differently depending which text encoding
is used to interpret it. <strong>Mojibake</strong> (文字化け, Japanese for "character transformation") is what
happens when the wrong one is picked.</p>
<h4>A classic example</h4>
<p>The word <code>café</code> saved as UTF-8 produces the bytes for <code>c a f Ã © </code>. If a program
reads those bytes assuming an older encoding like Latin-1 instead of UTF-8, "é" (two UTF-8 bytes) gets shown
as two separate wrong characters: <code>Ã©</code>.</p>
<h4>Why UTF-8 mostly won this fight</h4>
<p>Because UTF-8 is now the overwhelming default on the web, mismatches are rarer than they used to be — but
old files, some Windows software, and misconfigured servers still cause it.</p>
<h4>Try it</h4>
<p>Encode a word with accents to hex in the Workbench, then imagine reading those same bytes with a different
encoding — that mismatch is exactly what produces mojibake.</p>`,
      demo: { type: "hex" },
      quiz: { q: "What actually causes mojibake?", options: ["A corrupted file", "Reading bytes with the wrong text encoding", "A weak password"], answer: 1 }
    },
    {
      id: "homoglyphs", title: "Lookalike characters & homoglyph attacks",
      body: `
<h3>When two characters look identical but aren't</h3>
<p>Unicode has over 140,000 characters, and quite a few from different alphabets render nearly or exactly
identically. The Latin letter <code>a</code> (U+0061) and the Cyrillic letter <code>а</code> (U+0430) look the
same in most fonts but are completely different code points.</p>
<h4>Why this is a security problem</h4>
<p>An attacker can register <code>аpple.com</code> using a Cyrillic "а" — visually indistinguishable from
<code>apple.com</code>, but a different domain entirely. This is called a <strong>homoglyph</strong> or IDN
homograph attack, and it has been used for real phishing campaigns.</p>
<h4>How to actually tell them apart</h4>
<p>You can't, by eye. You need to inspect the underlying code points — exactly what the Character Inspector in
Analyse does. Two visually-identical characters will show different <code>U+</code> values.</p>
<h4>Punycode: how this actually reaches DNS</h4>
<p>Domain names are ASCII-only under the hood, so browsers convert any non-ASCII label to an ASCII-Compatible
Encoding called <strong>Punycode</strong> (RFC 3492) before sending it over the wire —
<code>münchen.de</code> becomes <code>xn--mnchen-3ya.de</code>. Try the To/From Punycode operations in The
Lab. Interestingly, browsers deliberately do <em>not</em> expose an automatic Punycode-to-Unicode decode in
script-visible APIs — doing so would make it trivially easy for a page to silently redisplay a spoofed
<code>xn--</code> domain as convincing-looking Unicode.</p>
<h4>Normalization</h4>
<p>Unicode also allows the <em>same</em> character to be encoded multiple ways (an "é" as one code point, or
as "e" plus a separate accent mark). <strong>Normalization</strong> (NFC/NFD forms) picks one canonical
representation so comparisons like login lookups don't silently fail or get spoofed.</p>`,
      demo: { type: "none" },
      quiz: { q: "How can you reliably tell two identical-looking characters apart?", options: ["Zoom in on the font", "Compare their underlying Unicode code points", "You can't, they are always the same"], answer: 1 }
    },
    {
      id: "base32", title: "Base32 vs Base64",
      body: `
<h3>Base32 vs Base64</h3>
<p>Both turn bytes into text, but with different alphabets.</p>
<h4>Base64</h4>
<p>Uses 64 characters, so 3 bytes become 4 characters — compact, but includes <code>+</code>, <code>/</code>
and mixed case, which aren't always safe.</p>
<h4>Base32</h4>
<p>Uses just 32 characters (A–Z and 2–7). It is longer, but case-insensitive and easy to type or read aloud —
handy for things like secret keys and one-time-password seeds.</p>
<h4>Try it</h4>
<p>The demo encodes to Base32.</p>`,
      demo: { type: "base32" },
      quiz: { q: "Why choose Base32 over Base64?", options: ["It is shorter", "It is case-insensitive and easy to type", "It is encrypted"], answer: 1 }
    },
    {
      id: "entropy", title: "Entropy & randomness",
      body: `
<h3>Entropy & randomness</h3>
<p>Entropy measures how unpredictable data is, in bits per byte (0 to 8). Plain English sits around 3.5–5;
compressed, encrypted or random data sits near 8.</p>
<h4>Why it's useful</h4>
<p>A file with very high entropy is probably compressed or encrypted. Security tools use entropy to spot packed
malware or hidden encrypted blobs.</p>
<h4>Randomness matters</h4>
<p>Keys and passwords must come from real randomness. ByteLabs' generators use the browser's cryptographic
random source, not <code>Math.random()</code>. Try the demo, or the Entropy operation in the Workbench.</p>`,
      demo: { type: "entropy" },
      quiz: { q: "High entropy (near 8 bits/byte) usually means…", options: ["Plain English", "Compressed or encrypted data", "An empty file"], answer: 1 }
    },
    {
      id: "frequency", title: "Breaking ciphers with frequency analysis",
      body: `
<h3>Breaking substitution ciphers</h3>
<p>Simple ciphers (Caesar, Atbash, or any one-letter-for-another substitution) don't hide the <em>shape</em>
of the language underneath.</p>
<h4>The weakness</h4>
<p>In English, <code>E</code> is by far the most common letter, followed by T, A, O, I, N. Whatever letter a
cipher uses most often is probably standing in for E.</p>
<h4>How to attack</h4>
<p>Run the ciphertext through the <strong>Letter frequency</strong> operation, line up the peaks against normal
English frequencies, and the substitutions start to fall out. For a Caesar cipher you only need to find one
correct letter to recover the shift.</p>
<h4>Why modern ciphers resist this</h4>
<p>Good encryption produces near-uniform output — every byte value is roughly equally likely — so there is no
frequency pattern to exploit.</p>`,
      demo: { type: "frequency" },
      quiz: { q: "Which letter is most common in English text?", options: ["E", "Z", "Q"], answer: 0 }
    },
    {
      id: "kerckhoffs", title: "Kerckhoffs's principle",
      body: `
<h3>Why secrecy belongs in the key, not the algorithm</h3>
<p>Every cipher in this unit has one thing in common: once you know the <em>method</em> — shift letters, swap
columns, XOR with a repeating key — you can decrypt anything encrypted with it, given the key. That's not a
flaw specific to weak ciphers. It's supposed to be true of every cipher, including the strongest ones in use
today.</p>
<h4>The principle, stated in 1883</h4>
<p>Auguste Kerckhoffs proposed a rule that still governs cryptography: <strong>a cryptosystem should be secure
even if everything about it is public knowledge except the key.</strong> AES's algorithm is published, studied,
and implemented in open-source libraries everywhere. What's secret is only the key.</p>
<h4>Why "secret algorithm" designs keep failing</h4>
<p>The tempting alternative — keeping the algorithm itself secret, "security through obscurity" — sounds like
an extra layer of protection but consistently fails in practice. Algorithms get leaked, reverse-engineered
from a binary, or reconstructed by observing inputs and outputs. Worse, a secret algorithm never gets tested
by outside cryptographers, so its weaknesses go undiscovered until an attacker finds them first, not a
researcher who'd report them.</p>
<h4>What this means for you</h4>
<p>Every classical cipher in this unit is "broken" not because you now know a clever trick — it's broken
because knowing the method (which you now do) plus a modest amount of ciphertext is enough, regardless of key.
A cipher that only holds up while its method stays secret was never actually secure — which is exactly why
real systems (AES, RSA, TLS) publish their algorithms and put all their security weight on the key.</p>`,
      demo: { type: "none" },
      quiz: [
        { q: "What does Kerckhoffs's principle say a cryptosystem should rely on for its security?", options: ["Keeping the algorithm secret", "Keeping only the key secret, even if the algorithm is public", "Using the longest possible ciphertext"], answer: 1 },
        { q: "Why does 'security through obscurity' (secret algorithms) tend to fail?", options: ["Secret algorithms are always slower", "They avoid public scrutiny, so weaknesses go unfound until an attacker exploits them", "They require more computing power"], answer: 1 }
      ]
    },
    {
      id: "base58", title: "What is Base58?",
      body: `
<h3>What is Base58?</h3>
<p>Base58 is like Base64 but with the confusing characters removed: no <code>0</code>/<code>O</code>,
no <code>l</code>/<code>I</code>, and no <code>+</code> or <code>/</code>.</p>
<h4>Why it exists</h4>
<p>It was designed for Bitcoin addresses, where a human might copy a value by hand. Dropping look-alike
characters means fewer costly typos.</p>
<h4>Trade-off</h4>
<p>It is slightly longer than Base64 and the maths is a bit slower (it treats the whole input as one big
number), but for short identifiers that's fine.</p>`,
      demo: { type: "base58" },
      quiz: { q: "Why does Base58 drop characters like 0 and O?", options: ["To save space", "To avoid look-alike typos", "For encryption"], answer: 1 }
    },
    {
      id: "density", title: "Encoding efficiency: hex to Base85",
      body: `
<h3>How dense can a text encoding get?</h3>
<p>Every "binary-to-text" encoding pays a size tax — it represents 8-bit bytes using a smaller, safer alphabet,
so the output is always longer than the input. How much longer depends on the alphabet size.</p>
<h4>The ladder</h4>
<p><strong>Binary</strong> (2 symbols): 8× the size — one character per bit.
<strong>Hex</strong> (16 symbols): 2× — two characters per byte.
<strong>Base32</strong> (32 symbols): 1.6× — 8 characters per 5 bytes.
<strong>Base64</strong> (64 symbols): 1.33× — 4 characters per 3 bytes.
<strong>Base85</strong> (85 symbols): 1.25× — 5 characters per 4 bytes.</p>
<h4>Why not always use the densest?</h4>
<p>Bigger alphabets need riskier characters. Base85 uses quotes, backslashes and angle brackets — characters
that break JSON strings, URLs and HTML if you paste them in raw. Base64 is the sweet spot for most uses:
dense enough, and its alphabet survives almost everywhere. Base85 shows up where the container is trusted,
like PostScript/PDF internals and git's binary patches.</p>
<h4>The theoretical wall</h4>
<p>You can't do much better: with only ~94 printable ASCII characters available, roughly 1.22× is the floor.
Base85 is nearly optimal — everything after it is diminishing returns.</p>
<h4>Try it</h4>
<p>The demo encodes your text as Base85. Compare its length with the Base64 of the same text in The Lab.</p>`,
      demo: { type: "base85" },
      quiz: { q: "Why isn't Base85 used everywhere Base64 is?", options: ["It's much slower to compute", "Its alphabet includes characters that break JSON, URLs and HTML", "It's proprietary"], answer: 1 }
    },
    {
      id: "base45lesson", title: "Base45: encoding tuned for QR codes",
      body: `
<h3>A denser encoding that's still the wrong choice</h3>
<p>The last lesson ranked encodings purely by output size and crowned Base85 the winner. Base45 (RFC 9285)
breaks that ranking on purpose — it's <em>less</em> dense than Base85 (2 bytes become 3 characters, a 1.5×
expansion, worse than Base85's 1.25×) and is still the right tool for one very specific, very common job:
data inside a QR code, including EU Digital COVID Certificates.</p>
<h4>Why "smaller text" isn't the metric that matters here</h4>
<p>QR codes don't store text — they store modules (the black/white squares), and different QR "modes" pack
different alphabets into those modules at different densities. <strong>Byte mode</strong> spends a full 8 bits
per character, accepting any alphabet. <strong>Alphanumeric mode</strong> restricts the alphabet to 45
specific characters chosen so that <em>two</em> of them pack into just 11 bits (45×45 = 2,025, comfortably
under 2¹¹ = 2,048) — noticeably denser than byte mode's 16 bits for the same two characters.</p>
<h4>The actual trade-off</h4>
<p>Base45's alphabet was picked to be exactly QR alphanumeric mode's 45-character set. So a Base45 string,
once inside a QR code, uses alphanumeric mode's tighter packing — even though the Base45 <em>text itself</em>
is bigger than Base85 would produce. Optimizing for "smallest string" and optimizing for "smallest QR code"
are different goals, and Base45 is built for the second one.</p>
<h4>Try it</h4>
<p>The demo encodes your text as Base45 — compare its output length with Base85's on the same input in The Lab.</p>`,
      demo: { type: "base45" },
      quiz: [
        { q: "Is Base45's text output smaller or larger than Base85's for the same input?", options: ["Smaller — Base45 is always denser", "Larger — 1.5× expansion versus Base85's 1.25×", "Identical"], answer: 1 },
        { q: "Why is Base45 still the right choice for QR codes despite that?", options: ["Its alphabet matches QR alphanumeric mode, which packs those specific 45 characters more densely than byte mode", "QR codes can't store Base85's characters at all", "It's faster to compute"], answer: 0 }
      ]
    },
    {
      id: "morse", title: "Morse code & variable-length codes",
      body: `
<h3>Morse code & variable-length codes</h3>
<p>Morse code (1830s) is one of the earliest digital encodings — every letter becomes a pattern of short and
long signals. It's still worth understanding because it introduced an idea modern compression relies on.</p>
<h4>Frequent letters get short codes</h4>
<p><code>E</code>, the most common English letter, is a single dot. <code>T</code> is a single dash. Rare
letters like <code>Q</code> get four symbols. Giving the most frequent symbols the shortest codes minimises
the average message length — the exact principle behind Huffman coding, which sits inside ZIP, JPEG and MP3
files today.</p>
<h4>The catch with variable-length codes</h4>
<p>If codes have different lengths, how do you know where one letter ends? Morse solves it with pauses —
a short gap between letters, a longer one between words (shown as <code>/</code> here). Huffman coding solves
it more cleverly: no code is a prefix of any other, so the boundaries are unambiguous without any separator.</p>
<h4>Try it</h4>
<p>The demo encodes your text as Morse. Notice how <code>E</code> and <code>T</code> practically disappear.</p>`,
      demo: { type: "morse" },
      quiz: { q: "Why does Morse give E a single dot?", options: ["It was easiest to remember", "Frequent letters get short codes to shorten messages overall", "Dots were cheaper to send than dashes"], answer: 1 }
    },
    {
      id: "datauri", title: "Data URIs: files hiding in text",
      body: `
<h3>Data URIs: files hiding in text</h3>
<p>Everything in the Encodings unit has been building to a genuinely useful trick: embedding an entire file —
an image, a font, a small icon — directly inside a URL, a CSS file, or an HTML document, with no separate
request needed.</p>
<h4>The format</h4>
<p>A data URI looks like <code>data:[mime type];base64,[the Base64-encoded bytes]</code>. A tiny red dot PNG
might become <code>data:image/png;base64,iVBORw0KG...</code>, pasted directly into an <code>&lt;img src&gt;</code>
or a CSS <code>background-image</code>. The browser decodes it in place — no network round trip.</p>
<h4>Why Base64, specifically</h4>
<p>URLs, CSS, and HTML attributes are text formats — raw binary bytes would collide with syntax characters
(quotes, <code>&amp;</code>, whitespace). Base64's alphabet is exactly the set of characters that survive
untouched everywhere: this is the same reasoning from the Base64 lesson, just applied to whole files instead
of short strings.</p>
<h4>The trade-off</h4>
<p>Base64 inflates size by about a third (the Encoding efficiency lesson covered why), and inlined data can't
be cached separately from the page that contains it. It's a good fit for small, page-specific assets — a
favicon, a tiny sprite — and a poor fit for a large shared image used across a whole site.</p>
<h4>Try it</h4>
<p>The demo below wraps your text in a <code>data:</code> URI. Paste the result into a browser's address bar
to see it "load" as a page.</p>`,
      demo: { type: "datauri" },
      quiz: [
        { q: "What does a data URI let a browser do?", options: ["Fetch a file from a CDN faster", "Embed a whole file's bytes directly in the URL/HTML/CSS text", "Compress a file before download"], answer: 1 },
        { q: "Why does a data URI use Base64 rather than raw bytes?", options: ["Base64 is smaller", "Raw bytes would collide with the surrounding text syntax", "Base64 is faster to decode"], answer: 1 }
      ]
    },
    {
      id: "networking", title: "IPv4 addresses under the hood",
      body: `
<h3>IPv4 addresses under the hood</h3>
<p>An IPv4 address like <code>192.168.1.1</code> looks like four separate numbers, but routers and computers
don't actually store it that way.</p>
<h4>It's really one 32-bit number</h4>
<p>Each of the four "octets" is one byte (0–255), and the dotted-quad form is just a human-readable way to write
a single 32-bit unsigned integer. <code>192.168.1.1</code> is exactly
<code>192×16777216 + 168×65536 + 1×256 + 1 = 3232235777</code> — try it with the IPv4 to Integer operation.</p>
<h4>Why this representation matters</h4>
<p>Routing tables, subnet masks, and access-control rules all operate on the integer form under the hood — a
subnet is really just "these high bits must match." Converting between the two forms is a routine task in
networking tools, log analysis, and firewall configuration.</p>
<h4>The address space</h4>
<p>32 bits means about 4.3 billion possible addresses total — which sounded huge in the 1980s and turned out not
to be, which is the whole reason IPv6 (128-bit addresses) exists.</p>
<h4>Try it</h4>
<p>The demo below converts an IPv4 address to its integer form.</p>`,
      demo: { type: "ipv4" },
      quiz: { q: "What is a dotted-quad IPv4 address really, under the hood?", options: ["Four unrelated numbers", "A single 32-bit unsigned integer, split into 4 bytes for readability", "A hash of the hostname"], answer: 1 }
    },
    {
      id: "subnetting", title: "Subnetting: splitting a network into pieces",
      body: `
<h3>Splitting one network into many</h3>
<p>The last lesson showed that an IPv4 address is a single 32-bit integer, and that a subnet is really "these
high bits must match." Subnetting is the practical technique built on exactly that fact: carving one big
address block into smaller ones by moving the dividing line between "network" and "host" bits.</p>
<h4>CIDR notation</h4>
<p><code>192.168.1.0/24</code> means the first 24 bits are the fixed network portion, leaving 8 bits (2⁸ = 256
addresses) for hosts. Two of those are reserved — the all-zero <strong>network address</strong>
(<code>.0</code>, names the network itself) and the all-one <strong>broadcast address</strong> (<code>.255</code>,
reaches every host at once) — leaving 254 usable addresses for actual devices.</p>
<h4>Moving the line</h4>
<p>Push the prefix from <code>/24</code> to <code>/25</code> and you've taken one bit away from the host
portion and given it to the network portion: 128 addresses instead of 256, but now there are <em>two</em>
independent /25 blocks (<code>192.168.1.0/25</code> and <code>192.168.1.128/25</code>) where there used to be
one /24. Every extra bit of prefix halves the block size and doubles the number of blocks — the same doubling
pattern that shows up anywhere binary is involved.</p>
<h4>Why bother splitting</h4>
<p>Separate subnets can sit behind separate routers, get separate firewall rules, and contain broadcast
traffic to a smaller group instead of flooding an entire building's network with it — an office might split
one address range into per-floor or per-department subnets for exactly these reasons.</p>
<h4>Try it</h4>
<p>The demo below computes the network address, broadcast address, and usable host range for a CIDR block —
try <code>192.168.1.10/24</code>, then compare it against <code>192.168.1.10/26</code>.</p>`,
      demo: { type: "subnet" },
      quiz: [
        { q: "In 192.168.1.0/24, what does the /24 mean?", options: ["24 devices are connected", "The first 24 bits are the fixed network portion", "The subnet is 24 years old"], answer: 1 },
        { q: "What happens to a subnet's size when you move its prefix from /24 to /25?", options: ["It doubles", "It stays the same", "It halves, and the freed bit creates a second independent block"], answer: 2 }
      ]
    },
    {
      id: "unixtime", title: "Unix time",
      body: `
<h3>Unix time</h3>
<p>Most computer systems don't store dates as year/month/day. They count the seconds since one fixed instant:
<strong>midnight UTC, 1 January 1970</strong> — the "Unix epoch." Right now the count is somewhere past
1.7 billion.</p>
<h4>Why a single number wins</h4>
<p>Comparing two dates becomes comparing two integers. "Three days from now" is just <code>+ 259200</code>.
There are no time zones, months of different lengths, or daylight-saving jumps inside the number itself —
all of that mess is applied only at the last moment, when a timestamp is <em>displayed</em> to a human in
their local zone.</p>
<h4>Where you'll meet it</h4>
<p>Log files, JWT expiry claims (<code>exp</code>, <code>iat</code> — you saw these in the JWT lesson),
file metadata, cookies, APIs. When something shows a date of <em>1 January 1970</em>, you're looking at a
timestamp of zero — usually a bug where "no value" got rendered as a date.</p>
<h4>The year-2038 problem</h4>
<p>Old systems store the count as a signed 32-bit integer, which tops out at 2,147,483,647 — that second
arrives on <strong>19 January 2038</strong>, when such systems overflow to a negative number and read it as
1901. Modern 64-bit timestamps push the limit billions of years out.</p>
<h4>Try it</h4>
<p>The demo converts a date (try <code>2024-06-15</code>) to its Unix timestamp.</p>`,
      demo: { type: "unixtime" },
      quiz: { q: "What is Unix time?", options: ["Hours since the year 2000", "Seconds since midnight UTC on 1 Jan 1970", "The server's local wall-clock time"], answer: 1 }
    },
    {
      id: "regex", title: "Regular expressions",
      body: `
<h3>Regular expressions</h3>
<p>A regex is a small pattern language for matching text. The Find &amp; Replace and Extract operations both use it.</p>
<h4>Building blocks</h4>
<p><code>\\d</code> a digit, <code>\\w</code> a word character, <code>.</code> any character, <code>+</code>
one or more, <code>*</code> zero or more, <code>[abc]</code> a set, <code>^</code>/<code>$</code> start/end.</p>
<h4>Example</h4>
<p><code>\\d{3}-\\d{4}</code> matches a phone number like <code>555-1234</code>. Try the Extract operation to
pull emails or IPs out of a block of text.</p>`,
      demo: { type: "regex" },
      quiz: { q: "What does \\d match in a regex?", options: ["Any letter", "A single digit", "A space"], answer: 1 }
    },
    {
      id: "merkletrees", title: "Merkle trees: hashing structured data",
      body: `
<h3>Hashing more than one file at once</h3>
<p>A single SHA-256 hash proves one blob of data hasn't changed. But real systems — Git repositories, download
managers, blockchains — need to verify thousands of files or transactions at once, and ideally prove that
<em>one specific piece</em> is unaltered without re-checking everything else. That's what a Merkle tree is for.</p>
<h4>Building the tree</h4>
<p>Hash every individual piece of data first (the "leaves"). Then hash each <em>pair</em> of those hashes
together to get one level up. Keep pairing and hashing up the tree until a single hash remains at the top —
the <strong>root hash</strong>. That one root hash is a fingerprint of every leaf underneath it, thanks to the
avalanche effect from the Hashing lesson: change any single leaf, and the change ripples all the way up to a
completely different root.</p>
<h4>The payoff: proving one leaf without the rest</h4>
<p>To prove one specific leaf belongs under a known root, you don't need the whole dataset — just that leaf
plus the small handful of sibling hashes on the path up to the root (a "Merkle proof"). For a million leaves,
that's about 20 hashes instead of a million. This is exactly how Git can tell a single file changed inside a
massive repository, and how lightweight blockchain clients verify a transaction is included in a block without
downloading the entire chain.</p>
<h4>Try it</h4>
<p>The demo hashes your text with SHA-256 — imagine feeding two such hashes back in as the input to the next
level up, and you've built the bottom of a Merkle tree.</p>`,
      demo: { type: "hash" },
      quiz: [
        { q: "What does a Merkle tree's root hash represent?", options: ["The hash of only the largest file", "A single fingerprint covering every leaf underneath it", "A password for the dataset"], answer: 1 },
        { q: "Why is a Merkle proof useful?", options: ["It compresses the data", "It proves one leaf belongs to a known root using only a few sibling hashes, not the whole dataset", "It encrypts the leaf"], answer: 1 }
      ]
    },
    {
      id: "checksums", title: "Checksums vs cryptographic hashes",
      body: `
<h3>Checksums vs cryptographic hashes</h3>
<p>Both turn data into a short value, but they answer different questions.</p>
<h4>Checksums (CRC-32, Adler-32)</h4>
<p>Fast, tiny, and built to catch <em>accidental</em> changes — a flipped bit during a download or transfer.
They are easy to fool on purpose, so never use them for security. <strong>Adler-32</strong> is even simpler and
faster than CRC-32 (it's what zlib/gzip use internally) — just two running sums — but that simplicity makes it
noticeably weaker at catching certain kinds of corruption, especially in short messages. CRC-32 remains the
better default checksum; Adler-32 trades a little reliability for speed on large files.</p>
<h4>Cryptographic hashes (SHA-256)</h4>
<p>Designed so that no one can craft two inputs with the same hash, or work backwards from the hash. Slower,
but suitable for verifying integrity against a determined attacker.</p>
<h4>Rule of thumb</h4>
<p>Guarding against noise? A checksum is fine. Guarding against people? Use a cryptographic hash.</p>`,
      demo: { type: "crc" },
      quiz: { q: "Which is safe against a deliberate attacker?", options: ["CRC-32", "SHA-256", "Both equally"], answer: 1 }
    },
    {
      id: "affine", title: "The Affine cipher: Caesar with math",
      body: `
<h3>The Affine cipher: Caesar with math</h3>
<p>Caesar shifts every letter by the same fixed amount — a purely additive operation. The <strong>Affine
cipher</strong> generalizes that into a full linear equation: <code>E(x) = (a·x + b) mod 26</code>, where
<code>x</code> is a letter's position (A=0…Z=25). Caesar is just the special case where <code>a = 1</code>.</p>
<h4>Why 'a' can't be just any number</h4>
<p>Multiplying by <code>a</code> only produces a valid one-to-one substitution — every ciphertext letter maps
back to exactly one plaintext letter — if <code>a</code> shares no common factor with 26, i.e. <code>a</code>
must be coprime to 26. Pick <code>a = 2</code> and half the alphabet collapses onto the same output letters,
making decoding ambiguous. Only 12 values of <code>a</code> out of 26 actually work (1, 3, 5, 7, 9, 11, 15, 17,
19, 21, 23, 25).</p>
<h4>Decoding needs a modular inverse</h4>
<p>Decrypting reverses the equation: <code>D(y) = a⁻¹·(y − b) mod 26</code>, where <code>a⁻¹</code> is the
<strong>modular inverse</strong> of <code>a</code> — the number that multiplies back to 1 mod 26. Finding it
uses the extended Euclidean algorithm, the same tool that underpins real modular arithmetic in RSA.</p>
<h4>Still just substitution</h4>
<p>Despite the extra math, Affine is still a one-letter-for-another substitution cipher underneath — a slightly
bigger key space than Caesar (12 × 26 = 312 combinations instead of 26), but just as vulnerable to the
frequency analysis covered later in this unit.</p>
<h4>Try it</h4>
<p>The demo below runs Affine encode. The key format is <code>a,b</code> — try the default <code>5,8</code>, or
an invalid <code>a</code> like <code>2,8</code> to see the error.</p>`,
      demo: { type: "affine" },
      quiz: [
        { q: "What must be true of 'a' in the Affine cipher for decoding to work?", options: ["It must be even", "It must be coprime to 26 (share no common factor)", "It must be greater than 13"], answer: 1 },
        { q: "What is the Caesar cipher, in Affine cipher terms?", options: ["Affine with a=1", "Affine with b=0", "Not related to Affine at all"], answer: 0 }
      ]
    },
    {
      id: "polybius", title: "The Polybius square: letters as coordinates",
      body: `
<h3>The Polybius square: letters as coordinates</h3>
<p>Instead of substituting one letter for another letter, the <strong>Polybius square</strong> (invented in
ancient Greece) substitutes each letter for a pair of coordinates on a 5×5 grid.</p>
<h4>Building the grid</h4>
<p>Write the 26-letter alphabet into a 5×5 grid (25 cells) by combining <code>I</code> and <code>J</code> into
one cell — 25 letters fit exactly. Number both rows and columns 1–5. Every letter now has a unique
row,column pair: <code>B</code> sits at row 1, column 2, so it becomes <code>12</code>.</p>
<h4>Why coordinates instead of letters</h4>
<p>A ciphertext made only of digit pairs looks completely different from letter-substitution ciphertext, and —
more usefully historically — digit pairs are easy to transmit as pairs of flag signals, lamp flashes, or tap
codes. Prisoners of war have used Polybius-square tap codes (tapping row, then column) to communicate silently
between cells.</p>
<h4>Still breakable the same way</h4>
<p>Structurally it's still a one-to-one substitution — swap "coordinate pair" for "letter" and the same
frequency-analysis attack covered later in this unit still applies, since each plaintext letter always maps to
the same coordinate pair.</p>
<h4>Try it</h4>
<p>The demo below runs Polybius Square Encode — try a word containing <code>J</code> and see it come out the
same as <code>I</code> would.</p>`,
      demo: { type: "polybius" },
      quiz: { q: "Why does the Polybius square combine I and J into one cell?", options: ["They sound alike", "A 5x5 grid has only 25 cells for 26 letters", "J wasn't part of the ancient Greek alphabet"], answer: 1 }
    },
    {
      id: "bacon", title: "The Bacon cipher: hiding a message in plain sight",
      body: `
<h3>The Bacon cipher: hiding a message in plain sight</h3>
<p>Every cipher so far scrambles a message so it's unreadable, but still obviously a ciphertext to anyone who
intercepts it. The <strong>Bacon cipher</strong> (Francis Bacon, ~1605) does something different: it hides a
secret message inside what looks like ordinary text — this is <strong>steganography</strong>, hiding that a
secret exists at all, not just hiding its content.</p>
<h4>The 5-bit encoding</h4>
<p>Each letter becomes a unique 5-bit pattern of just two symbols, traditionally called <code>A</code> and
<code>B</code> — 2⁵ = 32 combinations, enough for the 24-letter Latin alphabet Bacon used (I/J and U/V shared,
similar to the Polybius square's I/J). <code>A</code> is <code>AAAAA</code>, <code>B</code> is <code>AAAAB</code>,
and so on up through the alphabet.</p>
<h4>The real trick: carrying it invisibly</h4>
<p>The A/B pattern itself isn't the hiding place — it's just a binary code, no more secret than Morse. Bacon's
actual innovation was <em>carrying</em> that binary pattern inside an innocent-looking cover text: two visually
similar typefaces standing in for A and B, so a letter sent openly could contain a hidden message that only
someone who knew to look for the typeface pattern would ever notice. Modern equivalents hide the same A/B
pattern in whitespace, capitalization, or even which synonym is chosen in each sentence.</p>
<h4>Steganography vs encryption</h4>
<p>Encryption hides <em>what</em> a message says, assuming everyone can see a message was sent. Steganography
hides that a message exists at all. They solve different problems, and are often combined — encrypt the payload
first, then steganographically hide the ciphertext.</p>
<h4>Try it</h4>
<p>The demo below runs Bacon Cipher Encode on plain text, showing the raw A/B pattern — imagine it hidden in a
typeface or capitalization pattern instead.</p>`,
      demo: { type: "bacon" },
      quiz: [
        { q: "What does steganography hide, that encryption alone doesn't?", options: ["The content of the message", "The fact that a hidden message exists at all", "The sender's identity"], answer: 1 },
        { q: "How many bits does the Bacon cipher use per letter?", options: ["3", "5", "8"], answer: 1 }
      ]
    },
    {
      id: "romannumerals", title: "Roman numerals: a numbering system without place value",
      body: `
<h3>Roman numerals: a numbering system without place value</h3>
<p>Every number system covered so far — decimal, hex, binary — is <strong>positional</strong>: a digit's value
depends on <em>where</em> it sits. The <code>3</code> in <code>300</code> means something different from the
<code>3</code> in <code>30</code> purely because of position. Roman numerals work on a completely different
principle, and comparing the two makes it obvious why positional systems won.</p>
<h4>Additive and subtractive, not positional</h4>
<p>Roman numerals assign fixed values to a handful of symbols (<code>I</code>=1, <code>V</code>=5,
<code>X</code>=10, <code>L</code>=50, <code>C</code>=100, <code>D</code>=500, <code>M</code>=1000) and mostly
just add them left to right: <code>XII</code> = 10 + 1 + 1 = 12. A smaller symbol placed <em>before</em> a
larger one subtracts instead: <code>IV</code> = 5 − 1 = 4, avoiding four <code>I</code>s in a row.</p>
<h4>Where this breaks down</h4>
<p>There's no symbol for zero, no clean way to write a fraction, and numbers get unwieldy fast: 3,888 is
<code>MMMDCCCLXXXVIII</code> — thirteen symbols for a four-digit number. Worse, arithmetic is genuinely hard —
try multiplying <code>XLVII</code> by <code>XIX</code> by hand without converting to decimal first. Positional
notation (borrowed from Hindu-Arabic numerals, with the game-changing addition of a zero) makes arithmetic
mechanical instead of a matter of memorized symbol tricks.</p>
<h4>Where Roman numerals survive today</h4>
<p>Precisely because they're <em>not</em> used for calculation anymore — clock faces, book chapter numbers,
movie copyright years, and monarch or Super Bowl numbering all use them purely as a stylistic label, not
something anyone does math on directly.</p>
<h4>Try it</h4>
<p>The demo below converts a number to Roman numerals — try <code>1994</code> or <code>44</code>.</p>`,
      demo: { type: "roman" },
      quiz: { q: "What is the key difference between Roman numerals and decimal/hex/binary?", options: ["Roman numerals only go up to 100", "Decimal/hex/binary are positional — a digit's value depends on where it sits — Roman numerals aren't", "Roman numerals use letters instead of symbols"], answer: 1 }
    },
    {
      id: "luhn", title: "The Luhn algorithm: catching typos, not attacks",
      body: `
<h3>The Luhn algorithm: catching typos, not attacks</h3>
<p>The Checksums lesson drew a line between checksums (catch accidental corruption) and cryptographic hashes
(resist a deliberate attacker). The <strong>Luhn algorithm</strong> — the check digit on the end of every
credit card number — sits even further toward the "accidental" end of that spectrum: it isn't trying to
survive an attacker at all, just to catch a human mistyping or misreading a single digit.</p>
<h4>How it works</h4>
<p>Starting from the rightmost digit (the check digit itself is skipped), double every second digit going left;
if doubling produces a two-digit number, subtract 9 (equivalent to adding its two digits together). Sum every
digit, and the check digit is whatever makes that total a multiple of 10.</p>
<h4>What it actually catches</h4>
<p>Luhn is specifically good at catching two extremely common typing mistakes: a single mistyped digit, and two
adjacent digits swapped (a transposition) — together the overwhelming majority of real-world data-entry errors.
It's cheap enough to run on a point-of-sale terminal instantly, which is exactly the job it needs to do.</p>
<h4>What it can't catch</h4>
<p>Luhn is public and trivial to satisfy on purpose — anyone can compute a valid check digit for a made-up
number, which is why it stops nobody from typing a fabricated but Luhn-valid card number. It doesn't prove a
card is real, funded, or unstolen; that verification happens elsewhere, against the actual issuing bank. Luhn
only proves "this specific number wasn't garbled by a typo."</p>
<h4>Try it</h4>
<p>The demo below appends a Luhn check digit to whatever digits you type — try <code>7992739871</code> and
check the result ends in <code>3</code>.</p>`,
      demo: { type: "luhn" },
      quiz: [
        { q: "What is the Luhn algorithm actually designed to catch?", options: ["A deliberate attacker forging a card number", "Accidental human errors like a mistyped or swapped digit", "Expired cards"], answer: 1 },
        { q: "Why doesn't a Luhn-valid number prove a card is real?", options: ["Luhn is a proprietary secret formula", "The algorithm is public, so anyone can compute a valid check digit for a made-up number", "Luhn only works on odd-length numbers"], answer: 1 }
      ]
    },
    {
      id: "base3662", title: "Base36 & Base62: compact IDs without punctuation",
      body: `
<h3>Base36 & Base62: compact IDs without punctuation</h3>
<p>Base58 (previous lesson) removed a handful of look-alike characters for human readability. Base36 and Base62
take a different angle on the same underlying big-integer encoding trick: use only letters and digits, nothing
else — no <code>+</code>, <code>/</code>, or <code>=</code> padding — because that's the one alphabet every URL,
filename, and database column handles without any special-casing.</p>
<h4>Base36: digits and one case</h4>
<p><strong>Base36</strong> uses <code>0–9</code> then <code>a–z</code> — the same alphabet your browser's
address bar and most programming languages' built-in <code>parseInt(x, 36)</code> already understand. It's
popular for short, case-insensitive IDs (some URL shorteners, product or order references) where a customer
might read a code aloud over the phone.</p>
<h4>Base62: adding a second case</h4>
<p><strong>Base62</strong> adds uppercase back in (<code>0–9</code>, <code>A–Z</code>, <code>a–z</code>) for a
bigger alphabet in the same "letters and digits only" spirit. It's the encoding behind many real URL
shorteners' slugs (a 6-character Base62 string already covers 62⁶ ≈ 56 billion unique IDs) and is a common
choice for compact primary-key encodings in public-facing APIs.</p>
<h4>The trade-off vs Base58</h4>
<p>Unlike Base58, Base36/Base62 keep every letter and digit, including the ambiguous ones Base58 deliberately
drops (<code>0</code>/<code>O</code>, <code>l</code>/<code>I</code>). That's fine when a machine is doing the
reading — a URL router doesn't care that <code>1</code> and <code>l</code> look alike — but riskier for
anything a human copies by hand, which is exactly the gap Base58 exists to fill.</p>
<h4>Try it</h4>
<p>The demo below encodes your text as Base62. Compare it against To Base36 and To Base58 in The Lab to see how
alphabet size changes the output length.</p>`,
      demo: { type: "base62" },
      quiz: [
        { q: "What alphabet does Base62 use?", options: ["Only digits 0-9", "Digits plus uppercase and lowercase letters, nothing else", "The same alphabet as Base64"], answer: 1 },
        { q: "Why might Base36/Base62 be riskier than Base58 for a human to copy by hand?", options: ["They're always longer", "They keep ambiguous look-alike characters like 0/O and l/I that Base58 deliberately removes", "They require a calculator to decode"], answer: 1 }
      ]
    },
    {
      id: "playfair", title: "Playfair: encrypting two letters at a time",
      body: `
<h3>Playfair: encrypting two letters at a time</h3>
<p>Every substitution cipher so far — Caesar, Affine, Atbash, Polybius — replaces one letter with one
symbol, which is exactly what makes frequency analysis work: a common letter like <code>E</code> is always
disguised as the same other symbol, so its telltale frequency still shows through. The <strong>Playfair
cipher</strong> (1854) breaks that assumption by encrypting <em>pairs</em> of letters (digraphs) together,
so the same letter can turn into different ciphertext depending on what follows it.</p>
<h4>Building the grid</h4>
<p>A keyword fills a 5×5 grid (I and J share a cell, same trick as the Polybius square), followed by the
rest of the alphabet in order. Split the message into pairs; a repeated letter within a pair, or a leftover
single letter at the end, gets padded with an <code>X</code>.</p>
<h4>Three rules, one per pair</h4>
<p><strong>Same row:</strong> each letter is replaced by the one immediately to its right (wrapping around).
<strong>Same column:</strong> each letter is replaced by the one immediately below it (wrapping around).
<strong>Otherwise (a rectangle):</strong> each letter is replaced by the letter in its own row but the
other letter's column — this is the rule that does the real work, since it mixes both letters of the pair
into both outputs.</p>
<h4>Why pairs resist frequency analysis so much better</h4>
<p>English has 26 possible single letters but 26×26 = 676 possible digraphs, and their frequency
distribution is far flatter — no digraph dominates the way <code>E</code> dominates single letters. Playfair
was strong enough that it saw real military use into the early 20th century, well after simple substitution
ciphers were considered a solved problem for cryptanalysts.</p>
<h4>Try it</h4>
<p>The demo below runs Playfair Cipher Encode — try the default keyword <code>PLAYFAIR</code> on the word
<code>HIDE</code>.</p>`,
      demo: { type: "playfair" },
      quiz: [
        { q: "What does Playfair encrypt at a time, instead of one letter?", options: ["A pair of letters (a digraph)", "A whole word", "Four letters at once"], answer: 0 },
        { q: "Why does encrypting pairs resist frequency analysis better than single-letter substitution?", options: ["It doesn't - it's equally weak", "Digraphs have a much flatter frequency distribution than single letters, with no one pair dominating", "It uses a longer key"], answer: 1 }
      ]
    },
    {
      id: "autokey", title: "Autokey: closing Vigenere's key-length weakness",
      body: `
<h3>Autokey: closing Vigenere's key-length weakness</h3>
<p>The frequency-analysis lesson explained why a repeating Vigenère key is breakable once you know (or guess)
its length — the ciphertext splits into several interleaved Caesar ciphers, each crackable on its own. The
<strong>Autokey cipher</strong> fixes the root cause: instead of repeating a short keyword forever, it extends
the key using the plaintext itself, so the key is exactly as long as the message and never repeats.</p>
<h4>How the key stream is built</h4>
<p>The keyword starts the key stream; once it runs out, the key stream continues with the plaintext letters
themselves, shifted one position later. Encrypting <code>HELLO</code> with keyword <code>KEY</code> uses the
key stream <code>K, E, Y, H, E</code> — the last two letters borrowed directly from the plaintext
<code>HELLO</code> itself.</p>
<h4>Decoding has to work forward, one letter at a time</h4>
<p>This is the one place Autokey adds real complexity: decoding can't look up the whole key stream in advance,
because the key stream <em>is</em> the plaintext being recovered. Each decoded letter immediately becomes
available as a key letter further along — decode position 4 before you can decode position 5.</p>
<h4>What it doesn't fix</h4>
<p>A never-repeating key defeats Kasiski examination (the key-length-guessing attack from the frequency
analysis lesson), but Autokey is still additive letter substitution, and the keyword's own letters at the
start are still a weak point an attacker can lean on. It's a real improvement over plain Vigenère, not a leap
to unbreakable — that leap is the one-time pad, covered in the Bits & XOR unit, which uses a key as long as
the message that is <em>also</em> truly random, not derived from the message.</p>
<h4>Try it</h4>
<p>The demo below runs Autokey Cipher Encode — try the default keyword <code>KEY</code> on <code>HELLO</code>
and check the result is <code>RIJSS</code>.</p>`,
      demo: { type: "autokey" },
      quiz: [
        { q: "How does Autokey extend its key past the keyword's length?", options: ["It repeats the keyword, same as Vigenere", "It continues the key stream using the plaintext itself", "It asks the user to type a longer key"], answer: 1 },
        { q: "Why can't Autokey decoding look up the whole key stream in advance?", options: ["It's a technical limitation with no real reason", "The key stream past the keyword IS the plaintext being recovered, so it only becomes known as decoding proceeds", "Autokey doesn't support decoding at all"], answer: 1 }
      ]
    },
    {
      id: "twoscomplement", title: "Two's complement: how negative numbers are actually stored",
      body: `
<h3>Two's complement: how negative numbers are actually stored</h3>
<p>A byte is just 8 bits with no built-in concept of "negative" — so how does a CPU represent -1? The nearly
universal answer is <strong>two's complement</strong>, and understanding it explains a lot of otherwise-odd
behavior in low-level code.</p>
<h4>The rule</h4>
<p>To negate a number in two's complement: flip every bit, then add 1. Flipping every bit of
<code>00000001</code> (1) gives <code>11111110</code>; adding 1 gives <code>11111111</code> — so -1 is
<em>all ones</em> in an 8-bit byte, not the <code>10000001</code> you might naively expect from a plain
sign-and-magnitude scheme.</p>
<h4>Why not just use a sign bit directly?</h4>
<p>An earlier, simpler scheme — sign-and-magnitude, one bit for the sign and the rest for the value — has an
annoying flaw: it has <em>two</em> representations of zero (<code>00000000</code> and <code>10000000</code>),
and ordinary addition circuits don't work correctly on it without special-casing the sign bit. Two's
complement has exactly one zero, and — its real advantage — normal binary addition just works on negative
numbers automatically, with no extra circuitry: <code>-1 + 1</code> is <code>11111111 + 00000001</code>, which
overflows to <code>100000000</code>, and dropping the 9th bit (since a byte only holds 8) leaves
<code>00000000</code>, correctly zero.</p>
<h4>The range is lopsided</h4>
<p>An 8-bit two's complement byte covers -128 to 127, not -127 to 127 — one more negative value than positive.
That's because <code>10000000</code> is used for -128 rather than being a second zero, which is also exactly
why negating the most negative value (<code>-128</code>) famously overflows back to itself in many
programming languages.</p>
<h4>Try it</h4>
<p>The demo below converts a signed number to its two's complement hex at a chosen bit width — try
<code>-1</code> and <code>-128</code> at 8 bits.</p>`,
      demo: { type: "twoscomplement" },
      quiz: [
        { q: "How do you negate a number in two's complement?", options: ["Flip the leftmost bit only", "Flip every bit, then add 1", "Reverse the bit order"], answer: 1 },
        { q: "What is the main practical advantage of two's complement over a simple sign bit?", options: ["It uses fewer bits", "Ordinary binary addition works correctly on negative numbers with no special-casing", "It's easier for humans to read"], answer: 1 }
      ]
    },
    {
      id: "nandgate", title: "NAND: the one gate that builds every other gate",
      body: `
<h3>NAND: the one gate that builds every other gate</h3>
<p>AND, OR and XOR each do one specific job on two bits. <strong>NAND</strong> (NOT AND — 0 only when both
inputs are 1) looks like just another entry on that list, but it has a property none of the others share:
every other logic gate can be built out of NAND gates alone, and nothing else.</p>
<h4>Building NOT, AND and OR from only NAND</h4>
<p>Feed a NAND gate the same input twice and it becomes a <strong>NOT</strong> gate: <code>NAND(x, x)</code>
is 0 only when <code>x</code> is 1, which is exactly what NOT does. Chain that NOT onto a NAND's output and
you get <strong>AND</strong>: <code>NOT(NAND(a, b))</code>. Push NOT onto NAND's <em>inputs</em> instead and
you get <strong>OR</strong>, by De Morgan's law. Every other gate — XOR, NOR, XNOR — builds from those three,
so the whole chain traces back to NAND alone.</p>
<h4>Why this matters outside a logic textbook</h4>
<p>This isn't just a cute puzzle: NAND gates are cheap and simple to manufacture in silicon, so many real
integrated circuits are built almost entirely from NAND gates wired together in different patterns, rather
than stocking a separate physical gate design for every logical operation. "NAND is universal" is a big part
of why computer chips are practical to manufacture at all.</p>
<h4>NOR is universal too</h4>
<p>NAND isn't unique in this — NOR has the identical property, by the same De Morgan symmetry. Only NAND and
NOR are universal on their own; AND, OR, and XOR alone can never build a NOT gate, because they're all
"monotonic" (flipping an input never flips the output the opposite way), while NOT and NAND aren't.</p>
<h4>Try it</h4>
<p>In The Lab's Bitwise category, chain NAND with itself (same key twice) and compare it against the NOT
operation on the same input.</p>`,
      demo: { type: "none" },
      quiz: [
        { q: "What does it mean for NAND to be a 'universal' logic gate?", options: ["It's the fastest gate to compute", "Every other logic gate (NOT, AND, OR, XOR...) can be built from NAND gates alone", "It only works on single bits"], answer: 1 },
        { q: "Why can't AND, OR, and XOR alone ever build a NOT gate?", options: ["They're too slow", "They're all monotonic - flipping an input never flips the output the opposite way, but NOT always does", "They require more than 2 inputs"], answer: 1 }
      ]
    },
    {
      id: "noncryptohash", title: "Non-cryptographic hashes: fast, not safe",
      body: `
<h3>Non-cryptographic hashes: fast, not safe</h3>
<p>SHA-256 and MD5 both get called "hashes," but so do FNV and DJB2 — and the two groups are built for
completely different jobs. Mixing them up is a real, common security mistake.</p>
<h4>What FNV and DJB2 are actually for</h4>
<p>Hash tables (the data structure behind most language's dictionaries/objects) need to turn a key into an
array index, millions of times a second, with no attacker in the picture — just needing outputs to spread out
roughly evenly. FNV-1a and DJB2 are built purely for that: a tiny multiply-and-XOR (or multiply-and-add) loop
that's extremely fast and spreads typical inputs well, with no attempt to resist anyone trying to break them.</p>
<h4>Why that makes them unsafe as cryptographic hashes</h4>
<p>Both are so cheap to compute that finding two inputs with the same output (or crafting an input to
collide with a known one) is easy for an attacker on purpose — nothing in their design resists it. Worse, an
attacker who knows a server uses one of these for something security-sensitive (like a hash table key) can
often craft many inputs that all land in the same hash bucket, degrading a hash table from fast O(1) lookups
to slow O(n) ones - a real denial-of-service technique called "hash flooding" that has affected production
web frameworks.</p>
<h4>The rule of thumb</h4>
<p>If a value came from a trusted, non-adversarial source and you just need speed and reasonable spread — a
hash table key, a quick checksum for a cache — a non-cryptographic hash like FNV or DJB2 is a fine, fast
choice. The moment an untrusted party can influence the input, or the hash needs to prove something (identity,
integrity against tampering, a password), only a cryptographic hash from the SHA family will do.</p>
<h4>Try it</h4>
<p>In The Lab's Hashing category, run the same short word through FNV-1a (32-bit), DJB2, and SHA-256, and
compare how long each takes to reason through by hand versus how each is actually meant to be used.</p>`,
      demo: { type: "none" },
      quiz: [
        { q: "What are FNV-1a and DJB2 actually designed for?", options: ["Password storage", "Fast, well-spread hash table keys with no attacker in the picture", "Digital signatures"], answer: 1 },
        { q: "What real attack can a fast, non-cryptographic hash enable if attacker input reaches it?", options: ["SQL injection", "Hash flooding - crafting inputs that collide into the same bucket, degrading a hash table's performance", "Cross-site scripting"], answer: 1 }
      ]
    },
    {
      id: "internetchecksumlesson", title: "The Internet Checksum: one's-complement addition, everywhere",
      body: `
<h3>The Internet Checksum: one's-complement addition, everywhere</h3>
<p>Every IPv4, TCP, and UDP packet header carries a 16-bit checksum computed the exact same way — a scheme
from RFC 1071 that predates CRC-32's widespread use and is still universal today, precisely because it's cheap
enough to compute in hardware at line rate on every single packet.</p>
<h4>The algorithm</h4>
<p>Split the header into 16-bit words, add them all together, and whenever the running sum overflows past 16
bits, wrap the overflow bit back around and add it in too (called "end-around carry" — a quirk of
<strong>one's complement</strong> arithmetic, an older way of representing negative numbers than the two's
complement everything uses internally today). Finally, flip every bit of the total (the "complement" in
"one's-complement checksum").</p>
<h4>Why flip the bits at the end?</h4>
<p>That final complement step makes verification elegant: instead of recomputing the checksum and comparing
it to the one in the header, a receiver adds the ENTIRE header — checksum field included — through the same
process. If nothing was corrupted, the sums cancel out and the result is all 1s (every bit set). One
consistent rule for both computing and checking, no separate comparison step needed.</p>
<h4>Why not something stronger, like CRC-32?</h4>
<p>The checksums lesson explained that CRC-32 catches more error patterns than a simple additive checksum.
Routers and NICs process billions of packets a second, though, and one's-complement addition is dramatically
cheaper to implement in hardware than CRC's polynomial division. It also only has to catch <em>accidental</em>
transmission corruption — TCP and application-layer protocols add their own stronger integrity checks
(TLS, for instance) for anything that actually needs to resist tampering.</p>
<h4>Try it</h4>
<p>The demo below computes the Internet Checksum operation on your text — try the canonical worked example from
RFC 1071 by pasting hex bytes <code>00 01 f2 03 f4 f5 f6 f7</code> through the Internet Checksum operation in
The Lab and checking you get <code>220d</code>.</p>`,
      demo: { type: "none" },
      quiz: [
        { q: "What makes the Internet Checksum's algorithm attractive for routers processing billions of packets?", options: ["It's the strongest possible checksum", "One's-complement addition is much cheaper to implement in hardware than CRC's polynomial division", "It requires no computation at all"], answer: 1 },
        { q: "Why does a receiver check the Internet Checksum by summing the WHOLE header, checksum field included?", options: ["It's a mistake, they should exclude it", "If nothing was corrupted, everything cancels out to all 1s - one rule for both computing and checking", "The checksum field is ignored anyway"], answer: 1 }
      ]
    },
    {
      id: "ipv6", title: "IPv6: solving IPv4's address shortage",
      body: `
<h3>IPv6: solving IPv4's address shortage</h3>
<p>The IPv4 lesson mentioned that 32 bits caps IPv4 at about 4.3 billion addresses — not nearly enough for a
world with billions of phones, servers, and IoT devices all online at once. IPv6, standardized in 1998, fixes
this the most direct way possible: far more bits.</p>
<h4>128 bits is an almost incomprehensibly large space</h4>
<p>IPv6 addresses are 128 bits — not 4x IPv4's 32 bits, but 2^128 versus 2^32, a difference of 2^96, roughly
79 octillion times more addresses. It's written as eight groups of four hex digits separated by colons:
<code>2001:0db8:0000:0000:0000:0000:0000:0001</code>.</p>
<h4>The :: shorthand</h4>
<p>Long runs of all-zero groups are extremely common (most addresses don't use anywhere near their full
range), so IPv6 allows collapsing the <em>single longest</em> run of consecutive all-zero groups into
<code>::</code>, once per address: the address above shortens to <code>2001:db8::1</code>. Leading zeros
within each remaining group can also be dropped. Only one <code>::</code> is allowed per address — if two runs
of zeros both got collapsed, the address would be ambiguous about how many zero groups each <code>::</code>
represented.</p>
<h4>What this means day to day</h4>
<p>Subnetting still works the same conceptual way as the subnetting lesson covered (a prefix length like
<code>/64</code> marks the network portion), but IPv6 makes it common practice to give every device a full
<code>/64</code> of its own — 2^64 addresses per subnet, more than the <em>entire</em> IPv4 address space,
per single network segment. Running out of addresses within a subnet essentially stops being a design
consideration.</p>
<h4>Try it</h4>
<p>Try the Expand IPv6 and Compress IPv6 operations in The Lab on <code>2001:db8::1</code> and
<code>::1</code> (the IPv6 loopback address, equivalent to IPv4's <code>127.0.0.1</code>).</p>`,
      demo: { type: "none" },
      quiz: [
        { q: "Roughly how much bigger is IPv6's address space than IPv4's?", options: ["Twice as big", "About 79 octillion times bigger (2^128 vs 2^32)", "About 4 billion times bigger"], answer: 1 },
        { q: "Why is only one :: allowed per IPv6 address?", options: ["It's just a style convention with no real reason", "Two collapsed runs would make it ambiguous how many zero groups each :: represented", "IPv6 addresses can only have one zero group total"], answer: 1 }
      ]
    },
    {
      id: "csvjson", title: "CSV vs JSON: rows of text vs nested structure",
      body: `
<h3>CSV vs JSON: rows of text vs nested structure</h3>
<p>Almost every data-interchange problem eventually needs to move data between a spreadsheet-shaped world and
a code-shaped world, and that usually means converting between CSV and JSON — two formats built on genuinely
different assumptions about what data looks like.</p>
<h4>CSV: flat rows, comma-separated</h4>
<p>CSV (comma-separated values) is about as simple as a structured format gets: one header row naming the
columns, then one line per record, fields separated by commas. Its simplicity is exactly its strength — every
spreadsheet program, database, and scripting language can read and write it with almost no ceremony.</p>
<h4>The quoting rule that trips people up</h4>
<p>What happens when a field's own value contains a comma, or a newline? CSV's answer is to wrap that field in
double quotes, and escape any literal double-quote inside it by doubling it (<code>""</code>). A field
containing <code>Say "hi"</code> is written as <code>"Say ""hi"""</code>. Naive CSV parsers that just
<code>split(",")</code> break on exactly this case — a correct parser has to track whether it's currently
inside a quoted field before treating a comma as a separator.</p>
<h4>JSON: nested, typed, unambiguous</h4>
<p>JSON has no such quoting ambiguity (strings are always quoted and internal quotes are always escaped the
same way), and — unlike CSV's flat rows — it natively supports nesting: an array of objects, objects inside
objects, arrays inside arrays. That expressiveness is also JSON's weakness for spreadsheet-shaped data: there's
no single obvious way to "flatten" deeply nested JSON into CSV's strictly flat rows-and-columns shape.</p>
<h4>When each one wins</h4>
<p>CSV wins for genuinely flat, tabular data headed into a spreadsheet or a bulk database import. JSON wins
the moment the data has real structure — optional fields, nested objects, arrays of varying length — that a
rigid flat table can't represent cleanly without a lot of redundant or empty columns.</p>
<h4>Try it</h4>
<p>Try the CSV to JSON and JSON to CSV operations in The Lab on a couple of rows of your own data, including a
field with a comma inside it (wrapped in quotes) to see the quoting rule in action.</p>`,
      demo: { type: "none" },
      quiz: [
        { q: "How does CSV handle a field whose value contains a literal comma?", options: ["It's simply not possible in CSV", "The field is wrapped in double quotes", "The comma is replaced with a semicolon"], answer: 1 },
        { q: "What is JSON able to represent that flat CSV rows fundamentally can't?", options: ["Text with accented characters", "Nested structure - objects and arrays inside other objects and arrays", "Numbers larger than 32 bits"], answer: 1 }
      ]
    }
  ];

  const CHALLENGES = [
    // Easy
    { id: "c1", cat: "Encoding", level: "easy", title: "Decode Base64", prompt: "Decode this Base64 text.", task: "Qnl0ZUxhYnM=", answer: "ByteLabs", hint: "Use From Base64." },
    { id: "c2", cat: "Encoding", level: "easy", title: "Encode to Base64", prompt: "Type the Base64 encoding of the word below.", task: "hello", answer: "aGVsbG8=", hint: "Use To Base64 on 'hello'." },
    { id: "c3", cat: "Encoding", level: "easy", title: "Read the hex", prompt: "These bytes spell a word. Decode the hex.", task: "6f70656e", answer: "open", hint: "Use From Hex." },
    { id: "c4", cat: "Ciphers", level: "easy", title: "Break ROT13", prompt: "Decode this ROT13 message.", task: "Frperg", answer: "Secret", hint: "ROT13 again reverses it." },
    { id: "c5", cat: "Encoding", level: "easy", title: "Binary to text", prompt: "Decode this 8-bit binary.", task: "01001000 01101001", answer: "Hi", hint: "Use From Binary." },
    { id: "c6", cat: "Encoding", level: "easy", title: "Morse code", prompt: "Decode this Morse code.", task: ".... . .-.. .-.. ---", answer: "HELLO", hint: "Use From Morse (result is upper case)." },
    { id: "c7", cat: "Encoding", level: "easy", title: "URL decode", prompt: "Decode this URL-encoded string.", task: "a%20b%26c", answer: "a b&c", hint: "Use URL Decode." },
    { id: "c8", cat: "Ciphers", level: "easy", title: "Atbash", prompt: "Decode this Atbash-ciphered word.", task: "Gvhg", answer: "Test", hint: "Atbash is its own inverse." },
    // Medium
    { id: "c9", cat: "Encoding", level: "medium", title: "Base32", prompt: "Decode this Base32 text.", task: "JBSWY3DPEE======", answer: "Hello!", hint: "Use From Base32." },
    { id: "c10", cat: "Ciphers", level: "medium", title: "Caesar shift 5", prompt: "This was Caesar-shifted by 5. Recover the text.", task: "Mjqqt", answer: "Hello", hint: "Caesar with shift 21 (or -5)." },
    { id: "c11", cat: "Ciphers", level: "medium", title: "Vigenère", prompt: "Decode with the keyword LEMON.", task: "LXFOPVEFRNHR", answer: "ATTACKATDAWN", hint: "Use Vigenère Decode, key LEMON." },
    { id: "c12", cat: "Encoding", level: "medium", title: "Decimal codes", prompt: "Decode these decimal character codes.", task: "72 101 108 108 111", answer: "Hello", hint: "Use From Decimal." },
    { id: "c13", cat: "Ciphers", level: "medium", title: "ROT47", prompt: "Decode this ROT47 string.", task: "qJE6{23D", answer: "ByteLabs", hint: "ROT47 again reverses it." },
    { id: "c14", cat: "Ciphers", level: "medium", title: "A1Z26", prompt: "Decode these letter-position numbers.", task: "3 1 20", answer: "cat", hint: "Use A1Z26 Decode (A=1)." },
    // Hard
    { id: "c15", cat: "Hashing", level: "hard", title: "SHA-256", prompt: "Enter the SHA-256 hash (hex) of the word below.", task: "test", answer: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08", hint: "Put 'test' through SHA-256." },
    { id: "c16", cat: "Hashing", level: "hard", title: "MD5", prompt: "Enter the MD5 hash of the word below.", task: "hello", answer: "5d41402abc4b2a76b9719d911017c592", hint: "Put 'hello' through MD5." },
    { id: "c17", cat: "Ciphers", level: "hard", title: "XOR with a key", prompt: "This hex was XORed with the key 'cle'. Recover the message.", task: "221811020f0e430d114308041402", answer: "Attack at dawn", hint: "Use XOR, direction Hex → Text, key cle." },
    { id: "c18", cat: "Hashing", level: "hard", title: "CRC-32", prompt: "Enter the CRC-32 checksum (hex) of the word below.", task: "hello", answer: "3610a686", hint: "Use the CRC-32 operation." },
    { id: "c19", cat: "Encoding", level: "medium", title: "Two layers", prompt: "This was Hex-encoded, then Base64-encoded. Peel both layers.", task: "NjMgNjEgNzQ=", answer: "cat", hint: "From Base64, then From Hex." },
    { id: "c20", cat: "Encoding", level: "medium", title: "Base64 URL", prompt: "Decode this URL-safe Base64 token.", task: "ZmxhZ3t5MHVfZ290X2l0fQ", answer: "flag{y0u_got_it}", hint: "Use From Base64 URL." },
    { id: "c21", cat: "Text", level: "medium", title: "Reverse & Base64", prompt: "The text was reversed, then Base64-encoded. Recover it.", task: "Ym9C", answer: "Bob", hint: "From Base64, then Reverse text." },
    { id: "c22", cat: "Hashing", level: "hard", title: "HMAC", prompt: "Enter the HMAC-SHA256 of the message 'hello' using the key 'secret'.", task: "message: hello   key: secret", answer: "88aab3ede8d3adf94d26ab90d3bafd4a2083070c3bcce9c014ee04a443847c0b", hint: "Use HMAC-SHA256 with key 'secret' on input 'hello'." },
    { id: "c23", cat: "Encoding", level: "medium", title: "Base58", prompt: "Decode this Base58 string.", task: "StV1DL6CwTryKyV", answer: "hello world", hint: "Use From Base58." },
    { id: "c24", cat: "Data", level: "easy", title: "Change base", prompt: "Convert this hexadecimal number to decimal.", task: "ff", answer: "255", hint: "Change number base, from Hex to Decimal." },
    { id: "c25", cat: "Hashing", level: "hard", title: "SHA-1", prompt: "Enter the SHA-1 hash (hex) of the word below.", task: "abc", answer: "a9993e364706816aba3e25717850c26c9cd0d89d", hint: "Put 'abc' through SHA-1." },
    { id: "c26", cat: "Encoding", level: "easy", title: "Read a hexdump", prompt: "Decode the text hidden in this hexdump.", task: "00000000: 4869 21                                  Hi!", answer: "Hi!", hint: "Use From Hexdump." },
    { id: "c27", cat: "Encoding", level: "easy", title: "Spell it out", prompt: "Convert the word below to NATO phonetic spelling.", task: "cat", answer: "Charlie Alpha Tango", hint: "Use To NATO Phonetic." },
    { id: "c28", cat: "Encoding", level: "medium", title: "Octal codes", prompt: "Decode these octal character codes.", task: "107 157", answer: "Go", hint: "Use From Octal." },
    { id: "c29", cat: "Encoding", level: "medium", title: "Unicode escapes", prompt: "Decode this \\u-escaped string.", task: "\\u0053\\u0065\\u0063", answer: "Sec", hint: "Use From \\u Escapes." },
    { id: "c30", cat: "Text", level: "medium", title: "Strip the tags", prompt: "Remove the HTML tags, keeping just the text.", task: "<p>Nice <b>work</b></p>", answer: "Nice work", hint: "Use Strip HTML tags." },
    { id: "c31", cat: "Data", level: "medium", title: "Find the email", prompt: "Extract the email address hidden in this sentence.", task: "Contact us at hello@example.com for info", answer: "hello@example.com", hint: "Use Extract, mode Email addresses." },
    { id: "c32", cat: "Data", level: "easy", title: "Change of base", prompt: "Convert this binary number to hexadecimal.", task: "1010", answer: "a", hint: "Use Change number base, From Binary, To Hex." },
    { id: "c33", cat: "Ciphers", level: "hard", title: "Crack the shift", prompt: "This sentence was Caesar-shifted by an unknown amount. Recover the original text.", task: "aol xbpjr iyvdu mve qbtwz vcly aol shgf kvn dopsl aopurpun hivba jyfwavnyhwof", answer: "the quick brown fox jumps over the lazy dog while thinking about cryptography", hint: "Fastest way: use Caesar Brute Force and check the top-ranked line. Or do it by hand: run Letter frequency, compare the peak to normal English letter frequency, then try Caesar with that shift." },
    { id: "c34", cat: "Encoding", level: "medium", title: "Base32 again", prompt: "Decode this Base32 string.", task: "OB2XU6TMMU======", answer: "puzzle", hint: "Use From Base32." },
    { id: "c35", cat: "Bitwise", level: "easy", title: "Flip every bit", prompt: "Apply bitwise NOT to the character below and give the hex result.", task: "0", answer: "cf", hint: "Use the NOT operation." },
    { id: "c36", cat: "Bitwise", level: "easy", title: "Rotate a byte", prompt: "Rotate the bits of this single character left by 2 and give the hex result.", task: "@", answer: "01", hint: "Use Rotate Bits Left, amount 2. '@' is byte 0x40." },
    { id: "c37", cat: "Bitwise", level: "medium", title: "Modular addition", prompt: "ADD (mod 256) the key 'ab' to the text below and give the hex result.", task: "Go", answer: "a8d1", hint: "Use ADD (mod 256) with key 'ab'." },
    { id: "c38", cat: "Bitwise", level: "medium", title: "AND spells a word", prompt: "Bitwise-AND these two words together with key 'mask', then decode the hex result back to text.", task: "lock", answer: "lack", hint: "Use AND with key 'mask', then From Hex on the result." },
    { id: "c39", cat: "Ciphers", level: "hard", title: "Break the single-byte key", prompt: "This was encrypted with a single-byte XOR key. Recover the message.", task: "624a4a5b0f4e5b0f5b474a0f40434b0f4d5d464b484a0f5b40414648475b", answer: "Meet at the old bridge tonight", hint: "Use XOR Brute Force, input is Hex — check the top-ranked result." },
    { id: "c40", cat: "Ciphers", level: "hard", title: "Brute force the shift", prompt: "Use the Caesar Brute Force tool to recover this message — don't work it out by hand.", task: "xgvkrimbhg dxxil hnk wtmt ltyx ykhf ikrbgz xrxl tgw vnkbhnl tmmtvdxkl", answer: "encryption keeps our data safe from prying eyes and curious attackers", hint: "Use Caesar Brute Force and check the top-ranked line." },
    { id: "c41", cat: "Ciphers", level: "medium", title: "Rail Fence", prompt: "This was encoded with Rail Fence, 3 rails. Decode it.", task: "ACDTAKTANTAW", answer: "ATTACKATDAWN", hint: "Use Rail Fence Decode with Rails set to 3." },
    { id: "c42", cat: "Encoding", level: "easy", title: "Base85", prompt: "Decode this Base85 (Ascii85) string.", task: "Ao(mg", answer: "flag", hint: "Use From Base85." },
    { id: "c43", cat: "Encoding", level: "medium", title: "Internationalized domain", prompt: "Decode this Punycode domain back to Unicode.", task: "xn--mnchen-3ya.de", answer: "münchen.de", hint: "Use From Punycode." },
    { id: "c44", cat: "Ciphers", level: "hard", title: "Columnar transposition", prompt: "Decode this Columnar Transposition ciphertext using the keyword PUZZLE.", task: "ENMDMAIETGEMHTIT", answer: "MEETMEATMIDNIGHT", hint: "Use Columnar Transposition Decode, keyword PUZZLE." },
    { id: "c45", cat: "Encoding", level: "medium", title: "Quoted-Printable", prompt: "Decode this Quoted-Printable string.", task: "50% off caf=C3=A9 orders", answer: "50% off café orders", hint: "Use From Quoted-Printable." },
    { id: "c46", cat: "Hashing", level: "easy", title: "Adler-32", prompt: "Enter the Adler-32 checksum (hex) of the word below.", task: "hello", answer: "062c0215", hint: "Use the Adler-32 operation." },
    { id: "c47", cat: "Bitwise", level: "medium", title: "Gray code", prompt: "Decode these Gray-coded hex bytes.", task: "6468", answer: "GO", hint: "Use From Gray Code." },
    { id: "c48", cat: "Data", level: "easy", title: "Color format", prompt: "Convert this hex color to its RGB form.", task: "#663399", answer: "rgb(102, 51, 153)", hint: "Use Color Converter, convert to RGB." },
    { id: "c49", cat: "Data", level: "easy", title: "IP to integer", prompt: "Convert this IPv4 address to its 32-bit integer form.", task: "10.0.0.1", answer: "167772161", hint: "Use IPv4 to Integer." },
    { id: "c50", cat: "Data", level: "easy", title: "Integer to IP", prompt: "Convert this integer back to dotted-quad IPv4 form.", task: "2130706433", answer: "127.0.0.1", hint: "Use Integer to IPv4." },
    { id: "c51", cat: "Encoding", level: "medium", title: "Two layers, new encodings", prompt: "This was Quoted-Printable encoded, then Base64-encoded. Peel both layers.", task: "Y2FmPUMzPUE5ID0zRCAxMDAlIHNlY3VyZQ==", answer: "café = 100% secure", hint: "From Base64, then From Quoted-Printable." },
    { id: "c52", cat: "Data", level: "easy", title: "Date to timestamp", prompt: "Convert this date to a Unix timestamp (seconds).", task: "2024-01-01", answer: "1704067200", hint: "Use Date to Unix Time." },
    { id: "c53", cat: "Data", level: "easy", title: "Find the address", prompt: "Extract the IPv4 address from this sentence.", task: "The server at 10.20.30.40 stopped responding", answer: "10.20.30.40", hint: "Use Extract, mode IPv4 addresses." },
    { id: "c54", cat: "Data", level: "easy", title: "HSL to hex", prompt: "Convert this HSL color to its hex form.", task: "hsl(120, 100%, 25%)", answer: "#008000", hint: "Use Color Converter, convert to Hex." },
    { id: "c55", cat: "Encoding", level: "medium", title: "Encode to Base85", prompt: "Type the Base85 (Ascii85) encoding of the word below.", task: "byte", answer: "@X3',", hint: "Use To Base85 on 'byte'." },
    { id: "c56", cat: "Bitwise", level: "medium", title: "Into Gray code", prompt: "Give the hex Gray code of the text below.", task: "hi", answer: "5c5d", hint: "Use To Gray Code." },
    { id: "c57", cat: "Ciphers", level: "medium", title: "Vigenère, forward", prompt: "Encrypt this with a Vigenère cipher, keyword BYTE.", task: "ATTACKATDAWN", answer: "BRMEDITXEYPR", hint: "Use Vigenère Encode with key BYTE." },
    { id: "c58", cat: "Ciphers", level: "medium", title: "Base32, then ROT13", prompt: "This was ROT13'd, then Base32-encoded. Peel both layers.", task: "MZZHAZLSM4======", answer: "secret", hint: "From Base32 first, then ROT13." },
    { id: "c59", cat: "Ciphers", level: "medium", title: "Four rails", prompt: "Decode this Rail Fence ciphertext — it used 4 rails.", task: "DTTTEDHSWADFNEAALUKEELS", answer: "DEFENDTHEEASTWALLATDUSK", hint: "Rail Fence Decode with Rails set to 4." },
    { id: "c60", cat: "Ciphers", level: "hard", title: "Shifted, then dumped", prompt: "This message was Caesar-shifted by 7, then hex-encoded. Recover the original.", task: "74 6c 6c 61 20 68 61 20 61 6f 6c 20 75 76 79 61 6f 20 6e 68 61 6c", answer: "meet at the north gate", hint: "From Hex first, then Caesar with shift -7 (or 19)." },
    { id: "c61", cat: "Bitwise", level: "medium", title: "Swap the byte order", prompt: "Swap the endianness of this 4-byte hex value.", task: "12345678", answer: "78 56 34 12", hint: "Use Swap Endianness." },
    { id: "c62", cat: "Encoding", level: "easy", title: "Make a data URI", prompt: "Encode the word below as a plain-text data URI.", task: "hi", answer: "data:text/plain;base64,aGk=", hint: "Base64-encode 'hi', then prefix it with data:text/plain;base64," },
    { id: "c63", cat: "Text", level: "easy", title: "Into snake_case", prompt: "Convert this phrase into snake_case.", task: "Byte Labs Rocks", answer: "byte_labs_rocks", hint: "Use Change Case, style snake_case." },
    { id: "c64", cat: "Data", level: "medium", title: "Octal to binary", prompt: "Convert this octal number to binary.", task: "17", answer: "1111", hint: "Use Change number base, from Octal to Binary." },
    { id: "c65", cat: "Data", level: "easy", title: "Find the number", prompt: "Extract the number hidden in this sentence.", task: "Room 42 is now open", answer: "42", hint: "Use Extract, mode Numbers." },
    { id: "c66", cat: "Hashing", level: "hard", title: "HMAC-SHA512", prompt: "Enter the HMAC-SHA512 of the message 'hello' using the key 'key'.", task: "message: hello   key: key", answer: "ff06ab36757777815c008d32c8e14a705b4e7bf310351a06a23b612dc4c7433e7757d20525a5593b71020ea2ee162d2311b247e9855862b270122419652c0c92", hint: "Use HMAC-SHA512 with key 'key' on input 'hello'." },
    { id: "c67", cat: "Hashing", level: "medium", title: "BLAKE2b-256", prompt: "Enter the BLAKE2b-256 hash (hex) of the word below.", task: "hi", answer: "6815cb4aeb1580a91ef673e63ff03bdb6e855c3a896db3f2765e03281a61134a", hint: "Use the BLAKE2b-256 operation." },
    { id: "c68", cat: "Text", level: "easy", title: "Slugify a title", prompt: "Convert this title into a URL-friendly slug.", task: "Byte Labs Rocks!", answer: "byte-labs-rocks", hint: "Use Slugify." },
    { id: "c69", cat: "Encoding", level: "easy", title: "Encode to Base45", prompt: "Type the Base45 (RFC 9285) encoding of the word below.", task: "flag", answer: "U.C5EC", hint: "Use To Base45." },
    { id: "c70", cat: "Ciphers", level: "medium", title: "Beaufort, forward", prompt: "Encrypt this with a Beaufort cipher, keyword KEY.", task: "MEETATNOON", answer: "YAUREFXQKX", hint: "Use Beaufort Cipher with key KEY." },
    { id: "c71", cat: "Bitwise", level: "easy", title: "Count the bits", prompt: "How many bits (total) are set in the text below?", task: "A", answer: "2", hint: "Use Count Set Bits and read the total." },
    { id: "c72", cat: "Bitwise", level: "easy", title: "Mirror the bits", prompt: "Reverse the bit order of this single character and give the hex result.", task: "A", answer: "82", hint: "Use Reverse Bits." },
    { id: "c73", cat: "Data", level: "medium", title: "Find the broadcast address", prompt: "What is the broadcast address of this network?", task: "172.16.0.5/28", answer: "172.16.0.15", hint: "Use Subnet Info." },
    { id: "c74", cat: "Bitwise", level: "easy", title: "Swap two bytes", prompt: "Swap the endianness of this 2-byte hex value.", task: "abcd", answer: "cd ab", hint: "Use Swap Endianness." },
    { id: "c75", cat: "Encoding", level: "medium", title: "Decode Base45", prompt: "Decode this Base45 (RFC 9285) string.", task: "7I87WENT93KC", answer: "ByteLabs", hint: "Use From Base45." },
    { id: "c76", cat: "Ciphers", level: "hard", title: "Break the Beaufort", prompt: "This was encrypted with a Beaufort cipher, keyword SHIELD. Recover the message — remember Beaufort is reciprocal.", task: "PDDAYAOQ", answer: "DEFENDER", hint: "Use Beaufort Cipher again with the same key SHIELD — it decrypts itself." },
    { id: "c77", cat: "Ciphers", level: "medium", title: "Affine cipher", prompt: "Encrypt this with an Affine cipher, key a=5, b=8.", task: "MEET AT DAWN", answer: "QCCZ IZ XIOV", hint: "Use Affine Cipher Encode with a=5, b=8." },
    { id: "c78", cat: "Ciphers", level: "hard", title: "Break the Affine cipher", prompt: "This was Affine-enciphered with key a=5, b=8. Recover the message.", task: "UCSPCZ QCUUIMC", answer: "SECRET MESSAGE", hint: "Use Affine Cipher Decode with a=5, b=8." },
    { id: "c79", cat: "Ciphers", level: "easy", title: "Polybius square", prompt: "Encode this word on a Polybius square.", task: "HELLO", answer: "23 15 31 31 34", hint: "Use Polybius Square Encode." },
    { id: "c80", cat: "Ciphers", level: "medium", title: "Read the coordinates", prompt: "Decode these Polybius square coordinates.", task: "52 34 42 31 14", answer: "WORLD", hint: "Use Polybius Square Decode." },
    { id: "c81", cat: "Ciphers", level: "easy", title: "Bacon cipher", prompt: "Encode this word with the Bacon cipher.", task: "HI", answer: "AABBB ABAAA", hint: "Use Bacon Cipher Encode." },
    { id: "c82", cat: "Ciphers", level: "medium", title: "Read the A/B pattern", prompt: "Decode this Bacon cipher pattern.", task: "AAABA ABBBA AAABB AABAA", answer: "CODE", hint: "Use Bacon Cipher Decode." },
    { id: "c83", cat: "Encoding", level: "medium", title: "Base36", prompt: "Decode this Base36 string.", task: "17tvyr22jp", answer: "puzzle", hint: "Use From Base36." },
    { id: "c84", cat: "Encoding", level: "medium", title: "Base62", prompt: "Decode this Base62 string.", task: "2AYtmByu8J", answer: "hackers", hint: "Use From Base62." },
    { id: "c85", cat: "Encoding", level: "easy", title: "To Roman numerals", prompt: "Convert this number to Roman numerals.", task: "1994", answer: "MCMXCIV", hint: "Use To Roman Numerals." },
    { id: "c86", cat: "Encoding", level: "easy", title: "From Roman numerals", prompt: "Convert this Roman numeral back to a number.", task: "XLII", answer: "42", hint: "Use From Roman Numerals." },
    { id: "c87", cat: "Bitwise", level: "easy", title: "Swap the nibbles", prompt: "Swap the high and low nibble of every byte below and give the hex result.", task: "hi", answer: "8696", hint: "Use Swap Nibbles." },
    { id: "c88", cat: "Hashing", level: "medium", title: "CRC-16", prompt: "Enter the CRC-16 checksum (hex) of the word below.", task: "ByteLabs", answer: "5904", hint: "Use the CRC-16 operation." },
    { id: "c89", cat: "Hashing", level: "easy", title: "Luhn check digit", prompt: "Append the Luhn check digit to the number below.", task: "36695", answer: "366955", hint: "Use the Luhn Checksum operation." },
    { id: "c90", cat: "Data", level: "medium", title: "Edit distance", prompt: "How many single-character edits turn the word below into 'lawn'?", task: "flaw", answer: "2", hint: "Use Levenshtein Distance with Compare to = lawn." },
    { id: "c91", cat: "Data", level: "medium", title: "Parse the URL", prompt: "Run Parse URL on the address below and enter the value of the 'promo' query parameter.", task: "https://shop.example.com/cart?item=42&promo=SUMMER20", answer: "SUMMER20", hint: "Use Parse URL and read the promo line under Query." },
    { id: "c92", cat: "Encoding", level: "medium", title: "Crockford Base32", prompt: "Decode this Crockford Base32 string.", task: "E1TQMYKCCMG64VVR", answer: "puzzle box", hint: "Use From Crockford Base32." },
    { id: "c93", cat: "Encoding", level: "medium", title: "Z85", prompt: "Decode this Z85 string.", task: "lv0V:oKRyK", answer: "ByteLabs", hint: "Use From Z85." },
    { id: "c94", cat: "Encoding", level: "medium", title: "MIME encoded-word", prompt: "Decode this RFC 2047 MIME encoded-word.", task: "=?UTF-8?B?ZmxhZyBzZWN1cmVk?=", answer: "flag secured", hint: "Use From MIME Encoded-Word." },
    { id: "c95", cat: "Encoding", level: "hard", title: "UTF-7", prompt: "Decode this UTF-7 string.", task: "na+AO8-ve caf+AOk-", answer: "naïve café", hint: "Use From UTF-7." },
    { id: "c96", cat: "Encoding", level: "medium", title: "Spreadsheet column, forward", prompt: "Convert this number to spreadsheet-style column letters.", task: "703", answer: "AAA", hint: "Use To Bijective Base26 (Spreadsheet Columns)." },
    { id: "c97", cat: "Encoding", level: "medium", title: "Spreadsheet column, reversed", prompt: "Convert these spreadsheet column letters back to a number.", task: "AAA", answer: "703", hint: "Use From Bijective Base26 (Spreadsheet Columns)." },
    { id: "c98", cat: "Encoding", level: "easy", title: "Unary, reversed", prompt: "Decode this unary number.", task: "1111111", answer: "7", hint: "Use From Unary." },
    { id: "c99", cat: "Encoding", level: "easy", title: "Unary", prompt: "Encode this number in unary.", task: "7", answer: "1111111", hint: "Use To Unary." },
    { id: "c100", cat: "Ciphers", level: "medium", title: "Trithemius cipher", prompt: "Encrypt this with the Trithemius cipher.", task: "BYTELABS", answer: "BZVHPFHZ", hint: "Use Trithemius Cipher Encode." },
    { id: "c101", cat: "Ciphers", level: "hard", title: "Break the Gronsfeld cipher", prompt: "This was Gronsfeld-enciphered with key 5210. Recover the message.", task: "FVUAHMBTICXN", answer: "ATTACKATDAWN", hint: "Use Gronsfeld Cipher Decode with key 5210." },
    { id: "c102", cat: "Ciphers", level: "hard", title: "Break the Autokey cipher", prompt: "This was Autokey-enciphered with keyword LEMON. Recover the message.", task: "DIOFRLQGJWTSI", answer: "SECRETMESSAGE", hint: "Use Autokey Cipher Decode with keyword LEMON." },
    { id: "c103", cat: "Ciphers", level: "hard", title: "Break the Nihilist cipher", prompt: "This was Nihilist-enciphered with keyword SHIELD. Recover the message.", task: "57 38 45 30 64 28", answer: "DEFEND", hint: "Use Nihilist Cipher Decode with keyword SHIELD." },
    { id: "c104", cat: "Ciphers", level: "hard", title: "Break the Keyword cipher", prompt: "This was enciphered with a Keyword cipher, keyword CIPHER. Recover the message.", task: "CTTCPGCTHCWL", answer: "ATTACKATDAWN", hint: "Use Keyword Cipher Decode with keyword CIPHER." },
    { id: "c105", cat: "Ciphers", level: "medium", title: "ROT18", prompt: "Decode this ROT18 string.", task: "Ebbz 97O", answer: "Room 42B", hint: "ROT18 again reverses it - letters and digits both." },
    { id: "c106", cat: "Ciphers", level: "hard", title: "Playfair cipher", prompt: "Encrypt this with a Playfair cipher, keyword MONARCHY.", task: "ATTACKATDAWN", answer: "RSSRDERSBRNY", hint: "Use Playfair Cipher Encode with keyword MONARCHY." },
    { id: "c107", cat: "Ciphers", level: "hard", title: "Break the Playfair cipher", prompt: "This was Playfair-enciphered with keyword MONARCHY. Recover the message.", task: "RSSRDERSBRNY", answer: "ATTACKATDAWN", hint: "Use Playfair Cipher Decode with keyword MONARCHY." },
    { id: "c108", cat: "Bitwise", level: "medium", title: "NAND", prompt: "NAND this text with the key 'ok' and give the hex result.", task: "hi", answer: "9796", hint: "Use the NAND operation with key ok." },
    { id: "c109", cat: "Bitwise", level: "hard", title: "Arithmetic shift", prompt: "Arithmetic-shift-right this text by 1 bit and give the hex result.", task: "é", answer: "e1d4", hint: "Use Arithmetic Shift Right, amount 1. Note é is 2 UTF-8 bytes, both with the sign bit set." },
    { id: "c110", cat: "Bitwise", level: "medium", title: "Two's complement", prompt: "Convert this signed number to 8-bit two's complement hex.", task: "-42", answer: "d6", hint: "Use To Two's Complement, bit width 8." },
    { id: "c111", cat: "Bitwise", level: "medium", title: "From two's complement", prompt: "This is an 8-bit two's complement value. What decimal number is it?", task: "d6", answer: "-42", hint: "Use From Two's Complement, bit width 8." },
    { id: "c112", cat: "Bitwise", level: "easy", title: "Toggle a bit", prompt: "Toggle bit 3 (counting from 0, LSB first) of this hex byte.", task: "ff", answer: "f7", hint: "Use Toggle Bit, position 3." },
    { id: "c113", cat: "Bitwise", level: "easy", title: "Count leading zeros", prompt: "How many leading zero bits does this 8-bit hex value have?", task: "0f", answer: "4", hint: "Use Count Leading Zeros, bit width 8." },
    { id: "c114", cat: "Hashing", level: "medium", title: "CRC-8", prompt: "Enter the CRC-8 checksum (hex) of the word below.", task: "ByteLabs", answer: "92", hint: "Use the CRC-8 operation." },
    { id: "c115", cat: "Hashing", level: "medium", title: "FNV-1a", prompt: "Enter the FNV-1a (32-bit) hash (hex) of the word below.", task: "ByteLabs", answer: "8e4b9267", hint: "Use the FNV-1a (32-bit) operation." },
    { id: "c116", cat: "Hashing", level: "medium", title: "DJB2", prompt: "Enter the DJB2 hash (hex) of the word below.", task: "ByteLabs", answer: "dcd84d9b", hint: "Use the DJB2 operation." },
    { id: "c117", cat: "Hashing", level: "hard", title: "HMAC-MD5", prompt: "Enter the HMAC-MD5 of the message below using the key 'shield'.", task: "attack at dawn", answer: "6e70cec4d038cf6c6bb1ad2835422ad6", hint: "Use HMAC-MD5 with key shield." },
    { id: "c118", cat: "Hashing", level: "medium", title: "Internet Checksum", prompt: "Enter the Internet Checksum (RFC 1071, hex) of the word below.", task: "ByteLabs", answer: "9a4c", hint: "Use the Internet Checksum (RFC 1071) operation." },
    { id: "c119", cat: "Hashing", level: "easy", title: "XOR-8 checksum", prompt: "Enter the XOR-8 checksum (hex) of the word below.", task: "ByteLabs", answer: "16", hint: "Use the XOR-8 Checksum operation." },
    { id: "c120", cat: "Text", level: "easy", title: "Leetspeak", prompt: "Convert this phrase to leetspeak.", task: "elite hacker", answer: "31173 h4ck3r", hint: "Use To Leetspeak." },
    { id: "c121", cat: "Text", level: "medium", title: "Pig Latin", prompt: "Convert this phrase to Pig Latin.", task: "hello friend", answer: "ellohay iendfray", hint: "Use Pig Latin." },
    { id: "c122", cat: "Text", level: "easy", title: "Pad with zeros", prompt: "Pad this number to 6 digits with leading zeros.", task: "42", answer: "000042", hint: "Use Pad left, width 6, pad character 0." },
    { id: "c123", cat: "Text", level: "easy", title: "Center it", prompt: "Center this text in a field of width 8 using * as the pad character.", task: "hi", answer: "***hi***", hint: "Use Center text, width 8, pad character *." },
    { id: "c124", cat: "Text", level: "easy", title: "Mocking case", prompt: "Convert this phrase to aLtErNaTiNg CaSe.", task: "byte labs", answer: "bYtE lAbS", hint: "Use aLtErNaTiNg CaSe." },
    { id: "c125", cat: "Text", level: "easy", title: "Strip the punctuation", prompt: "Remove the punctuation from this sentence.", task: "Wait... really?!", answer: "Wait really", hint: "Use Remove punctuation." },
    { id: "c126", cat: "Data", level: "medium", title: "Compress an IPv6 address", prompt: "Compress this fully-expanded IPv6 address.", task: "2001:0db8:0000:0000:0000:0000:0000:0001", answer: "2001:db8::1", hint: "Use Compress IPv6." },
    { id: "c127", cat: "Data", level: "easy", title: "Format a MAC address", prompt: "Reformat this MAC address using dashes.", task: "AABBCCDDEEFF", answer: "aa-bb-cc-dd-ee-ff", hint: "Use Format MAC Address, style dash." },
    { id: "c128", cat: "Data", level: "medium", title: "CSV to JSON", prompt: "Run CSV to JSON on the table below and enter the value of the id field for the Labs row.", task: "id,name\n1,Byte\n2,Labs", answer: "2", hint: "Use CSV to JSON, then read the id value next to \"name\": \"Labs\"." },
    { id: "c129", cat: "Data", level: "medium", title: "Build a query string", prompt: "Run Build Query String on the key=value lines below and enter the full result.", task: "q=byte labs\npage=2", answer: "?q=byte%20labs&page=2", hint: "Use Build Query String - spaces get percent-encoded." },
    { id: "c130", cat: "Data", level: "easy", title: "Days between dates", prompt: "How many days are there between 2026-01-01 and 2026-03-15?", task: "2026-01-01", answer: "73 days", hint: "Use Date Difference with the second date set to 2026-03-15." },
    { id: "c131", cat: "Data", level: "medium", title: "Word frequency", prompt: "Run Word Frequency on the text below and enter the count shown for 'byte'.", task: "byte labs byte encode byte", answer: "3", hint: "Use Word Frequency and read the count next to byte." }
  ];

  // Order lessons follow on the progression map (each unlocks the next).
  // Sections group the path into named units on the Learn map. Their ids, flattened
  // in order, ARE the lesson order — the unlock chain runs straight through them.
  const LESSON_SECTIONS = [
    { title: "Encodings", ids: ["base64", "hex", "romannumerals", "hexdump", "unicode", "surrogates", "mojibake", "homoglyphs", "url", "mime", "base32", "base58", "base3662", "density", "base45lesson", "morse", "datauri"] },
    { title: "Classical ciphers", ids: ["ciphers", "affine", "polybius", "playfair", "beaufortlesson", "transposition", "columnar", "bacon", "frequency", "autokey", "kerckhoffs"] },
    { title: "Bits & XOR", ids: ["xor", "otp", "bitwise", "twoscomplement", "nandgate", "bitmasks", "hamming", "endianness", "bruteforce"] },
    { title: "Hashing & integrity", ids: ["hashing", "collisions", "merkletrees", "checksums", "luhn", "noncryptohash", "internetchecksumlesson", "hmac"] },
    { title: "Encryption", ids: ["encryption", "aes", "rsa", "signatures", "keyexchange", "tls"] },
    { title: "Passwords & secrets", ids: ["salt", "kdf", "cracking", "strength-practice", "diceware", "mfa"] },
    { title: "Data in practice", ids: ["uuids", "jwt", "networking", "subnetting", "ipv6", "csvjson", "unixtime", "regex", "entropy"] }
  ];
  const LESSON_ORDER = LESSON_SECTIONS.reduce((acc, s) => acc.concat(s.ids), []);

  window.CL_DATA = { LESSONS, CHALLENGES, LESSON_ORDER, LESSON_SECTIONS };
})();
