import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormEventHandler, useEffect } from 'react';

interface Account {
    id: number;
    name: string;
    type: string;
}

interface GoalItem {
    id: number;
    name: string;
    icon: string;
    current_amount: number;
    target_amount: number;
    remaining: number;
}

interface GoalFundsModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'add' | 'withdraw';
    goal: GoalItem | null;
    accounts: Account[];
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

export default function GoalFundsModal({ isOpen, onClose, mode, goal, accounts }: GoalFundsModalProps) {
    const isAdding = mode === 'add';

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        amount: '',
        account_id: '',
        notes: '',
        allocation_date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (!isOpen) return;

        clearErrors();
        setData({
            amount: '',
            account_id: accounts.length > 0 ? String(accounts[0].id) : '',
            notes: '',
            allocation_date: new Date().toISOString().split('T')[0],
        });
    }, [isOpen, mode]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!goal) return;

        const endpoint = isAdding 
            ? `/goals/${goal.id}/add-funds`
            : `/goals/${goal.id}/withdraw-funds`;

        post(endpoint, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    if (!goal) return null;

    const maxWithdraw = goal.current_amount;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isAdding ? 'Add Funds' : 'Withdraw Funds'}
                    </DialogTitle>
                    <DialogDescription>
                        {isAdding 
                            ? `Add money towards "${goal.name}"`
                            : `Withdraw money from "${goal.name}"`
                        }
                    </DialogDescription>
                </DialogHeader>

                {/* Goal Info */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <span className="text-3xl">{goal.icon}</span>
                    <div className="flex-1">
                        <p className="font-medium">{goal.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)}
                        </p>
                    </div>
                    {isAdding && (
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">Remaining</p>
                            <p className="font-semibold text-primary">{formatCurrency(goal.remaining)}</p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount (₱)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={!isAdding ? maxWithdraw : undefined}
                                placeholder="0.00"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                            />
                            {!isAdding && (
                                <p className="text-xs text-muted-foreground">
                                    Maximum: {formatCurrency(maxWithdraw)}
                                </p>
                            )}
                            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                        </div>

                        {accounts.length > 0 && (
                            <div className="grid gap-2">
                                <Label htmlFor="account">
                                    {isAdding ? 'From Account' : 'To Account'}
                                </Label>
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
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={data.allocation_date}
                                onChange={(e) => setData('allocation_date', e.target.value)}
                            />
                            {errors.allocation_date && <p className="text-sm text-red-500">{errors.allocation_date}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Add a note..."
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
                            className={isAdding ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
                        >
                            {processing ? 'Processing...' : isAdding ? 'Add Funds' : 'Withdraw'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}