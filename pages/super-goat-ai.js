import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const SuperGoatAIHub = dynamic(() => import('../components/SuperGoatAIHub'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white">Loading Super GOAT AI Hub...</p>
      </div>
    </div>
  )
});

export default function SuperGoatAIPage() {
  return (
    <>
      <Head>
        <title>Super GOAT AI Hub | GOAT Royalty App</title>
        <meta name="description" content="Access 215+ NVIDIA NGC AI models with Super GOAT AI Hub" />
      </Head>
      <SuperGoatAIHub />
    </>
  );
}