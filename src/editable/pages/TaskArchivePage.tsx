import Link from 'next/link'
import { ArrowUpRight, BriefcaseBusiness, ChevronDown, Download, FileText, Globe, Heart, MapPin, Phone, Search, Star, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo) || asText(content.avatar)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const getSummary = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body)) || 'Open this post to view full details and available contact information.'
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const archiveAdSlot: Record<TaskKey, 'header' | 'sidebar' | 'in-feed' | 'article-bottom' | 'footer'> = {
  article: 'header',
  listing: 'in-feed',
  profile: 'sidebar',
  classified: 'footer',
  image: 'in-feed',
  sbm: 'header',
  pdf: 'article-bottom',
}

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({
  task,
  posts,
  pagination,
  category,
  basePath,
}: {
  task: TaskKey
  posts: SitePost[]
  pagination: SiteFeedPagination
  category: string
  basePath: string
}) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const spotlight = posts[0]
  const rail = posts.slice(1, 7)
  const grid = posts.slice(7)

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <header className="bg-white">
          <div className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] bg-[linear-gradient(135deg,#81A6C6_0%,#AACDDC_100%)] p-6 text-white shadow-[0_24px_54px_rgba(24,49,69,0.16)] sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-white/72">
                <span>{theme.kicker}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-white/45" />
                <span>{voice.eyebrow}</span>
              </div>
              <div className="mt-5 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
                <div>
                  <h1 className="editable-display max-w-3xl text-[2.7rem] font-bold leading-[1.03] sm:text-[3.3rem]">{voice.headline || `Browse ${label}`}</h1>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-white/82">{voice.description || theme.note}</p>
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {(voice.chips || []).map((chip) => (
                      <span key={chip} className="rounded-full border border-white/18 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/78">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                <form action={basePath} className="grid gap-3 rounded-[1.5rem] bg-white p-3 directory-search-shadow sm:grid-cols-[minmax(0,1fr)_220px_120px]">
                  <div className="flex items-center gap-3 rounded-[1.1rem] px-3 py-2">
                    <Search className="h-5 w-5 text-[var(--tk-muted)]" />
                    <input name="q" disabled placeholder="Browse this section" className="w-full bg-transparent text-sm font-medium text-[var(--tk-text)] outline-none placeholder:text-[var(--tk-muted)]" />
                  </div>
                  <div className="relative">
                    <select
                      name="category"
                      defaultValue={category}
                      className="h-full min-h-[52px] w-full appearance-none rounded-[1.1rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] pl-4 pr-10 text-sm font-semibold text-[var(--tk-text)] outline-none"
                      aria-label={voice.filterLabel || 'Filter category'}
                    >
                      <option value="all">All categories</option>
                      {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                  </div>
                  <button className="rounded-[1.1rem] bg-[var(--editable-cta-bg)] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-white transition hover:brightness-95">
                    Apply
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-6 grid gap-4 rounded-[1.5rem] bg-white p-5 directory-card-shadow sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tk-muted)]">Category</p>
                <p className="mt-2 text-lg font-bold text-[var(--tk-text)]">{categoryLabel}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tk-muted)]">Available posts</p>
                <p className="mt-2 text-lg font-bold text-[var(--tk-text)]">{posts.length}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tk-muted)]">Page</p>
                <p className="mt-2 text-lg font-bold text-[var(--tk-text)]">{page} of {pagination.totalPages || 1}</p>
              </div>
            </div>
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot={archiveAdSlot[task]} showLabel eager className="mx-auto w-full" />
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
          {spotlight ? (
            <Link href={`${basePath}/${spotlight.slug}` || buildPostUrl(task, spotlight.slug)} className="group block overflow-hidden rounded-[1.9rem] bg-[var(--tk-surface)] shadow-[0_24px_54px_rgba(24,49,69,0.12)]">
              <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--tk-accent)]">Featured {label}</p>
                  <h2 className="editable-display mt-4 text-[2.2rem] font-bold leading-[1.03] text-[var(--tk-text)] sm:text-[2.9rem]">{spotlight.title}</h2>
                  <p className="mt-4 max-w-xl text-base leading-8 text-[var(--tk-muted)]">{getSummary(spotlight)}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <span className="rounded-full bg-[var(--tk-accent-soft)] px-4 py-2 text-sm font-bold text-[var(--tk-accent)]">{getField(spotlight, ['price', 'amount', 'budget']) || 'Click To Contact'}</span>
                    <span className="rounded-full border border-[var(--tk-line)] px-4 py-2 text-sm font-semibold text-[var(--tk-muted)]">{getCategory(spotlight, label)}</span>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-[var(--tk-accent)]">Open details <ArrowUpRight className="h-4 w-4" /></span>
                </div>
                <div className="relative min-h-[320px] overflow-hidden bg-[var(--tk-raised)]">
                  <img src={getImage(spotlight)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
              </div>
            </Link>
          ) : null}

          {rail.length ? (
            <div className="mt-10">
              <div className="mb-6 text-center">
                <Link href={basePath} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--editable-cta-bg)] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-white transition hover:-translate-y-0.5 hover:brightness-95">
                  View all
                </Link>
              </div>
              <div className="directory-stripes mx-auto h-[22px] max-w-5xl rounded-sm border border-[var(--editable-border)]" />
              <h2 className="editable-display text-center text-[2.3rem] font-bold text-[var(--slot4-accent)] sm:text-[2.7rem]">{label}</h2>
              <div className="mt-8 overflow-x-auto pb-3">
                <div className="flex gap-5">
                  {rail.map((post, index) => (
                    <ArchiveRailCard key={post.id || post.slug} post={post} href={`${basePath}/${post.slug}` || buildPostUrl(task, post.slug)} task={task} index={index} />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {grid.length ? (
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {grid.map((post, index) => (
                <ArchiveGridCard key={post.id || post.slug} post={post} href={`${basePath}/${post.slug}` || buildPostUrl(task, post.slug)} task={task} index={index} />
              ))}
            </div>
          ) : null}

          {!posts.length ? (
            <div className="mx-auto max-w-xl rounded-[1.8rem] border border-dashed border-[var(--tk-line)] bg-white px-8 py-16 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-5 text-3xl font-bold text-[var(--tk-text)]">Nothing here yet</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--tk-muted)]">Try another category, or check back after new {label.toLowerCase()} are published.</p>
            </div>
          ) : null}

          {posts.length ? (
            <nav className="mt-14 flex flex-wrap items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="rounded-2xl border border-[var(--tk-line)] bg-white px-5 py-3 font-bold uppercase tracking-[0.08em] text-[var(--tk-text)] transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]">Previous</Link> : null}
              <span className="rounded-2xl bg-white px-5 py-3 font-bold uppercase tracking-[0.08em] text-[var(--tk-muted)] directory-card-shadow">Page {page} of {pagination.totalPages || 1}</span>
              {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="rounded-2xl border border-[var(--tk-line)] bg-white px-5 py-3 font-bold uppercase tracking-[0.08em] text-[var(--tk-text)] transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]">Next</Link> : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}
const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.8 + (hashStr(post.slug || post.id || post.title || 'x') % 11) / 10) * 10) / 10
}

