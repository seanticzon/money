import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowUpRight, Plus, Search, ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ExpenseModal from '@/components/expenses/expense-modal';
import DeleteConfirmModal from '@/components/delete-confirm-modal';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Expenses', href: '/expenses' },
];

interface Transaction {
    id: number;
    description: string;
    amount: number;
    type: string;
    account_id: number;
    category_id: number;
    category: { id: number; name: string; icon: string } | null;
    account: { id: number; name: string };
    transaction_date: string;
    notes: string | null;
}

interface Category {
    id: number;
    name: string;
    icon: string;
    color: string;
}

interface Account {
    id: number;
    name: string;
    type: string;
}

interface ExpensesProps {
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: Category[];
    accounts: Account[];
    summary: {
        income: number;
        expenses: number;
        net: number;
    };
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

export default function Expenses({ 
    transactions = { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 }, 
    categories = [], 
    accounts = [], 
    summary = { income: 0, expenses: 0, net: 0 }, 
    filters = { month: new Date().getMonth() + 1, year: new Date().getFullYear() } 
}: ExpensesProps) {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Transaction | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleMonthChange = (month: string) => {
        router.get('/expenses', { month, year: filters.year }, { preserveState: true });
    };

    const handleYearChange = (year: string) => {
        router.get('/expenses', { month: filters.month, year }, { preserveState: true });
    };

    const handleAddNew = () => {
        setSelectedExpense(null);
        setIsModalOpen(true);
    };

    const handleEdit = (expense: Transaction) => {
        setSelectedExpense(expense);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (expense: Transaction) => {
        setSelectedExpense(expense);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!selectedExpense) return;
        
        setIsDeleting(true);
        router.delete(`/transactions/${selectedExpense.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedExpense(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const filteredTransactions = transactions.data.filter(tx =>
        tx.description.toLowerCase().includes(search.toLowerCase())
    );

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => currentYear + 1 - i);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Expenses" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
                        <p className="text-muted-foreground">Track and manage your spending</p>
                    </div>
                    <Button onClick={handleAddNew}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Expense
                    </Button>
                </div>

                {/* Summary Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Expenses for {months[filters.month - 1]?.label} {filters.year}</CardDescription>
                        <CardTitle className="text-3xl text-red-600">{formatCurrency(summary.expenses)}</CardTitle>
                    </CardHeader>
                </Card>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="flex gap-2 flex-1 max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder="Search expenses..." 
                                className="pl-9" 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
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
                    </div>
                </div>

                {/* No Accounts Warning */}
                {accounts.length === 0 && (
                    <Card className="border-yellow-500/50 bg-yellow-500/5">
                        <CardContent className="py-4">
                            <p className="text-sm text-yellow-600">
                                You need to create an account first before adding expenses.{' '}
                                <a href="/accounts" className="underline font-medium">Go to Accounts →</a>
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* No Categories Warning */}
                {categories.length === 0 && (
                    <Card className="border-yellow-500/50 bg-yellow-500/5">
                        <CardContent className="py-4">
                            <p className="text-sm text-yellow-600">
                                No expense categories found. Please run the database seeder or create categories.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Expenses List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Expenses</CardTitle>
                        <CardDescription>
                            {transactions.total} expense{transactions.total !== 1 ? 's' : ''} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredTransactions.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                {transactions.total === 0 
                                    ? 'No expenses yet. Add your first expense!' 
                                    : 'No expenses match your search.'}
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {filteredTransactions.map((expense) => (
                                    <div 
                                        key={expense.id} 
                                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                                                <ArrowUpRight className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{expense.description}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {expense.category?.icon} {expense.category?.name || 'Uncategorized'} • {expense.account.name} • {expense.transaction_date}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-semibold text-red-600">
                                                -{formatCurrency(expense.amount)}
                                            </span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(expense)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => handleDeleteClick(expense)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {transactions.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Page {transactions.current_page} of {transactions.last_page}
                                </p>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        disabled={transactions.current_page === 1}
                                        onClick={() => router.get('/expenses', { 
                                            page: transactions.current_page - 1,
                                            month: filters.month,
                                            year: filters.year 
                                        })}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        disabled={transactions.current_page === transactions.last_page}
                                        onClick={() => router.get('/expenses', { 
                                            page: transactions.current_page + 1,
                                            month: filters.month,
                                            year: filters.year 
                                        })}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add/Edit Modal */}
            <ExpenseModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedExpense(null);
                }}
                categories={categories}
                accounts={accounts}
                expense={selectedExpense}
            />

            {/* Delete Confirmation */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedExpense(null);
                }}
                onConfirm={handleDeleteConfirm}
                processing={isDeleting}
                title="Delete Expense"
                description={`Are you sure you want to delete "${selectedExpense?.description}"? This will also update your account balance.`}
            />
        </AppLayout>
    );
}