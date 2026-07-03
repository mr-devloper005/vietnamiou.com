import Link from 'next/link'
import {
  ArrowRight, Building2, ChevronRight, Eye, FileText, Heart, Image as ImageIcon, MapPin,
  Megaphone, MessageCircle, Search, Star, Tag, UserRound,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, postHref } from '@/editable/cards/PostCards'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'
const hiddenDirectTasks = new Set<TaskKey>(['classified', 'profile'])

const taskIcon: Record<TaskKey, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: Megaphone,
  image: ImageIcon,
  sbm: FileText,
  pdf: FileText,
  profile: UserRound,
}

function getContent(post?: SitePost | null) {
  return post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
}

function getExcerpt(post?: SitePost | null, limit = 130) {
  const content = getContent(post)
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!clean) return 'Open the detail page for images, highlights, and contact information.'
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

function categoryOf(post?: SitePost | null) {
  const content = getContent(post)
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Featured'
}

function locationOf(post?: SitePost | null) {
  const content = getContent(post)
  return ['location', 'address', 'city']
    .map((key) => content[key])
    .find((value): value is string => typeof value === 'string' && Boolean(value.trim())) || 'Browse details'
}

function priceOf(post?: SitePost | null) {
  const content = getContent(post)
  return ['price', 'amount', 'budget']
    .map((key) => content[key])
    .find((value): value is string => typeof value === 'string' && Boolean(value.trim())) || 'Click To Contact'
}

function hashStr(value: string) {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

function ratingOf(post: SitePost) {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  const h = hashStr(post.slug || post.id || post.title || 'x')
  return Math.round((3.8 + (h % 11) / 10) * 10) / 10
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

function chunkPosts(posts: SitePost[], size: number) {
  const chunks: SitePost[][] = []
  for (let i = 0; i < posts.length; i += size) chunks.push(posts.slice(i, i + size))
  return chunks
}

function shelfTitle(section: SitePost[], index: number) {
  const leadCategory = categoryOf(section[0])
  if (leadCategory && leadCategory !== 'Featured') return leadCategory
  const fallback = ['Featured Collections', 'Popular Now', 'Fresh Picks', 'Latest Discoveries', 'Recommended Posts']
  return fallback[index] || `Collection ${index + 1}`
}

function ViewAllPill({ href }: { href: string }) {
  return (
    <div className="mb-6 text-center">
      <Link href={href} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--editable-cta-bg)] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-white transition hover:-translate-y-0.5 hover:brightness-95">
        <Eye className="h-4 w-4" /> View all
      </Link>
    </div>
  )
}

function SectionHeading({ title }: { title: string }) {
  return <h2 className="editable-display text-center text-[2.3rem] font-bold text-[var(--slot4-accent)] sm:text-[2.7rem]">{title}</h2>
}

function FeaturedSpotlightCard({ post, href }: { post: SitePost; href: string }) {
  const image = getEditablePostImage(post)
  return (
    <Link href={href} className="group block overflow-hidden rounded-[1.6rem] bg-[var(--slot4-accent)] text-white directory-card-shadow-strong">
      <div className="relative grid min-h-[420px] md:grid-cols-[0.9fr_1.1fr]">
        <div className="relative z-10 flex flex-col justify-between p-6 sm:p-8">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-white/18 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white">
              {categoryOf(post)}
            </span>
            <h3 className="editable-display text-3xl font-bold leading-[1.02] sm:text-[2.5rem]">{post.title}</h3>
            <p className="max-w-md text-sm leading-7 text-white/78">{getExcerpt(post, 180)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/72">
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--slot4-accent)]" /> {locationOf(post)}</span>
            <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 fill-[var(--slot4-accent)] text-[var(--slot4-accent)]" /> {ratingOf(post).toFixed(1)}</span>
          </div>
        </div>
        <div className="relative min-h-[250px] overflow-hidden md:min-h-full">
          <img src={image} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,49,69,0.05),rgba(24,49,69,0.55))]" />
          <div className="absolute bottom-5 left-5 right-5 rounded-[1.25rem] border border-white/15 bg-black/38 p-4 backdrop-blur-sm">
            <p className="line-clamp-1 text-2xl font-bold text-white">{priceOf(post)}</p>
            <p className="mt-1 text-sm text-white/80">Click to view the full details and contact options.</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

