import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export const BaselProblem: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [terms, setTerms] = useState(0);
  const [sum, setSum] = useState(0);
  const [speed, setSpeed] = useState(1);

  // Calculate specific target for visualization scaling
  const PI_SQUARED_OVER_6 = Math.PI * Math.PI / 6;

  useEffect(() => {
    let intervalId: number;

    if (isRunning) {
      intervalId = window.setInterval(() => {
        setTerms(prevTerms => {
          const newTerms = prevTerms + speed;

          // Calculate the sum incrementally to avoid O(n) recalculation every frame,
          // but for large 'speed' jumps, we might need a small loop.
          setSum(prevSum => {
            let currentSum = prevSum;
            for(let i = prevTerms + 1; i <= newTerms; i++) {
              currentSum += 1 / (i * i);
            }
            return currentSum;
          });

          return newTerms;
        });
      }, 50);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, speed]);

  const reset = () => {
    setIsRunning(false);
    setTerms(0);
    setSum(0);
  };

  const estimatedPi = terms > 0 ? Math.sqrt(sum * 6) : 0;
  const error = Math.abs(Math.PI - estimatedPi);

  // For visualization: we'll show the first few blocks filling up a space of size Pi^2 / 6
  // To keep it clean, we'll only visualize the first ~100 terms individually,
  // and aggregate the rest into a single "remaining" block, or just show a graph.
  // We will do a stacked bar or area filling visualization.

  const maxVisualTerms = 50;
  const visualBlocks = [];
  let cumulative = 0;

  for(let i = 1; i <= Math.min(terms, maxVisualTerms); i++) {
    const val = 1 / (i * i);
    visualBlocks.push({
      term: i,
      value: val,
      cumulative: cumulative + val,
      heightPercent: (val / PI_SQUARED_OVER_6) * 100
    });
    cumulative += val;
  }

  // The rest of the sum if terms > maxVisualTerms
  const remainingSum = terms > maxVisualTerms ? sum - cumulative : 0;

  return (
    <div className="flex flex-col lg:flex-row h-full p-6 gap-6">
      <div className="flex-1 flex flex-col items-center">

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4 w-full h-[400px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider text-center">Convergence of Σ(1/n²) to π²/6</h3>

          <div className="flex-1 relative border-l-2 border-b-2 border-slate-300 mx-4 mb-6 mt-2">
            {/* Target line */}
            <div className="absolute w-full border-t border-dashed border-emerald-500 z-10" style={{ bottom: '100%' }}>
              <span className="absolute -top-6 right-0 text-xs font-bold text-emerald-600">π²/6 ≈ 1.64493</span>
            </div>

            <div className="absolute inset-0 flex items-end">
              {/* Stacked visualization of blocks */}
              <div className="w-full flex flex-col-reverse h-full" style={{ height: `${(sum / PI_SQUARED_OVER_6) * 100}%` }}>

                 {/* Remaining terms aggregated block */}
                 {terms > maxVisualTerms && (
                   <div
                     className="w-full bg-indigo-300 transition-all duration-300 opacity-80"
                     style={{ height: `${(remainingSum / sum) * 100}%` }}
                     title={`Terms ${maxVisualTerms + 1} to ${terms}`}
                   />
                 )}

                 {/* Individual terms */}
                 {[...visualBlocks].reverse().map(block => (
                   <div
                     key={block.term}
                     className={`w-full border-b border-white/20 transition-all duration-300 ${block.term % 2 === 0 ? 'bg-indigo-500' : 'bg-indigo-600'}`}
                     style={{ height: `${(block.value / sum) * 100}%` }}
                     title={`n=${block.term}: 1/${block.term}² ≈ ${block.value.toFixed(4)}`}
                   >
                     {block.heightPercent > 5 && (
                       <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                         1/{block.term}²
                       </div>
                     )}
                   </div>
                 ))}

              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm w-full">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium text-white transition-colors ${
              isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {isRunning ? <><Pause size={18} className="mr-2" /> Pause</> : <><Play size={18} className="mr-2" /> Start</>}
          </button>

          <button
            onClick={reset}
            className="flex items-center px-4 py-2 rounded-lg font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <RotateCcw size={18} className="mr-2" /> Reset
          </button>

          <div className="flex items-center space-x-3 ml-auto">
            <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Terms per tick:</label>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500"
            >
              <option value="1">1</option>
              <option value="10">10</option>
              <option value="100">100</option>
              <option value="1000">1,000</option>
              <option value="10000">10,000</option>
            </select>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-80 flex flex-col space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Statistics</h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Total Terms (n)</p>
              <p className="text-2xl font-bold font-mono text-slate-800">{terms.toLocaleString()}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500 mb-1">Current Sum</p>
              <p className="text-2xl font-bold font-mono text-indigo-500">{sum.toFixed(6)}</p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500 mb-1">Estimated Pi (π)</p>
              <p className="text-3xl font-bold font-mono text-indigo-600">
                {estimatedPi > 0 ? estimatedPi.toFixed(6) : '0.000000'}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500 mb-1">Error</p>
              <p className="text-lg font-mono text-slate-600">
                {estimatedPi > 0 ? error.toFixed(6) : '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-2">The Basel Problem</h3>
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">
            First posed in 1650, the Basel problem asks for the precise sum of the reciprocals of the squares of the natural numbers.
          </p>
          <div className="bg-slate-50 p-3 rounded-lg text-sm font-mono text-center text-slate-700 mb-4 border border-slate-200 overflow-x-auto">
            1/1² + 1/2² + 1/3² + ... = π²/6
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Leonhard Euler solved it in 1734, famously proving that the sum converges to exactly <strong>π²/6</strong>. By computing this sum, we can rearrange the formula to solve for Pi: <strong>π = √(6 × sum)</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};