import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface Needle {
  x: number;
  y: number;
  angle: number;
  crosses: boolean;
}

export const BuffonsNeedle: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [needles, setNeedles] = useState<Needle[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [crossCount, setCrossCount] = useState(0);
  const [speed, setSpeed] = useState(10);

  // Constants
  const lineSpacing = 40;
  const needleLength = 40; // l = d for simplicity so P = 2/pi
  const canvasWidth = 600;
  const canvasHeight = 400;

  // Animation loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      if (isRunning) {
        // Drop new needles
        const newNeedles: Needle[] = [];
        let newCrosses = 0;

        for (let i = 0; i < speed; i++) {
          const x = Math.random() * canvasWidth;
          const y = Math.random() * canvasHeight;
          const angle = Math.random() * Math.PI; // 0 to pi

          // Determine if it crosses a line
          // The distance from the center of the needle to the closest line
          const closestLineY = Math.round(y / lineSpacing) * lineSpacing;
          const yDist = Math.abs(y - closestLineY);

          // A needle crosses a line if the vertical distance from its center to the line
          // is less than half the vertical extent of the needle
          const halfVerticalExtent = (needleLength / 2) * Math.sin(angle);

          const crosses = yDist <= halfVerticalExtent;
          if (crosses) newCrosses++;

          newNeedles.push({ x, y, angle, crosses });
        }

        setNeedles(prev => [...prev, ...newNeedles]);
        setCrossCount(prev => prev + newCrosses);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    if (isRunning) {
      render();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, speed]);

  // Draw needles and lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw lines
    ctx.strokeStyle = '#94a3b8'; // slate-400
    ctx.lineWidth = 1;
    for (let y = 0; y <= canvasHeight; y += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    // Draw needles
    needles.forEach(needle => {
      const dx = (needleLength / 2) * Math.cos(needle.angle);
      const dy = (needleLength / 2) * Math.sin(needle.angle);

      ctx.strokeStyle = needle.crosses ? '#ef4444' : '#3b82f6'; // red if crossing, blue otherwise
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(needle.x - dx, needle.y - dy);
      ctx.lineTo(needle.x + dx, needle.y + dy);
      ctx.stroke();
    });

  }, [needles]);

  const reset = () => {
    setIsRunning(false);
    setNeedles([]);
    setCrossCount(0);
  };

  const totalNeedles = needles.length;
  // If d = l, probability P = 2/pi.
  // P ≈ crosses / total => 2/pi ≈ crosses / total => pi ≈ 2 * total / crosses
  const estimatedPi = totalNeedles > 0 && crossCount > 0 ? (2 * totalNeedles) / crossCount : 0;
  const error = Math.abs(Math.PI - estimatedPi);

  return (
    <div className="flex flex-col lg:flex-row h-full p-6 gap-6">
      <div className="flex-1 flex flex-col items-center">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="bg-slate-50 border border-slate-200 rounded-lg max-w-full"
            style={{ width: '100%', height: 'auto', aspectRatio: `${canvasWidth}/${canvasHeight}` }}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm w-full max-w-2xl">
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
            <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Speed:</label>
            <input
              type="range"
              min="1"
              max="100"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-32 accent-indigo-600"
            />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-80 flex flex-col space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Statistics</h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Total Needles</p>
              <p className="text-2xl font-bold font-mono text-slate-800">{totalNeedles.toLocaleString()}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500 mb-1">Crossing Lines</p>
              <p className="text-2xl font-bold font-mono text-red-500">{crossCount.toLocaleString()}</p>
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
          <h3 className="text-lg font-bold text-slate-800 mb-2">How it works</h3>
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">
            Buffon's Needle is a classic geometric probability experiment. By dropping needles of length <span className="font-mono text-xs bg-slate-100 px-1 rounded">l</span> onto a surface with parallel lines spaced <span className="font-mono text-xs bg-slate-100 px-1 rounded">d</span> apart.
          </p>
          <div className="bg-slate-50 p-3 rounded-lg text-sm font-mono text-center text-slate-700 mb-4 border border-slate-200">
            P = (2 × l) / (π × d)
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            In this simulation, we set <span className="font-mono text-xs bg-slate-100 px-1 rounded">l = d</span>, which simplifies the equation to <span className="font-mono text-xs bg-slate-100 px-1 rounded">P = 2 / π</span>. By simulating many drops and calculating the ratio of crosses to total needles, we can approximate Pi!
          </p>
        </div>
      </div>
    </div>
  );
};
