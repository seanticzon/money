import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn, isSameUrl, resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import {
    LayoutDashboard,
    ArrowUpRight,
    ArrowDownLeft,
    Wallet,
    PieChart,
    Target,
} from 'lucide-react';

// You'll need to create these routes in Laravel and generate with Wayfinder
// For now, using static paths - replace with your route functions
const sidebarNavItems: NavItem[] = [
    {
        title: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Expenses',
        href: '/expenses',
        icon: ArrowUpRight,
    },
    {
        title: 'Income',
        href: '/income',
        icon: ArrowDownLeft,
    },
    {
        title: 'Accounts',
        href: '/accounts',
        icon: Wallet,
    },
    {
        title: 'Budgets',
        href: '/budgets',
        icon: PieChart,
    },
    {
        title: 'Goals',
        href: '/goals',
        icon: Target,
    },
];

interface FinanceLayoutProps extends PropsWithChildren {
    title?: string;
    description?: string;
}

export default function FinanceLayout({ 
    children, 
    title = 'Finance',
    description = 'Manage your money'
}: FinanceLayoutProps) {
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <div className="px-4 py-6">
            <Heading title={title} description={description} />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-52">
                    <nav className="flex flex-col space-y-1">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${resolveUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start gap-2', {
                                    'bg-muted': isSameUrl(currentPath, item.href),
                                })}
                            >
                                <Link href={resolveUrl(item.href)}>
                                    {item.icon && <item.icon className="h-4 w-4" />}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1">
                    <section className="space-y-6">{children}</section>
                </div>
            </div>
        </div>
    );
}