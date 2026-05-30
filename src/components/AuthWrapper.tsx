import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#09090b] text-zinc-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl border-2 border-zinc-800 border-t-purple-500 animate-spin" />
          <span className="text-xs font-medium tracking-widest text-zinc-500 uppercase animate-pulse">Loading engine...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#09090b] relative overflow-hidden font-sans text-zinc-100">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center brightness-[0.25] mix-blend-luminosity opacity-40" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/[0.04] blur-[120px] rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/[0.03] blur-[120px] rounded-full -ml-32 -mb-32" />
        
        <Card className="w-[380px] z-10 shadow-2xl relative bg-[#09090b]/80 backdrop-blur-md border border-zinc-800/80 rounded-2xl space-y-4 p-4">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-black/50">
              <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-250 to-indigo-500">S</span>
            </div>
            <CardTitle className="text-2xl font-black tracking-tight text-white">Susun<span className="text-purple-400">Ai</span></CardTitle>
            <CardDescription className="text-zinc-500 font-semibold text-xs uppercase tracking-wide">The Student Scheduling Core</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button className="w-full text-xs py-5 rounded-xl font-black uppercase tracking-widest bg-white text-zinc-950 hover:bg-zinc-200 hover:text-zinc-900 transition-all border border-transparent shadow-md cursor-pointer" onClick={handleSignIn}>
              Continue with Google
            </Button>
            <p className="text-[10px] text-center text-zinc-500 mt-6 max-w-xs mx-auto leading-relaxed uppercase tracking-wider font-semibold">
              Secure authentication via Google Cloud Services.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
