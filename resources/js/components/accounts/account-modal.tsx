import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormEventHandler, useEffect } from 'react';

type AccountType = 'bank' | 'ewallet' | 'cash' | 'credit_card';

interface Account {
    id: number;
    name: string;
    type: AccountType;
    balance: number;
    color: string | null;
}

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    account?: Account | null;
}

const accountTypes: { value: AccountType; label: string }[] = [
    { value: 'bank', label: '🏦 Bank Account' },
    { value: 'ewallet', label: '📱 E-Wallet' },
    { value: 'cash', label: '💵 Cash' },
    { value: 'credit_card', label: '💳 Credit Card' },
];

const colorOptions = [
    { value: 'bg-blue-500', label: 'Blue' },
    { value: 'bg-green-500', label: 'Green' },
    { value: 'bg-red-500', label: 'Red' },
    { value: 'bg-purple-500', label: 'Purple' },
    { value: 'bg-orange-500', label: 'Orange' },
    { value: 'bg-pink-500', label: 'Pink' },
    { value: 'bg-cyan-500', label: 'Cyan' },
    { value: 'bg-emerald-500', label: 'Emerald' },
    { value: 'bg-indigo-500', label: 'Indigo' },
    { value: 'bg-yellow-500', label: 'Yellow' },
];

export default function AccountModal({ isOpen, onClose, account }: AccountModalProps) {
    const isEditing = !!account;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: 'bank' as AccountType,
        balance: '',
        color: 'bg-blue-500',
    });

    useEffect(() => {
        if (!isOpen) return;
        
        clearErrors();
        
        if (account) {
            setData({
                name: account.name,
                type: account.type,
                balance: String(account.balance),
                color: account.color || 'bg-blue-500',
            });
        } else {
            setData({
                name: '',
                type: 'bank',
                balance: '',
                color: 'bg-blue-500',
            });
        }
    }, [account, isOpen]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        };

        if (isEditing && account) {
            put(`/accounts/${account.id}`, options);
        } else {
            post('/accounts', options);
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
                    <DialogTitle>{isEditing ? 'Edit Account' : 'Add Account'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update your account details.' : 'Add a new account to track your money.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Account Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., BDO Savings, GCash"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Account Type</Label>
                            <Select 
                                value={data.type} 
                                onValueChange={(val) => setData('type', val as AccountType)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accountTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                        </div>

                        {!isEditing && (
                            <div className="grid gap-2">
                                <Label htmlFor="balance">Initial Balance (₱)</Label>
                                <Input
                                    id="balance"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={data.balance}
                                    onChange={(e) => setData('balance', e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {data.type === 'credit_card' 
                                        ? 'Enter your current balance (negative for amount owed)' 
                                        : 'Enter the current balance in this account'}
                                </p>
                                {errors.balance && <p className="text-sm text-red-500">{errors.balance}</p>}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label>Color</Label>
                            <div className="flex flex-wrap gap-2">
                                {colorOptions.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        className={`h-8 w-8 rounded-full ${color.value} transition-all ${
                                            data.color === color.value 
                                                ? 'ring-2 ring-offset-2 ring-primary scale-110' 
                                                : 'hover:scale-105'
                                        }`}
                                        onClick={() => setData('color', color.value)}
                                        title={color.label}
                                    />
                                ))}
                            </div>
                            {errors.color && <p className="text-sm text-red-500">{errors.color}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : isEditing ? 'Update' : 'Add Account'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}