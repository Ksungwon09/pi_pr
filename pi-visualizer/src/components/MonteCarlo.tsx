import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';

export const MonteCarlo = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [pointsTotal, setPointsTotal] = useState(0);
  const [pointsInside, setPointsInside] = useState(0);
  const [piEstimate, setPiEstimate] = useState(0);

  const requestRef = useRef<number>(0);
  const totalRef = useRef(0);
  const insideRef = useRef(0);

  const CANVAS_SIZE = 400;

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    // Draw Square
    ctx.strokeStyle = '#94a3b8'; // slate-400
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw Arc
    ctx.beginPath();
    ctx.arc(0, CANVAS_SIZE, CANVAS_SIZE, 0, Math.PI * 2);
    ctx.strokeStyle = '#3b82f6'; // blue-500
    ctx.stroke();
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    setPointsTotal(0);
    setPointsInside(0);
    setPiEstimate(0);
    totalRef.current = 0;
    insideRef.current = 0;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) drawBackground(ctx);
    }
  }, [drawBackground]);

  // Initial draw without setting reactive state unnecessarily
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) drawBackground(ctx);
    }
  }, [drawBackground]);

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw multiple points per frame to speed up visualization
    const POINTS_PER_FRAME = 50;

    for (let i = 0; i < POINTS_PER_FRAME; i++) {
      const x = Math.random() * CANVAS_SIZE;
      const y = Math.random() * CANVAS_SIZE;

      // Coordinate system from bottom-left
      const dx = x;
      const dy = CANVAS_SIZE - y;

      const distance = Math.sqrt(dx * dx + dy * dy);
      const isInside = distance <= CANVAS_SIZE;

      totalRef.current += 1;
      if (isInside) insideRef.current += 1;

      ctx.fillStyle = isInside ? '#ef4444' : '#64748b'; // red-500 if inside, slate-500 outside
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    setPointsTotal(totalRef.current);
    setPointsInside(insideRef.current);
    setPiEstimate(4 * (insideRef.current / totalRef.current));

    // eslint-disable-next-line react-hooks/immutability
    requestRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(loop);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, loop]);

  return (
    <div className="flex flex-col md:flex-row h-full">
      <div className="flex-1 p-6 flex items-center justify-center bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="bg-white shadow-md rounded-sm border border-slate-300 w-full max-w-[400px] aspect-square"
          style={{ width: '100%', height: 'auto', maxWidth: '400px' }}
        />
      </div>

      <div className="w-full md:w-96 p-6 flex flex-col bg-white">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Monte Carlo Method</h2>

        <div className="prose prose-sm text-slate-600 mb-8">
          <p>
            Imagine a circle inscribed in a square. The ratio of the area of the circle to the area of the square is <strong>π/4</strong>.
          </p>
          <p>
            By scattering points randomly across the square, we can estimate this ratio by counting how many points fall inside the circle versus the total number of points.
          </p>
          <p className="font-mono bg-slate-100 p-2 rounded text-center">
            π ≈ 4 × (Inside / Total)
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500">Total Points</span>
            <span className="font-mono font-medium">{pointsTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-red-500 font-medium">Points Inside</span>
            <span className="font-mono font-medium">{pointsInside.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-3 bg-indigo-50 px-4 rounded-lg border border-indigo-100">
            <span className="text-indigo-900 font-bold">Estimated π</span>
            <span className="font-mono text-xl font-bold text-indigo-700">
              {piEstimate.toFixed(6)}
            </span>
          </div>
        </div>

        <div className="flex space-x-3 mt-auto">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
              isRunning
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isRunning ? <Square size={18} /> : <Play size={18} />}
            <span>{isRunning ? 'Pause' : 'Start'} Simulation</span>
          </button>

          <button
            onClick={reset}
            className="p-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
