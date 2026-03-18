'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, ArrowLeft, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

type Plan = 'starter' | 'pro' | 'enterprise';

const plans: { name: Plan; price: number; quota: number; features: string[] }[] = [
  { name: 'starter', price: 49, quota: 1000, features: ['1,000 messages/mo', 'Basic automations', 'Email support', '1 team member'] },
  { name: 'pro', price: 149, quota: 10000, features: ['10,000 messages/mo', 'Advanced automations', 'Priority support', 'Campaigns', '5 team members'] },
  { name: 'enterprise', price: 499, quota: 100000, features: ['100,000 messages/mo', 'Unlimited automations', 'Dedicated support', 'Custom integrations', 'Unlimited team'] },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Account details
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Plan selection
  const [selectedPlan, setSelectedPlan] = useState<Plan>('starter');

  const validateStep1 = () => {
    if (!name.trim()) { toast.error('Enter your name'); return false; }
    if (!businessName.trim()) { toast.error('Enter your business name'); return false; }
    if (!email.trim()) { toast.error('Enter your email'); return false; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
    return true;
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const plan = plans.find((p) => p.name === selectedPlan)!;

      // 1. Create Firebase Auth user
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;

      // 2. Generate API keys
      const apiKey = Array.from(globalThis.crypto.getRandomValues(new Uint8Array(24)))
        .map((b) => b.toString(16).padStart(2, '0')).join('');
      const webhookSecret = Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0')).join('');

      // 3. Create client doc
      const clientRef = doc(db, 'clients', `client_${uid}`);
      await setDoc(clientRef, {
        businessName,
        ownerName: name,
        ownerEmail: email,
        ownerUid: uid,
        plan: selectedPlan,
        planPrice: plan.price,
        status: 'setup',
        whatsappNumber: null,
        whatsappDisplayName: null,
        wabaId: null,
        phoneNumberId: null,
        apiKey,
        webhookSecret,
        storeType: null,
        storeUrl: null,
        storeConnected: false,
        messageQuota: plan.quota,
        messagesUsedThisMonth: 0,
        assignedAgentIds: [],
        createdAt: serverTimestamp(),
        billingDate: serverTimestamp(),
      });

      // 4. Create user doc
      await setDoc(doc(db, 'users', uid), {
        email,
        name,
        role: 'client_owner',
        clientId: clientRef.id,
        assignedClientIds: [],
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        isActive: true,
        avatarUrl: null,
      });

      toast.success('Account created! Redirecting...');
      setTimeout(() => router.push('/client'), 1500);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-emerald-50/30 to-zinc-100 p-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                step > s ? 'bg-primary text-primary-foreground' : step === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && <div className={cn('h-0.5 w-12', step > s ? 'bg-primary' : 'bg-border')} />}
            </div>
          ))}
        </div>

        {/* Step 1: Account Details */}
        {step === 1 && (
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <Image src="/images/logo.png" alt="WhatBot" width={120} height={120} className="mx-auto mb-2 h-[120px] w-[120px] object-contain" />
              <CardTitle className="text-xl">Create your account</CardTitle>
              <CardDescription>Start automating your WhatsApp business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Your Name</Label>
                  <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input placeholder="My Business" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="you@business.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button className="w-full" onClick={() => validateStep1() && setStep(2)}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account? <Link href="/login" className="font-medium text-emerald-600 hover:underline">Sign in</Link>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Choose Plan */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Choose your plan</h2>
              <p className="text-muted-foreground">Select the plan that fits your business needs</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={cn('cursor-pointer transition-all hover:shadow-md',
                    selectedPlan === plan.name ? 'border-2 border-emerald-600 shadow-md' : ''
                  )}
                  onClick={() => setSelectedPlan(plan.name)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">{plan.name}</CardTitle>
                      {plan.name === 'pro' && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Popular</span>
                      )}
                    </div>
                    <div>
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/mo</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-600" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)}>
                Continue with {selectedPlan} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm & Create */}
        {step === 3 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Confirm your details</CardTitle>
              <CardDescription>Review and create your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Business</span>
                  <span className="font-medium">{businessName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{email}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-3">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium capitalize">{selectedPlan} — ${plans.find((p) => p.name === selectedPlan)?.price}/mo</span>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <p>After creating your account, you'll be taken to the setup wizard to connect your WhatsApp Business number and configure your store integration.</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button className="flex-1" onClick={handleSignup} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
