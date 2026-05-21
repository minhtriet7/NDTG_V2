import React from 'react';
import { BookOpen, Camera, ShieldCheck, Coins } from 'lucide-react';

export default function UserGuide() {
  return (
    <div className="max-w-3xl mx-auto font-sans space-y-8 py-6">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900">User Handbook</h2>
        <p className="text-slate-500 mt-1">Learn how to maximize the efficiency of the Multi-Agent grading pipeline.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4">
          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0 font-bold">1</div>
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">Upload High-Resolution Imagery</h4>
            <p className="text-slate-500 text-sm">Ensure the banknote lies flat on a high-contrast background without dark overhead casting shadows. OpenCV contours work best with uniform lighting parameters.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4">
          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0 font-bold">2</div>
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">Execution and Token Mechanics</h4>
            <p className="text-slate-500 text-sm">Initiating a scan consumes exactly 1 system token. All three specialized validation architectures (YOLO, Gemini LLM, Lens Engine) process in concurrent execution clusters.</p>
          </div>
        </div>
      </div>
    </div>
  );
}