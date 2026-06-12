/**
 * Shared Tool Page Layout
 * Reusable layout for AI tool pages with consistent header styling.
 * Eliminates duplicated header/layout code across tool pages.
 */

import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';

/**
 * @param {Object} props
 * @param {string} props.title - Page title (shown in tab and header)
 * @param {string} [props.subtitle] - Subtitle text below the title
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {string} props.gradient - Tailwind gradient classes (e.g., 'from-blue-500 to-cyan-500')
 * @param {string} [props.backUrl] - URL to navigate back to (default: '/ai-tools')
 * @param {React.ReactNode} props.children - Page content
 */
export default function ToolPageLayout({ title, subtitle, icon: Icon, gradient, backUrl = '/ai-tools', children }) {
  const router = useRouter();

  return (
    <>
      <Head><title>{title} | Super GOAT Royalty App</title></Head>
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <header className="flex items-center justify-between px-4 py-2 bg-black/50 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(backUrl)} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-none">{title}</h1>
                {subtitle && <p className="text-[9px] text-gray-500">{subtitle}</p>}
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </>
  );
}
