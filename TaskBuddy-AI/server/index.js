const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let todos = []; 


app.get('/api/todos', (req, res) => {
    res.json(todos);
});


app.post('/api/todos', (req, res) => {
    const { task } = req.body;
    todos.push({ task, id: Date.now() });
    res.json({ success: true });
});

app.delete('/api/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    todos = todos.filter(t => t.id !== id);
    res.json({ success: true });
});

app.post('/api/ask', async (req, res) => {
    const { question } = req.body;

    const prompt = `
You are a friendly and motivational productivity assistant named SmartBuddy.

Your job is to keep users focused, uplifted, and help them overcome laziness or distraction. 
Be short, casual, and kind — max 2–4 lines. Always respond in an encouraging and fun way.

Here is the user’s question:
"${question}"

Now reply with your best practical advice:
`;

    try {
        const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const payload = {
            contents: [
                {
                    parts: [{ text: prompt.trim() }]
                }
            ]
        };

        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
        res.json({ answer });

    } catch (err) {
        console.error("Gemini API Error:", err.message);
        res.status(500).json({ error: 'Something went wrong with Gemini AI' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
