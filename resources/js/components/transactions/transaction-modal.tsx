import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormEventHandler, useEffect } from 'react';

type TransactionType = 'income' | 'expense';

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

interface Transaction {
    id: number;
    description: string;
    amount: number;
    type: string;
    category: { id: number; name: string } | null;
    account: { id: number; name: string };
    transaction_date: string;
    notes?: string | null;
}

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: TransactionType;
    categories: Category[];
    accounts: Account[];
    transaction?: Transaction | null;
}

export default function TransactionModal({ 
    isOpen, 
    onClose, 
    type,
    categories,
    accounts,
    transaction 
}: TransactionModalProps) {
    const isEditing = !!transaction;
    const isIncome = type === 'income';

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        type: type,
        amount: '',
        description: '',
        account_id: '',
        category_id: '',
        transaction_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    useEffect(() => {
        if (!isOpen) return;

        clearErrors();

        if (transaction) {
            setData({
                type: transaction.type as TransactionType,
                amount: String(transaction.amount),
                description: transaction.description,
                account_id: String(transaction.account.id),
                category_id: transaction.category ? String(transaction.category.id) : '',
                transaction_date: transaction.transaction_date,
                notes: transaction.notes || '',
            });
        } else {
            setData({
                type: type,
                amount: '',
                description: '',
                account_id: accounts.length > 0 ? String(accounts[0].id) : '',
                category_id: '',
                transaction_date: new Date().toISOString().split('T')[0],
                notes: '',
            });
        }
    }, [transaction, isOpen, type]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        };

        if (isEditing && transaction) {
            put(`/transactions/${transaction.id}`, options);
        } else {
            post('/transactions', options);
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
                    <DialogTitle>
                        {isEditing ? 'Edit' : 'Add'} {isIncome ? 'Income' : 'Expense'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing 
                            ? `Update this ${type} transaction.`
                            : `Record a new ${type} transaction.`
                        }
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount (₱)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                            />
                            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                placeholder={isIncome ? "e.g., Salary, Freelance payment" : "e.g., Groceries, Electricity bill"}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="account">Account</Label>
                            <Select 
                                value={data.account_id} 
                                onValueChange={(val) => setData('account_id', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map((account) => (
                                        <SelectItem key={account.id} value={String(account.id)}>
                                            {account.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.account_id && <p className="text-sm text-red-500">{errors.account_id}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select 
                                value={data.category_id} 
                                onValueChange={(val) => setData('category_id', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={String(category.id)}>
                                            {category.icon} {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={data.transaction_date}
                                onChange={(e) => setData('transaction_date', e.target.value)}
                            />
                            {errors.transaction_date && <p className="text-sm text-red-500">{errors.transaction_date}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Add any additional details..."
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={2}
                            />
                            {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className={isIncome ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                        >
                            {processing ? 'Saving...' : isEditing ? 'Update' : `Add ${isIncome ? 'Income' : 'Expense'}`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}