import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    ArrowDownLeft, 
    ArrowRight,
    ArrowUpRight, 
    CheckCircle2,
    PiggyBank,
    Plus,
    Target,
    TrendingDown,
    TrendingUp,
    Wallet,
    XCircle
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

interface DashboardProps {
    data: {
        stats: {
            total_balance: number;
            monthly_income: number;
            monthly_expenses: number;
            projected_savings: number;
        };
        monthly_tracker: {
            income: number;
            expenses: number;
            net_savings: number;
            savings_goal: number;
            savings_progress: number;
            is_on_track: boolean;
            shortfall: number;
        };
        recent_transactions: {
            id: number;
            description: string;
            amount: number;
            type: string;
            category: { name: string; icon: string } | null;
            account: { name: string };
            transaction_date: string;
        }[];
        budget_status: {
            id: number;
            category: { id: number; name: string; icon: string; color: string };
            amount: number;
            spent: number;
            remaining: number;
            progress: number;
            is_over_budget: boolean;
        }[];
        savings_goals: {
            id: number;
            name: string;
            icon: string;
            color: string;
            target_amount: number;
            current_amount: number;
            progress: number;
        }[];
        current_month: {
            month: number;
            year: number;
            month_name: string;
        };
    };
    comparison: {
        income: { current: number; previous: number; change: number; trend: string };
        expenses: { current: number; previous: number; change: number; trend: string };
        savings: { current: number; previous: number; change: number; trend: string };
    };
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

function StatCard({ title, value, icon: Icon, trend, trendValue, highlight }: { 
    title: string; value: number; icon: React.ElementType; trend?: 'up' | 'down'; trendValue?: string; highlight?: 'green' | 'red';
}) {
    return (
        <Card className={highlight === 'green' ? 'border-green-500/50 bg-green-500/5' : highlight === 'red' ? 'border-red-500/50 bg-red-500/5' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${highlight === 'green' ? 'text-green-500' : highlight === 'red' ? 'text-red-500' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${highlight === 'green' ? 'text-green-600' : highlight === 'red' ? 'text-red-600' : ''}`}>
                    {formatCurrency(value)}
                </div>
                {trend && trendValue && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        {trend === 'up' ? <TrendingUp className="h-3 w-3 text-green-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
                        <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>{trendValue}</span> from last month
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export default function Dashboard({ 
    data = {
        stats: { total_balance: 0, monthly_income: 0, monthly_expenses: 0, projected_savings: 0 },
        monthly_tracker: { income: 0, expenses: 0, net_savings: 0, savings_goal: 0, savings_progress: 0, is_on_track: true, shortfall: 0 },
        recent_transactions: [],
        budget_status: [],
        savings_goals: [],
        current_month: { month: new Date().getMonth() + 1, year: new Date().getFullYear(), month_name: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }
    }, 
    comparison = {
        income: { current: 0, previous: 0, change: 0, trend: 'up' },
        expenses: { current: 0, previous: 0, change: 0, trend: 'up' },
        savings: { current: 0, previous: 0, change: 0, trend: 'up' }
    }
}: DashboardProps) {
    const { stats, monthly_tracker, recent_transactions, budget_status, savings_goals, current_month } = data;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">Your financial overview for {current_month.month_name}</p>
                    </div>
                    <Button><Plus className="mr-2 h-4 w-4" />Add Transaction</Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard 
                        title="Total Balance" 
                        value={stats.total_balance} 
                        icon={Wallet} 
                        trend={comparison.savings.trend as 'up' | 'down'} 
                        trendValue={`${comparison.savings.change >= 0 ? '+' : ''}${comparison.savings.change.toFixed(1)}%`} 
                    />
                    <StatCard 
                        title="Monthly Income" 
                        value={stats.monthly_income} 
                        icon={ArrowDownLeft} 
                        trend={comparison.income.trend as 'up' | 'down'} 
                        trendValue={`${comparison.income.change >= 0 ? '+' : ''}${comparison.income.change.toFixed(1)}%`} 
                        highlight="green" 
                    />
                    <StatCard 
                        title="Monthly Expenses" 
                        value={stats.monthly_expenses} 
                        icon={ArrowUpRight} 
                        trend={comparison.expenses.trend as 'up' | 'down'} 
                        trendValue={`${comparison.expenses.change >= 0 ? '+' : ''}${comparison.expenses.change.toFixed(1)}%`} 
                        highlight="red" 
                    />
                    <StatCard 
                        title="Projected Savings" 
                        value={stats.projected_savings} 
                        icon={PiggyBank} 
                    />
                </div>

                {/* Monthly Savings Tracker */}
                <Card className={monthly_tracker.is_on_track ? 'border-green-500/50' : 'border-yellow-500/50'}>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {monthly_tracker.is_on_track ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-yellow-500" />
                                )}
                                <CardTitle className="text-lg">Monthly Savings Tracker</CardTitle>
                            </div>
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${monthly_tracker.is_on_track ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {monthly_tracker.is_on_track ? 'On Track! 🎉' : 'Needs Attention'}
                            </span>
                        </div>
                        <CardDescription>
                            {monthly_tracker.is_on_track 
                                ? `Great job! You're on track to save ${formatCurrency(monthly_tracker.net_savings)} this month.`
                                : `You need to reduce expenses by ${formatCurrency(monthly_tracker.shortfall)} to meet your goal.`
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                                <p className="text-xs text-muted-foreground">Income</p>
                                <p className="text-lg font-bold text-green-600">{formatCurrency(monthly_tracker.income)}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                                <p className="text-xs text-muted-foreground">Expenses</p>
                                <p className="text-lg font-bold text-red-600">{formatCurrency(monthly_tracker.expenses)}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${monthly_tracker.net_savings >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                <p className="text-xs text-muted-foreground">Net Savings</p>
                                <p className={`text-lg font-bold ${monthly_tracker.net_savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {formatCurrency(monthly_tracker.net_savings)}
                                </p>
                            </div>
                        </div>

                        {monthly_tracker.savings_goal > 0 && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Progress to monthly savings goal</span>
                                    <span className="font-medium">{Math.min(Math.round(monthly_tracker.savings_progress), 100)}% of {formatCurrency(monthly_tracker.savings_goal)}</span>
                                </div>
                                <div className="h-3 rounded-full bg-secondary overflow-hidden">
                                    <div 
                                        className={`h-3 rounded-full transition-all ${monthly_tracker.savings_progress >= 100 ? 'bg-green-500' : monthly_tracker.savings_progress >= 70 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                                        style={{ width: `${Math.min(monthly_tracker.savings_progress, 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Savings Goals Preview */}
                {savings_goals.length > 0 && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Savings Goals
                                </CardTitle>
                                <CardDescription>Your top savings goals</CardDescription>
                            </div>
                            <Button size="sm" variant="outline" asChild>
                                <Link href="/goals">
                                    View All
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {savings_goals.map((goal) => (
                                    <div key={goal.id} className="p-4 rounded-lg border space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{goal.icon}</span>
                                            <span className="font-medium">{goal.name}</span>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-bold">{formatCurrency(goal.current_amount)}</span>
                                                <span className="text-muted-foreground">{goal.progress}%</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-secondary">
                                                <div className={`h-2 rounded-full ${goal.color}`} style={{ width: `${goal.progress}%` }} />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">of {formatCurrency(goal.target_amount)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Activity & Budget */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>Your latest activity</CardDescription>
                            </div>
                            <Button size="sm" variant="outline" asChild>
                                <Link href="/expenses">View All</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recent_transactions.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
                            ) : (
                                recent_transactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {tx.type === 'income' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{tx.description}</p>
                                                <p className="text-xs text-muted-foreground">{tx.category?.name || 'Uncategorized'}</p>
                                            </div>
                                        </div>
                                        <span className={`text-sm font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                                        </span>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Budget Status</CardTitle>
                                <CardDescription>This month's spending</CardDescription>
                            </div>
                            <Button size="sm" variant="outline" asChild>
                                <Link href="/budgets">Manage</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {budget_status.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No budgets set</p>
                            ) : (
                                budget_status.slice(0, 4).map((b) => (
                                    <div key={b.id} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>{b.category.icon} {b.category.name}</span>
                                            <span className="text-muted-foreground">{formatCurrency(b.spent)} / {formatCurrency(b.amount)}</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-secondary">
                                            <div className={`h-2 rounded-full ${b.is_over_budget ? 'bg-red-500' : b.progress > 80 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(b.progress, 100)}%` }} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}