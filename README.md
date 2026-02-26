# Hive Delegation Manager v0.0.1 (Slim Edition) 🚀

A lightweight, terminal-based auditor for the Hive blockchain, optimized specifically for **Termux** and mobile users. 

### 📱 Features
- **Mobile Optimized:** 45-character width prevents UI wrapping on small screens.
- **HP Auditor:** Lists detailed outgoing HP delegations and calculates Available vs. Total HP.
- **RC Insights:** Displays total outgoing Resource Credits converted into human-readable **HP units**.
- **User Friendly:** Simple 'X' to exit and persistent input for auditing multiple accounts.

📖 Extended Description
The Hive Delegation Manager was born out of a specific need: a way to audit account resources on the go without the UI breaking. Most CLI tools are built for wide desktop monitors; this script is built for the Termux environment on mobile devices.
🎯 Problem & Solution
The Problem: Standard terminal outputs wrap and become unreadable on narrow smartphone screens (Portrait mode).
The Solution: A strictly 45-character wide interface that ensures a clean, "box-style" dashboard even on small screens.
⚡ Technical Highlights
Global Ratio Logic: Instead of showing raw VESTS, the script pulls live data from the getDynamicGlobalProperties API to convert all values into real Hive Power (HP).
RC-to-HP Conversion: Most users find raw RC numbers confusing. This script translates delegated Resource Credits into their HP Equivalent, allowing you to see exactly how much "Power" you are sharing with others.
Persistent Interaction: Unlike one-off scripts, this keeps the session open, allowing you to audit multiple accounts in a single run.
🤝 Community Focus
The default audit target is set to @stayoutoftherz, honoring the developers who keep the Hive ecosystem moving forward. This tool is open for anyone to fork and adapt for their own curation or delegation tracking needs.

### 🛠️ Installation

Ensure you have [Node.js](https://nodejs.org/) installed on your system or Termux.

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/oneteacher365/rc-delegations.git](https://github.com/oneteacher365/rc-delegations.git)
   cd rc-delegations
2. Install Dependencies:
Running this command will automatically read the package.json and install the @hiveio/dhive library for you:

npm install

🚀 Running the Auditor
You don't need to type the full filename anymore. I have configured a start script for you:

npm start

   
