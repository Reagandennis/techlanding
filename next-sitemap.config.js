/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://techgetafrica.com',
  generateRobotsTxt: true, // Enable robots.txt generation
  exclude: [
    '/dashboard/*', 
    '/profile/*',
    '/api/*',
    '/(root)/*', // Exclude route groups from sitemap
    '/server-sitemap.xml'
  ],
  generateIndexSitemap: false,
  
  // Additional paths for better SEO coverage of business verticals
  additionalPaths: async (config) => [
    // Education vertical
    await config.transform(config, '/certifications'),
    await config.transform(config, '/programs'),
    await config.transform(config, '/accreditation'),
    await config.transform(config, '/courses'),
    
    // Recruitment vertical - existing and new paths
    await config.transform(config, '/recruitment'),
    
    // Consulting vertical - existing and new paths
    await config.transform(config, '/consulting'),
    
    // Development vertical - existing and new paths
    await config.transform(config, '/development'),
    
    // Shared pages
    await config.transform(config, '/about'),
    await config.transform(config, '/contact'),
    await config.transform(config, '/partners'),
    await config.transform(config, '/blog'),
  ],
  
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/profile/', '/api/', '/(root)/'],
      },
    ],
    additionalSitemaps: [
      'https://techgetafrica.com/server-sitemap.xml',
    ],
  },
};
