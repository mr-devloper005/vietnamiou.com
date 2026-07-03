import type { TaskKey } from '@/lib/site-config'

export type TaskPageVoice = {
  eyebrow: string
  headline: string
  description: string
  filterLabel: string
  secondaryNote: string
  chips: string[]
}

export const taskPageVoices = {
  article: {
    eyebrow: 'Reading room',
    headline: 'Editorial posts with a clearer browse-and-read rhythm.',
    description: 'Article pages balance strong headlines, visual summaries, and supporting rails so longer reading still feels connected to the directory.',
    filterLabel: 'Choose article topic',
    secondaryNote: 'Long-form content should still feel easy to scan before the reader commits.',
    chips: ['Feature reads', 'Fresh stories', 'Searchable archive'],
  },
  classified: {
    eyebrow: 'Notice board',
    headline: 'Quick-scanning classifieds with stronger action cues.',
    description: 'Classified pages foreground price, availability, and fast contact paths while keeping the browsing rhythm tidy.',
    filterLabel: 'Filter classified category',
    secondaryNote: 'Readers should understand the offer quickly and know where to click next.',
    chips: ['Fast scan', 'Offers', 'Direct contact'],
  },
  sbm: {
    eyebrow: 'Saved links',
    headline: 'Useful resources arranged like a curated collection.',
    description: 'Bookmark pages work best when they feel ordered, practical, and easy to revisit.',
    filterLabel: 'Filter collection',
    secondaryNote: 'Useful resource pages need calm structure and clear destination cues.',
    chips: ['Collections', 'Useful links', 'Reference shelf'],
  },
  profile: {
    eyebrow: 'People and brands',
    headline: 'Profiles with identity, trust cues, and quick summaries.',
    description: 'Profile pages should help visitors understand who they are looking at before diving into longer details.',
    filterLabel: 'Filter profile category',
    secondaryNote: 'Identity-first layouts work best when image, role, and actions stay nearby.',
    chips: ['Identity first', 'Trust cues', 'Easy contact'],
  },
  pdf: {
    eyebrow: 'Document room',
    headline: 'PDFs and files presented like a clean public library.',
    description: 'Document pages should feel organized and easy to use, with file access and preview paths kept obvious.',
    filterLabel: 'Filter document type',
    secondaryNote: 'A useful file archive should look dependable, not hidden.',
    chips: ['Files', 'Guides', 'Preview ready'],
  },
  listing: {
    eyebrow: 'Business directory',
    headline: 'Listings designed for browsing, comparison, and contact.',
    description: 'Directory pages should help people search, compare, and move toward action without losing context.',
    filterLabel: 'Filter business category',
    secondaryNote: 'Business browsing needs faster metadata scanning than a normal article feed.',
    chips: ['Directory', 'Compare', 'Contact-ready'],
  },
  image: {
    eyebrow: 'Visual gallery',
    headline: 'Image posts with a stronger discovery-led layout.',
    description: 'Visual pages put media first while still preserving category context and quick access to related posts.',
    filterLabel: 'Filter visual category',
    secondaryNote: 'Let imagery do the heavy lifting, then support it with tidy metadata.',
    chips: ['Gallery', 'Visual-first', 'Discovery'],
  },
} satisfies Record<TaskKey, TaskPageVoice>
