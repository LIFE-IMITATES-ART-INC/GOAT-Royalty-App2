/**
 * AI Image Studio Page
 */
import { Image } from 'lucide-react';
import dynamic from 'next/dynamic';
import ToolPageLayout from '../components/layouts/ToolPageLayout';

const AIImageStudio = dynamic(() => import('../components/AIImageStudio'), { ssr: false });

export default function AIImageStudioPage() {
  return (
    <ToolPageLayout
      title="AI Image Studio"
      subtitle="Generate & edit images with AI"
      icon={Image}
      gradient="from-purple-500 to-pink-500"
    >
      <AIImageStudio />
    </ToolPageLayout>
  );
}
