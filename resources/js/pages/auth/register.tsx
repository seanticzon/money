import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

export default function Register() {
    return (
        <>
            <Head title="Register" />
            <div className="grid min-h-screen lg:grid-cols-2">
                {/* Left Side - Branding */}
                <div className="hidden lg:flex flex-col justify-center items-center bg-primary text-primary-foreground p-12">
                    <div className="flex flex-col items-center gap-6 max-w-md text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur">
                            <DollarSign className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold tracking-tight">Money</h1>
                            <p className="text-lg text-primary-foreground/80">
                                Start your journey to financial freedom. Track spending, set budgets, and reach your goals.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Register Form */}
                <div className="flex flex-col justify-center items-center p-6 sm:p-12 bg-background">
                    {/* Mobile Logo */}
                    <div className="flex lg:hidden items-center gap-2 mb-8">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <span className="text-2xl font-bold">Money</span>
                    </div>

                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Create an account</CardTitle>
                            <CardDescription>
                                Enter your details below to get started
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form
                                {...store.form()}
                                resetOnSuccess={['password', 'password_confirmation']}
                                disableWhileProcessing
                                className="flex flex-col gap-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="name"
                                                    name="name"
                                                    placeholder="Full name"
                                                />
                                                <InputError message={errors.name} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="email">Email address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="email"
                                                    name="email"
                                                    placeholder="email@example.com"
                                                />
                                                <InputError message={errors.email} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="password">Password</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    required
                                                    tabIndex={3}
                                                    autoComplete="new-password"
                                                    name="password"
                                                    placeholder="Password"
                                                />
                                                <InputError message={errors.password} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="password_confirmation">
                                                    Confirm password
                                                </Label>
                                                <Input
                                                    id="password_confirmation"
                                                    type="password"
                                                    required
                                                    tabIndex={4}
                                                    autoComplete="new-password"
                                                    name="password_confirmation"
                                                    placeholder="Confirm password"
                                                />
                                                <InputError message={errors.password_confirmation} />
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full mt-2"
                                                tabIndex={5}
                                            >
                                                {processing && <Spinner className="mr-2" />}
                                                Create account
                                            </Button>
                                        </div>

                                        <div className="text-center text-sm text-muted-foreground">
                                            Already have an account?{' '}
                                            <TextLink href={login()} tabIndex={6}>
                                                Log in
                                            </TextLink>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}