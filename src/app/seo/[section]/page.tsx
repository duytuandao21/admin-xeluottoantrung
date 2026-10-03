import { notFound } from 'next/navigation';
import SeoManager from '@/components/SeoManager';
import { seoSections } from '@/lib/seo';
export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const item = seoSections[(await params).section];
  if (!item) notFound();
  return <SeoManager initialRoute={item.route} />;
}