function CompactDirectoryCard({ post, href }: { post: SitePost; href: string }) {
  const image = getEditablePostImage(post)
  return (
    <Link href={href} className="group block min-w-[240px] overflow-hidden rounded-[1.2rem] border border-[var(--editable-border)] bg-white directory-card-shadow">
      <div className="aspect-[4/3] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="p-4">
        <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-soft-muted-text)]">
          <Tag className="h-3.5 w-3.5" /> {categoryOf(post)}
        </p>
        <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent)]">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 92)}</p>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--editable-border)] pt-3">
          <span className="text-sm font-semibold text-[var(--slot4-page-text)]">{priceOf(post)}</span>
          <Heart className="h-4 w-4 text-[var(--slot4-soft-muted-text)]" />
        </div>
      </div>
    </Link>
  )
}

function HorizontalPostCard({ post, href }: { post: SitePost; href: string }) {
  const image = getEditablePostImage(post)
  return (
    <Link href={href} className="group grid min-w-[320px] gap-4 overflow-hidden rounded-[1.3rem] border border-[var(--editable-border)] bg-white p-3 directory-card-shadow sm:min-w-[420px] sm:grid-cols-[170px_minmax(0,1fr)]">
      <div className="overflow-hidden rounded-[1rem] bg-[var(--slot4-media-bg)]">
        <img src={image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="min-w-0 py-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">{categoryOf(post)}</p>
        <h3 className="mt-2 line-clamp-2 text-xl font-bold leading-tight text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent)]">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 118)}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--slot4-muted-text)]">
          <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[var(--slot4-accent)]" /> {locationOf(post)}</span>
          <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4 text-[var(--slot4-accent)]" /> Click To Contact</span>
        </div>
      </div>
    </Link>
  )
}

function EditorialListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group flex items-start gap-4 rounded-[1.2rem] border border-[var(--editable-border)] bg-white px-4 py-5 directory-card-shadow">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-lavender)] text-sm font-extrabold text-[var(--slot4-page-text)]">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--slot4-soft-muted-text)]">{categoryOf(post)}</p>
        <h3 className="mt-2 line-clamp-2 text-xl font-bold leading-tight text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent)]">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 106)}</p>
      </div>
    </Link>
  )
}

function ImageFirstCard({ post, href }: { post: SitePost; href: string }) {
  const image = getEditablePostImage(post)
  return (
    <Link href={href} className="group block min-w-[260px] overflow-hidden rounded-[1.4rem] border border-[var(--editable-border)] bg-white directory-card-shadow">
      <div className="relative aspect-[4/4.6] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={image} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgba(24,49,69,0.82))]" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/72">{categoryOf(post)}</p>
          <h3 className="mt-2 line-clamp-2 text-xl font-bold leading-tight">{post.title}</h3>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <span className="font-semibold text-[var(--slot4-page-text)]">{priceOf(post)}</span>
        <ArrowRight className="h-4 w-4 text-[var(--slot4-accent)]" />
      </div>
    </Link>
  )
}

