/**
 * AI Research Agent Page
 */
import { Search } from 'lucide-react';
import dynamic from 'next/dynamic';
import ToolPageLayout from '../components/layouts/ToolPageLayout';

const AIResearchAgent = dynamic(() => import('../components/AIResearchAgent'), { ssr: false });

export default function AIResearchPage() {
  return (
    <ToolPageLayout
      title="AI Research Agent"
      subtitle="Deep research with citations"
      icon={Search}
      gradient="from-orange-500 to-red-500"
    >
      <AIResearchAgent />
    </ToolPageLayout>
  );
}
