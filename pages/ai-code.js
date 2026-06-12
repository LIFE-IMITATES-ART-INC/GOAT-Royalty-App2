/**
 * AI Code Generator Page
 */
import { Code } from 'lucide-react';
import dynamic from 'next/dynamic';
import ToolPageLayout from '../components/layouts/ToolPageLayout';

const AICodeGenerator = dynamic(() => import('../components/AICodeGenerator'), { ssr: false });

export default function AICodePage() {
  return (
    <ToolPageLayout
      title="AI Code Generator"
      subtitle="Write, debug & refactor code"
      icon={Code}
      gradient="from-green-500 to-emerald-500"
    >
      <AICodeGenerator />
    </ToolPageLayout>
  );
}
