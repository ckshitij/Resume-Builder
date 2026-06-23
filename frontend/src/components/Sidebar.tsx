import type { ReactNode } from 'react';
import { IconChevronDown } from './Icons';

interface Props {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  badge?: ReactNode;
}

export function CollapsiblePanel({ title, icon, defaultOpen = true, children, badge }: Props) {
  return (
    <details className="collapsible-panel" open={defaultOpen}>
      <summary className="collapsible-summary">
        <span className="collapsible-title">
          {icon && <span className="collapsible-icon">{icon}</span>}
          {title}
        </span>
        {badge}
        <span className="collapsible-chevron">
          <IconChevronDown />
        </span>
      </summary>
      <div className="collapsible-body">{children}</div>
    </details>
  );
}

export function SidebarTabs({
  activeTab,
  onTabChange,
  tabs,
}: {
  activeTab: string;
  onTabChange: (id: string) => void;
  tabs: { id: string; label: string; icon: ReactNode }[];
}) {
  return (
    <nav className="sidebar-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
