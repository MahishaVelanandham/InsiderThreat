// controllers/authController.js — Demo login, no real auth needed for prototype
const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required.' });
  return res.status(200).json({
    success: true,
    token: 'demo-soc-token-2026',
    user: { id: 'ANALYST-01', name: 'Analyst Security Admin', email, role: 'SOC Senior Security Analyst' }
  });
};
module.exports = { login };
