import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Pencil, PiggyBank, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import BudgetModal from '@/components/budgets/budget-modal';
import DeleteConfirmModal from '@/components/delete-confirm-modal';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Budgets', href: '/budgets' },
];

interface BudgetItem {
    id: number;
    category: {
        id: number;
        name: string;
        icon: string;
        color: string;
    };
    amount: number;
    spent: number;
    remaining: number;
    progress: number;
    is_over_budget: boolean;
}

interface Category {
    id: number;
    name: string;
    icon: string;
    color: string;
}

interface BudgetsProps {
    data: {
        budgets: BudgetItem[];
        total_budget: number;
        total_spent: number;
        total_remaining: number;
        overall_progress: number;
    };
    categories: Category[];
    filters: {
        month: number;
        year: number;
    };
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
];

export default function Budgets({ 
    data = { budgets: [], total_budget: 0, total_spent: 0, total_remaining: 0, overall_progress: 0 }, 
    categories = [], 
    filters = { month: new Date().getMonth() + 1, year: new Date().getFullYear() } 
}: BudgetsProps) {
    const { budgets, total_budget, total_spent, total_remaining, overall_progress } = data;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<BudgetItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCopying, setIsCopying] = useState(false);

    const handleMonthChange = (month: string) => {
        router.get('/budgets', { month, year: filters.year }, { preserveState: true });
    };

    const handleYearChange = (year: string) => {
        router.get('/budgets', { month: filters.month, year }, { preserveState: true });
    };

    const handleAddNew = () => {
        setSelectedBudget(null);
        setIsModalOpen(true);
    };

    const handleEdit = (budget: BudgetItem) => {
        setSelectedBudget(budget);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (budget: BudgetItem) => {
        setSelectedBudget(budget);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!selectedBudget) return;

        setIsDeleting(true);
        router.delete(`/budgets/${selectedBudget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedBudget(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const handleCopyToNextMonth = () => {
        setIsCopying(true);
        router.post('/budgets/copy-to-next-month', 
            { month: filters.month, year: filters.year },
            {
                preserveScroll: true,
                onFinish: () => setIsCopying(false),
            }
        );
    };

    const existingBudgetCategoryIds = budgets.map(b => b.category.id);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => currentYear + 1 - i);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Budgets" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
                        <p className="text-muted-foreground">Set and track your monthly spending limits</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Select value={String(filters.month)} onValueChange={handleMonthChange}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((m) => (
                                    <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={String(filters.year)} onValueChange={handleYearChange}>
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((y) => (
                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {budgets.length > 0 && (
                            <Button 
                                variant="outline" 
                                onClick={handleCopyToNextMonth}
                                disabled={isCopying}
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                {isCopying ? 'Copying...' : 'Copy to Next Month'}
                            </Button>
                        )}
                        <Button onClick={handleAddNew}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Budget
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Budget</CardDescription>
                            <CardTitle className="text-2xl">{formatCurrency(total_budget)}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Spent</CardDescription>
                            <CardTitle className="text-2xl text-orange-600">{formatCurrency(total_spent)}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Remaining</CardDescription>
                            <CardTitle className={`text-2xl ${total_remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(total_remaining)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Overall Progress */}
                {budgets.length > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Overall Budget Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-4 rounded-full bg-secondary">
                                <div 
                                    className={`h-4 rounded-full transition-all ${overall_progress > 100 ? 'bg-red-500' : overall_progress > 80 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                    style={{ width: `${Math.min(overall_progress, 100)}%` }} 
                                />
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                {Math.round(overall_progress)}% of total budget used
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Budgets Grid */}
                {budgets.length === 0 ? (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <PiggyBank className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-lg font-medium">No budgets set</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Create your first budget for {months[filters.month - 1]?.label} {filters.year}
                                </p>
                                <Button className="mt-4" onClick={handleAddNew}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Budget
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {budgets.map((budget) => {
                            const isWarning = !budget.is_over_budget && budget.progress > 80;
                            
                            return (
                                <Card key={budget.id}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{budget.category.icon}</span>
                                            <CardTitle className="text-base">{budget.category.name}</CardTitle>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8"
                                                onClick={() => handleEdit(budget)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                                onClick={() => handleDeleteClick(budget)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-lg font-bold ${budget.is_over_budget ? 'text-red-600' : ''}`}>
                                                {formatCurrency(budget.spent)}
                                            </span>
                                            <span className="text-muted-foreground">
                                                of {formatCurrency(budget.amount)}
                                            </span>
                                        </div>
                                        <div className="h-3 rounded-full bg-secondary">
                                            <div 
                                                className={`h-3 rounded-full transition-all ${budget.is_over_budget ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                                style={{ width: `${Math.min(budget.progress, 100)}%` }} 
                                            />
                                        </div>
                                        <p className={`text-sm ${budget.is_over_budget ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                                            {budget.is_over_budget 
                                                ? `${formatCurrency(Math.abs(budget.remaining))} over budget!` 
                                                : `${formatCurrency(budget.remaining)} remaining`
                                            }
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <BudgetModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedBudget(null);
                }}
                categories={categories}
                existingBudgetCategoryIds={existingBudgetCategoryIds}
                budget={selectedBudget}
                month={filters.month}
                year={filters.year}
            />

            {/* Delete Confirmation */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedBudget(null);
                }}
                onConfirm={handleDeleteConfirm}
                processing={isDeleting}
                title="Delete Budget"
                description={`Are you sure you want to delete the budget for "${selectedBudget?.category.name}"?`}
            />
        </AppLayout>
    );
}