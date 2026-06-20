# 🚀 SnipAlt 
> The fastest way to save web insights without breaking your flow.

SnipAlt is a high-end, keyboard-driven Chrome Extension designed for developers, researchers, and power users. Capture important text instantly using **`Alt + S`**, manage it on the fly via an interactive Floating Dock, and keep your permanent knowledge vault tucked away neatly in the native Chrome SidePanel.

---

## 🔥 Launch Special: Lifetime Access (First 50 Users Only)
We are currently bootstrapping SnipAlt! To reward our earliest adopters, the first **50 users** can unlock **Premium Cloud Sync for life with a one-time purchase**. 

* **Early-Bird Tier:** One-Time Purchase (Lifetime Access) — *Limited to 50 slots*
* **Official Release Tier:** $1.00 - $2.00 / month

*Grab your license key via our distribution channel and activate Cloud Sync instantly.*

---

## 🛠️ How to Install (Beta Release)

Since SnipAlt is currently in open beta via GitHub, you can install it manually in less than 60 seconds:

### Step 1: Download the Extension Package
1. Look at the **Releases** section on the right side of this GitHub page.
2. Download the latest `SnipAlt-v1.0.0.zip` file.
3. Extract (unzip) the file somewhere safe on your computer (e.g., your Documents folder).

### Step 2: Enable Developer Mode in Chrome
1. Open Google Chrome and type `chrome://extensions/` into the URL bar.
2. In the top-right corner of the Extensions page, toggle the **Developer mode** switch to **ON**.

### Step 3: Load the Extension
1. Click the **Load unpacked** button in the top-left corner.
2. Select the extracted folder that contains the `manifest.json` file.
3. **Boom! You're done.** Pin SnipAlt to your toolbar for easy access.

---

## 💡 Core Workflows & Features

### 1. Ultra-Fast Clipping (`Alt + S`)
Highlight any text on any website and press `Alt + S`. The snippet is automatically cloned into your temporary session workspace without interrupting what you are currently reading or typing.

### 2. High-Performance Floating Dock
Your temporary workspace features a custom micro-interaction physics engine. Hover over the screen edge to expand it, drag it to reposition it, or click outside to instantly minimize it out of your sight.

### 3. Native SidePanel Vault
Press the SidePanel icon to view your full permanent database. It uses lightning-fast offline storage (`IndexedDB` via Dexie.js) so searching and interacting with your saved clips happens instantly.

### 4. Multi-Device Cloud Sync (Premium)
Upgrade to Premium to back up your snippets to our cloud repository powered by Supabase. Your clips will securely auto-update across different Chrome profiles or computer devices automatically.

---

## 📋 Tech Stack & Architecture

SnipAlt is engineered using modern, performant web standards:
* **Manifest Version:** MV3 (Chrome Extension Standard)
* **Frontend UI:** React.js + Tailwind CSS
* **Icons:** Lucide React
* **Local Storage:** IndexedDB (via Dexie.js)
* **Cloud Storage:** Supabase (PostgreSQL Client Engine)

---

## 🔒 Privacy & Security First
Your data belongs to you. Local clips stay fully sandbox-encrypted in your browser's IndexedDB instances. If you use Premium Cloud Sync, your text streams are safely isolated using custom database security protocols. We never track your browsing history or sell your captured text data.
