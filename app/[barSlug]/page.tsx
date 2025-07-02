'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BarPageProps {
  params: Promise<{
    barSlug: string;
  }>;
}

export default function BarPage({ params }: BarPageProps) {
  const router = useRouter();

  useEffect(() => {
    const redirectToMainApp = async () => {
      const { barSlug } = await params;
      
      // Store the bar context in localStorage so it persists across page refreshes
      localStorage.setItem('selectedBar', barSlug);
      
      // Redirect to the main app
      router.replace('/');
    };

    redirectToMainApp();
  }, [params, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}