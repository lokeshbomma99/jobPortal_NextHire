// Shared small UI components

export const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-slate-700 text-slate-300",
    primary: "bg-red-500/20 text-red-400",
    success: "bg-emerald-500/20 text-emerald-400",
    warning: "bg-amber-500/20 text-amber-400",
    danger: "bg-red-500/20 text-red-400",
    info: "bg-blue-500/20 text-blue-400",
    purple: "bg-purple-500/20 text-purple-400",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Button = ({
  children, variant = "primary", size = "md", loading = false,
  className = "", disabled = false, ...props
}) => {
  const variants = {
    primary: "text-white hover:opacity-90",
    secondary: "text-slate-300 hover:text-white hover:bg-white/10",
    outline: "border text-slate-300 hover:text-white",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      style={variant === "primary" ? { background: "#e94560" } : variant === "outline" ? { borderColor: "rgba(255,255,255,0.15)" } : {}}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
};

export const Input = ({ label, error, className = "", ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
    <input
      className={`w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 transition-all ${className}`}
      style={{
        background: "rgba(255,255,255,0.05)",
        border: `1px solid ${error ? "#e94560" : "rgba(255,255,255,0.1)"}`,
      }}
      {...props}
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

export const Textarea = ({ label, error, className = "", ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
    <textarea
      className={`w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 transition-all resize-none ${className}`}
      style={{
        background: "rgba(255,255,255,0.05)",
        border: `1px solid ${error ? "#e94560" : "rgba(255,255,255,0.1)"}`,
      }}
      {...props}
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

export const Select = ({ label, error, children, className = "", ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
    <select
      className={`w-full px-4 py-2.5 rounded-lg text-sm text-white transition-all ${className}`}
      style={{
        background: "#1e2a47",
        border: `1px solid ${error ? "#e94560" : "rgba(255,255,255,0.1)"}`,
      }}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

export const Card = ({ children, className = "", hover = false, ...props }) => (
  <div
    className={`rounded-xl transition-all ${hover ? "hover:border-red-500/30 cursor-pointer" : ""} ${className}`}
    style={{
      background: "#1e2a47",
      border: "1px solid rgba(255,255,255,0.06)",
    }}
    {...props}
  >
    {children}
  </div>
);

export const Spinner = ({ size = "md" }) => {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className={`${sizes[size]} border-2 border-red-500 border-t-transparent rounded-full animate-spin`} />
  );
};

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && (
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(233,69,96,0.1)" }}>
        <Icon size={32} className="text-red-400" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    {description && <p className="text-sm text-slate-400 max-w-xs mb-6">{description}</p>}
    {action}
  </div>
);

export const Avatar = ({ src, name, size = "md" }) => {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg", xl: "w-20 h-20 text-xl" };
  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden flex-shrink-0`} style={{ background: "#e94560" }}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white font-bold">
          {name?.[0]?.toUpperCase() || "?"}
        </div>
      )}
    </div>
  );
};
