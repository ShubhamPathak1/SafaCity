# 🧹 SafaCity
**SafaCity** is an AI-powered mobile application that promotes cleaner, smarter cities by helping users identify waste types through their phone camera and providing real-time guidance.

With a simple scan, SafaCity performs waste analysis (type, degradability, recyclability, reusability, combustibility), shows nearby disposal sites, and enables users to ask questions via an AI-powered WasteBot. It also offers reward incentives, waste-related notifications, and lets users send feedback to relevant authorities.

Built with **React Native + Expo** and powered by Google Gemini AI, **SafaCity** is your pocket-sized sustainability assistant.

---

## 🚀 Features

- 📷 **Waste Recognition via Camera**  
  Instantly analyze waste by scanning it with your phone. The app identifies:
  - Type of waste  
  - Degradability  
  - Recyclability  
  - Reusability  
  - Combustibility (burnable or not)

- 💬 **AI-Powered WasteBot**  
  Ask anything about the scanned waste and get real-time answers with Google Gemini-powered assistance.

- 📍 **Disposal Site Suggestions**  
  Get nearby disposal site recommendations based on the type of waste detected.

- 🏆 **Reward System**  
  Earn points for responsible disposal actions, creating an incentive for sustainable habits.

- 🔔 **Smart Notifications**  
  Receive timely, waste-related updates and educational content.

- 📝 **Authority Feedback**  
  Submit reports or feedback directly to the relevant municipal or environmental authorities.

- 🔐 **User Authentication**  
  Auth powered by [Clerk.dev](https://clerk.dev) for secure and seamless onboarding.

---

## 🔧 Tech Stack

- React Native + Expo
- TypeScript
- Clerk for Authentication
- Google Gemini API
---

## 🛠️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/safacity.git
cd safacity
```

### 2. Create a .env file and add the following
```
EXPO_GOOGLE_GEMINI_API_KEY= your_api_key
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY= your_clerk_api_key
```

### 3. Install Dependencies
```
npm install
```

### 4. Start the app
```
npx expo start
```

## License
This project is open-source and available under the MIT License.

