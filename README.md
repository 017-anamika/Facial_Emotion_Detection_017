# Facial Emotion Detection App 🧠💻

A real-time **facial emotion detection** app built with **React**, **TensorFlow.js**, and **Vite**. It uses **face-api.js** to detect emotions like happy, sad, and angry from your webcam feed. 😄😢😠

## Features 🌟

- Real-time emotion detection via webcam. 📹
- Displays dominant emotion and an intensity bar. 📊
- Screenshot capture of detected emotion. 📸

## Technologies Used 🛠️

- **React**: Frontend framework for building the UI. 🖥️
- **TensorFlow.js** & **face-api.js**: For facial emotion detection. 🤖
- **Vite**: Fast build tool with HMR (Hot Module Replacement). ⚡
- **JavaScript** & **CSS**: For styling and functionality. 🎨

## Setup and Installation ⚙️

### Prerequisites 📋

- **Node.js** (v14 or higher) ⚡
- **npm** (or **Yarn**) 🎯

### Install Dependencies 📦

1. Clone the repository:
   ```bash
   git clone https://github.com/017-anamika/Facial_Emotion_Detection_017.git
   cd Facial_Emotion_Detection_017
   
2. Install the required dependencies:
   ```bash
   npm install
   
3. Download the pre-trained models for Tiny Face Detector and Face Expression Model and place them in the public/models directory.

### Run the App 🚀
Start the development server:
   ```bash
   npm run dev
   ```
Navigate to http://localhost:5173 in your browser. 🌍

### Project Structure 📂
   ```bash
   /public
   └── /models         # TensorFlow models for face-api.js
   /src
   └── App.js          # Main component for emotion detection
   └── main.jsx        # Entry point for the React app
   .gitignore
   eslint.config.js      # ESLint configuration
   package.json          # Project dependencies and scripts
   vite.config.js        # Vite build configuration
   README.md             # Project documentation
