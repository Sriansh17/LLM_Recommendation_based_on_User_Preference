import express from 'express';
import bodyParser from 'body-parser';
import { handleRequest } from './llm_model_router.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Middleware for logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Input validation middleware
function validateInput(req, res, next) {
  const { prompt, preference } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({
      error: 'Prompt is required and must be a string'
    });
  }

  if (prompt.trim().length < 5) {
    return res.status(400).json({
      error: 'Prompt must be at least 5 characters long'
    });
  }

  if (!preference || typeof preference !== 'string') {
    return res.status(400).json({
      error: 'Preference is required and must be a string'
    });
  }

  const validPreferences = ['balanced', 'quality', 'latency', 'cost', 'quality_latency', 'quality_cost', 'latency_cost'];
  if (!validPreferences.includes(preference)) {
    return res.status(400).json({
      error: `Invalid preference. Must be one of: ${validPreferences.join(', ')}`
    });
  }

  next();
}

app.post('/suggest-model', validateInput, async (req, res) => {
  try {
    const { prompt, preference } = req.body;
    console.log(`📊 Processing request - Prompt: "${prompt.substring(0, 50)}...", Preference: ${preference}`);

    const result = await handleRequest(prompt, preference);
    
    console.log(`✅ Successfully selected model: ${result.selected_model}`);
    res.json(result);

  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Failed to suggest model';
    
    res.status(statusCode).json({
      error: message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📝 Logging enabled`);
  console.log(`✅ Ready to process requests`);
});
