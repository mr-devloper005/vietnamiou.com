import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, ArrowUpRight, Bookmark, Building2, Camera, CheckCircle2, Download, ExternalLink,
  FileText, Globe2, Mail, MapPin, Phone, Star, Tag, UserRound,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3
const hiddenDirectTasks = new Set<TaskKey>(['classified', 'profile'])
const detailAdSlot: Record<TaskKey, 'header' | 'sidebar' | 'in-feed' | 'article-bottom' | 'footer'> = {
  article: 'article-bottom',
  listing: 'sidebar',
  profile: 'footer',
  classified: 'in-feed',
  image: 'sidebar',
  sbm: 'header',
  pdf: 'footer',
}

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
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
const reviewsOf = (post: SitePost) => {
  const real = Number(getContent(post).reviewCount ?? getContent(post).reviews)
  if (real > 0) return Math.floor(real)
  return 6 + (hashStr((post.slug || post.title || 'x') + 'r') % 480)
}

function DetailMeta({ post, category, center = false }: { post: SitePost; category?: string; center?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-[18px] w-[18px] ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">{reviewsOf(post)} reviews</span>
      {category ? (
        <>
          <span className="h-1 w-1 rounded-full bg-[var(--tk-muted)] opacity-50" />
          <span className="text-sm text-[var(--tk-muted)]">{category}</span>
        </>
      ) : null}
    </div>
  )
}

function Kicker({ task, children }: { task: TaskKey; children: React.ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--tk-accent)]">
      <span>{theme.kicker}</span>
      <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-50" />
      <span className="text-[var(--tk-muted)]">{children}</span>
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  if (hiddenDirectTasks.has(task)) return null
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--tk-muted)] transition hover:text-[var(--tk-text)] directory-card-shadow">
      <ArrowLeft className="h-4 w-4" /> Back to {taskConfig?.label || 'posts'}
    </Link>
  )
}

function DetailHero({
  task,
  post,
  images,
  category,
  summary,
  aside,
}: {
  task: TaskKey
  post: SitePost
  images: string[]
  category: string
  summary?: string
  aside?: React.ReactNode
}) {
  const hero = images[0] || '/placeholder.svg?height=900&width=1400'
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
      <BackLink task={task} />
      <div className="mt-6 overflow-hidden rounded-[2rem] bg-white directory-card-shadow-strong">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <Kicker task={task}>{category}</Kicker>
            <h1 className="editable-display mt-4 text-[2.5rem] font-bold leading-[1.03] text-[var(--tk-text)] sm:text-[3.2rem]">{post.title}</h1>
            <DetailMeta post={post} category={category} />
            {summary ? <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--tk-muted)]">{summary}</p> : null}
            {aside ? <div className="mt-7">{aside}</div> : null}
          </div>
          <div className="relative min-h-[320px] overflow-hidden bg-[var(--tk-raised)]">
            <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  )
}

function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  return (
    <>
      <DetailHero task="article" post={post} images={images} category={categoryOf(post, 'Article')} summary={leadText(post)} />
      <article className="mx-auto max-w-[var(--editable-container)] px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[1.8rem] bg-white p-6 directory-card-shadow sm:p-8">
            <BodyContent post={post} />
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot={detailAdSlot.article} showLabel eager className="mx-auto w-full" />
            </div>
            <EditableArticleComments slug={post.slug} comments={comments} />
          </div>
          <aside className="space-y-6">
            <RelatedPanel task="article" post={post} related={related} />
          </aside>
        </div>
      </article>
    </>
  )
}

function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <>
      <DetailHero
        task="listing"
        post={post}
        images={images}
        category={categoryOf(post, 'Listing')}
        summary={leadText(post)}
        aside={<ContactAction website={website} phone={phone} email={email} bare />}
      />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="space-y-8">
            <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />
            <CardPanel><BodyContent post={post} /></CardPanel>
            <ImageStrip images={images.slice(1)} label="Showcase gallery" />
          </article>
          <aside className="space-y-6">
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot={detailAdSlot.listing} showLabel eager className="mx-auto w-full" />
            </div>
            {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
            <ContactAction website={website} phone={phone} email={email} />
            <RelatedPanel task="listing" post={post} related={related} />
          </aside>
        </div>
      </section>
    </>
  )
}

