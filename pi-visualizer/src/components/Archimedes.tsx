import { useState, useMemo } from 'react';

export const Archimedes = () => {
  const [sides, setSides] = useState(6);

  // SVG dimensions and circle properties
  const SIZE = 400;
  const CENTER = SIZE / 2;
  const RADIUS = 150;

  // Calculate polygon points and Pi estimates
  const { innerPoints, outerPoints, innerPi, outerPi } = useMemo(() => {
    const innerPts = [];
    const outerPts = [];
    const angleStep = (Math.PI * 2) / sides;

    for (let i = 0; i < sides; i++) {
      const angle = i * angleStep;

      // Inner polygon (inscribed)
      const innerX = CENTER + RADIUS * Math.cos(angle);
      const innerY = CENTER + RADIUS * Math.sin(angle);
      innerPts.push(`${innerX},${innerY}`);

      // Outer polygon (circumscribed)
      // Radius of circumscribed polygon = r / cos(PI/n)
      const outerRadius = RADIUS / Math.cos(Math.PI / sides);
      const outerX = CENTER + outerRadius * Math.cos(angle);
      const outerY = CENTER + outerRadius * Math.sin(angle);
      outerPts.push(`${outerX},${outerY}`);
    }

    // Calculate perimeters to estimate Pi
    // Inner perimeter = n * 2 * r * sin(PI/n)
    // Outer perimeter = n * 2 * r * tan(PI/n)
    // Pi approx = Perimeter / (2 * r)
    const iPi = sides * Math.sin(Math.PI / sides);
    const oPi = sides * Math.tan(Math.PI / sides);

    return {
      innerPoints: innerPts.join(' '),
      outerPoints: outerPts.join(' '),
      innerPi: iPi,
      outerPi: oPi
    };
  }, [sides, CENTER, RADIUS]);

  return (
    <div className="flex flex-col md:flex-row h-full">
      <div className="flex-1 p-6 flex flex-col items-center justify-center bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200">
        <svg
          width={SIZE}
          height={SIZE}
          className="bg-white shadow-md rounded-sm border border-slate-300 w-full max-w-[400px] aspect-square"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
        >
          {/* Circumscribed (Outer) Polygon */}
          <polygon
            points={outerPoints}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="#3b82f6"
            strokeWidth="2"
          />

          {/* The Circle */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
          />

          {/* Inscribed (Inner) Polygon */}
          <polygon
            points={innerPoints}
            fill="rgba(239, 68, 68, 0.1)"
            stroke="#ef4444"
            strokeWidth="2"
          />

          {/* Center Point */}
          <circle cx={CENTER} cy={CENTER} r={3} fill="#475569" />
        </svg>

        <div className="mt-6 flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-sm opacity-20 border border-blue-500"></div>
            <span className="text-sm text-slate-600">Upper Bound</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full border-2 border-emerald-500"></div>
            <span className="text-sm text-slate-600">Circle (π)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-sm opacity-20 border border-red-500"></div>
            <span className="text-sm text-slate-600">Lower Bound</span>
          </div>
        </div>
      </div>

      <div className="w-full md:w-96 p-6 flex flex-col bg-white">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Archimedes' Polygons</h2>

        <div className="prose prose-sm text-slate-600 mb-8">
          <p>
            Around 250 BC, Archimedes bounded the value of π by drawing regular polygons inside and outside a circle.
          </p>
          <p>
            As the number of sides <strong>(n)</strong> increases, the perimeters of the polygons get closer to the circumference of the circle.
          </p>
          <p>
            Archimedes used a 96-sided polygon to prove that: <br/>
            <span className="font-mono">3 10/71 &lt; π &lt; 3 1/7</span>
          </p>
        </div>

        <div className="mb-8">
          <label htmlFor="sides-slider" className="block text-sm font-medium text-slate-700 mb-2">
            Number of Polygon Sides (n = {sides})
          </label>
          <input
            id="sides-slider"
            type="range"
            min="3"
            max="96"
            value={sides}
            onChange={(e) => setSides(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>3 (Triangle)</span>
            <span>96 (Archimedes)</span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-blue-600 font-medium text-sm">Upper Bound (Outer)</span>
            <span className="font-mono text-blue-700">{outerPi.toFixed(8)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-emerald-600 font-bold">Actual π</span>
            <span className="font-mono font-bold text-emerald-700">3.14159265</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-red-600 font-medium text-sm">Lower Bound (Inner)</span>
            <span className="font-mono text-red-700">{innerPi.toFixed(8)}</span>
          </div>
        </div>

        <div className="mt-auto bg-slate-100 p-4 rounded-lg text-sm text-slate-600 text-center">
          Difference between bounds: <br/>
          <strong className="font-mono">{(outerPi - innerPi).toFixed(8)}</strong>
        </div>
      </div>
    </div>
  );
};