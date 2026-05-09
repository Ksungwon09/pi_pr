import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';

export const GregoryLeibniz = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [iterations, setIterations] = useState(0);
  const [piEstimate, setPiEstimate] = useState(0);

  const requestRef = useRef<number>(0);
  const iterationsRef = useRef(0);
  const currentPiRef = useRef(0);
  const historyRef = useRef<{ x: number; y: number }[]>([]);

  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 400;
  const MARGIN = 40;
  const Y_MIN = 2.0;
  const Y_MAX = 4.2;

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw axes
    ctx.strokeStyle = '#cbd5e1'; // slate-300
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(MARGIN, MARGIN);
    ctx.lineTo(MARGIN, CANVAS_HEIGHT - MARGIN);
    ctx.lineTo(CANVAS_WIDTH - MARGIN, CANVAS_HEIGHT - MARGIN);
    ctx.stroke();

    // Draw Pi line
    const piY = CANVAS_HEIGHT - MARGIN - ((Math.PI - Y_MIN) / (Y_MAX - Y_MIN)) * (CANVAS_HEIGHT - 2 * MARGIN);
    ctx.strokeStyle = '#ef4444'; // red-500
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(MARGIN, piY);
    ctx.lineTo(CANVAS_WIDTH - MARGIN, piY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ef4444';
    ctx.font = '12px sans-serif';
    ctx.fillText('π', MARGIN - 15, piY + 4);

    // Draw Y axis labels
    ctx.fillStyle = '#64748b';
    ctx.fillText('4.0', MARGIN - 25, CANVAS_HEIGHT - MARGIN - ((4.0 - Y_MIN) / (Y_MAX - Y_MIN)) * (CANVAS_HEIGHT - 2 * MARGIN) + 4);
    ctx.fillText('3.0', MARGIN - 25, CANVAS_HEIGHT - MARGIN - ((3.0 - Y_MIN) / (Y_MAX - Y_MIN)) * (CANVAS_HEIGHT - 2 * MARGIN) + 4);
    ctx.fillText('2.0', MARGIN - 25, CANVAS_HEIGHT - MARGIN - ((2.0 - Y_MIN) / (Y_MAX - Y_MIN)) * (CANVAS_HEIGHT - 2 * MARGIN) + 4);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    setIterations(0);
    setPiEstimate(0);
    iterationsRef.current = 0;
    currentPiRef.current = 0;
    historyRef.current = [];

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) drawBackground(ctx);
    }
  }, [drawBackground]);

  // Initial draw, without setting reactive state unnecessarily
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

    // Perform multiple iterations per frame, increasing as we go to show long-term behavior
    const ITERATIONS_PER_FRAME = Math.max(1, Math.floor(iterationsRef.current / 50));

    for (let i = 0; i < ITERATIONS_PER_FRAME; i++) {
      const n = iterationsRef.current;
      const term = (n % 2 === 0 ? 1 : -1) * (4 / (2 * n + 1));
      currentPiRef.current += term;
      iterationsRef.current += 1;

      // Only record some points to avoid drawing too much
      if (iterationsRef.current < 100 || iterationsRef.current % Math.floor(iterationsRef.current / 100) === 0) {
          historyRef.current.push({ x: iterationsRef.current, y: currentPiRef.current });
      }
    }

    // Keep history manageable
    if (historyRef.current.length > 500) {
      historyRef.current.shift();
    }

    // Redraw
    drawBackground(ctx);

    // Draw line
    if (historyRef.current.length > 1) {
      ctx.strokeStyle = '#3b82f6'; // blue-500
      ctx.lineWidth = 2;
      ctx.beginPath();

      const startX = historyRef.current[0].x;
      const endX = historyRef.current[historyRef.current.length - 1].x;
      const xRange = Math.max(endX - startX, 10);

      historyRef.current.forEach((point, index) => {
        const px = MARGIN + ((point.x - startX) / xRange) * (CANVAS_WIDTH - 2 * MARGIN);
        const py = CANVAS_HEIGHT - MARGIN - ((point.y - Y_MIN) / (Y_MAX - Y_MIN)) * (CANVAS_HEIGHT - 2 * MARGIN);

        if (index === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      });
      ctx.stroke();
    }

    setIterations(iterationsRef.current);
    setPiEstimate(currentPiRef.current);

    // eslint-disable-next-line react-hooks/immutability
    requestRef.current = requestAnimationFrame(loop);
  }, [drawBackground]);

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
      <div className="flex-1 p-6 flex flex-col items-center justify-center bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="bg-white shadow-md rounded-sm border border-slate-300 max-w-full"
        />
        <p className="mt-4 text-sm text-slate-500">The chart shows the estimated value converging towards π (red dashed line).</p>
      </div>

      <div className="w-full md:w-96 p-6 flex flex-col bg-white">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Gregory-Leibniz Series</h2>

        <div className="prose prose-sm text-slate-600 mb-8">
          <p>
            An infinite series for calculating π, discovered independently by James Gregory and Gottfried Wilhelm Leibniz.
          </p>
          <p className="font-mono bg-slate-100 p-2 rounded text-center whitespace-nowrap overflow-x-auto">
            π = 4/1 - 4/3 + 4/5 - 4/7 + ...
          </p>
          <p>
            It is simple and elegant but <strong>converges very slowly</strong>. It takes millions of iterations to get just a few accurate decimal places.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500">Iterations (n)</span>
            <span className="font-mono font-medium">{iterations.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500">Actual π</span>
            <span className="font-mono font-medium">3.14159265...</span>
          </div>
          <div className="flex justify-between items-center py-3 bg-indigo-50 px-4 rounded-lg border border-indigo-100">
            <span className="text-indigo-900 font-bold">Estimated π</span>
            <span className="font-mono text-xl font-bold text-indigo-700">
              {piEstimate.toFixed(8)}
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
            <span>{isRunning ? 'Pause' : 'Start'} Series</span>
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