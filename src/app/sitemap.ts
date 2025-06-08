import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://techgetafrica.com';
  
  // Core pages
  const routes = [
    '',
    '/about',
    '/contact',
    '/register',
    '/eligibility-check',
    '/partners/join',
    '/apply',
    '/community-tour',
    '/partners',
    '/programs',
    '/resources',
    '/blog',
    '/blog/category/tech',
    '/blog/category/education',
    '/blog/category/career',
    '/blog/category/innovation',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
} 