import React from 'react';
import { HelpCircle, BrainCircuit, ScanLine, Globe, Award, DatabaseZap, Sparkles, Coins, ArrowRight, Zap, Network } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Info() {
  const agents = [
    { 
      icon: ScanLine, color: "text-sky-500", bg: "bg-sky-50", border: "border-sky-200", 
      name: "Agent 1: YOLO ML", 
      desc: "Spatial Recognition Specialist. Executes real-time object detection to extract bounding boxes and isolate the banknote from complex backgrounds with ultra-low latency.", 
      power: "85%" 
    },
    { 
      icon: BrainCircuit, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-200", 
      name: "Agent 2: Gemini LLM", 
      desc: "Vision-Language Expert. Leverages multimodal capabilities to analyze micro-patterns, security threads, and contextual semantics for denomination verification.", 
      power: "92%" 
    },
    { 
      icon: Globe, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200", 
      name: "Agent 3: Lens Engine", 
      desc: "Global Cross-Reference Node. Queries international currency knowledge graphs to prevent false positives against visually similar foreign fiat currencies.", 
      power: "90%" 
    },
  ];

  const steps = [
    { icon: DatabaseZap, title: "1. Data Ingestion", text: "Secure REST API endpoint receives the high-resolution image payload and normalizes the visual data structure." },
    { icon: Sparkles, title: "2. Parallel Processing", text: "The task is dispatched concurrently to the YOLO, Gemini, and Lens nodes. They process the image in isolated execution environments." },
    { icon: Network, title: "3. Neural Consensus", text: "The Aggregator (Chief Judge) receives independent confidence scores and applies a conflict-resolution matrix to determine the absolute truth." },
    { icon: Coins, title: "4. Token Settlement", text: "Upon successful classification, the smart ledger deducts exactly 1 processing token and returns the finalized JSON output." },
  ];

  return (
    <div className="max-w-6xl mx-auto font-sans space-y-16 py-12 px-4 sm:px-6 lg:px-8 text-slate-800 antialiased overflow-hidden relative">
      
      {/* 🔮 Background Decorative Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400 rounded-full blur-[120px] opacity-10 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-40 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-10 animate-pulse duration-[6000ms] pointer-events-none"></div>

      {/* 🚀 HERO SECTION */}
      <section className="text-center space-y-6 relative z-10 animate-[fadeInUp_0.8s_ease-out]">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-bold shadow-sm">
          <HelpCircle className="w-4 h-4" />
          <span>System Architecture v1.0</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
          Powered by <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#009688] to-blue-600">
            Multi-Agent AI Intelligence
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          The NTTG_BCKH system implements a state-of-the-art Multi-Agent architecture, bridging the gap between Computer Vision and Large Language Models to deliver unprecedented accuracy in global currency recognition.
        </p>
      </section>

      {/* 🤖 THE AGENT CLUSTER */}
      <section className="relative z-10 space-y-10 pt-8">
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left justify-center md:justify-start">
          <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
            <BrainCircuit className="w-8 h-8 text-slate-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">The Neural Consensus Cluster</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {agents.map((agent, index) => (
            <div key={index} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 group flex flex-col relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 ${agent.bg} rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110`}></div>
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className={`w-14 h-14 ${agent.bg} ${agent.color} ${agent.border} rounded-2xl flex items-center justify-center border shadow-sm`}>
                  <agent.icon className="w-7 h-7" />
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-black ${agent.color}`}>{agent.power}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Base Accuracy</div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight relative z-10">{agent.name}</h3>
              <p className="text-slate-600 text-sm leading-relaxed flex-1 relative z-10">{agent.desc}</p>
              
              <div className="w-full h-px bg-slate-100 my-5 relative z-10"></div>
              <div className={`text-xs font-mono font-semibold ${agent.color} bg-slate-50 p-2.5 rounded-lg border border-slate-100 relative z-10`}>
                // Status: Operational / Node_{index+1}
              </div>
            </div>
          ))}
        </div>

        {/* 🏆 AGGREGATOR AGENT (CHIEF JUDGE) */}
        <div className="bg-slate-900 p-8 md:p-10 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden group transform transition-all duration-300 hover:border-teal-700">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-900/40 via-slate-900 to-slate-900 opacity-80 z-0"></div>
          <div className="relative z-10 grid md:grid-cols-[1fr,auto] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 text-xs font-bold uppercase tracking-wider mb-4">
                <Award className="w-4 h-4" /> The Chief Arbitrator
              </div>
              <h3 className="text-3xl font-extrabold text-white tracking-tight mb-3">Aggregator Agent & Logic</h3>
              <p className="text-slate-300 text-sm md:text-base max-w-3xl leading-relaxed">
                Functioning as the ultimate decision-maker, this structural agent does not analyze the image directly. Instead, it evaluates the weight matrices and confidence thresholds returned by the subordinate cluster. By applying strict conflict-resolution protocols, it guarantees absolute classification accuracy even when individual models encounter noise or adversarial inputs.
              </p>
            </div>
            <Award className="w-24 h-24 text-amber-500/20 group-hover:scale-110 transition-transform duration-500 hidden md:block" />
          </div>
        </div>
      </section>

      {/* ⚙️ THE PIPELINE */}
      <section className="relative z-10 space-y-12 pt-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Execution Pipeline</h2>
          <p className="text-slate-600">From raw pixel ingestion to validated financial data in seconds.</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 top-4 bottom-4 w-1 bg-slate-100 rounded-full"></div>
          
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className={`flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''} group relative`}>
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-teal-500 rounded-full border-4 border-white shadow-sm z-10 hidden md:block"></div>
                
                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'} pl-16 md:pl-0`}>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group-hover:shadow-md group-hover:border-teal-300 transition-all duration-300 relative">
                    <div className={`absolute top-6 ${index % 2 === 0 ? '-right-3' : '-left-3'} w-6 h-6 bg-white border-t border-r border-slate-200 transform ${index % 2 === 0 ? 'rotate-45 border-b-0 border-l-0' : '-rotate-[135deg] border-b-0 border-l-0'} hidden md:block group-hover:border-teal-300 transition-colors`}></div>
                    <div className="flex items-center gap-3 mb-3 md:hidden">
                       <step.icon className="w-5 h-5 text-teal-600" />
                       <h4 className="text-lg font-bold text-slate-900">{step.title}</h4>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2 hidden md:block flex items-center gap-2 justify-end">
                      {index % 2 !== 0 && <step.icon className="w-5 h-5 text-teal-600 inline mr-2" />}
                      {step.title}
                      {index % 2 === 0 && <step.icon className="w-5 h-5 text-teal-600 inline ml-2" />}
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{step.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🎯 CALL TO ACTION */}
      <section className="relative z-10 text-center py-16 bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden mt-16 group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/80 to-transparent z-0"></div>
        
        <div className="relative z-10 space-y-6 px-4">
          <Zap className="w-12 h-12 text-teal-400 mx-auto animate-pulse" />
          <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Ready to Deploy the Agents?</h3>
          <p className="text-slate-300 text-base max-w-2xl mx-auto">
            Experience the precision of ensemble machine learning. Upload a banknote image and watch the consensus protocol in action.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
            <Link to="/directory" className="flex items-center justify-center gap-2 bg-slate-800 text-white border border-slate-700 px-8 py-3.5 rounded-xl font-bold hover:bg-slate-700 transition active:scale-95 text-sm">
              Explore Database
            </Link>
            <Link to="/recognize" className="flex items-center justify-center gap-2 bg-[#009688] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-teal-700 transition active:scale-95 text-sm shadow-lg shadow-teal-900/50">
              <ScanLine className="w-5 h-5" /> Initialize Scanner
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}