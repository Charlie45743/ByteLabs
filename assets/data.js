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
    }
  ];

  const CHALLENGES = [
    // Easy
    { id: "c1", level: "easy", title: "Decode Base64", prompt: "Decode this Base64 text.", task: "Qnl0ZUxhYnM=", answer: "ByteLabs", hint: "Use From Base64." },
    { id: "c2", level: "easy", title: "Encode to Base64", prompt: "Type the Base64 encoding of the word below.", task: "hello", answer: "aGVsbG8=", hint: "Use To Base64 on 'hello'." },
    { id: "c3", level: "easy", title: "Read the hex", prompt: "These bytes spell a word. Decode the hex.", task: "6f70656e", answer: "open", hint: "Use From Hex." },
    { id: "c4", level: "easy", title: "Break ROT13", prompt: "Decode this ROT13 message.", task: "Frperg", answer: "Secret", hint: "ROT13 again reverses it." },
    { id: "c5", level: "easy", title: "Binary to text", prompt: "Decode this 8-bit binary.", task: "01001000 01101001", answer: "Hi", hint: "Use From Binary." },
    { id: "c6", level: "easy", title: "Morse code", prompt: "Decode this Morse code.", task: ".... . .-.. .-.. ---", answer: "HELLO", hint: "Use From Morse (result is upper case)." },
    { id: "c7", level: "easy", title: "URL decode", prompt: "Decode this URL-encoded string.", task: "a%20b%26c", answer: "a b&c", hint: "Use URL Decode." },
    { id: "c8", level: "easy", title: "Atbash", prompt: "Decode this Atbash-ciphered word.", task: "Gvhg", answer: "Test", hint: "Atbash is its own inverse." },
    // Medium
    { id: "c9", level: "medium", title: "Base32", prompt: "Decode this Base32 text.", task: "JBSWY3DPEE======", answer: "Hello!", hint: "Use From Base32." },
    { id: "c10", level: "medium", title: "Caesar shift 5", prompt: "This was Caesar-shifted by 5. Recover the text.", task: "Mjqqt", answer: "Hello", hint: "Caesar with shift 21 (or -5)." },
    { id: "c11", level: "medium", title: "Vigenère", prompt: "Decode with the keyword LEMON.", task: "LXFOPVEFRNHR", answer: "ATTACKATDAWN", hint: "Use Vigenère Decode, key LEMON." },
    { id: "c12", level: "medium", title: "Decimal codes", prompt: "Decode these decimal character codes.", task: "72 101 108 108 111", answer: "Hello", hint: "Use From Decimal." },
    { id: "c13", level: "medium", title: "ROT47", prompt: "Decode this ROT47 string.", task: "qJE6{23D", answer: "ByteLabs", hint: "ROT47 again reverses it." },
    { id: "c14", level: "medium", title: "A1Z26", prompt: "Decode these letter-position numbers.", task: "3 1 20", answer: "cat", hint: "Use A1Z26 Decode (A=1)." },
    // Hard
    { id: "c15", level: "hard", title: "SHA-256", prompt: "Enter the SHA-256 hash (hex) of the word below.", task: "test", answer: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08", hint: "Put 'test' through SHA-256." },
    { id: "c16", level: "hard", title: "MD5", prompt: "Enter the MD5 hash of the word below.", task: "hello", answer: "5d41402abc4b2a76b9719d911017c592", hint: "Put 'hello' through MD5." },
    { id: "c17", level: "hard", title: "XOR with a key", prompt: "This hex was XORed with the key 'cle'. Recover the message.", task: "221811020f0e430d114308041402", answer: "Attack at dawn", hint: "Use XOR, direction Hex → Text, key cle." },
    { id: "c18", level: "hard", title: "CRC-32", prompt: "Enter the CRC-32 checksum (hex) of the word below.", task: "hello", answer: "3610a686", hint: "Use the CRC-32 operation." },
    { id: "c19", level: "hard", title: "Two layers", prompt: "This was Hex-encoded, then Base64-encoded. Peel both layers.", task: "NjMgNjEgNzQ=", answer: "cat", hint: "From Base64, then From Hex." },
    { id: "c20", level: "medium", title: "Base64 URL", prompt: "Decode this URL-safe Base64 token.", task: "ZmxhZ3t5MHVfZ290X2l0fQ", answer: "flag{y0u_got_it}", hint: "Use From Base64 URL." },
    { id: "c21", level: "medium", title: "Reverse & Base64", prompt: "The text was reversed, then Base64-encoded. Recover it.", task: "Ym9C", answer: "Bob", hint: "From Base64, then Reverse text." },
    { id: "c22", level: "hard", title: "HMAC", prompt: "Enter the HMAC-SHA256 of the message 'hello' using the key 'secret'.", task: "message: hello   key: secret", answer: "88aab3ede8d3adf94d26ab90d3bafd4a2083070c3bcce9c014ee04a443847c0b", hint: "Use HMAC-SHA256 with key 'secret' on input 'hello'." },
    { id: "c23", level: "medium", title: "Base58", prompt: "Decode this Base58 string.", task: "StV1DL6CwTryKyV", answer: "hello world", hint: "Use From Base58." },
    { id: "c24", level: "easy", title: "Change base", prompt: "Convert this hexadecimal number to decimal.", task: "ff", answer: "255", hint: "Change number base, from Hex to Decimal." },
    { id: "c25", level: "hard", title: "SHA-1", prompt: "Enter the SHA-1 hash (hex) of the word below.", task: "abc", answer: "a9993e364706816aba3e25717850c26c9cd0d89d", hint: "Put 'abc' through SHA-1." },
    { id: "c26", level: "easy", title: "Read a hexdump", prompt: "Decode the text hidden in this hexdump.", task: "00000000: 4869 21                                  Hi!", answer: "Hi!", hint: "Use From Hexdump." },
    { id: "c27", level: "easy", title: "Spell it out", prompt: "Convert the word below to NATO phonetic spelling.", task: "cat", answer: "Charlie Alpha Tango", hint: "Use To NATO Phonetic." },
    { id: "c28", level: "medium", title: "Octal codes", prompt: "Decode these octal character codes.", task: "107 157", answer: "Go", hint: "Use From Octal." },
    { id: "c29", level: "medium", title: "Unicode escapes", prompt: "Decode this \\u-escaped string.", task: "\\u0053\\u0065\\u0063", answer: "Sec", hint: "Use From \\u Escapes." },
    { id: "c30", level: "medium", title: "Strip the tags", prompt: "Remove the HTML tags, keeping just the text.", task: "<p>Nice <b>work</b></p>", answer: "Nice work", hint: "Use Strip HTML tags." },
    { id: "c31", level: "medium", title: "Find the email", prompt: "Extract the email address hidden in this sentence.", task: "Contact us at hello@example.com for info", answer: "hello@example.com", hint: "Use Extract, mode Email addresses." },
    { id: "c32", level: "easy", title: "Change of base", prompt: "Convert this binary number to hexadecimal.", task: "1010", answer: "a", hint: "Use Change number base, From Binary, To Hex." },
    { id: "c33", level: "hard", title: "Crack the shift", prompt: "This sentence was Caesar-shifted by an unknown amount. Use letter frequency to find the shift and recover the text.", task: "aol xbpjr iyvdu mve qbtwz vcly aol shgf kvn dopsl aopurpun hivba jyfwavnyhwof", answer: "the quick brown fox jumps over the lazy dog while thinking about cryptography", hint: "Run Letter frequency on the ciphertext, compare to normal English letter frequency, then try Caesar with that shift." },
    { id: "c34", level: "medium", title: "Base32 again", prompt: "Decode this Base32 string.", task: "OB2XU6TMMU======", answer: "puzzle", hint: "Use From Base32." },
    { id: "c35", level: "easy", title: "Flip every bit", prompt: "Apply bitwise NOT to the character below and give the hex result.", task: "0", answer: "cf", hint: "Use the NOT operation." },
    { id: "c36", level: "easy", title: "Rotate a byte", prompt: "Rotate the bits of this single character left by 2 and give the hex result.", task: "@", answer: "01", hint: "Use Rotate Bits Left, amount 2. '@' is byte 0x40." },
    { id: "c37", level: "medium", title: "Modular addition", prompt: "ADD (mod 256) the key 'ab' to the text below and give the hex result.", task: "Go", answer: "a8d1", hint: "Use ADD (mod 256) with key 'ab'." },
    { id: "c38", level: "medium", title: "AND spells a word", prompt: "Bitwise-AND these two words together with key 'mask', then decode the hex result back to text.", task: "lock", answer: "lack", hint: "Use AND with key 'mask', then From Hex on the result." },
    { id: "c39", level: "hard", title: "Break the single-byte key", prompt: "This was encrypted with a single-byte XOR key. Recover the message.", task: "624a4a5b0f4e5b0f5b474a0f40434b0f4d5d464b484a0f5b40414648475b", answer: "Meet at the old bridge tonight", hint: "Use XOR Brute Force, input is Hex — check the top-ranked result." },
    { id: "c40", level: "hard", title: "Brute force the shift", prompt: "Use the Caesar Brute Force tool to recover this message — don't work it out by hand.", task: "xgvkrimbhg dxxil hnk wtmt ltyx ykhf ikrbgz xrxl tgw vnkbhnl tmmtvdxkl", answer: "encryption keeps our data safe from prying eyes and curious attackers", hint: "Use Caesar Brute Force and check the top-ranked line." },
    { id: "c41", level: "medium", title: "Rail Fence", prompt: "This was encoded with Rail Fence, 3 rails. Decode it.", task: "ACDTAKTANTAW", answer: "ATTACKATDAWN", hint: "Use Rail Fence Decode with Rails set to 3." },
    { id: "c42", level: "easy", title: "Base85", prompt: "Decode this Base85 (Ascii85) string.", task: "Ao(mg", answer: "flag", hint: "Use From Base85." },
    { id: "c43", level: "medium", title: "Internationalized domain", prompt: "Decode this Punycode domain back to Unicode.", task: "xn--mnchen-3ya.de", answer: "münchen.de", hint: "Use From Punycode." },
    { id: "c44", level: "hard", title: "Columnar transposition", prompt: "Decode this Columnar Transposition ciphertext using the keyword PUZZLE.", task: "ENMDMAIETGEMHTIT", answer: "MEETMEATMIDNIGHT", hint: "Use Columnar Transposition Decode, keyword PUZZLE." },
    { id: "c45", level: "medium", title: "Quoted-Printable", prompt: "Decode this Quoted-Printable string.", task: "50% off caf=C3=A9 orders", answer: "50% off café orders", hint: "Use From Quoted-Printable." },
    { id: "c46", level: "easy", title: "Adler-32", prompt: "Enter the Adler-32 checksum (hex) of the word below.", task: "hello", answer: "062c0215", hint: "Use the Adler-32 operation." },
    { id: "c47", level: "medium", title: "Gray code", prompt: "Decode these Gray-coded hex bytes.", task: "6468", answer: "GO", hint: "Use From Gray Code." },
    { id: "c48", level: "easy", title: "Color format", prompt: "Convert this hex color to its RGB form.", task: "#663399", answer: "rgb(102, 51, 153)", hint: "Use Color Converter, convert to RGB." },
    { id: "c49", level: "easy", title: "IP to integer", prompt: "Convert this IPv4 address to its 32-bit integer form.", task: "10.0.0.1", answer: "167772161", hint: "Use IPv4 to Integer." },
    { id: "c50", level: "easy", title: "Integer to IP", prompt: "Convert this integer back to dotted-quad IPv4 form.", task: "2130706433", answer: "127.0.0.1", hint: "Use Integer to IPv4." },
    { id: "c51", level: "hard", title: "Two layers, new encodings", prompt: "This was Quoted-Printable encoded, then Base64-encoded. Peel both layers.", task: "Y2FmPUMzPUE5ID0zRCAxMDAlIHNlY3VyZQ==", answer: "café = 100% secure", hint: "From Base64, then From Quoted-Printable." }
  ];

  // Order lessons follow on the progression map (each unlocks the next).
  const LESSON_ORDER = [
    "base64", "hex", "unicode", "mojibake", "homoglyphs", "url", "mime", "base32", "base58",
    "ciphers", "transposition", "columnar", "frequency", "xor", "bitwise", "bruteforce", "hashing", "checksums", "hmac",
    "encryption", "aes", "rsa", "signatures", "keyexchange", "tls",
    "salt", "kdf", "cracking", "strength-practice", "jwt", "networking", "regex", "entropy"
  ];

  window.CL_DATA = { LESSONS, CHALLENGES, LESSON_ORDER };
})();
