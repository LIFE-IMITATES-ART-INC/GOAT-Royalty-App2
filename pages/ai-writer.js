/**
 * AI Writer Page
 */
import { PenTool } from 'lucide-react';
import dynamic from 'next/dynamic';
import ToolPageLayout from '../components/layouts/ToolPageLayout';

const AIWriter = dynamic(() => import('../components/AIWriter'), { ssr: false });

export default function AIWriterPage() {
  return (
    <ToolPageLayout
      title="AI Writer"
      subtitle="Professional content creation"
      icon={PenTool}
      gradient="from-blue-500 to-cyan-500"
    >
      <AIWriter />
    </ToolPageLayout>
  );
}
