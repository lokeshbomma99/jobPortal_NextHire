import { useState, useEffect } from "react";
import { Bell, Trash2, CheckCheck } from "lucide-react";
import { notificationsAPI } from "../lib/api";
import { EmptyState, Spinner } from "../components/ui";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

const TYPE_ICONS = {
  application_received: "📥",
  application_status: "📋",
  message: "💬",
  job_match: "✨",
  profile_view: "👁️",
  system: "🔔",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsAPI.getAll()
      .then(({ data }) => setNotifications(data))
      .catch(() => toast.error("Failed to load notifications"))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await notificationsAPI.markAsRead(id);
    setNotifications((p) => p.map((n) => n._id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await notificationsAPI.markAllRead();
    setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));
    toast.success("All marked as read");
  };

  const deleteNotif = async (id) => {
    await notificationsAPI.delete(id);
    setNotifications((p) => p.filter((n) => n._id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Notifications</h1>
          {unreadCount > 0 && <p className="text-sm text-slate-400 mt-1">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all" style={{ background: "rgba(255,255,255,0.05)" }}>
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up! Notifications will appear here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n._id}
              onClick={() => !n.isRead && markRead(n._id)}
              className="flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer"
              style={{
                background: n.isRead ? "#1e2a47" : "rgba(233,69,96,0.07)",
                border: `1px solid ${n.isRead ? "rgba(255,255,255,0.06)" : "rgba(233,69,96,0.2)"}`,
              }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "rgba(255,255,255,0.05)" }}>
                {TYPE_ICONS[n.type] || "🔔"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{n.title}</p>
                <p className="text-sm text-slate-400 mt-0.5">{n.message}</p>
                <p className="text-xs text-slate-600 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!n.isRead && <span className="w-2 h-2 rounded-full" style={{ background: "#e94560" }} />}
                <button onClick={(e) => { e.stopPropagation(); deleteNotif(n._id); }} className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
