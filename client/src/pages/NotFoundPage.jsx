import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-black mb-4" style={{ fontFamily: "'Syne', sans-serif", color: "#e94560" }}>404</p>
        <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-slate-400 mb-8 max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90" style={{ background: "#e94560" }}>
            <Home size={16} /> Go Home
          </Link>
          <Link to="/jobs" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all" style={{ background: "rgba(255,255,255,0.05)" }}>
            <Search size={16} /> Browse Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
