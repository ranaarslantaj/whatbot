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
    <nav className="flex flex-col gap-0.5 px-2 py-3">
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/' && pathname.startsWith(item.href + '/'));

        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
              collapsed && 'justify-center px-0',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <item.icon
              className={cn(
                'shrink-0 transition-transform duration-150 group-hover:scale-110',
                collapsed ? 'h-5 w-5' : 'h-4 w-4',
                isActive ? 'text-primary-foreground' : ''
              )}
            />
            {!collapsed && <span className="truncate">{item.label}</span>}
            {/* Active left indicator — only shown when not collapsed */}
            {isActive && !collapsed && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/60" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
