/**
 * Deep Research Page
 */
import { Brain } from 'lucide-react';
import dynamic from 'next/dynamic';
import ToolPageLayout from '../components/layouts/ToolPageLayout';

const DeepResearchPanel = dynamic(() => import('../components/DeepResearchPanel'), { ssr: false });

export default function DeepResearchPage() {
  return (
    <ToolPageLayout
      title="Deep Research"
      subtitle="In-depth analysis & planning"
      icon={Brain}
      gradient="from-indigo-500 to-violet-500"
    >
      <DeepResearchPanel />
    </ToolPageLayout>
  );
}
