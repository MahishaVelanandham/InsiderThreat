// services/pythonAiClient.js
// Calls the Python Isolation Forest AI microservice at http://127.0.0.1:5001/analyze
// If Python service is not running, returns { isPythonAiConnected: false } so the
// caller can fall back to the JS engine automatically.

const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://127.0.0.1:5001';

const analyzeBehaviorWithPythonAi = async (payload) => {
  try {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(`${PYTHON_AI_URL}/analyze`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
      signal:  controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();

    if (json.success && json.data) {
      return { isPythonAiConnected: true, data: json.data };
    }
    throw new Error('Unexpected response shape from Python service');

  } catch (err) {
    console.warn(`[pythonAiClient] Python AI service not reachable (${err.message}) — using JS fallback.`);
    return { isPythonAiConnected: false, data: null };
  }
};

module.exports = { analyzeBehaviorWithPythonAi };