export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const lead = pool[0]
  const thumbs = pool.slice(1, 4)
  const categories = SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenDirectTasks.has(task.key as TaskKey)).slice(0, 6)

  return (
    <section className="bg-white">
      <div className={`grid gap-10 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start ${container}`}>
        <div className="pt-5 lg:px-4">
          <h1 className="editable-display max-w-xl text-[2.8rem] font-bold leading-[1.05] text-[var(--slot4-page-text)] sm:text-[3.4rem]">
            Find your needs in our <span className="text-[var(--slot4-accent)]">Best Sellers</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-9 text-[var(--slot4-muted-text)]">
            {pagesContent.home.hero.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={primaryRoute} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--editable-cta-bg)] px-6 py-4 text-sm font-extrabold uppercase tracking-[0.08em] text-white transition hover:-translate-y-0.5 hover:brightness-95">
              <Eye className="h-4 w-4" /> View all products
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            {categories.map((task) => {
              const Icon = taskIcon[task.key]
              return (
                <Link key={task.key} href={task.route} className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-warm)] px-4 py-2 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]">
                  <Icon className="h-4 w-4 text-[var(--slot4-accent)]" /> {task.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="pb-4">
          {lead ? <FeaturedSpotlightCard post={lead} href={postHref(primaryTask, lead, primaryRoute)} /> : null}
          {thumbs.length ? (
            <div className="mt-6 grid grid-cols-3 gap-4">
              {thumbs.map((post) => (
                <Link key={post.id || post.slug} href={postHref(primaryTask, post, primaryRoute)} className="overflow-hidden rounded-[1.15rem] border border-[var(--editable-border)] bg-white p-2 directory-card-shadow">
                  <div className="aspect-[5/4] overflow-hidden rounded-[0.9rem] bg-[var(--slot4-media-bg)]">
                    <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover" />
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export function EditableStoryRail({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)]).slice(0, 8)
  if (!pool.length) return null

  return (
    <section className="bg-white">
      <div className={`py-6 ${container}`}>
        <ViewAllPill href={primaryRoute} />
        <div className="directory-stripes mx-auto h-[22px] max-w-5xl rounded-sm border border-[var(--editable-border)]" />
        <div className="mt-10 overflow-x-auto pb-3">
          <div className="flex gap-5">
            {pool.map((post) => (
              <CompactDirectoryCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const chunks = chunkPosts(pool.slice(0, 18), 6).slice(0, 2)
  if (!chunks.length) return null

  return (
    <>
      {chunks.map((group, sectionIndex) => (
        <section key={sectionIndex} className="bg-white">
          <div className={`py-8 ${container}`}>
            <ViewAllPill href={primaryRoute} />
            <SectionHeading title={shelfTitle(group, sectionIndex)} />
            <div className="mt-10 overflow-x-auto pb-4">
              <div className="flex gap-5">
                {group.map((post, index) =>
                  index % 2 === 0 ? (
                    <HorizontalPostCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
                  ) : (
                    <ImageFirstCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  )
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const source = timeSections.length
    ? timeSections.map((section) => section.posts)
    : chunkPosts(dedupePosts(posts).slice(0, 24), 6)
  const groups = source.filter((group) => group.length).slice(0, 3)
  if (!groups.length) return null

  return (
    <>
      {groups.map((group, groupIndex) => (
        <section key={groupIndex} className="bg-white">
          <div className={`py-8 ${container}`}>
            <ViewAllPill href={primaryRoute} />
            <div className="directory-stripes mx-auto h-[22px] max-w-5xl rounded-sm border border-[var(--editable-border)]" />
            <div className="mt-8">
              <SectionHeading title={shelfTitle(group, groupIndex + 2)} />
            </div>

            {groupIndex === 0 ? (
              <div className="mt-10 grid gap-5 lg:grid-cols-2">
                {group.slice(0, 6).map((post, index) => (
                  <EditorialListCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
                ))}
              </div>
            ) : (
              <div className="mt-10 overflow-x-auto pb-4">
                <div className="flex gap-5">
                  {group.slice(0, 6).map((post, index) =>
                    index % 3 === 0 ? (
                      <ImageFirstCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
                    ) : (
                      <CompactDirectoryCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      ))}
    </>
  )
}

export function EditableHomeCta() {
  return (
    <section className="bg-[var(--slot4-warm)]">
      <div className={`py-16 ${container}`}>
        <div className="overflow-hidden rounded-[2rem] border border-[var(--editable-border)] bg-[linear-gradient(135deg,#81A6C6_0%,#AACDDC_100%)] px-6 py-10 text-white directory-card-shadow-strong sm:px-10">
          <div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/72">{pagesContent.home.cta.badge}</p>
              <h2 className="editable-display mt-4 max-w-2xl text-4xl font-bold leading-[1.03] sm:text-5xl">
                {pagesContent.home.cta.title}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-white/82">{pagesContent.home.cta.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={pagesContent.home.cta.primaryCta.href} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--editable-cta-bg)] px-6 py-4 text-sm font-extrabold uppercase tracking-[0.08em] text-white transition hover:-translate-y-0.5 hover:brightness-95">
                  {pagesContent.home.cta.primaryCta.label}
                </Link>
                <Link href={pagesContent.home.cta.secondaryCta.href} className="inline-flex items-center gap-2 rounded-2xl border border-white/35 px-6 py-4 text-sm font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-white/10">
                  {pagesContent.home.cta.secondaryCta.label}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
