import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function Feedback() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Chỗ này gọi API feedbackService.submit(...)
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <CheckCircle2 className="w-16 h-16 text-teal-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank you!</h2>
        <p className="text-slate-500">Your feedback helps us improve the AI models.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-12">
      <div className="text-center mb-10">
        <MessageSquare className="w-12 h-12 text-teal-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-slate-900">Send Feedback</h2>
        <p className="text-slate-500 mt-2">Report a wrong recognition result or suggest an improvement.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Feedback Type</label>
          <select className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500">
            <option value="wrong_result">AI Recognized Wrong Currency</option>
            <option value="system_error">System/App Error</option>
            <option value="suggestion">Feature Suggestion</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
          <textarea 
            rows="4" 
            required
            className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            placeholder="Please describe the issue in detail..."
          ></textarea>
        </div>

        <button type="submit" className="w-full flex justify-center items-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">
          <Send className="w-4 h-4" /> Submit Feedback
        </button>
      </form>
    </div>
  );
}