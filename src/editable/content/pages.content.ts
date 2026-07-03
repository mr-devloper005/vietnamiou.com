import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const pagesContent = {
  home: {
    metadata: {
      title: 'Classifieds, listings, and profiles in one place',
      description: 'Explore fresh listings, local profiles, and discoverable posts through a playful directory-style experience.',
      openGraphTitle: 'Classifieds, listings, and profiles in one place',
      openGraphDescription: 'Browse listings, profiles, visuals, and resources through a stronger directory-style design.',
      keywords: ['classified listings', 'business directory', 'profile discovery', 'local search'],
    },
    hero: {
      badge: 'Directory spotlight',
      title: ['Find what matters in one', 'brighter local directory.'],
      description: 'Browse active listings, discover standout profiles, and move quickly from search to contact through a warmer, clearer directory experience.',
      primaryCta: { label: 'View all listings', href: '/listing' },
      secondaryCta: { label: 'Browse listings', href: '/listing' },
      searchPlaceholder: "What's in your mind?",
      focusLabel: 'Focus',
      featureCardBadge: 'featured listing',
      featureCardTitle: 'A spotlight layout that keeps fresh posts visible first.',
      featureCardDescription: 'Recent content, category shelves, and easy contact paths stay in view without changing any data plumbing.',
    },
    intro: {
      badge: 'About the platform',
      title: 'A public-facing directory with an easier rhythm.',
      paragraphs: [
        'This site brings together listing-style browsing, profile visibility, and image-led discovery in one consistent experience.',
        'Visitors can move naturally between category rails, profile cards, and detail pages without losing their place.',
        'The layout keeps search, contact, and comparison cues close at hand so discovery feels quick instead of overwhelming.',
      ],
      sideBadge: 'At a glance',
      sidePoints: [
        'Search-first navigation with clear category links.',
        'Multiple card styles for better visual variety.',
        'Directory-friendly archive pages with stronger metadata.',
        'Detail pages that keep images, summaries, and contact actions visible.',
      ],
      primaryLink: { label: 'Browse listings', href: '/listing' },
      secondaryLink: { label: 'Contact us', href: '/contact' },
    },
    cta: {
      badge: 'Get discovered',
      title: 'Share your listing or profile with a cleaner public presentation.',
      description: 'Publish listings, update profiles, and keep your details easy to browse across home, archive, and detail views.',
      primaryCta: { label: 'Create listing', href: '/create' },
      secondaryCta: { label: 'Contact us', href: '/contact' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'Browse the newest posts in this section.',
    },
  },
  about: {
    badge: 'About',
    title: 'Built to make discovery feel lighter and easier.',
    description: `${slot4BrandConfig.siteName} brings listings, profiles, and supporting content into one public-facing space with stronger browsing cues and cleaner page structure.`,
    paragraphs: [
      'The experience focuses on faster scanning, clearer categories, and smoother movement between overview pages and detail pages.',
      'Whether someone starts with a category shelf, a profile card, or a direct search, they can keep exploring without friction.',
    ],
    values: [
      {
        title: 'Search-first browsing',
        description: 'Important actions stay visible so visitors can move from discovery to contact more quickly.',
      },
      {
        title: 'Visual variety',
        description: 'Different card types create hierarchy and keep large listing collections easier to read.',
      },
      {
        title: 'Public-ready structure',
        description: 'The copy and layouts stay general, polished, and suitable for a real public website.',
      },
    ],
  },
  contact: {
    eyebrow: `Contact ${slot4BrandConfig.siteName}`,
    title: 'A cleaner way to reach the team behind the directory.',
    description: 'Use the contact page for listing help, profile questions, or general support about what you want to publish or update.',
    formTitle: 'Send a message',
  },
  search: {
    metadata: {
      title: 'Search',
      description: 'Search posts, listings, profiles, and categories across the site.',
    },
    hero: {
      badge: 'Search the directory',
      title: 'Find listings, profiles, and useful posts faster.',
      description: 'Use keywords and categories to move through every active section of the site from one search surface.',
      placeholder: 'Search by keyword, category, title, or name',
    },
    resultsTitle: 'Search results',
  },
  create: {
    metadata: {
      title: 'Create',
      description: 'Create and submit new content for the site.',
    },
    locked: {
      badge: 'Creator access',
      title: 'Login to create a new listing or profile.',
      description: 'Use your account to open the submission workspace and prepare content for the active sections of the site.',
    },
    hero: {
      badge: 'Submission workspace',
      title: 'Create content for every active section.',
      description: 'Choose the content type, add your details, and prepare a polished public-facing post with the fields already supported by the site.',
    },
    formTitle: 'Content details',
    submitLabel: 'Submit content',
    successTitle: 'Content submitted successfully.',
  },
  auth: {
    login: {
      metadataDescription: 'Login page for this site.',
      badge: 'Member access',
      title: 'Welcome back to your dashboard.',
      description: 'Login to manage submissions, browse your account, and create new content.',
      formTitle: 'Login',
      submitLabel: 'Continue',
      noAccount: 'No account matched these details. Create an account first, then login.',
      success: 'Login successful. Redirecting...',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: 'Signup page for this site.',
      badge: 'Create access',
      title: 'Create your account and start publishing.',
      description: 'Create an account to manage listings, save profile details, and submit content through the site.',
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created successfully. Redirecting...',
      loginCta: 'Login',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Related articles',
      fallbackTitle: 'Article details',
    },
    listing: {
      relatedTitle: 'Related listings',
      fallbackTitle: 'Listing details',
    },
    image: {
      relatedTitle: 'Related visuals',
      fallbackTitle: 'Image details',
    },
    profile: {
      relatedTitle: 'Suggested profiles',
      fallbackDescription: 'Profile details will appear here once available.',
      visitButton: 'Visit Official Site',
    },
  },
} as const
