import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CreditCard, Landmark, MoreHorizontal, Pencil, Plus, Trash2, Wallet, Banknote } from 'lucide-react';
import { useState } from 'react';
import AccountModal from '@/components/accounts/account-modal';
import DeleteConfirmModal from '@/components/delete-confirm-modal';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Accounts', href: '/accounts' },
];

interface Account {
    id: number;
    name: string;
    type: 'bank' | 'ewallet' | 'cash' | 'credit_card';
    balance: number;
    icon: string | null;
    color: string | null;
    is_active: boolean;
}

interface AccountsProps {
    data: {
        accounts: Account[];
        total_assets: number;
        total_liabilities: number;
        net_worth: number;
    };
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

const typeIcons = {
    bank: Landmark,
    ewallet: Wallet,
    cash: Banknote,
    credit_card: CreditCard,
};

const typeLabels = {
    bank: 'Bank Account',
    ewallet: 'E-Wallet',
    cash: 'Cash',
    credit_card: 'Credit Card',
};

const defaultColors: Record<string, string> = {
    bank: 'bg-blue-500',
    ewallet: 'bg-emerald-500',
    cash: 'bg-green-500',
    credit_card: 'bg-red-500',
};

export default function Accounts({ 
    data = { accounts: [], total_assets: 0, total_liabilities: 0, net_worth: 0 } 
}: AccountsProps) {
    const { accounts, total_assets, total_liabilities, net_worth } = data;
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleAddNew = () => {
        setSelectedAccount(null);
        setIsModalOpen(true);
    };

    const handleEdit = (account: Account) => {
        setSelectedAccount(account);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (account: Account) => {
        setSelectedAccount(account);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!selectedAccount) return;
        
        setIsDeleting(true);
        router.delete(`/accounts/${selectedAccount.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedAccount(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accounts" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
                        <p className="text-muted-foreground">Manage your bank accounts, cards, and wallets</p>
                    </div>
                    <Button onClick={handleAddNew}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Account
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Assets</CardDescription>
                            <CardTitle className="text-2xl text-green-600">{formatCurrency(total_assets)}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Liabilities</CardDescription>
                            <CardTitle className="text-2xl text-red-600">{formatCurrency(total_liabilities)}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Net Worth</CardDescription>
                            <CardTitle className={`text-2xl ${net_worth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(net_worth)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Accounts Grid */}
                {accounts.length === 0 ? (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <Wallet className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-lg font-medium">No accounts yet</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Add your first account to start tracking your finances.
                                </p>
                                <Button className="mt-4" onClick={handleAddNew}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Account
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {accounts.map((account) => {
                            const IconComponent = typeIcons[account.type] || Wallet;
                            const bgColor = account.color || defaultColors[account.type] || 'bg-gray-500';

                            return (
                                <Card key={account.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${bgColor} text-white`}>
                                                <IconComponent className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">{account.name}</CardTitle>
                                                <CardDescription>{typeLabels[account.type]}</CardDescription>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(account)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => handleDeleteClick(account)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </CardHeader>
                                    <CardContent>
                                        <p className={`text-2xl font-bold ${account.balance < 0 ? 'text-red-600' : ''}`}>
                                            {formatCurrency(account.balance)}
                                        </p>
                                        {account.type === 'credit_card' && account.balance < 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">Amount owed</p>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AccountModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedAccount(null);
                }}
                account={selectedAccount}
            />

            {/* Delete Confirmation */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedAccount(null);
                }}
                onConfirm={handleDeleteConfirm}
                processing={isDeleting}
                title="Delete Account"
                description={`Are you sure you want to delete "${selectedAccount?.name}"? All transactions linked to this account will also be affected.`}
            />
        </AppLayout>
    );
}