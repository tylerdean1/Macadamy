import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Hooks for routing
import { LogOut, Home, Building2, Bell, ChevronDown } from 'lucide-react'; // Icons for logout and home
import { useAuthStore } from '@/lib/store'; // Auth store for user management
import { useAuthContext } from '@/context/AuthContext';
import { useMyOrganizations } from '@/hooks/useMyOrganizations';
import { useValidatedSelectedOrganization } from '@/hooks/useValidatedSelectedOrganization';
import { usePrimaryOrganizationSwitch } from '@/hooks/usePrimaryOrganizationSwitch';
import { fetchNotificationsForUser, getNotificationTimestamp, markNotificationAsRead, subscribeToNotifications } from '@/hooks/useNotificationsData';
import { getNotificationDisplayMessage } from '@/lib/utils/notificationMessages';
import { logBackendError, toBackendErrorToastMessage } from '@/lib/backendErrors';
import type { Database } from '@/lib/database.types';
import { toast } from 'sonner';

type NotificationRow = Database['public']['Functions']['filter_notifications']['Returns'][number];


// Navigation bar component
export function Navbar() {
  const navigate = useNavigate(); // Use hook for navigation
  const { user, profile, setSelectedOrganizationId } = useAuthStore();
  const { logout } = useAuthContext();
  const { orgs: myOrgs, loading: myOrgsLoading } = useMyOrganizations(profile?.id);
  const {
    validatedSelectedOrganizationId,
  } = useValidatedSelectedOrganization(myOrgs.map((org) => org.id));
  const { isSwitching: isOrgSwitching, switchPrimaryOrganization } = usePrimaryOrganizationSwitch();

  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [isNotifBusy, setIsNotifBusy] = useState(false);
  const [isLogoutBusy, setIsLogoutBusy] = useState(false);
  const dashboardMenuRef = useRef<HTMLDivElement | null>(null);
  const orgMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationsMenuRef = useRef<HTMLDivElement | null>(null);
  const dashboardToggleRef = useRef<HTMLButtonElement | null>(null);
  const orgToggleRef = useRef<HTMLButtonElement | null>(null);
  const notificationsToggleRef = useRef<HTMLButtonElement | null>(null);

  // Close menus on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if (isDashboardOpen && dashboardMenuRef.current && !dashboardMenuRef.current.contains(target)) {
        setIsDashboardOpen(false);
      }
      if (isOrgMenuOpen && orgMenuRef.current && !orgMenuRef.current.contains(target)) {
        setIsOrgMenuOpen(false);
      }
      if (isNotificationsOpen && notificationsMenuRef.current && !notificationsMenuRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isDashboardOpen, isOrgMenuOpen, isNotificationsOpen]);

  // Keep the DOM aria-expanded attribute in sync so static analysis sees a literal default
  useEffect(() => {
    if (dashboardToggleRef.current) {
      dashboardToggleRef.current.setAttribute('aria-expanded', isDashboardOpen ? 'true' : 'false');
    }
  }, [isDashboardOpen]);

  useEffect(() => {
    if (orgToggleRef.current) {
      orgToggleRef.current.setAttribute('aria-expanded', isOrgMenuOpen ? 'true' : 'false');
    }
  }, [isOrgMenuOpen]);

  useEffect(() => {
    if (notificationsToggleRef.current) {
      notificationsToggleRef.current.setAttribute('aria-expanded', isNotificationsOpen ? 'true' : 'false');
    }
  }, [isNotificationsOpen]);

  // Handle user logout
  const handleLogout = async () => {
    if (isLogoutBusy) return;

    setIsLogoutBusy(true);
    try {
      await logout();
      setSelectedOrganizationId(null);
      navigate('/login', { replace: true });
    } catch (error) {
      const context = {
        module: 'Navbar',
        operation: 'sign out',
        trigger: 'user' as const,
        error,
        ids: {
          profileId: profile?.id ?? null,
        },
      };
      logBackendError(context);
      toast.error(toBackendErrorToastMessage(context));
    } finally {
      setIsLogoutBusy(false);
    }
  };

  const handleSelectOrganization = async (organizationId: string) => {
    try {
      await switchPrimaryOrganization(organizationId);
    } catch {
      return;
    }
  };

  const resolveNotificationRoute = (notification: NotificationRow): string => {
    const payload = notification.payload;
    const payloadObj = payload && typeof payload === 'object' && !Array.isArray(payload)
      ? payload as Record<string, unknown>
      : null;

    const projectId = payloadObj && typeof payloadObj.project_id === 'string' ? payloadObj.project_id : null;
    if (projectId) {
      return `/projects/${projectId}`;
    }

    const organizationId = payloadObj && typeof payloadObj.organization_id === 'string' ? payloadObj.organization_id : null;
    if (organizationId) {
      return '/organizations';
    }

    if (notification.category === 'approval_needed' || notification.category === 'workflow_update') {
      return '/organizations';
    }

    return '/dashboard';
  };

  const loadNotifications = useCallback(async (activeProfileId: string) => {
    try {
      const latest = await fetchNotificationsForUser(activeProfileId, { limit: 100 });
      setUnreadCount(latest.reduce((count, item) => count + (item.is_read ? 0 : 1), 0));
      setNotifications(latest.slice(0, 6));
    } catch (err) {
      logBackendError({
        module: 'Navbar',
        operation: 'load notifications',
        trigger: 'background',
        error: err,
        ids: {
          profileId: activeProfileId,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (!user || !profile?.id) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    void loadNotifications(profile.id);
    const unsubscribe = subscribeToNotifications(profile.id, () => {
      void loadNotifications(profile.id);
    });

    return () => {
      unsubscribe();
    };
  }, [user, profile?.id, loadNotifications]);

  const handleNotificationClick = async (notification: NotificationRow) => {
    if (isNotifBusy) return;

    setIsNotifBusy(true);
    try {
      if (!notification.is_read) {
        await markNotificationAsRead(notification.id);
      }

      setNotifications((prev) => prev.map((item) => item.id === notification.id ? { ...item, is_read: true } : item));
      if (!notification.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      const payload = notification.payload;
      const payloadObj = payload && typeof payload === 'object' && !Array.isArray(payload)
        ? payload as Record<string, unknown>
        : null;
      const payloadOrganizationId = payloadObj && typeof payloadObj.organization_id === 'string'
        ? payloadObj.organization_id
        : null;
      if (payloadOrganizationId) {
        setSelectedOrganizationId(payloadOrganizationId);
      }

      setIsNotificationsOpen(false);
      navigate(resolveNotificationRoute(notification));
    } catch (err) {
      const context = {
        module: 'Navbar',
        operation: 'mark notification as read',
        trigger: 'user' as const,
        error: err,
        ids: {
          notificationId: notification.id,
          profileId: profile?.id ?? null,
        },
      };
      logBackendError(context);
      toast.error(toBackendErrorToastMessage(context));
    } finally {
      setIsNotifBusy(false);
    }
  };

  // If there is no user, don't render the navbar
  if (!user) return null;

  return (
    <nav className="bg-background-light border-b border-background-lighter">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <div className="relative">
              {/* Dashboard + dropdown (click to open). If the user has only 1 org, no dropdown shown */}
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  className="flex items-center text-gray-300 hover:text-white transition-colors"
                  onClick={() => { setIsDashboardOpen(false); navigate('/dashboard'); }}
                >
                  <Home className="w-5 h-5 mr-2" />
                  <span className="font-medium">Dashboard</span>
                </button>

                {profile?.id && myOrgs.length > 1 && (
                  <button
                    ref={dashboardToggleRef}
                    onClick={() => setIsDashboardOpen((s) => !s)}
                    type="button"
                    className="text-gray-300 hover:text-white transition-colors"
                    aria-haspopup="menu"
                    aria-controls="dashboard-menu"
                    aria-expanded="false"
                    title="Open dashboard organization filter"
                    aria-label="Open dashboard organization filter"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dashboard dropdown: show only when user has more than one org */}
              {isDashboardOpen && profile?.id && myOrgs.length > 1 && (
                <div id="dashboard-menu" role="menu" ref={dashboardMenuRef} className="absolute left-0 mt-2 w-56 bg-background-lighter rounded shadow-lg z-50">
                  <button
                    role="menuitem"
                    type="button"
                    className={`w-full text-left px-4 py-2 text-sm ${validatedSelectedOrganizationId === null ? 'text-white bg-background' : 'text-gray-300 hover:bg-background'}`}
                    onClick={() => { setSelectedOrganizationId(null); setIsDashboardOpen(false); }}
                  >
                    All organizations
                  </button>
                  <div className="divide-y divide-background">
                    {myOrgs.map((o) => (
                      <button
                        key={o.id}
                        role="menuitem"
                        type="button"
                        className={`w-full text-left px-4 py-2 text-sm ${validatedSelectedOrganizationId === o.id ? 'text-white bg-background' : 'text-gray-300 hover:bg-background'}`}
                        onClick={() => { setSelectedOrganizationId(o.id); setIsDashboardOpen(false); }}
                      >
                        {o.name}{o.roleLabel ? ` — ${o.roleLabel}` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Organization menu (click to open) */}
            <div className="relative ml-4">
              <button
                ref={orgToggleRef}
                onClick={() => setIsOrgMenuOpen((s) => !s)}
                type="button"
                className="flex items-center text-gray-300 hover:text-white transition-colors"
                aria-haspopup="menu"
                aria-controls="org-menu"
                aria-expanded="false"
                disabled={isOrgSwitching}
              >
                <Building2 className="w-5 h-5 mr-2" />
                <span className="font-medium">{isOrgSwitching ? 'Switching…' : 'Organization'}</span>
              </button>

              {isOrgMenuOpen && profile?.id && (
                <div id="org-menu" role="menu" ref={orgMenuRef} className="absolute left-0 mt-2 w-56 bg-background-lighter rounded shadow-lg z-50">
                  <div className="py-1">
                    {myOrgsLoading ? (
                      <div className="px-4 py-2 text-sm text-gray-400">Loading…</div>
                    ) : myOrgs.length === 0 ? (
                      <button
                        role="menuitem"
                        type="button"
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-background"
                        onClick={() => { setIsOrgMenuOpen(false); navigate('/organizations/onboarding'); }}
                      >
                        No organizations — create one
                      </button>
                    ) : (
                      myOrgs.map((o) => (
                        <Link
                          role="menuitem"
                          key={o.id}
                          to="/organizations"
                          className={`block w-full text-left px-4 py-2 text-sm ${isOrgSwitching ? 'text-gray-500 cursor-not-allowed pointer-events-none' : 'text-gray-300 hover:bg-background'}`}
                          aria-disabled={isOrgSwitching}
                          onClick={(event) => {
                            if (isOrgSwitching) {
                              event.preventDefault();
                              return;
                            }
                            setIsOrgMenuOpen(false);
                            void handleSelectOrganization(o.id);
                          }}
                        >
                          {o.name}{o.roleLabel ? ` — ${o.roleLabel}` : ''}
                        </Link>
                      ))
                    )}
                  </div>

                  <div className="border-t border-background p-1">
                    <Link
                      role="menuitem"
                      to="/organizations/onboarding"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-background"
                      onClick={() => { setIsOrgMenuOpen(false); }}
                    >
                      + Add Organization
                    </Link>
                    <Link
                      role="menuitem"
                      to="/organizations/onboarding?mode=rejoin"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-background"
                      onClick={() => { setIsOrgMenuOpen(false); }}
                    >
                      ↺ Rejoin Organization
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={notificationsMenuRef}>
              <button
                ref={notificationsToggleRef}
                type="button"
                aria-label="Notifications"
                aria-haspopup="menu"
                aria-controls="notifications-menu"
                aria-expanded="false"
                title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'}
                onClick={() => setIsNotificationsOpen((s) => !s)}
                className="relative flex items-center text-gray-300 hover:text-white transition-colors"
                disabled={isNotifBusy}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" />
                )}
              </button>

              {isNotificationsOpen && (
                <div id="notifications-menu" role="menu" className="absolute right-0 mt-2 w-80 bg-background-lighter rounded shadow-lg z-50 border border-background">
                  <div className="px-3 py-2 border-b border-background text-sm text-gray-300 font-medium">Notifications</div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-3 py-3 text-sm text-gray-400">No notifications</div>
                    ) : notifications.map((notification) => (
                      <button
                        key={notification.id}
                        role="menuitem"
                        type="button"
                        className={`w-full text-left px-3 py-3 border-b border-background last:border-b-0 hover:bg-background transition-colors ${notification.is_read ? 'text-gray-300' : 'text-white'}`}
                        onClick={() => { void handleNotificationClick(notification); }}
                        disabled={isNotifBusy}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm leading-5">{getNotificationDisplayMessage(notification)}</p>
                          {!notification.is_read && <span className="mt-1 w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                        </div>
                        <p className="mt-1 text-xs text-gray-400">{new Date(getNotificationTimestamp(notification)).toLocaleString()}</p>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-background p-1">
                    <button
                      type="button"
                      role="menuitem"
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-background"
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        navigate('/notifications');
                      }}
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => { void handleLogout(); }} // Trigger logout on button click
              className="flex items-center text-gray-300 hover:text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLogoutBusy}
            >
              <LogOut className="w-5 h-5 mr-2" /> {/* Logout icon */}
              <span className="font-medium">{isLogoutBusy ? 'Signing out…' : 'Sign Out'}</span> {/* Sign Out label */}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}