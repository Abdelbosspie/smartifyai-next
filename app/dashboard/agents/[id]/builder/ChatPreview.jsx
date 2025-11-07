'use client';
import { useEffect, useRef, useState } from 'react';

export default function ChatPreview({ agentId, agentName }) {
  const [msgs, setMsgs] = useState([
    { role: 'system', content: `You're chatting with ${agentName}.` },
  ]);
  const [input, setInput] = useState('');
  const boxRef = useRef(null);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs]);

  async function send() {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMsgs((m) => [...m, userMsg]);
    setInput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, agentId }),
      });
      const data = await res.json();
      setMsgs((m) => [...m, { role: 'assistant', content: data?.reply ?? '…' }]);
    } catch {
      setMsgs((m) => [...m, { role: 'assistant', content: 'Sorry — I could not reply.' }]);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={boxRef} className="flex-1 space-y-3 overflow-auto p-4">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`max-w-[75%] rounded-md px-3 py-2 text-sm ${
              m.role === 'user'
                ? 'ml-auto bg-indigo-600 text-white'
                : m.role === 'assistant'
                ? 'bg-gray-100'
                : 'text-gray-500'
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={`Message ${agentName}…`}
          className="flex-1 rounded-md border px-3 py-2 outline-none"
        />
        <button
          onClick={send}
          className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
        >
          Send
        </button>
      </div>
    </div>
  );
}