'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';
import {
  LayoutDashboard, Users, HeadphonesIcon, FileCheck, CreditCard, BarChart3,
  Settings, Inbox, BookOpen, MessageSquareReply, Plug, Bot, FileText,
  Megaphone, MessagesSquare, UserPlus, Receipt,
} from 'lucide-react';

interface NavItem { label: string; href: string; icon: React.ElementType }

const navItems: Record<UserRole, NavItem[]> = {
  super_admin: [
    { label: 'Overview',          href: '/admin',           icon: LayoutDashboard },
    { label: 'Clients',           href: '/admin/clients',   icon: Users },
    { label: 'Support Agents',    href: '/admin/agents',    icon: HeadphonesIcon },
    { label: 'Templates',         href: '/admin/templates', icon: FileCheck },
    { label: 'Billing',           href: '/admin/billing',   icon: CreditCard },
    { label: 'Analytics',         href: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings',          href: '/admin/settings',  icon: Settings },
  ],
  support_agent: [
    { label: 'Overview',          href: '/support',                  icon: LayoutDashboard },
    { label: 'Inbox',             href: '/support/inbox',            icon: Inbox },
    { label: 'My Clients',        href: '/support/clients',          icon: Users },
    { label: 'Quick Replies',     href: '/support/quick-replies',    icon: MessageSquareReply },
    { label: 'Knowledge Base',    href: '/support/knowledge-base',   icon: BookOpen },
  ],
  client_owner: [
    { label: 'Overview',          href: '/client',              icon: LayoutDashboard },
    { label: 'Setup',             href: '/client/setup',        icon: Plug },
    { label: 'Automations',       href: '/client/automations',  icon: Bot },
    { label: 'Templates',         href: '/client/templates',    icon: FileText },
    { label: 'Campaigns',         href: '/client/campaigns',    icon: Megaphone },
    { label: 'Conversations',     href: '/client/conversations',icon: MessagesSquare },
    { label: 'My Team',           href: '/client/team',         icon: UserPlus },
    { label: 'Billing',           href: '/client/billing',      icon: Receipt },
  ],
  client_agent: [
    { label: 'Overview',          href: '/client',               icon: LayoutDashboard },
    { label: 'Conversations',     href: '/client/conversations', icon: MessagesSquare },
  ],
};

export function RoleSidebar({ role, collapsed = false }: { role: UserRole; collapsed?: boolean }) {
  const pathname = usePathname();
  const items = navItems[role] || [];

  return (
    <nav className="flex flex-col gap-1.5 flex-1">
      {items.map((item) => {
        // Root-level hrefs (e.g. /admin, /support, /client) must match exactly
        // so they don't stay highlighted when a sub-page is active.
        const isRootHref = /^\/[^/]+$/.test(item.href);
        const isActive = isRootHref
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + '/');

        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={cn(
              'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-300 ease-out',
              collapsed && 'justify-center px-0',
              isActive
                ? 'bg-primary text-primary-foreground shadow-apple-sm scale-[1.02]'
                : 'text-muted-foreground/80 hover:bg-sidebar-accent hover:text-foreground'
            )}
          >
            <item.icon
              className={cn(
                'shrink-0 transition-all duration-300',
                collapsed ? 'h-5 w-5' : 'h-4 w-4',
                isActive ? 'text-primary-foreground' : 'group-hover:scale-110 group-hover:text-primary/70'
              )}
            />
            {!collapsed && (
              <span className="truncate tracking-tight">{item.label}</span>
            )}
            
            {/* Active right glow — refined */}
            {isActive && !collapsed && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/40 animate-pulse" />
            )}
            
            {/* Hover tooltip for collapsed mode could go here, but title prop handles it for now */}
          </Link>
        );
      })}
    </nav>
  );
}
