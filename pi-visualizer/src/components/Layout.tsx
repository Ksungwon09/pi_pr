import React, { type ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'monte-carlo', label: 'Monte Carlo Methods' },
  { id: 'infinite-series', label: 'Infinite Series' },
  { id: 'geometric', label: 'Geometric Methods' },
  { id: 'fun-with-pi', label: 'Fun with Pi' },
];

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-indigo-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-serif">π</span>
              <h1 className="text-xl font-bold tracking-tight">Visualizing Pi</h1>
            </div>
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-indigo-800 text-white'
                      : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          {/* Mobile nav */}
          <div className="md:hidden pb-4 flex flex-wrap gap-2">
             {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-indigo-800 text-white'
                      : 'bg-indigo-500 text-indigo-50 hover:bg-indigo-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
          {children}
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-400 py-6 text-center text-sm">
        <p>A study on the consideration and implementation methods of website components for viewing various visualizations of Pi.</p>
      </footer>
    </div>
  );
};
