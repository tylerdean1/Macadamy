import { Link, useLocation } from 'react-router-dom';

type ProjectNavItem = {
  label: string;
  href: string;
};

function getProjectId(pathname: string): string | null {
  const match = pathname.match(/^\/projects\/([^/]+)/);
  const projectId = match?.[1];

  if (!projectId || projectId === 'create') {
    return null;
  }

  return projectId;
}

export function ProjectWorkspaceNavbar(): JSX.Element | null {
  const location = useLocation();
  const projectId = getProjectId(location.pathname);

  if (!projectId) {
    return null;
  }

  const items: ProjectNavItem[] = [
    { label: 'Dashboard', href: `/projects/${projectId}` },
    { label: 'PM Workspace', href: `/projects/${projectId}/management` },
    { label: 'Controls', href: `/projects/${projectId}/controls` },
    { label: 'Registers', href: `/projects/${projectId}/registers` },
    { label: 'Production', href: `/projects/${projectId}/production` },
    { label: 'Settings', href: `/projects/${projectId}/settings` },
  ];

  return (
    <div className="border-b border-background-lighter bg-background">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          <span className="mr-2 shrink-0 text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
            Project
          </span>
          {items.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`inline-flex shrink-0 items-center rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-background-light hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
