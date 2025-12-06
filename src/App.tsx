import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Table from './sections/Table';
import { Moon, Sun, Layout, LogOut, PlayCircle } from 'lucide-react';

interface DashboardProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

function Dashboard({ darkMode, toggleDarkMode }: DashboardProps) {
  const { signOut, user } = useAuth();
  const [runTutorial, setRunTutorial] = useState(false);
  
  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-300 ${darkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-zinc-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Layout size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-blue-500">
                Freelancer Dashboard
              </h1>
              <p className="text-[10px] font-medium text-zinc-500 tracking-wider">
                {user?.email}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setRunTutorial(true)}
              className={`p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${darkMode ? 'bg-zinc-800 text-blue-400 hover:bg-zinc-700' : 'bg-zinc-100 text-blue-600 hover:bg-zinc-200'}`}
              title="Start Tutorial"
            >
              <PlayCircle size={18} />
            </button>
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${darkMode ? 'bg-zinc-800 text-yellow-400 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={signOut}
              className={`p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${darkMode ? 'bg-zinc-800 text-rose-400 hover:bg-zinc-700' : 'bg-zinc-100 text-rose-600 hover:bg-zinc-200'}`}
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <Table darkMode={darkMode} runTutorial={runTutorial} setRunTutorial={setRunTutorial} />
    </div>
  );
}

function AppContent() {
  const { session, loading } = useAuth();

  // --- Theme State (Global) ---
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Sync Dark Mode with DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return <Dashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
