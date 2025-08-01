'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  CalendarClock,
  FileText,
  Settings,
} from 'lucide-react';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import type { User } from '@/lib/types';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'Obras', icon: Building2 },
  { href: '/dashboard/team', label: 'Equipe', icon: Users },
  { href: '/dashboard/finance', label: 'Financeiro', icon: DollarSign },
  { href: '/dashboard/schedule', label: 'Cronograma', icon: CalendarClock },
  { href: '/dashboard/reports', label: 'Relatórios', icon: FileText },
  { href: '/dashboard/settings', label: 'Configurações', icon: Settings, requiredRole: 'Administrator' },
];

export function MainNav({ user }: { user: User | null }) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        if (item.requiredRole && user?.role !== item.requiredRole) {
          return null;
        }

        const isActive = pathname === item.href;
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href}>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={{ children: item.label }}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
