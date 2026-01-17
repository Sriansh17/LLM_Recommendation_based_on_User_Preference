# 🚀 LLM Model Selector

An intelligent tool that classifies your prompt into different domains and recommends the best LLM model based on your preferences (quality, speed, cost, or combinations).

## ✨ Features

- 🤖 **Smart Domain Classification** - Automatically categorizes your query into 6 different domains
- 📊 **Multi-Model Routing** - Compares 6 different LLM models
- ⚙️ **Preference-Based Selection** - Choose based on: Quality, Speed, Cost, or balanced approach
- 📈 **Detailed Metrics** - View quality scores, response times, and costs
- 📜 **Request History** - Track your recent suggestions
- 🎨 **Modern UI** - Beautiful, responsive interface

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Data**: Portkey AI API, Excel metrics
- **Models**: GPT-4o, Claude Opus, Grok

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Portkey API Key

## 🚀 Local Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd portKey
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

4. **Add your Portkey API Key**
   - Edit `.env` and add your API key:
   ```
   PORTKEY_API_KEY=your_api_key_here
   ```

5. **Run the server**
   ```bash
   npm start
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🌐 Deploy to Public Hosting

### Option 1: **Render** (Recommended - Easy & Free)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <github-repo-url>
   git push -u origin main
   ```

2. **Go to [Render.com](https://render.com)**
   - Sign up with GitHub
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: llm-model-selector
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
   - Add Environment Variables:
     - Key: `PORTKEY_API_KEY`
     - Value: Your actual API key
   - Deploy!

3. Your app will be live at: `https://llm-model-selector.onrender.com`

---

### Option 2: **Railway** (Also Easy)

1. **Push to GitHub** (same as above)

2. **Go to [Railway.app](https://railway.app)**
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repo
   - Add Environment Variables:
     - `PORTKEY_API_KEY=your_key`
   - Railway auto-detects Node.js and deploys!

3. Your app will be live automatically

---

### Option 3: **Vercel**

1. **Push to GitHub** (same as above)

2. **Go to [Vercel.com](https://vercel.com)**
   - Sign up with GitHub
   - Click "Import Project"
   - Select your repo
   - Add Environment Variables
   - Deploy!

---

## 📝 API Endpoints

### `POST /suggest-model`
Suggests an LLM model based on user preferences

**Request:**
```json
{
  "prompt": "How do I debug a memory leak in Node.js?",
  "preference": "balanced"
}
```

**Response:**
```json
{
  "domain": "Coding and Debugging",
  "selected_model": "gpt-4o",
  "metrics": {
    "quality": 9.2,
    "responseTime": 450,
    "cost": 0.0025
  },
  "explanation": {
    "quality": "Quality increased by 0.5",
    "cost": "Cost decreased by 10%",
    "response_time": "Response time improved by 15%"
  }
}
```

### `GET /health`
Check if server is running

## 📊 Available Preferences

- `balanced` - 40% quality + 30% speed + 30% cost
- `quality` - Highest quality model
- `latency` - Fastest response time
- `cost` - Lowest cost
- `quality_latency` - Best quality + fast response
- `quality_cost` - Best quality + low cost
- `latency_cost` - Fast + low cost

## 📂 Project Structure

```
portKey/
├── server.js                    # Express server
├── domain_classifier_llm.js     # Domain classification
├── llm_model_router.js          # Model selection logic
├── metrics_loader_from_excel.js # Metrics loading
├── package.json
├── .env.example
├── .gitignore
└── public/
    └── index.html               # Frontend UI
```

## 🔐 Security Notes

- Never commit `.env` file (it's in `.gitignore`)
- API keys are stored as environment variables in production
- Always use HTTPS in production

## 📚 Domains Supported

1. Coding and Debugging
2. Reasoning
3. Advice
4. Summarization
5. Content Generation
6. General Q&A

## 🎯 Models Supported

- GPT-4o
- GPT-4o-mini
- Claude Opus 4.1
- Claude Opus 4.5
- Grok 4 Latest
- Grok 4 Fast Reasoning

## 📞 Support

For issues or questions, please open an issue on GitHub.

## 📄 License

MIT License

---

**Made with ❤️ using Node.js and Portkey AI**
