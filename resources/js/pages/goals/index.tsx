import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CalendarDays, MinusCircle, MoreHorizontal, Pencil, Plus, PlusCircle, Target, Trash2, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import GoalModal from '@/components/goals/goal-modal';
import GoalFundsModal from '@/components/goals/goal-funds-modal';
import DeleteConfirmModal from '@/components/delete-confirm-modal';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Goals', href: '/goals' },
];

interface GoalItem {
    id: number;
    name: string;
    icon: string;
    color: string;
    target_amount: number;
    current_amount: number;
    remaining: number;
    progress: number;
    deadline: string | null;
    days_remaining: number | null;
    monthly_target: number;
    is_completed: boolean;
    account_id?: number | null;
}

interface Account {
    id: number;
    name: string;
    type: string;
}

interface GoalsProps {
    data: {
        goals: GoalItem[];
        total_target: number;
        total_saved: number;
        overall_progress: number;
    };
    accounts: Account[];
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

function formatDate(dateString: string | null) {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Goals({ 
    data = { goals: [], total_target: 0, total_saved: 0, overall_progress: 0 }, 
    accounts = [] 
}: GoalsProps) {
    const { goals, total_target, total_saved, overall_progress } = data;

    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isFundsModalOpen, setIsFundsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<GoalItem | null>(null);
    const [fundsMode, setFundsMode] = useState<'add' | 'withdraw'>('add');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleAddNew = () => {
        setSelectedGoal(null);
        setIsGoalModalOpen(true);
    };

    const handleEdit = (goal: GoalItem) => {
        setSelectedGoal(goal);
        setIsGoalModalOpen(true);
    };

    const handleAddFunds = (goal: GoalItem) => {
        setSelectedGoal(goal);
        setFundsMode('add');
        setIsFundsModalOpen(true);
    };

    const handleWithdrawFunds = (goal: GoalItem) => {
        setSelectedGoal(goal);
        setFundsMode('withdraw');
        setIsFundsModalOpen(true);
    };

    const handleDeleteClick = (goal: GoalItem) => {
        setSelectedGoal(goal);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!selectedGoal) return;

        setIsDeleting(true);
        router.delete(`/goals/${selectedGoal.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedGoal(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Goals" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Savings Goals</h1>
                        <p className="text-muted-foreground">Track progress towards your financial goals</p>
                    </div>
                    <Button onClick={handleAddNew}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Goal
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Goal Amount</CardDescription>
                            <CardTitle className="text-2xl">{formatCurrency(total_target)}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Saved</CardDescription>
                            <CardTitle className="text-2xl text-green-600">{formatCurrency(total_saved)}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Overall Progress</CardDescription>
                            <CardTitle className="text-2xl text-primary">{Math.round(overall_progress)}%</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Goals Grid */}
                {goals.length === 0 ? (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-lg font-medium">No savings goals yet</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Create your first goal to start tracking your progress.
                                </p>
                                <Button className="mt-4" onClick={handleAddNew}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Goal
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {goals.map((goal) => (
                            <Card key={goal.id} className={`overflow-hidden ${goal.is_completed ? 'border-green-500' : ''}`}>
                                <div className={`h-2 ${goal.color || 'bg-blue-500'}`} />
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{goal.icon}</span>
                                        <div>
                                            <CardTitle className="text-base">{goal.name}</CardTitle>
                                            {goal.deadline && (
                                                <CardDescription className="flex items-center gap-1">
                                                    <CalendarDays className="h-3 w-3" />
                                                    {formatDate(goal.deadline)}
                                                </CardDescription>
                                            )}
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {!goal.is_completed && (
                                                <>
                                                    <DropdownMenuItem onClick={() => handleAddFunds(goal)}>
                                                        <PlusCircle className="mr-2 h-4 w-4 text-green-600" />
                                                        Add Funds
                                                    </DropdownMenuItem>
                                                    {goal.current_amount > 0 && (
                                                        <DropdownMenuItem onClick={() => handleWithdrawFunds(goal)}>
                                                            <MinusCircle className="mr-2 h-4 w-4 text-orange-600" />
                                                            Withdraw Funds
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                </>
                                            )}
                                            <DropdownMenuItem onClick={() => handleEdit(goal)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => handleDeleteClick(goal)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-2xl font-bold">{formatCurrency(goal.current_amount)}</span>
                                            <span className="text-sm text-muted-foreground">of {formatCurrency(goal.target_amount)}</span>
                                        </div>
                                        <div className="h-3 rounded-full bg-secondary">
                                            <div 
                                                className={`h-3 rounded-full ${goal.color || 'bg-blue-500'} transition-all`} 
                                                style={{ width: `${goal.progress}%` }} 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{Math.round(goal.progress)}% complete</span>
                                        {goal.days_remaining !== null && (
                                            <span className={`font-medium ${goal.days_remaining < 30 ? 'text-orange-600' : ''}`}>
                                                {goal.days_remaining > 0 ? `${goal.days_remaining} days left` : 'Deadline passed'}
                                            </span>
                                        )}
                                    </div>

                                    {!goal.is_completed && (
                                        <div className="pt-2 border-t space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Remaining</span>
                                                <span className="font-medium">{formatCurrency(goal.remaining)}</span>
                                            </div>
                                            {goal.monthly_target > 0 && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Monthly target</span>
                                                    <span className="font-medium text-primary flex items-center gap-1">
                                                        <TrendingUp className="h-3 w-3" />
                                                        {formatCurrency(goal.monthly_target)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {goal.is_completed ? (
                                        <div className="flex items-center justify-center gap-2 py-2 rounded-lg bg-green-100 text-green-700">
                                            <span>🎉</span>
                                            <span className="font-medium">Goal Completed!</span>
                                        </div>
                                    ) : (
                                        <Button 
                                            className="w-full bg-green-600 hover:bg-green-700" 
                                            size="sm"
                                            onClick={() => handleAddFunds(goal)}
                                        >
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Add Funds
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Goal Modal */}
            <GoalModal
                isOpen={isGoalModalOpen}
                onClose={() => {
                    setIsGoalModalOpen(false);
                    setSelectedGoal(null);
                }}
                accounts={accounts}
                goal={selectedGoal}
            />

            {/* Funds Modal */}
            <GoalFundsModal
                isOpen={isFundsModalOpen}
                onClose={() => {
                    setIsFundsModalOpen(false);
                    setSelectedGoal(null);
                }}
                mode={fundsMode}
                goal={selectedGoal}
                accounts={accounts}
            />

            {/* Delete Confirmation */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedGoal(null);
                }}
                onConfirm={handleDeleteConfirm}
                processing={isDeleting}
                title="Delete Goal"
                description={`Are you sure you want to delete "${selectedGoal?.name}"? This will also delete all fund allocation history.`}
            />
        </AppLayout>
    );
}