import { Link, useLocation, useParams } from 'react-router-dom';

type NavItem = {
  label: string;
  href: string;
};

export default function ProjectNav(): JSX.Element | null {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  if (!id) return null;

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: `/projects/${id}` },
    { label: 'PM Workspace', href: `/projects/${id}/management` },
    { label: 'Controls', href: `/projects/${id}/controls` },
    { label: 'Registers', href: `/projects/${id}/registers` },
    { label: 'Production', href: `/projects/${id}/production` },
    { label: 'Settings', href: `/projects/${id}/settings` },
  ];

  return (
    <nav className="rounded-2xl border border-border bg-card p-2 shadow-sm">
      <div className="flex gap-2 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`inline-flex shrink-0 items-center rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isActive ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