function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <DetailHero
        task="classified"
        post={post}
        images={images}
        category={categoryOf(post, 'Classified')}
        summary={leadText(post)}
        aside={
          <div className="flex flex-wrap gap-3">
            {price ? <span className="rounded-full bg-[var(--tk-accent-soft)] px-4 py-2 text-sm font-bold text-[var(--tk-accent)]">{price}</span> : null}
            {condition ? <span className="rounded-full border border-[var(--tk-line)] px-4 py-2 text-sm font-semibold text-[var(--tk-muted)]">{condition}</span> : null}
            {location ? <span className="rounded-full border border-[var(--tk-line)] px-4 py-2 text-sm font-semibold text-[var(--tk-muted)]">{location}</span> : null}
          </div>
        }
      />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="space-y-8">
            <ImageStrip images={images} label="Offer images" large />
            <CardPanel><BodyContent post={post} /></CardPanel>
          </article>
          <aside className="space-y-6">
            <ContactAction website={website} phone={phone} email={email} />
            <RelatedPanel task="classified" post={post} related={related} />
          </aside>
        </div>
      </section>
    </>
  )
}

function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <DetailHero task="image" post={post} images={gallery} category={categoryOf(post, 'Visual')} summary={leadText(post)} />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-[1.6rem] bg-white p-3 directory-card-shadow">
                <img src={image} alt="" className="w-full rounded-[1.2rem] object-cover" />
              </figure>
            ))}
          </div>
          <aside className="space-y-6">
            <CardPanel>
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent-soft)] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--tk-accent)]">
                <Camera className="h-3.5 w-3.5" /> Image story
              </div>
              <BodyContent post={post} compact />
            </CardPanel>
            <RelatedPanel task="image" post={post} related={related} />
          </aside>
        </div>
      </section>
    </>
  )
}

function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <DetailHero
        task="sbm"
        post={post}
        images={getImages(post)}
        category={categoryOf(post, 'Resource')}
        summary={leadText(post)}
        aside={website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-[var(--editable-cta-bg)] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-[var(--tk-on-accent)] transition hover:brightness-95">Open resource <ExternalLink className="h-4 w-4" /></Link> : null}
      />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <CardPanel><BodyContent post={post} /></CardPanel>
          <aside className="space-y-6">
            <RelatedPanel task="sbm" post={post} related={related} />
          </aside>
        </div>
      </section>
    </>
  )
}

function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <>
      <DetailHero task="pdf" post={post} images={getImages(post)} category={categoryOf(post, 'Document')} summary={leadText(post)} />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="space-y-8">
            <CardPanel><BodyContent post={post} /></CardPanel>
            {fileUrl ? (
              <div className="overflow-hidden rounded-[1.8rem] bg-white directory-card-shadow">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-4">
                  <span className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--tk-text)]">Document preview</span>
                  <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-[var(--editable-cta-bg)] px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--tk-on-accent)] transition hover:brightness-95">Download <Download className="h-4 w-4" /></Link>
                </div>
                <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] w-full bg-[var(--tk-raised)]" />
              </div>
            ) : null}
          </article>
          <aside className="space-y-6">
            {fileUrl ? (
              <CardPanel>
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--tk-text)]">Get this document</p>
                <p className="mt-3 text-sm leading-7 text-[var(--tk-muted)]">Open or download the full file in a new tab.</p>
                <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--editable-cta-bg)] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-[var(--tk-on-accent)] transition hover:brightness-95">Download <Download className="h-4 w-4" /></Link>
              </CardPanel>
            ) : null}
            <RelatedPanel task="pdf" post={post} related={related} />
          </aside>
        </div>
      </section>
    </>
  )
}

