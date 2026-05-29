# Secure Registration and Login System
**Cybersecurity Final Project**

## 1. Hashing Algorithm Used
This project utilizes the **SHA-256** (Secure Hash Algorithm 256-bit) algorithm for hashing passwords. SHA-256 is part of the SHA-2 cryptographic hash function family designed by the NSA. It generates an almost-unique, fixed-size 256-bit (32-byte) hash. It is a one-way function, meaning it is computationally infeasible to reverse the hash back into the original plain text password.

## 2. How Salt Works
A **Salt** is a random string of data added to a user's password before it is hashed. In this project, a cryptographically secure 16-byte random salt is generated for each new user during registration. 
- **Mechanism:** The system combines the password and the salt (e.g., `Hash(password + salt)`).
- **Purpose:** Even if two users have the same password (e.g., `Password123`), their salts will be different. This ensures their final hashes are completely different, preventing attackers from using precomputed tables (Rainbow Tables) to crack the passwords. The salt is stored in the database alongside the username and hash.

## 3. How Pepper Works
A **Pepper** is a secret, constant value added to the password and salt before hashing (e.g., `Hash(password + salt + pepper)`).
- **Mechanism:** Unlike a salt, which is unique per user and stored in the database, the pepper is a secret hardcoded into the application's source code or securely stored in an environment variable. In our implementation, it is a constant string in the backend server code.
- **Purpose:** The pepper acts as an additional layer of security. If an attacker breaches the database and steals the hashes and salts, they still cannot crack the passwords without also breaching the application server to discover the pepper. **The pepper is NEVER stored in the database.**

## 4. How Password Meter Validates Password Strength
The system implements both client-side (JavaScript) and server-side (Node.js) password strength validation to ensure robust security. The meter validates the password against five strict criteria:
1. **Lowercase Letter:** Checked using the Regular Expression `/[a-z]/`
2. **Uppercase Letter:** Checked using the Regular Expression `/[A-Z]/`
3. **Digit:** Checked using the Regular Expression `/\d/`
4. **Symbol:** Checked using the Regular Expression `/[\W_]/`
5. **Minimum Length:** Checked by ensuring the string length is `>= 12`

The client-side script visually updates a meter:
- **Strong:** All 5 requirements met.
- **Medium:** 3 or 4 requirements met.
- **Weak:** Fewer than 3 requirements met.
Registration is strictly disabled until the password achieves a "Strong" status (all 5 criteria met).

## 5. Why Strong Passwords are Important in Cybersecurity
Strong passwords act as the first line of defense against unauthorized access to systems and sensitive data. 
- **Brute Force Attacks:** Short or simple passwords can be cracked in seconds using automated tools. A complex, 12+ character password takes exponentially longer to crack.
- **Dictionary Attacks:** Attackers use lists of common words. Passwords with random combinations of upper/lower case letters, numbers, and symbols are immune to standard dictionary attacks.
- **Credential Stuffing:** Strong, unique passwords prevent attackers who obtain credentials from one breached site from using them to access other accounts belonging to the user.

---

## 6. Screenshots of Hosted Online System
*(Instructions for student: After deploying your project online, take screenshots of the live Registration, Login, and Dashboard pages and place them in the `screenshots/` folder. You can embed them here or provide them separately as requested by your instructor.)*

## 7. Public URL / Link of Hosted System
**Project URL:** `[Replace this with your actual hosted link (e.g., https://my-cyber-project.glitch.me)]`

---

## Appendix: How to Host this Node.js Project for Free
Because this project utilizes a secure Node.js backend to interact with the SQLite database, you should host it on platforms that support Node.js rather than traditional PHP-only hosts like InfinityFree.

**Recommended Platform: Glitch (Easiest)**
1. Go to [Glitch.com](https://glitch.com/) and create a free account.
2. Click "New Project" -> "Import from GitHub" (if you push this to GitHub) OR create a "glitch-hello-node" project and copy/paste your files into it.
3. Make sure your `package.json`, `server.js`, `public/`, and `database/` folders are all present.
4. Glitch will automatically run `npm install` and start your `server.js`.
5. Your app will be live at `https://your-project-name.glitch.me`.

**Recommended Platform: Render.com**
1. Go to [Render.com](https://render.com/) and create a free account.
2. Push this project folder to a GitHub repository.
3. Create a new "Web Service" on Render and connect your GitHub repository.
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Note: Render's free tier has an ephemeral disk, meaning the SQLite database resets on restart. This is perfectly fine for your cybersecurity demonstration/screenshots, as you just need to show it working.
