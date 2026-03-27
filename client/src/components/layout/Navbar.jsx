import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import {
  Briefcase, Bell, MessageCircle, User, LogOut, Menu, X, ChevronDown,
  LayoutDashboard, BookmarkCheck, FileText, PlusCircle, Settings,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setDropdownOpen(false);
    setMobileOpen(false);
  };

  const seekerLinks = [
    { to: "/seeker/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/seeker/applications", label: "My Applications", icon: FileText },
    { to: "/seeker/saved", label: "Saved Jobs", icon: BookmarkCheck },
  ];
  const employerLinks = [
    { to: "/employer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/employer/post-job", label: "Post a Job", icon: PlusCircle },
  ];
  const dashboardLinks = user?.role === "employer" ? employerLinks : user?.role === "seeker" ? seekerLinks : [];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur border-b" style={{ background: "rgba(0,0,0,0.95)", borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#e94560" }}>
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="gradient-text">NextHire</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={({ isActive }) => `px-4 py-2 rounded-lg text-sm transition-colors ${isActive ? "text-white" : "text-slate-400 hover:text-white"}`} style={({ isActive }) => isActive ? { background: "rgba(233,69,96,0.15)" } : {}}>Home</NavLink>
            <NavLink to="/jobs" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm transition-colors ${isActive ? "text-white" : "text-slate-400 hover:text-white"}`} style={({ isActive }) => isActive ? { background: "rgba(233,69,96,0.15)" } : {}}>Find Jobs</NavLink>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {user.role !== "admin" && (
                  <Link to="/chat" className="relative p-2 rounded-lg text-slate-400 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <MessageCircle className="w-5 h-5" />
                  </Link>
                )}
                <Link to="/notifications" className="relative p-2 rounded-lg text-slate-400 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: "#e94560" }}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm" style={{ background: "rgba(233,69,96,0.2)", color: "#e94560" }}>
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-300 max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-52 rounded-2xl shadow-lg py-2 z-20 animate-fade-in-up" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.1)" }}>
                        {dashboardLinks.map(({ to, label, icon: Icon }) => (
                          <Link key={to} to={to} onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white transition-colors" style={{ background: "transparent" }}>
                            <Icon className="w-4 h-4 text-slate-400" />{label}
                          </Link>
                        ))}
                        {user.role === "admin" && (
                          <Link to="/admin" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white transition-colors">
                            <Settings className="w-4 h-4 text-slate-400" /> Admin Panel
                          </Link>
                        )}
                        <Link to="/profile" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white transition-colors">
                          <User className="w-4 h-4 text-slate-400" /> Profile
                        </Link>
                        <div className="my-1" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }} />
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors" style={{ color: "#e94560" }}>
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-colors">Sign In</Link>
                <Link to="/register" className="px-6 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: "#e94560" }}>Get Started</Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-4 py-4 space-y-1 animate-fade-in" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#16213e" }}>
          <NavLink to="/" end onClick={() => setMobileOpen(false)} className="block py-2 px-3 rounded-xl text-sm text-slate-300 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.03)" }}>Home</NavLink>
          <NavLink to="/jobs" onClick={() => setMobileOpen(false)} className="block py-2 px-3 rounded-xl text-sm text-slate-300 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.03)" }}>Find Jobs</NavLink>
          {user ? (
            <>
              {dashboardLinks.map(({ to, label }) => (
                <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} className="block py-2 px-3 rounded-xl text-sm text-slate-300 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.03)" }}>{label}</NavLink>
              ))}
              <NavLink to="/notifications" onClick={() => setMobileOpen(false)} className="block py-2 px-3 rounded-xl text-sm text-slate-300 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.03)" }}>
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </NavLink>
              {user.role !== "admin" && (
                <NavLink to="/chat" onClick={() => setMobileOpen(false)} className="block py-2 px-3 rounded-xl text-sm text-slate-300 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.03)" }}>Messages</NavLink>
              )}
              <NavLink to="/profile" onClick={() => setMobileOpen(false)} className="block py-2 px-3 rounded-xl text-sm text-slate-300 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.03)" }}>Profile</NavLink>
              <button onClick={handleLogout} className="w-full text-left py-2 px-3 rounded-xl text-sm transition-colors" style={{ background: "rgba(233,69,96,0.1)", color: "#e94560" }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 px-3 rounded-xl text-sm text-slate-300 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.03)" }}>Sign In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block py-2 px-3 rounded-xl text-sm text-center font-semibold text-white" style={{ background: "#e94560" }}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