function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  return (
    <>
      <DetailHero
        task="profile"
        post={post}
        images={images}
        category={categoryOf(post, 'Profile')}
        summary={leadText(post)}
        aside={
          <div className="flex flex-wrap items-center gap-3">
            {role ? <span className="rounded-full bg-[var(--tk-accent-soft)] px-4 py-2 text-sm font-bold text-[var(--tk-accent)]">{role}</span> : null}
            <ContactAction website={website} email={email} bare />
          </div>
        }
      />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="space-y-8">
            <CardPanel><BodyContent post={post} /></CardPanel>
            <ImageStrip images={images.slice(1)} label="Gallery" />
          </article>
          <aside className="space-y-6">
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot={detailAdSlot.profile} showLabel eager className="mx-auto w-full" />
            </div>
            <RelatedPanel task="profile" post={post} related={related} />
          </aside>
        </div>
      </section>
    </>
  )
}

function CardPanel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[1.8rem] bg-white p-6 directory-card-shadow sm:p-8">{children}</div>
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-7' : 'text-[1.0625rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[1.6rem] bg-white p-5 directory-card-shadow">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--tk-muted)]"><Icon className="h-4 w-4 text-[var(--tk-accent)]" /> {label}</div>
          <p className="mt-3 break-words text-sm font-semibold leading-7 text-[var(--tk-text)]">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-muted)]">{label}</p>
      <div className={`mt-4 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => (
          <div key={`${image}-${index}`} className="overflow-hidden rounded-[1.5rem] bg-white p-3 directory-card-shadow">
            <img src={image} alt="" className="aspect-[4/3] w-full rounded-[1.1rem] object-cover" />
          </div>
        ))}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[1.8rem] bg-white directory-card-shadow">
      <div className="flex items-center gap-2 p-4 text-sm font-bold text-[var(--tk-text)]"><MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label || 'Map location'}</div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? '' : ''}`}>
      {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-[var(--editable-cta-bg)] px-4 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-[var(--tk-on-accent)] transition hover:brightness-95">Website <ExternalLink className="h-4 w-4" /></Link> : null}
      {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-2xl border border-[var(--tk-line)] bg-white px-4 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-[var(--tk-text)] transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]"><Phone className="h-4 w-4" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-2xl border border-[var(--tk-line)] bg-white px-4 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-[var(--tk-text)] transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
    </div>
  )
  if (bare) return buttons
  return (
    <CardPanel>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-muted)]">Quick actions</p>
      <div className="mt-4">{buttons}</div>
    </CardPanel>
  )
}

function RelatedPanel({ task, post, related }: { task: TaskKey; post: SitePost; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  const showArchiveLink = !hiddenDirectTasks.has(task)
  return (
    <div className="space-y-6">
      <CardPanel>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-muted)]">About this post</p>
        <div className="mt-4 grid gap-3 text-sm text-[var(--tk-muted)]">
          <p className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-[var(--tk-accent)]" /> {taskConfig?.label || task}</p>
          <p className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--tk-accent)]" /> {SITE_CONFIG.name}</p>
          {summaryText(post) ? <p className="line-clamp-3 leading-7">{stripHtml(summaryText(post))}</p> : null}
        </div>
      </CardPanel>
      {related.length ? (
        <CardPanel>
          <div className="flex items-center justify-between gap-3">
            <h2 className="editable-display text-2xl font-bold text-[var(--tk-text)]">More like this</h2>
            {showArchiveLink ? <Link href={taskConfig?.route || '/'} className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--tk-accent)]">View all</Link> : null}
          </div>
          <div className="mt-5 grid gap-3">
            {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
          </div>
        </CardPanel>
      ) : null}
    </div>
  )
}

function RelatedCard({ task, post }: { task: TaskKey; post: SitePost }) {
  const image = getImages(post)[0]
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  return (
    <Link href={href} className="group flex gap-3 rounded-[1.2rem] border border-[var(--tk-line)] bg-[var(--tk-raised)] p-3 transition hover:border-[var(--tk-accent)]">
      {image && task !== 'sbm' ? <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-[0.9rem] object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[0.9rem] bg-white"><FileText className="h-5 w-5 text-[var(--tk-muted)]" /></div>}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[var(--tk-text)] group-hover:text-[var(--tk-accent)]">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}
