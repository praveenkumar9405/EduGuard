import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import UploadPage from './pages/UploadPage';
import Dashboard from './pages/Dashboard';
import StudentDetail from './pages/StudentDetail';
import HeatmapPage from './pages/HeatmapPage';
import InterventionTracker from './pages/InterventionTracker';
import {
  UploadCloud, LayoutDashboard, Map as MapIcon, ShieldAlert, LogOut, User
} from 'lucide-react';

const NAV_ITEMS_BY_ROLE = {
  teacher: [
    { label: 'Upload Data', path: '/upload', icon: UploadCloud },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Interventions', path: '/interventions', icon: ShieldAlert },
  ],
  principal: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Heatmap', path: '/heatmap', icon: MapIcon },
    { label: 'Interventions', path: '/interventions', icon: ShieldAlert },
  ],
  deo: [
    { label: 'Heatmap', path: '/heatmap', icon: MapIcon },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Interventions', path: '/interventions', icon: ShieldAlert },
  ],
};

const ROLE_LABELS = { teacher: 'Teacher', principal: 'Principal', deo: 'Dist. Officer' };
const ROLE_COLORS = { teacher: 'bg-emerald-100 text-emerald-700', principal: 'bg-blue-100 text-blue-700', deo: 'bg-violet-100 text-violet-700' };

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

function AppInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isPublicPage = location.pathname === '/' || location.pathname === '/auth';
  const navItems = user ? (NAV_ITEMS_BY_ROLE[user.role] || NAV_ITEMS_BY_ROLE.teacher) : [];

  const isActive = (path) =>
    path === '/upload' ? location.pathname === '/upload' : location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col font-sans">
      {/* Top Navigation — shown only when logged in (not on public pages) */}
      {user && !isPublicPage && (
        <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-semibold text-slate-800 tracking-tight">
              Edu<span className="text-primary">Guard</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map(({ label, path, icon: Icon }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${isActive(path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-500 hover:text-primary hover:bg-slate-50'
                  }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* User pill + logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                {user.name.charAt(0)}
              </div>
              <span className="text-slate-700 text-sm font-medium hidden sm:block">{user.name}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full hidden sm:block ${ROLE_COLORS[user.role]}`}>
                {ROLE_LABELS[user.role]}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={18} />
            </button>
          </div>
        </nav>
      )}

      {/* When user is logged in but on a public page, show minimal nav */}
      {user && isPublicPage && location.pathname !== '/auth' && (
        <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-semibold text-slate-800 tracking-tight">
              Edu<span className="text-primary">Guard</span>
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 transition-colors font-medium"
          >
            <LogOut size={16} /> Logout
          </button>
        </nav>
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-x-hidden ${!isPublicPage ? 'pt-6 pb-12' : ''}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/student/:id" element={<ProtectedRoute><StudentDetail /></ProtectedRoute>} />
          <Route path="/heatmap" element={<ProtectedRoute><HeatmapPage /></ProtectedRoute>} />
          <Route path="/interventions" element={<ProtectedRoute><InterventionTracker /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
