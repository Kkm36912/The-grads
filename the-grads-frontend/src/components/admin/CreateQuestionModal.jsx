import React, { useState, useContext } from 'react';
import { X, Plus, Trash2, Code, Terminal, Save } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

export default function CreateQuestionModal({ isOpen, onClose, onSuccess }) {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic: 'Algorithms',
    difficulty: 'EASY',
    expReward: 10,
    examples: [{ input: '', output: '', explanation: '' }],
    testCases: [{ input: '', output: '', isHidden: false }],
    starterCode: { python: '', javascript: '', cpp: '', java: '' }
  });

  if (!isOpen) return null;

  // 🔥 THE MISSING FUNCTIONS THAT CAUSED THE WHITE SCREEN!
  const addExample = () => setFormData({ ...formData, examples: [...formData.examples, { input: '', output: '', explanation: '' }] });
  const removeExample = (index) => setFormData({ ...formData, examples: formData.examples.filter((_, i) => i !== index) });
  
  const addTestCase = () => setFormData({ ...formData, testCases: [...formData.testCases, { input: '', output: '', isHidden: false }] });
  const removeTestCase = (index) => setFormData({ ...formData, testCases: formData.testCases.filter((_, i) => i !== index) });

  const handleArrayChange = (e, index, field, arrayName) => {
    const newArray = [...formData[arrayName]];
    newArray[index][field] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [arrayName]: newArray });
  };

  const handleStarterCodeChange = (e, lang) => {
    setFormData({ ...formData, starterCode: { ...formData.starterCode, [lang]: e.target.value } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Sanitize empty inputs to prevent Backend Validation Errors
    const sanitizedExamples = formData.examples.filter(ex => ex.input.trim() !== '' && ex.output.trim() !== '');
    const sanitizedTestCases = formData.testCases.filter(tc => tc.input.trim() !== '' && tc.output.trim() !== '');

    if (sanitizedTestCases.length === 0) {
      alert("❌ Critical Error: You must provide at least one valid Test Case!");
      setLoading(false);
      return;
    }

    const finalData = {
      ...formData,
      examples: sanitizedExamples,
      testCases: sanitizedTestCases
    };

    try {
      await axios.post('https://the-grads.onrender.com/api/admin/questions', finalData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("✅ Challenge injected into the Arena successfully!");
      if (onSuccess) onSuccess(); 
      onClose();
    } catch (err) {
      console.error(err);
      alert("❌ Failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-[#03070b] overflow-hidden animate-in fade-in duration-200">
      <div className="w-full h-full flex flex-col">
        
        {/* Full-Screen Header */}
        <div className="flex justify-between items-center p-6 md:px-12 border-b border-slate-800 bg-slate-900 shrink-0 shadow-lg">
          <div className="flex items-center gap-4">
            <Terminal className="w-8 h-8 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Forge New Challenge</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 bg-slate-800 hover:bg-slate-700 rounded-xl">
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:px-32 custom-scrollbar">
          <form id="create-challenge-form" onSubmit={handleSubmit} className="space-y-12 max-w-6xl mx-auto">
            
            {/* 1. Core Info */}
            <div className="space-y-6">
              <h4 className="text-blue-400 font-bold uppercase text-base flex items-center gap-2"><Code className="w-5 h-5"/> Core Specifications</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Challenge Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-base focus:border-blue-500 outline-none transition-colors" placeholder="e.g., Anagram Validator" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Topic</label>
                    <select value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-base focus:border-blue-500 outline-none cursor-pointer">
                      <option value="Algorithms">Algorithms</option>
                      <option value="Data Structures">Data Structures</option>
                      <option value="Math">Math</option>
                      <option value="Strings">Strings</option>
                      <option value="Logic">Logic</option>
                      <option value="Arrays">Arrays</option>
                      <option value="Databases">Databases</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Difficulty</label>
                    <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-base focus:border-blue-500 outline-none cursor-pointer">
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">EXP Reward</label>
                    <input required type="number" value={formData.expReward} onChange={e => setFormData({...formData, expReward: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-base font-mono focus:border-blue-500 outline-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Mission Brief (Description)</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="5" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-base leading-relaxed focus:border-blue-500 outline-none resize-none" placeholder="Describe the algorithm requirements..." />
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* 2. UI Examples */}
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                 <h4 className="text-blue-400 font-bold uppercase text-base flex items-center gap-2">UI Examples (Visible to Students)</h4>
                 <button type="button" onClick={addExample} className="text-sm font-bold bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-500/30 transition-colors"><Plus className="w-4 h-4"/> ADD EXAMPLE</button>
               </div>
               {formData.examples.map((ex, idx) => (
                 <div key={idx} className="bg-slate-950 p-6 border border-slate-800 rounded-xl relative group space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Example Input</label>
                        <input required value={ex.input} onChange={e => handleArrayChange(e, idx, 'input', 'examples')} className="w-full bg-slate-900 text-white font-mono text-base p-3 rounded-lg outline-none border border-slate-700 focus:border-blue-500" placeholder='e.g., "anagram", "nagaram"' />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Example Output</label>
                        <input required value={ex.output} onChange={e => handleArrayChange(e, idx, 'output', 'examples')} className="w-full bg-slate-900 text-white font-mono text-base p-3 rounded-lg outline-none border border-slate-700 focus:border-blue-500" placeholder="e.g., true" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Explanation (Optional)</label>
                      <input value={ex.explanation} onChange={e => handleArrayChange(e, idx, 'explanation', 'examples')} className="w-full bg-slate-900 text-white text-sm p-3 rounded-lg outline-none border border-slate-700 focus:border-blue-500" placeholder="e.g., Because 'nagaram' is a rearrangement of 'anagram'." />
                    </div>
                    {formData.examples.length > 1 && (
                      <button type="button" onClick={() => removeExample(idx)} className="absolute top-4 right-4 text-red-500 hover:text-white bg-red-500/10 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                    )}
                 </div>
               ))}
            </div>

            <hr className="border-slate-800" />

            {/* 3. JDoodle Test Cases */}
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                 <h4 className="text-emerald-400 font-bold uppercase text-base flex items-center gap-2">Compiler Test Cases</h4>
                 <button type="button" onClick={addTestCase} className="text-sm font-bold bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-500/30 transition-colors"><Plus className="w-4 h-4"/> ADD TEST CASE</button>
               </div>
               {formData.testCases.map((tc, idx) => (
                 <div key={idx} className="flex flex-col md:flex-row gap-4 bg-slate-950 p-6 border border-slate-800 rounded-xl relative group">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Input Data</label>
                      <input required value={tc.input} onChange={e => handleArrayChange(e, idx, 'input', 'testCases')} className="w-full bg-slate-900 text-white font-mono text-base p-3 rounded-lg outline-none border border-slate-700 focus:border-emerald-500" placeholder="e.g.," />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Expected Output</label>
                      <input required value={tc.output} onChange={e => handleArrayChange(e, idx, 'output', 'testCases')} className="w-full bg-slate-900 text-white font-mono text-base p-3 rounded-lg outline-none border border-slate-700 focus:border-emerald-500" placeholder="e.g., 6" />
                    </div>
                    <div className="flex items-center gap-4 pt-6">
                      <label className="text-sm font-bold text-orange-400 flex items-center gap-2 cursor-pointer bg-orange-500/10 px-3 py-2 rounded-lg border border-orange-500/20 hover:bg-orange-500/20 transition-colors">
                        <input type="checkbox" checked={tc.isHidden} onChange={e => handleArrayChange(e, idx, 'isHidden', 'testCases')} className="accent-orange-500 w-4 h-4" /> HIDDEN TEST
                      </label>
                      {formData.testCases.length > 1 && (
                        <button type="button" onClick={() => removeTestCase(idx)} className="text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 p-2 rounded-lg transition-colors border border-red-500/20"><Trash2 className="w-5 h-5"/></button>
                      )}
                    </div>
                 </div>
               ))}
            </div>

            <hr className="border-slate-800" />

            {/* 4. Starter Code */}
            <div className="space-y-6">
              <h4 className="text-purple-400 font-bold uppercase text-base">Dynamic Starter Code</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['python', 'javascript', 'cpp', 'java'].map(lang => (
                  <div key={lang}>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">{lang === 'cpp' ? 'C++' : lang}</label>
                    <textarea value={formData.starterCode[lang]} onChange={e => handleStarterCodeChange(e, lang)} rows="4" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white font-mono text-sm focus:border-purple-500 outline-none leading-relaxed" placeholder={`// Starter code for ${lang}...`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Padding for scrolling */}
            <div className="h-12"></div>
          </form>
        </div>

        {/* Full-Screen Footer */}
        <div className="p-6 md:px-12 border-t border-slate-800 bg-slate-900 shrink-0 flex justify-end gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <button onClick={onClose} className="px-8 py-3 text-slate-400 hover:text-white text-base font-bold transition-colors rounded-xl hover:bg-slate-800">Abort Mission</button>
          <button form="create-challenge-form" type="submit" disabled={loading} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-base font-bold rounded-xl transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] disabled:opacity-50">
            {loading ? 'Forging...' : <><Save className="w-5 h-5"/> Deploy to Arena</>}
          </button>
        </div>

      </div>
    </div>
  );
}