function RatingLine({ post }: { post: SitePost }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-4 w-4 ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
    </div>
  )
}

function ArchiveRailCard({ post, href, task, index }: { post: SitePost; href: string; task: TaskKey; index: number }) {
  const image = getImage(post)
  if (task === 'profile') {
    return (
      <Link href={href} className="group flex min-w-[260px] flex-col items-center rounded-[1.4rem] border border-[var(--tk-line)] bg-white p-6 text-center directory-card-shadow">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[var(--tk-raised)]">
          {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-[var(--tk-muted)]" />}
        </div>
        <h3 className="mt-4 line-clamp-2 text-xl font-bold text-[var(--tk-text)] group-hover:text-[var(--tk-accent)]">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
      </Link>
    )
  }

  return (
    <Link href={href} className="group block min-w-[255px] overflow-hidden rounded-[1.4rem] border border-[var(--tk-line)] bg-white directory-card-shadow">
      <div className="aspect-[4/3] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tk-muted)]">No. {String(index + 1).padStart(2, '0')}</p>
        <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-[var(--tk-text)] group-hover:text-[var(--tk-accent)]">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
      </div>
    </Link>
  )
}

function ArchiveGridCard({ post, href, task, index }: { post: SitePost; href: string; task: TaskKey; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, task)
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  const price = getField(post, ['price', 'amount', 'budget'])

  if (index % 4 === 0 && task !== 'pdf') {
    return (
      <Link href={href} className="group overflow-hidden rounded-[1.6rem] border border-[var(--tk-line)] bg-white directory-card-shadow">
        <div className="grid gap-0 sm:grid-cols-[180px_minmax(0,1fr)]">
          <div className="overflow-hidden bg-[var(--tk-raised)]">
            <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
          </div>
          <div className="p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{category}</p>
            <h3 className="mt-2 line-clamp-2 text-2xl font-bold leading-tight text-[var(--tk-text)] group-hover:text-[var(--tk-accent)]">{post.title}</h3>
            <RatingLine post={post} />
            <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-[var(--tk-muted)]">
              {location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {location}</span> : null}
              {phone ? <span className="inline-flex items-center gap-1.5"><Phone className="h-4 w-4 text-[var(--tk-accent)]" /> {phone}</span> : null}
              {website ? <span className="inline-flex items-center gap-1.5"><Globe className="h-4 w-4 text-[var(--tk-accent)]" /> Website</span> : null}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  if (task === 'pdf') {
    return (
      <Link href={href} className="group rounded-[1.6rem] border border-[var(--tk-line)] bg-white p-6 directory-card-shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.1rem] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
            <FileText className="h-7 w-7" />
          </div>
          <Download className="h-5 w-5 text-[var(--tk-muted)] transition group-hover:text-[var(--tk-accent)]" />
        </div>
        <h3 className="mt-5 line-clamp-2 text-2xl font-bold leading-tight text-[var(--tk-text)] group-hover:text-[var(--tk-accent)]">{post.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      </Link>
    )
  }

  return (
    <Link href={href} className="group rounded-[1.6rem] border border-[var(--tk-line)] bg-white p-5 directory-card-shadow">
      <div className="aspect-[4/3] overflow-hidden rounded-[1.2rem] bg-[var(--tk-raised)]">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tk-muted)]">{category}</p>
        <Heart className="h-4 w-4 text-[var(--tk-muted)]" />
      </div>
      <h3 className="mt-2 line-clamp-2 text-xl font-bold leading-tight text-[var(--tk-text)] group-hover:text-[var(--tk-accent)]">{post.title}</h3>
      <RatingLine post={post} />
      <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <div className="mt-4 flex items-center justify-between border-t border-[var(--tk-line)] pt-3">
        <span className="text-sm font-semibold text-[var(--tk-text)]">{price || 'Click To Contact'}</span>
        <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)]" />
      </div>
    </Link>
  )
}
