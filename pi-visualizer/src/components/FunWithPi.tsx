import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';

export const FunWithPi = () => {
  const [piData, setPiData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{ found: boolean; position: number; contextStart: string; match: string; contextEnd: string } | null>(null);

  // Load Pi data on mount
  useEffect(() => {
    const fetchPi = async () => {
      try {
        const response = await fetch('/data/pi-1m.txt');
        if (!response.ok) throw new Error('Failed to load Pi data');
        const text = await response.text();
        setPiData(text);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load the digits of Pi. Please try refreshing.');
        setIsLoading(false);
      }
    };
    fetchPi();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery || !piData) return;

    // Clean input (only allow digits)
    const query = searchQuery.replace(/\D/g, '');
    if (!query) {
      setSearchResult(null);
      return;
    }

    const index = piData.indexOf(query);

    if (index !== -1) {
      // Get surrounding context (up to 20 chars before and after)
      const contextLength = 20;
      const startIdx = Math.max(0, index - contextLength);
      const endIdx = Math.min(piData.length, index + query.length + contextLength);

      setSearchResult({
        found: true,
        position: index + 1, // 1-based indexing for users (technically includes '3.')
        contextStart: piData.substring(startIdx, index),
        match: query,
        contextEnd: piData.substring(index + query.length, endIdx),
      });
    } else {
      setSearchResult({ found: false, position: -1, contextStart: '', match: '', contextEnd: '' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-500" />
          <p>Loading 1,000,000 digits of Pi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-red-500 p-8 text-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full">
      <div className="flex-1 p-8 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200">
        <h2 className="text-3xl font-bold mb-6 text-slate-800">Find Yourself in Pi</h2>

        <div className="prose text-slate-600 mb-8 max-w-none">
          <p>
            Pi is believed to be a <strong>normal number</strong>, meaning its digits appear to be completely random.
            Because it is infinite and non-repeating, it is theorized that <em>any</em> finite sequence of digits
            can be found somewhere within it.
          </p>
          <p>
            We have loaded the first <strong>1,000,000 digits</strong> of Pi. Try searching for your birthday (e.g., MMDDYYYY or YYMMDD),
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
                  The sequence <strong>{searchQuery.replace(/\D/g, '')}</strong> was not found in the first 1,000,000 digits of Pi.
                </p>
                <p className="text-sm text-red-600 mt-2">
                  Try a shorter sequence!
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="w-full md:w-80 p-6 flex flex-col bg-white overflow-hidden relative">
        <h3 className="text-lg font-bold mb-4 text-slate-800 z-10 bg-white/90 pb-2 backdrop-blur-sm border-b">A Glimpse of Pi</h3>
        <div className="flex-1 overflow-hidden relative">
           <div className="absolute inset-0 font-mono text-xs text-slate-300 break-all leading-tight text-justify select-none overflow-hidden mask-image-bottom">
             {/* Show a chunk of Pi as background texture */}
             {piData ? piData.substring(0, 5000) : ''}
           </div>

           <style>{`
             .mask-image-bottom {
               -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
               mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
             }
           `}</style>
        </div>
      </div>
    </div>
  );
};