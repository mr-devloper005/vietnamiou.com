import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const globalContent = {
  site: {
    name: slot4BrandConfig.siteName,
    tagline: slot4BrandConfig.tagline || 'Discover local listings and standout profiles',
    domain: slot4BrandConfig.domain,
    baseUrl: slot4BrandConfig.baseUrl,
  },
  nav: {
    tagline: 'Local directory and profile hub',
    primaryLinks: [
      { label: 'Explore', href: '/' },
      { label: 'Listings', href: '/listing' },
      { label: 'Contact', href: '/contact' },
    ],
    actions: {
      primary: { label: 'List product', href: '/create' },
      secondary: { label: 'Login', href: '/login' },
    },
  },
  footer: {
    tagline: 'Directory discovery with a warmer editorial finish',
    description: 'Browse fresh listings, profiles, and useful posts through a friendlier directory layout built for quick scanning and confident clicks.',
    columns: [
      {
        title: 'Explore',
        links: [
          { label: 'Home', href: '/' },
          { label: 'Listings', href: '/listing' },
        ],
      },
      {
        title: 'Support',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ],
      },
    ],
    bottomNote: 'A clean public-facing space for discovery, browsing, and profile visibility.',
  },
  commonLabels: {
    readMore: 'Read more',
    viewAll: 'View all',
    explore: 'Explore',
    latest: 'Latest',
    related: 'Related',
    published: 'Published',
  },
} as const
