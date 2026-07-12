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
    { id: "c51", level: "hard", title: "Two layers, new encodings", prompt: "This was Quoted-Printable encoded, then Base64-encoded. Peel both layers.", task: "Y2FmPUMzPUE5ID0zRCAxMDAlIHNlY3VyZQ==", answer: "café = 100% secure", hint: "From Base64, then From Quoted-Printable." },
    { id: "c52", level: "easy", title: "Date to timestamp", prompt: "Convert this date to a Unix timestamp (seconds).", task: "2024-01-01", answer: "1704067200", hint: "Use Date to Unix Time." },
    { id: "c53", level: "easy", title: "Find the address", prompt: "Extract the IPv4 address from this sentence.", task: "The server at 10.20.30.40 stopped responding", answer: "10.20.30.40", hint: "Use Extract, mode IPv4 addresses." },
    { id: "c54", level: "easy", title: "HSL to hex", prompt: "Convert this HSL color to its hex form.", task: "hsl(120, 100%, 25%)", answer: "#008000", hint: "Use Color Converter, convert to Hex." },
    { id: "c55", level: "medium", title: "Encode to Base85", prompt: "Type the Base85 (Ascii85) encoding of the word below.", task: "byte", answer: "@X3',", hint: "Use To Base85 on 'byte'." },
    { id: "c56", level: "medium", title: "Into Gray code", prompt: "Give the hex Gray code of the text below.", task: "hi", answer: "5c5d", hint: "Use To Gray Code." },
    { id: "c57", level: "medium", title: "Vigenère, forward", prompt: "Encrypt this with a Vigenère cipher, keyword BYTE.", task: "ATTACKATDAWN", answer: "BRMEDITXEYPR", hint: "Use Vigenère Encode with key BYTE." },
    { id: "c58", level: "medium", title: "ROT13 in Base32", prompt: "This was ROT13'd, then Base32-encoded. Peel both layers.", task: "MZZHAZLSM4======", answer: "secret", hint: "From Base32 first, then ROT13." },
    { id: "c59", level: "hard", title: "Four rails", prompt: "Decode this Rail Fence ciphertext — it used 4 rails.", task: "DTTTEDHSWADFNEAALUKEELS", answer: "DEFENDTHEEASTWALLATDUSK", hint: "Rail Fence Decode with Rails set to 4." },
    { id: "c60", level: "hard", title: "Shifted, then dumped", prompt: "This message was Caesar-shifted by 7, then hex-encoded. Recover the original.", task: "74 6c 6c 61 20 68 61 20 61 6f 6c 20 75 76 79 61 6f 20 6e 68 61 6c", answer: "meet at the north gate", hint: "From Hex first, then Caesar with shift -7 (or 19)." },
    { id: "c61", level: "medium", title: "Swap the byte order", prompt: "Swap the endianness of this 4-byte hex value.", task: "12345678", answer: "78 56 34 12", hint: "Use Swap Endianness." },
    { id: "c62", level: "easy", title: "Make a data URI", prompt: "Encode the word below as a plain-text data URI.", task: "hi", answer: "data:text/plain;base64,aGk=", hint: "Base64-encode 'hi', then prefix it with data:text/plain;base64," },
    { id: "c63", level: "easy", title: "Spell it phonetically", prompt: "Convert the word below to NATO phonetic spelling.", task: "bug", answer: "Bravo Uniform Golf", hint: "Use To NATO Phonetic." },
    { id: "c64", level: "medium", title: "Octal to binary", prompt: "Convert this octal number to binary.", task: "17", answer: "1111", hint: "Use Change number base, from Octal to Binary." },
    { id: "c65", level: "easy", title: "Find the number", prompt: "Extract the number hidden in this sentence.", task: "Room 42 is now open", answer: "42", hint: "Use Extract, mode Numbers." },
    { id: "c66", level: "hard", title: "HMAC-SHA512", prompt: "Enter the HMAC-SHA512 of the message 'hello' using the key 'key'.", task: "message: hello   key: key", answer: "ff06ab36757777815c008d32c8e14a705b4e7bf310351a06a23b612dc4c7433e7757d20525a5593b71020ea2ee162d2311b247e9855862b270122419652c0c92", hint: "Use HMAC-SHA512 with key 'key' on input 'hello'." },
    { id: "c67", level: "medium", title: "BLAKE2b-256", prompt: "Enter the BLAKE2b-256 hash (hex) of the word below.", task: "hi", answer: "6815cb4aeb1580a91ef673e63ff03bdb6e855c3a896db3f2765e03281a61134a", hint: "Use the BLAKE2b-256 operation." },
    { id: "c68", level: "easy", title: "Slugify a title", prompt: "Convert this title into a URL-friendly slug.", task: "Byte Labs Rocks!", answer: "byte-labs-rocks", hint: "Use Slugify." }
  ];

  // Order lessons follow on the progression map (each unlocks the next).
  // Sections group the path into named units on the Learn map. Their ids, flattened
  // in order, ARE the lesson order — the unlock chain runs straight through them.
  const LESSON_SECTIONS = [
    { title: "Encodings", ids: ["base64", "hex", "hexdump", "unicode", "surrogates", "mojibake", "homoglyphs", "url", "mime", "base32", "base58", "density", "morse", "datauri"] },
    { title: "Classical ciphers", ids: ["ciphers", "transposition", "columnar", "frequency", "kerckhoffs"] },
    { title: "Bits & XOR", ids: ["xor", "otp", "bitwise", "bitmasks", "endianness", "bruteforce"] },
    { title: "Hashing & integrity", ids: ["hashing", "collisions", "merkletrees", "checksums", "hmac"] },
    { title: "Encryption", ids: ["encryption", "aes", "rsa", "signatures", "keyexchange", "tls"] },
    { title: "Passwords & secrets", ids: ["salt", "kdf", "cracking", "strength-practice", "diceware", "mfa"] },
    { title: "Data in practice", ids: ["uuids", "jwt", "networking", "unixtime", "regex", "entropy"] }
  ];
  const LESSON_ORDER = LESSON_SECTIONS.reduce((acc, s) => acc.concat(s.ids), []);

  window.CL_DATA = { LESSONS, CHALLENGES, LESSON_ORDER, LESSON_SECTIONS };
})();
