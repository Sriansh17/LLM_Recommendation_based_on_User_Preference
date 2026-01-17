# 📚 LLM Model Selector - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Installation & Setup](#installation--setup)
5. [Configuration](#configuration)
6. [How It Works](#how-it-works)
7. [API Documentation](#api-documentation)
8. [Frontend Usage](#frontend-usage)
9. [Deployment Guide](#deployment-guide)
10. [Troubleshooting](#troubleshooting)
11. [Contributing](#contributing)

---

## Project Overview

**LLM Model Selector** is an intelligent tool that helps users choose the best Large Language Model (LLM) for their needs based on real-world performance metrics.

### Problem Solved
- Users struggle to choose between different LLM models
- Different models excel at different tasks
- Trade-offs exist between quality, speed, and cost
- Manual comparison is time-consuming

### Solution
An AI-powered recommendation system that:
1. **Classifies** user queries into domains
2. **Analyzes** performance metrics for each model
3. **Recommends** the best model based on user preferences
4. **Provides** detailed explanations and comparisons

### Key Statistics
- **6 Supported Models**: GPT-4o, GPT-4o-mini, Claude Opus 4.1, Claude Opus 4.5, Grok 4 Latest, Grok 4 Fast Reasoning
- **6 Domain Categories**: Coding, Reasoning, Advice, Summarization, Content Generation, General Q&A
- **7 Preference Options**: Balanced, Quality, Speed, Cost, and 3 combinations
- **3 Key Metrics**: Quality Score, Response Time, Cost per Request

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                     USER BROWSER                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Frontend (index.html)                    │ │
│  │  • Beautiful UI with input form                    │ │
│  │  • Request history tracking                        │ │
│  │  • Results display with metrics                    │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ POST /suggest-model
                       ↓
┌─────────────────────────────────────────────────────────┐
│                  EXPRESS SERVER                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  server.js (Port 3000/Environment)                │ │
│  │  • Request validation & logging                   │ │
│  │  • Error handling                                 │ │
│  │  • Route management                              │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Domain     │ │   Router     │ │   Metrics    │
│ Classifier   │ │  (Model      │ │   Loader     │
│ (Portkey AI) │ │  Selection)  │ │  (Excel)     │
└──────────────┘ └──────────────┘ └──────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       ↓
            Recommended Model + Explanation
```

### Component Breakdown

#### 1. **Frontend (index.html)**
- Pure HTML5, CSS3, and Vanilla JavaScript
- No external dependencies
- Responsive design for mobile/desktop
- Features: Input validation, loading states, history tracking

#### 2. **Backend (server.js)**
- Express.js web server
- Input validation middleware
- Error handling & logging
- Serves static files from `/public`

#### 3. **Domain Classifier (domain_classifier_llm.js)**
- Uses Portkey AI API with GPT-4o-mini
- Classifies user input into 6 domains
- Fallback to "General Q&A" on error
- Logging for debugging

#### 4. **Model Router (llm_model_router.js)**
- Core logic for model selection
- 7 different ranking algorithms
- Comparison with runner-up model
- Detailed explanation generation

#### 5. **Metrics Loader (metrics_loader_from_excel.js)**
- Reads performance data from Excel
- 5-minute caching for performance
- Averages metrics across samples
- Error handling for missing data

---

## Features

### ✨ User-Facing Features

#### 1. **Smart Domain Classification**
```
User Input: "How do I fix a memory leak in Node.js?"
            ↓
         GPT-4o-mini
            ↓
Result: "Coding and Debugging" domain
```

#### 2. **Multi-Model Comparison**
- Evaluates 6 different LLM models in parallel
- Compares on 3 metrics: Quality, Speed, Cost
- Shows runner-up model for reference

#### 3. **Flexible Preferences**
- **Balanced**: 40% Quality + 30% Speed + 30% Cost
- **Quality**: Pure quality ranking
- **Latency**: Pure speed ranking
- **Cost**: Pure cost ranking
- **Quality+Latency**: Best quality that's also fast
- **Quality+Cost**: Best quality that's also cheap
- **Latency+Cost**: Fastest that's also cheap

#### 4. **Request History**
- Displays last 10 requests
- Shows timestamp for each
- Helps users see patterns

#### 5. **Copy to Clipboard**
- One-click copy button
- Useful for sharing recommendations

#### 6. **Detailed Metrics**
- Quality score (0-10)
- Response time (milliseconds)
- Cost per request (USD)

### 🔧 Technical Features

#### 1. **Error Handling**
- Input validation (min 5 characters)
- Preference validation
- API error handling
- User-friendly error messages

#### 2. **Performance**
- 5-minute metrics caching
- Fast Excel loading
- Optimized sorting algorithms
- Responsive UI with loading states

#### 3. **Security**
- API keys in environment variables
- No credentials in code
- Input sanitization
- HTTPS ready

#### 4. **Logging**
- Request tracking with timestamps
- Duration monitoring
- Error logging with stack traces
- Console emojis for visibility

---

## Installation & Setup

### Prerequisites
- Node.js v16+ (v18+ recommended)
- npm or yarn
- Portkey API key
- Excel file: `combined_all_domains.xlsx`

### Step-by-Step Setup

#### 1. Clone Repository
```bash
git clone https://github.com/Sriansh17/LLM_Recommendation_based_on_User_Preference.git
cd portKey
```

#### 2. Install Dependencies
```bash
npm install
```

This installs:
- `express` (web framework)
- `body-parser` (JSON parsing)
- `portkey-ai` (LLM API)
- `xlsx` (Excel reading)

#### 3. Create Environment File
```bash
cp .env.example .env
```

#### 4. Add Your API Key
```bash
# Edit .env file
PORTKEY_API_KEY=your_api_key_here
PORT=3000
NODE_ENV=development
```

#### 5. Add Excel Metrics File
Place `combined_all_domains.xlsx` in project root:
```
portKey/
├── combined_all_domains.xlsx
├── server.js
└── ...
```

#### 6. Run Locally
```bash
npm start
```

Output:
```
🚀 Server running at http://localhost:3000
📝 Logging enabled
✅ Ready to process requests
```

#### 7. Open in Browser
```
http://localhost:3000
```

---

## Configuration

### Environment Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `PORTKEY_API_KEY` | String | Required | Your Portkey API key for LLM access |
| `PORT` | Number | 3000 | Server port |
| `NODE_ENV` | String | development | Environment (development/production) |

### Excel File Format

The `combined_all_domains.xlsx` should have columns:

| Column | Example | Type |
|--------|---------|------|
| domain | "Coding and Debugging" | String |
| model_1_quality_score | 9.2 | Number (0-10) |
| model_1_latency | 450 | Number (milliseconds) |
| model_1_cost | 0.0025 | Number (USD) |
| model_2_quality_score | 8.5 | Number |
| model_2_latency | 350 | Number |
| model_2_cost | 0.001 | Number |
| ... | ... | ... |

Repeat for models 2-6.

### Model Mapping

```javascript
{
  model_1: 'gpt-4o',
  model_2: 'gpt-4o-mini',
  model_3: 'claude-opus-4-1',
  model_4: 'claude-opus-4-5',
  model_5: 'grok-4-latest',
  model_6: 'grok-4-fast-reasoning'
}
```

---

## How It Works

### Step-by-Step Flow

#### Step 1: User Submits Request
```javascript
{
  prompt: "How do I optimize database queries?",
  preference: "balanced"
}
```

#### Step 2: Input Validation
```
✓ Prompt exists
✓ Prompt is at least 5 characters
✓ Preference is valid (balanced, quality, latency, cost, etc.)
```

#### Step 3: Domain Classification
```
User Prompt: "How do I optimize database queries?"
              ↓
    Portkey API (GPT-4o-mini)
              ↓
Classified As: "Coding and Debugging"
```

#### Step 4: Load Metrics
```
Domain: "Coding and Debugging"
              ↓
Read Excel File (or use 5-min cache)
              ↓
Extract metrics for all 6 models
              ↓
Models loaded successfully (6 models)
```

#### Step 5: Model Ranking
```
Preference: "balanced"
              ↓
Apply algorithm: 40% Quality + 30% Speed + 30% Cost
              ↓
Sort models by score
              ↓
Best Model: gpt-4o (score: 8.6)
Runner-up:  claude-opus-4-5 (score: 8.2)
```

#### Step 6: Generate Explanation
```
Quality Delta:  9.2 - 8.9 = +0.3 points
Cost Delta:     (0.003 - 0.0025) / 0.003 * 100 = 16.7% cheaper
Speed Delta:    (500 - 480) / 500 * 100 = 4% faster
```

#### Step 7: Return Results
```json
{
  "domain": "Coding and Debugging",
  "selected_model": "gpt-4o",
  "metrics": {
    "quality": 9.2,
    "responseTime": 480,
    "cost": 0.0025
  },
  "comparison": {
    "name": "claude-opus-4-5",
    "qualityDiff": 0.3,
    "costDiff": 16.7,
    "speedDiff": 4
  },
  "explanation": {
    "quality": "Quality increased by 0.30",
    "cost": "Cost decreased by 16.67%",
    "response_time": "Response time improved by 4.00%"
  }
}
```

#### Step 8: Display Results
```
✅ Suggested Model
Domain: Coding and Debugging
Model: gpt-4o
Quality Score: 9.20/10
Response Time: 480ms
Cost per Request: $0.0025

Why this model?
✓ Quality increased by 0.30
✓ Cost decreased by 16.67%
✓ Response time improved by 4.00%

Compared to runner-up: claude-opus-4-5
```

---

## API Documentation

### POST `/suggest-model`

Analyzes a user prompt and recommends the best LLM model.

#### Request
```bash
curl -X POST https://llm-model-selector.onrender.com/suggest-model \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "How do I implement OAuth 2.0?",
    "preference": "quality"
  }'
```

#### Request Body
```json
{
  "prompt": "string (required, min 5 chars)",
  "preference": "string (required, enum)"
}
```

**Valid Preferences:**
- `balanced` - Balanced across quality, speed, cost
- `quality` - Highest quality only
- `latency` - Fastest response only
- `cost` - Lowest cost only
- `quality_latency` - Quality + Speed
- `quality_cost` - Quality + Cost
- `latency_cost` - Speed + Cost

#### Response (200 OK)
```json
{
  "domain": "Coding and Debugging",
  "selected_model": "gpt-4o",
  "metrics": {
    "quality": 9.2,
    "responseTime": 450,
    "cost": 0.0025
  },
  "comparison": {
    "name": "claude-opus-4-5",
    "qualityDiff": 0.5,
    "costDiff": 15.2,
    "speedDiff": 10.5
  },
  "explanation": {
    "quality": "Quality increased by 0.50",
    "cost": "Cost decreased by 15.20%",
    "response_time": "Response time improved by 10.50%"
  },
  "response": {
    "model": "gpt-4o",
    "output": "Response from gpt-4o for: How do I implement OAuth 2.0?"
  }
}
```

#### Error Responses

**400 Bad Request** - Invalid input
```json
{
  "error": "Prompt must be at least 5 characters long"
}
```

**400 Bad Request** - Invalid preference
```json
{
  "error": "Invalid preference. Must be one of: balanced, quality, latency, cost, quality_latency, quality_cost, latency_cost"
}
```

**500 Internal Server Error** - Server error
```json
{
  "error": "Failed to suggest model",
  "timestamp": "2026-01-18T12:34:56.789Z"
}
```

### GET `/health`

Health check endpoint for monitoring.

#### Request
```bash
curl https://llm-model-selector.onrender.com/health
```

#### Response (200 OK)
```json
{
  "status": "healthy",
  "timestamp": "2026-01-18T12:34:56.789Z"
}
```

---

## Frontend Usage

### Using the Web Interface

#### Step 1: Enter Your Prompt
```
Input Field: "What's the best way to handle errors in Python?"
```

#### Step 2: Select Your Preference
```
Dropdown Options:
⚖️ Balanced (default)
⭐ High Quality
⚡ Fast Response
💰 Low Cost
⭐⚡ High Quality + Fast
⭐💰 High Quality + Low Cost
⚡💰 Fast + Low Cost
```

#### Step 3: Submit
```
Click: "Suggest Model" button
or
Press: Enter key
```

#### Step 4: View Results
```
✅ Suggested Model
Domain: Coding and Debugging
Model: gpt-4o
Quality Score: 9.20/10
Response Time: 480ms
Cost per Request: $0.0025

Why this model?
✓ Quality increased by 0.30
✓ Cost decreased by 16.67%
✓ Response time improved by 4.00%
```

#### Step 5: Copy or View History
```
📋 Copy Result: Copy to clipboard
📜 Recent Suggestions: View last 10 requests
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Submit prompt |
| `Shift + Enter` | New line in textarea |

---

## Deployment Guide

### Option 1: Render (Recommended)

#### Prerequisites
- GitHub account with code pushed
- Render account

#### Steps

1. **Visit Render.com**
   - Go to https://render.com
   - Sign up or log in with GitHub

2. **Create New Web Service**
   - Click "New +"
   - Select "Web Service"
   - Select your GitHub repository

3. **Configure Deployment**
   ```
   Name: llm-model-selector
   Environment: Node
   Region: Any (closest to users)
   Build Command: npm install
   Start Command: node server.js
   ```

4. **Add Environment Variables**
   - Click "Advanced"
   - Add variable:
     - Key: `PORTKEY_API_KEY`
     - Value: Your API key
   - Add variable:
     - Key: `NODE_ENV`
     - Value: `production`

5. **Upload Excel File**
   - Ensure `combined_all_domains.xlsx` is in repo root
   - Commit and push to GitHub

6. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Live at: `https://llm-model-selector.onrender.com`

### Option 2: Railway

#### Steps

1. **Visit Railway.app**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository

3. **Add Environment Variables**
   - Click on project
   - Go to "Variables"
   - Add `PORTKEY_API_KEY`
   - Add `NODE_ENV=production`

4. **Deploy**
   - Railway auto-deploys on push
   - View logs in dashboard

### Option 3: Vercel

#### Steps

1. **Visit Vercel.com**
   - Go to https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Import Project"
   - Select GitHub repository

3. **Configure**
   - Environment: Node.js
   - Add environment variables:
     - `PORTKEY_API_KEY`
     - `NODE_ENV=production`

4. **Deploy**
   - Click "Deploy"
   - Live in seconds

---

## Troubleshooting

### Issue: "Port already in use"
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### Issue: "API Key not found"
```bash
# Verify .env file exists
cat .env

# Verify PORTKEY_API_KEY is set
echo $PORTKEY_API_KEY

# If not set:
export PORTKEY_API_KEY=your_key
npm start
```

### Issue: "Excel file not found"
```bash
# Check if file exists in root
ls combined_all_domains.xlsx

# If missing, add it to project root
cp /path/to/combined_all_domains.xlsx .
```

### Issue: "Domain classification fails"
```
Error: classifyDomainLLM failed

Causes:
1. Invalid API key
2. Portkey API down
3. Network issue

Solution:
- Check API key in .env
- Check internet connection
- See console logs for details
```

### Issue: "No metrics found for domain"
```
Error: No metrics found for domain: Custom Domain

Causes:
1. Domain not in Excel file
2. Excel file missing data
3. Typo in domain name

Solution:
- Verify Excel has the domain
- Check domain name spelling
- Use "General Q&A" as fallback
```

### Issue: "Render app keeps restarting"
```
Check:
1. Check Render logs
2. Verify environment variables set
3. Check Excel file uploaded
4. Verify node_modules installed

Solution:
- Fix errors in logs
- Re-deploy with correct config
- Check for memory issues
```

### Debug Mode

Enable detailed logging:

```bash
# Local
DEBUG=* npm start

# In production Render logs:
# Check "Logs" tab in Render dashboard
```

Check server logs:
```bash
# View request logs
npm start

# Output shows:
# [timestamp] POST /suggest-model - 200 (123ms)
# 🔍 Classifying domain for: "..."
# ✅ Classified as: "Coding and Debugging"
# 📂 Loading metrics from Excel...
```

---

## Contributing

### Reporting Issues

1. Check if issue already exists
2. Provide:
   - Error message
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment info (Node version, OS, etc.)

### Suggesting Features

1. Check GitHub issues first
2. Describe the feature
3. Explain the use case
4. Provide examples

### Code Contributions

1. Fork repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes
4. Test locally: `npm start`
5. Commit: `git commit -m "Add my feature"`
6. Push: `git push origin feature/my-feature`
7. Create Pull Request

### Code Style

- Use `const`/`let` not `var`
- Use arrow functions when appropriate
- Add comments for complex logic
- Follow existing patterns
- Use meaningful variable names

### Testing

Test changes locally:
```bash
# Install dependencies
npm install

# Run server
npm start

# Test endpoints
curl -X POST http://localhost:3000/suggest-model \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test query","preference":"balanced"}'
```

---

## Project Structure

```
portKey/
├── server.js                         # Main Express server
├── domain_classifier_llm.js          # Domain classification logic
├── llm_model_router.js               # Model selection algorithm
├── metrics_loader_from_excel.js      # Excel metrics loader
├── package.json                      # Dependencies & scripts
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
├── README.md                         # Quick start guide
├── DOCUMENTATION.md                  # This file
│
├── public/
│   └── index.html                    # Frontend UI
│
├── combined_all_domains.xlsx         # Model metrics (add this)
│
└── logs.jsonl                        # Log file (optional)
```

---

## FAQ

**Q: Can I add more models?**
A: Yes! Update `MODEL_NAME_MAP` in `metrics_loader_from_excel.js` and add columns to Excel.

**Q: Can I add more domains?**
A: Yes! Update `ALLOWED_DOMAINS` in `domain_classifier_llm.js` and add data to Excel.

**Q: How often is metrics cache refreshed?**
A: Every 5 minutes (configured in `metrics_loader_from_excel.js`).

**Q: Is my data private?**
A: User prompts are sent to Portkey API for classification. Check Portkey's privacy policy.

**Q: Can I use this offline?**
A: Partially. Frontend works offline, but domain classification requires internet.

**Q: What if API key expires?**
A: Update `.env` and redeploy (or set new environment variable in Render).

**Q: How do I monitor usage?**
A: Check Render dashboard logs or add monitoring service.

---

## Performance Metrics

### Response Time
- Classification: ~500ms (Portkey API)
- Metrics loading: <50ms (with cache)
- Model selection: <10ms (sorting)
- **Total: ~600ms average**

### Resource Usage
- Memory: ~50MB (Node.js + cache)
- Disk: 1MB (code) + 2MB (Excel file)
- CPU: Minimal (event-driven)

### Scalability
- Can handle 100+ concurrent requests
- Auto-scaling on Render/Railway
- 5-minute cache reduces database hits

---

## License

MIT License - See LICENSE file

---

## Support & Contact

- **Issues**: GitHub Issues
- **Email**: contact@example.com
- **Documentation**: This file
- **Live Demo**: https://llm-model-selector.onrender.com

---

**Last Updated**: January 18, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
