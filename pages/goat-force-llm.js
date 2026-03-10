import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const GoatForceLLM = dynamic(() => import('../components/GoatForceLLM'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white">Loading GOAT Force LLM...</p>
      </div>
    </div>
  )
});

export default function GoatForceLLMPage() {
  return (
    <>
      <Head>
        <title>GOAT Force LLM | GOAT Royalty App</title>
        <meta name="description" content="NVIDIA NIM-Powered Music Industry AI Assistant" />
      </Head>
      <GoatForceLLM />
    </>
  );
}