import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Download, Settings, Play, Square } from 'lucide-react';

export const FunWithPi = () => {
  const [activeDataset, setActiveDataset] = useState<'1m' | '10m' | 'custom'>('1m');
  const [piData, setPiData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{ found: boolean; position: number; contextStart: string; match: string; contextEnd: string } | null>(null);

  // Custom Generation states
  const [customDigitsCount, setCustomDigitsCount] = useState<number>(1000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPi, setGeneratedPi] = useState('');
  const workerRef = useRef<Worker | null>(null);

  // Load Pi data
  useEffect(() => {
    const fetchPi = async (filename: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/data/${filename}`);
        if (!response.ok) throw new Error(`Failed to load ${filename}`);
        const text = await response.text();
        setPiData(text);
      } catch (err) {
        console.error(err);
        setError(`Failed to load Pi data (${filename}). Please try refreshing.`);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeDataset === '1m') {
      fetchPi('pi-1m.txt');
    } else if (activeDataset === '10m') {
      fetchPi('pi-10m.txt');
    }
  }, [activeDataset]);

  // Custom dataset handling without nested setState triggers
  useEffect(() => {
    if (activeDataset === 'custom') {
      // We intentionally disable this rule here as we need to update state based on activeDataset
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPiData(generatedPi);

      setIsLoading(false);
    }
  }, [activeDataset, generatedPi]);

  // Clean up worker
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery || !piData) return;

    const query = searchQuery.replace(/\D/g, '');
    if (!query) {
      setSearchResult(null);
      return;
    }

    const index = piData.indexOf(query);

    if (index !== -1) {
      const contextLength = 20;
      const startIdx = Math.max(0, index - contextLength);
      const endIdx = Math.min(piData.length, index + query.length + contextLength);

      setSearchResult({
        found: true,
        position: index + 1,
        contextStart: piData.substring(startIdx, index),
        match: query,
        contextEnd: piData.substring(index + query.length, endIdx),
      });
    } else {
      setSearchResult({ found: false, position: -1, contextStart: '', match: '', contextEnd: '' });
    }
  };

  const startGeneration = () => {
    if (isGenerating) {
      // Stop generation
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      setIsGenerating(false);
      return;
    }

    setGeneratedPi('');
    setIsGenerating(true);
    setSearchResult(null);

    workerRef.current = new Worker(new URL('/piWorker.js', window.location.origin));

    workerRef.current.onmessage = (e) => {
      const { type, data } = e.data;
      if (type === 'progress') {
        setGeneratedPi(data);
        if (activeDataset === 'custom') setPiData(data);
      } else if (type === 'done') {
        setGeneratedPi(data);
        if (activeDataset === 'custom') setPiData(data);
        setIsGenerating(false);
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null;
        }
      }
    };

    workerRef.current.postMessage({ action: 'generate', digits: customDigitsCount });
  };

  const downloadCustomPi = () => {
    if (!generatedPi) return;
    const blob = new Blob([generatedPi], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pi-${customDigitsCount}-digits.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      <div className="flex-1 p-8 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto max-h-[800px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-slate-800">Find Yourself in Pi</h2>

          <div className="flex bg-slate-200 p-1 rounded-lg">
            <button
              onClick={() => setActiveDataset('1m')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeDataset === '1m' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              1 Million
            </button>
            <button
              onClick={() => setActiveDataset('10m')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeDataset === '10m' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              10 Million
            </button>
            <button
              onClick={() => setActiveDataset('custom')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeDataset === 'custom' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Custom Generator
            </button>
          </div>
        </div>

        {activeDataset === 'custom' && (
          <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-indigo-500" />
              Device-Powered Generation
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Use your device's processing power to compute digits of Pi in real-time using a Spigot algorithm running in a Web Worker.
            </p>

            <div className="flex flex-wrap items-end gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Digits</label>
                <select
                  value={customDigitsCount}
                  onChange={(e) => setCustomDigitsCount(Number(e.target.value))}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 min-w-[150px]"
                >
                  <option value={100}>100 Digits</option>
                  <option value={500}>500 Digits</option>
                  <option value={1000}>1,000 Digits</option>
                  <option value={5000}>5,000 Digits (Slow)</option>
                  <option value={10000}>10,000 Digits (Very Slow)</option>
                </select>
              </div>

              <button
                onClick={startGeneration}
                className={`px-6 py-2 rounded-lg font-medium text-white flex items-center transition-colors ${
                  isGenerating ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isGenerating ? <><Square size={18} className="mr-2" /> Stop Generating</> : <><Play size={18} className="mr-2" /> Start Generation</>}
              </button>

              {generatedPi.length > 0 && !isGenerating && (
                <button
                  onClick={downloadCustomPi}
                  className="px-4 py-2 rounded-lg font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center transition-colors"
                >
                  <Download size={18} className="mr-2" /> Download TXT
                </button>
              )}
            </div>

            <div className="flex items-center text-sm">
              <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700 font-bold border border-slate-200">
                {generatedPi.length} / {customDigitsCount}
              </span>
              <span className="ml-2 text-slate-500">digits generated</span>
              {isGenerating && <Loader2 className="w-4 h-4 ml-3 animate-spin text-indigo-500" />}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-500" />
              <p>Loading {activeDataset === '10m' ? '10,000,000' : '1,000,000'} digits of Pi...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-red-500 p-8 text-center bg-red-50 rounded-xl border border-red-100">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="prose text-slate-600 mb-8 max-w-none">
              <p>
                Pi is believed to be a <strong>normal number</strong>, meaning its digits appear to be completely random.
                Because it is infinite and non-repeating, it is theorized that <em>any</em> finite sequence of digits
                can be found somewhere within it.
              </p>
              <p>
                We have currently loaded {piData.length.toLocaleString()} digits. Try searching for your birthday (e.g., MMDDYYYY),
                a phone number, or a lucky sequence!
              </p>
            </div>

            <form onSubmit={handleSearch} className="mb-8">
              <div className="flex shadow-sm rounded-lg overflow-hidden border border-slate-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., 04241990"
                  className="flex-1 px-4 py-3 outline-none text-lg font-mono placeholder:font-sans"
                  pattern="[0-9]*"
                  inputMode="numeric"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-3 flex items-center justify-center hover:bg-indigo-700 transition-colors"
                >
                  <Search size={20} className="mr-2" />
                  Search
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">Only numbers (0-9) will be searched.</p>
            </form>

            {searchResult && (
              <div className={`p-6 rounded-xl border ${searchResult.found ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                {searchResult.found ? (
                  <>
                    <h3 className="text-xl font-bold text-emerald-800 mb-2">Sequence Found!</h3>
                    <p className="text-emerald-700 mb-4">
                      The sequence <strong>{searchResult.match}</strong> starts at position <strong>{searchResult.position.toLocaleString()}</strong>.
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-emerald-100 font-mono text-lg text-center break-all shadow-sm">
                      <span className="text-slate-400">{searchResult.contextStart}</span>
                      <span className="bg-yellow-200 text-slate-900 font-bold px-1 rounded mx-0.5">{searchResult.match}</span>
                      <span className="text-slate-400">{searchResult.contextEnd}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-red-800 mb-2">Not Found</h3>
                    <p className="text-red-700">
                      The sequence <strong>{searchQuery.replace(/\D/g, '')}</strong> was not found in the current dataset ({piData.length.toLocaleString()} digits).
                    </p>
                    <p className="text-sm text-red-600 mt-2">
                      Try a shorter sequence or switch to a larger dataset!
                    </p>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="w-full md:w-80 p-6 flex flex-col bg-white overflow-hidden relative border-l border-slate-200">
        <h3 className="text-lg font-bold mb-4 text-slate-800 z-10 bg-white/90 pb-2 backdrop-blur-sm border-b border-slate-100 flex items-center justify-between">
          A Glimpse of Pi
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono">
            {piData.length > 0 ? piData.length.toLocaleString() : '0'}
          </span>
        </h3>
        <div className="flex-1 overflow-hidden relative">
           <div className="absolute inset-0 font-mono text-xs text-slate-300 break-all leading-relaxed text-justify select-none overflow-hidden mask-image-bottom tracking-widest">
             {piData ? piData.substring(0, 8000) : ''}
           </div>

           <style>{`
             .mask-image-bottom {
               -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
               mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
             }
           `}</style>
        </div>
      </div>
    </div>
  );
};