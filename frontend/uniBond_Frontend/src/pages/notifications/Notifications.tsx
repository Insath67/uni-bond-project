import { useEffect, useState } from "react";
import { handleGetNotificationSummary, handleGetNotifications, handleMarkAllAsRead, handleMarkAsRead } from "@/controllers/notificationController";
import type { Notification, NotificationFilter, NotificationSummary } from "@/types/notification";
import SectionCard from "@/components/common/SectionCard";
import EmptyState from "@/components/common/EmptyState";
import { Bell, Heart, MessageSquare, GraduationCap, Users, Megaphone, CheckCheck } from "lucide-react";
import { formatDateTime } from "@/utils/formatters";

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<NotificationSummary>({ totalCount: 0, unreadCount: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<NotificationFilter>("all");

  useEffect(() => {
    void fetchNotifications(filter);
  }, [filter]);

  const fetchNotifications = async (nextFilter: NotificationFilter) => {
    try {
      setLoading(true);
      setError("");
      const [data, nextSummary] = await Promise.all([
        handleGetNotifications({ unreadOnly: nextFilter === "unread" }),
        handleGetNotificationSummary(),
      ]);
      setNotifications(data);
      setSummary(nextSummary);
    } catch (nextError) {
      console.error("Failed to load notifications", nextError);
      setNotifications([]);
      setSummary({ totalCount: 0, unreadCount: 0 });
      setError("Notifications could not be loaded right now.");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "like": return <Heart className="w-5 h-5 text-red-500 fill-red-50" />;
      case "comment": return <MessageSquare className="w-5 h-5 text-blue-500 fill-blue-50" />;
      case "kuppy": return <GraduationCap className="w-5 h-5 text-indigo-500 fill-indigo-50" />;
      case "group": return <Users className="w-5 h-5 text-green-500 fill-green-50" />;
      case "notice": return <Megaphone className="w-5 h-5 text-amber-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const onMarkAsRead = async (id: string) => {
    try {
      setActionLoading(true);
      const updated = await handleMarkAsRead(id);
      setNotifications((current) =>
        current.map((notification) => notification.id === id ? updated : notification)
      );
      setSummary((current) => ({
        ...current,
        unreadCount: Math.max(0, current.unreadCount - 1),
      }));
      if (filter === "unread") {
        setNotifications((current) => current.filter((notification) => notification.id !== id));
      }
    } catch (nextError) {
      console.error("Failed to mark notification as read", nextError);
      setError("The notification could not be updated.");
    } finally {
      setActionLoading(false);
    }
  };

  const onMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      const nextSummary = await handleMarkAllAsRead();
      setSummary(nextSummary);
      setNotifications((current) =>
        filter === "unread"
          ? []
          : current.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch (nextError) {
      console.error("Failed to mark all notifications as read", nextError);
      setError("Notifications could not be marked as read.");
    } finally {
      setActionLoading(false);
    }
  };

  const recentNotifications = notifications.filter((notification) => {
    const createdAt = new Date(notification.createdAt).getTime();
    return Date.now() - createdAt <= 1000 * 60 * 60 * 24;
  });

  const earlierNotifications = notifications.filter((notification) => {
    const createdAt = new Date(notification.createdAt).getTime();
    return Date.now() - createdAt > 1000 * 60 * 60 * 24;
  });

  const renderNotificationList = (items: Notification[]) => (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] shadow-sm">
      {items.map((n, idx) => (
        <button
          type="button"
          key={n.id}
          className={`flex w-full items-start gap-4 p-5 text-left transition ${idx !== items.length - 1 ? "border-b border-[var(--border-soft)]" : ""} ${!n.isRead ? "bg-[var(--accent-soft)]/70 hover:bg-[var(--accent-soft)]" : "hover:bg-[var(--surface-muted)]"}`}
          onClick={() => {
            if (!n.isRead) {
              void onMarkAsRead(n.id);
            }
          }}
        >
          <div className="shrink-0 mt-1">
            {getIcon(n.type)}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm ${!n.isRead ? "font-semibold text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
              {n.message}
            </p>
            <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">
              {formatDateTime(n.createdAt)}
            </p>
          </div>
          {!n.isRead ? (
            <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent)]" />
          ) : null}
        </button>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SectionCard title="Notifications">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[var(--text-primary)]">
              <Bell className="h-6 w-6 text-[var(--accent)]" />
              <h1 className="text-2xl font-bold">Notifications</h1>
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {summary.unreadCount} unread of {summary.totalCount} total notifications
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${filter === "all" ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]" : "bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${filter === "unread" ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]" : "bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            >
              Unread
            </button>
            <button
              type="button"
              onClick={() => void onMarkAllAsRead()}
              disabled={actionLoading || summary.unreadCount === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          </div>
        </div>
      </SectionCard>

      {loading ? (
        <SectionCard title="Inbox">
          <div className="py-10 text-center text-sm text-[var(--text-secondary)]">Loading notifications...</div>
        </SectionCard>
      ) : error ? (
        <SectionCard title="Inbox">
          <EmptyState icon={Bell} title="Unable to load notifications" description={error} />
        </SectionCard>
      ) : notifications.length === 0 ? (
        <SectionCard title="Inbox">
           <EmptyState icon={Bell} title="All caught up" description={filter === "unread" ? "You have no unread notifications." : "You don't have any notifications yet."} />
        </SectionCard>
      ) : (
        <div className="space-y-6">
          {recentNotifications.length > 0 ? (
            <section className="space-y-3">
              <h2 className="px-1 text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Recent
              </h2>
              {renderNotificationList(recentNotifications)}
            </section>
          ) : null}

          {earlierNotifications.length > 0 ? (
            <section className="space-y-3">
              <h2 className="px-1 text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Earlier
              </h2>
              {renderNotificationList(earlierNotifications)}
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
