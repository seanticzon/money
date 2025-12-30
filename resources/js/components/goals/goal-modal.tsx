import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    color: string;
    target_amount: number;
    current_amount: number;
    deadline: string | null;
    monthly_target: number;
    account_id?: number | null;
}

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    accounts: Account[];
    goal?: GoalItem | null;
}

const iconOptions = [
    { value: '🏠', label: 'House' },
    { value: '🚗', label: 'Car' },
    { value: '✈️', label: 'Travel' },
    { value: '💻', label: 'Tech' },
    { value: '📚', label: 'Education' },
    { value: '💍', label: 'Wedding' },
    { value: '👶', label: 'Baby' },
    { value: '🎯', label: 'General' },
    { value: '💰', label: 'Savings' },
    { value: '🏥', label: 'Health' },
    { value: '🎮', label: 'Gaming' },
    { value: '📱', label: 'Phone' },
];

const colorOptions = [
    { value: 'bg-blue-500', label: 'Blue' },
    { value: 'bg-green-500', label: 'Green' },
    { value: 'bg-purple-500', label: 'Purple' },
    { value: 'bg-orange-500', label: 'Orange' },
    { value: 'bg-pink-500', label: 'Pink' },
    { value: 'bg-cyan-500', label: 'Cyan' },
    { value: 'bg-red-500', label: 'Red' },
    { value: 'bg-yellow-500', label: 'Yellow' },
];

export default function GoalModal({ isOpen, onClose, accounts, goal }: GoalModalProps) {
    const isEditing = !!goal;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        target_amount: '',
        current_amount: '',
        deadline: '',
        monthly_target: '',
        icon: '🎯',
        color: 'bg-blue-500',
        account_id: '',
    });

    useEffect(() => {
        if (!isOpen) return;

        clearErrors();

        if (goal) {
            setData({
                name: goal.name,
                target_amount: String(goal.target_amount),
                current_amount: String(goal.current_amount),
                deadline: goal.deadline || '',
                monthly_target: goal.monthly_target ? String(goal.monthly_target) : '',
                icon: goal.icon || '🎯',
                color: goal.color || 'bg-blue-500',
                account_id: goal.account_id ? String(goal.account_id) : '',
            });
        } else {
            setData({
                name: '',
                target_amount: '',
                current_amount: '0',
                deadline: '',
                monthly_target: '',
                icon: '🎯',
                color: 'bg-blue-500',
                account_id: '',
            });
        }
    }, [goal, isOpen]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        };

        if (isEditing && goal) {
            put(`/goals/${goal.id}`, options);
        } else {
            post('/goals', options);
        }
    };

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update your savings goal.' : 'Set a new financial goal to work towards.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Goal Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Emergency Fund, New Car"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="target_amount">Target Amount (₱)</Label>
                                <Input
                                    id="target_amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    value={data.target_amount}
                                    onChange={(e) => setData('target_amount', e.target.value)}
                                />
                                {errors.target_amount && <p className="text-sm text-red-500">{errors.target_amount}</p>}
                            </div>

                            {!isEditing && (
                                <div className="grid gap-2">
                                    <Label htmlFor="current_amount">Starting Amount (₱)</Label>
                                    <Input
                                        id="current_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={data.current_amount}
                                        onChange={(e) => setData('current_amount', e.target.value)}
                                    />
                                    {errors.current_amount && <p className="text-sm text-red-500">{errors.current_amount}</p>}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="deadline">Target Date (Optional)</Label>
                                <Input
                                    id="deadline"
                                    type="date"
                                    value={data.deadline}
                                    onChange={(e) => setData('deadline', e.target.value)}
                                />
                                {errors.deadline && <p className="text-sm text-red-500">{errors.deadline}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="monthly_target">Monthly Target (₱)</Label>
                                <Input
                                    id="monthly_target"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={data.monthly_target}
                                    onChange={(e) => setData('monthly_target', e.target.value)}
                                />
                                {errors.monthly_target && <p className="text-sm text-red-500">{errors.monthly_target}</p>}
                            </div>
                        </div>

                        {accounts.length > 0 && (
                            <div className="grid gap-2">
                                <Label htmlFor="account">Link to Account (Optional)</Label>
                                <Select 
                                    value={data.account_id || 'none'} 
                                    onValueChange={(val) => setData('account_id', val === 'none' ? '' : val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No linked account</SelectItem>
                                        {accounts.map((account) => (
                                            <SelectItem key={account.id} value={String(account.id)}>
                                                {account.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Icon</Label>
                                <div className="flex flex-wrap gap-2">
                                    {iconOptions.map((icon) => (
                                        <button
                                            key={icon.value}
                                            type="button"
                                            className={`h-10 w-10 rounded-lg border-2 text-xl transition-all ${
                                                data.icon === icon.value 
                                                    ? 'border-primary bg-primary/10 scale-110' 
                                                    : 'border-transparent hover:border-muted-foreground/30'
                                            }`}
                                            onClick={() => setData('icon', icon.value)}
                                            title={icon.label}
                                        >
                                            {icon.value}
                                        </button>
                                    ))}
                                </div>
                            </div>

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
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : isEditing ? 'Update Goal' : 'Create Goal'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}