'use client';
import { useState } from 'react';
import axios from 'axios';
import  {Button}  from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function AIBox() {
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState('');

    const askAI = async () => {
        const res = await axios.post('http://localhost:5000/api/ask', {
            question,
        });
        setResponse(res.data.answer);
    };

    return (
        <div className="mt-10">
            <Textarea
                placeholder="Ask SmartBuddy a productivity question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="text-white bg-white/5 border border-white/20 backdrop-blur-sm"
            />
            <Button className="mt-2" onClick={askAI}>
                Ask Gemini
            </Button>
            {response && (
                <div className="mt-4 p-4 bg-white/10 rounded-md border border-white/20 text-white">
                    {response}
                </div>
            )}
        </div>
    );
}
