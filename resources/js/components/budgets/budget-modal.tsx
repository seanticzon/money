import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormEventHandler, useEffect } from 'react';

interface Category {
    id: number;
    name: string;
    icon: string;
    color: string;
}

interface BudgetItem {
    id: number;
    category: Category;
    amount: number;
}

interface BudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    existingBudgetCategoryIds: number[];
    budget?: BudgetItem | null;
    month: number;
    year: number;
}

export default function BudgetModal({ 
    isOpen, 
    onClose, 
    categories,
    existingBudgetCategoryIds,
    budget,
    month,
    year
}: BudgetModalProps) {
    const isEditing = !!budget;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        category_id: '',
        amount: '',
        month: month,
        year: year,
    });

    // Filter out categories that already have budgets (except current one being edited)
    const availableCategories = categories.filter(cat => 
        !existingBudgetCategoryIds.includes(cat.id) || cat.id === budget?.category.id
    );

    useEffect(() => {
        if (!isOpen) return;

        clearErrors();

        if (budget) {
            setData({
                category_id: String(budget.category.id),
                amount: String(budget.amount),
                month: month,
                year: year,
            });
        } else {
            setData({
                category_id: availableCategories.length > 0 ? String(availableCategories[0].id) : '',
                amount: '',
                month: month,
                year: year,
            });
        }
    }, [budget, isOpen, month, year]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        };

        if (isEditing && budget) {
            put(`/budgets/${budget.id}`, options);
        } else {
            post('/budgets', options);
        }
    };

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Budget' : 'Create Budget'}</DialogTitle>
                    <DialogDescription>
                        {isEditing 
                            ? 'Update your budget amount for this category.'
                            : 'Set a spending limit for a category this month.'
                        }
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select 
                                value={data.category_id} 
                                onValueChange={(val) => setData('category_id', val)}
                                disabled={isEditing}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableCategories.map((category) => (
                                        <SelectItem key={category.id} value={String(category.id)}>
                                            {category.icon} {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {availableCategories.length === 0 && !isEditing && (
                                <p className="text-sm text-muted-foreground">
                                    All categories have budgets. Edit existing ones or add new categories.
                                </p>
                            )}
                            {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="amount">Budget Amount (₱)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Set the maximum amount you want to spend in this category.
                            </p>
                            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing || (availableCategories.length === 0 && !isEditing)}
                        >
                            {processing ? 'Saving...' : isEditing ? 'Update' : 'Create Budget'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}