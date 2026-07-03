'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogIn, PlusCircle, Search, SlidersHorizontal, User, UserPlus, X } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
const hiddenDirectTasks = new Set<TaskKey>(['classified', 'profile'])

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()
  const navItems = useMemo(
    () => SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenDirectTasks.has(task.key as TaskKey)).map((task) => ({ label: task.label, href: task.route })),
    []
  )
  const showMobileMenu = navItems.length > 0 || Boolean(session)

  return (
    <header className="sticky top-0 z-50 bg-[var(--editable-nav-bg)] text-[var(--editable-nav-text)] shadow-[0_10px_26px_rgba(129,166,198,0.26)]">
      <nav className="mx-auto flex min-h-[86px] w-full max-w-[var(--editable-container)] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-12 w-12 object-contain" />
          <span className="hidden md:block">
            <span className="editable-display block text-[2rem] font-bold leading-none text-white">{SITE_CONFIG.name}</span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.26em] text-white/70">
              {globalContent.nav.tagline}
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-3 xl:flex">
          <Link href={session ? '/create' : '/login'} className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/18">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--slot4-page-text)] shadow-[0_8px_18px_rgba(0,0,0,0.12)]">
              {session ? <User className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </span>
            {session ? 'Account' : 'Login'}
          </Link>
        </div>

        <form action="/search" className="directory-search-shadow ml-auto hidden min-w-0 flex-1 items-center rounded-2xl bg-white px-4 py-3 md:flex">
          <Search className="h-5 w-5 shrink-0 text-[var(--slot4-muted-text)]" />
          <input
            name="q"
            type="search"
            placeholder={globalContent.site.name ? "What's In Your Mind?" : 'Search'}
            className="min-w-0 flex-1 bg-transparent px-3 text-[15px] font-medium text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-muted-text)]"
          />
          <SlidersHorizontal className="h-5 w-5 shrink-0 text-[var(--slot4-muted-text)]" />
        </form>

        <div className="ml-auto hidden items-center gap-4 md:flex">
          {session ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-2xl border border-white/25 px-4 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/10"
            >
              Logout
            </button>
          ) : null}
          <Link
            href={session ? '/create' : '/signup'}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--editable-cta-bg)] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.06em] text-[var(--editable-cta-text)] transition hover:-translate-y-0.5 hover:brightness-95"
          >
            {session ? <PlusCircle className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {session ? 'List product' : 'List product'}
          </Link>
        </div>

        {showMobileMenu ? (
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="ml-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--slot4-page-text)] shadow-[0_8px_18px_rgba(0,0,0,0.12)] md:hidden"
            aria-label="Toggle menu"
          >
            <X className={`h-5 w-5 transition ${open ? 'opacity-100' : 'hidden opacity-0'}`} />
            <span className={`text-2xl leading-none ${open ? 'hidden' : 'block'}`}>≡</span>
          </button>
        ) : null}
      </nav>

      {open ? (
        <div className="border-t border-white/10 bg-[var(--editable-nav-bg)] px-4 py-5 lg:px-8">
          <form action="/search" className="directory-search-shadow mb-5 flex items-center rounded-2xl bg-white px-4 py-3 md:hidden">
            <Search className="h-5 w-5 shrink-0 text-[var(--slot4-muted-text)]" />
            <input
              name="q"
              type="search"
              placeholder="What's In Your Mind?"
              className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-muted-text)]"
            />
            <SlidersHorizontal className="h-5 w-5 shrink-0 text-[var(--slot4-muted-text)]" />
          </form>
          <div className="grid gap-2 md:grid-cols-2 xl:hidden">
            {[{ label: 'Home', href: '/' }, ...navItems, { label: 'Contact', href: '/contact' }].map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-[0.08em] transition ${
                    active ? 'bg-white text-[var(--slot4-page-text)]' : 'bg-white/10 text-white hover:bg-white/16'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            {session ? (
              <button
                type="button"
                onClick={() => {
                  logout()
                  setOpen(false)
                }}
                className="rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/16"
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/16">
                  <span className="inline-flex items-center gap-2"><LogIn className="h-4 w-4" /> Login</span>
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="rounded-2xl bg-[var(--editable-cta-bg)] px-4 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:brightness-95">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}
