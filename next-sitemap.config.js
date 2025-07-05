/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://techgetafrica.com',
  generateRobotsTxt: false, // We already have a robots.txt
  exclude: ['/server-sitemap.xml'], // Exclude the server-side sitemap if you have one
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://techgetafrica.com/server-sitemap.xml', // If you have a server-side sitemap
    ],
  },
};
