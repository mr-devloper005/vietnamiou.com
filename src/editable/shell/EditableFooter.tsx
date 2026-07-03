'use client'

import Link from 'next/link'
import { Facebook, Instagram, Mail, Twitter } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
const hiddenDirectTasks = new Set<TaskKey>(['classified', 'profile'])

export function EditableFooter() {
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenDirectTasks.has(task.key as TaskKey))
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="mt-auto bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <h2 className="editable-display text-4xl font-bold text-white">Subscribe for latest updates</h2>
            <p className="mt-5 max-w-xl text-sm uppercase tracking-[0.12em] text-white/50">
              Stay in the loop for new listings, profile highlights, and useful updates from across the site.
            </p>
          </div>
          <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px]">
            <input
              type="email"
              placeholder="Enter Your Email Address"
              className="rounded-2xl border border-white/10 bg-white px-5 py-4 text-[15px] font-medium text-[var(--slot4-page-text)] outline-none"
            />
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--editable-cta-bg)] px-5 py-4 text-sm font-extrabold uppercase tracking-[0.06em] text-white transition hover:brightness-95">
              <Mail className="h-4 w-4" /> Subscribe
            </button>
          </form>
        </div>

        <div className="grid gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-12 w-12 object-contain" />
              <span>
                <span className="editable-display block text-4xl font-bold text-white">{SITE_CONFIG.name}</span>
                <span className="block text-sm text-white/60">{globalContent.footer.tagline}</span>
              </span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/65">{globalContent.footer.description}</p>
          </div>

          <div>
            <h3 className="text-4xl font-semibold text-white">Company</h3>
            <div className="mt-6 grid gap-3">
              {[...taskLinks.slice(0, 4).map((task) => ({ label: task.label, href: task.route })), { label: 'About Us', href: '/about' }, { label: 'Contact', href: '/contact' }].map((item) => (
                <Link key={item.href} href={item.href} className="text-sm text-white/65 transition hover:text-white">
                  {item.label}
                </Link>
              ))}
              {session ? (
                <button type="button" onClick={logout} className="text-left text-sm text-white/65 transition hover:text-white">
                  Logout
                </button>
              ) : null}
            </div>
          </div>

          <div>
            <h3 className="text-4xl font-semibold text-white">Need Help?</h3>
            <div className="mt-6 grid gap-3 text-sm text-white/65">
              <Link href="/create" className="transition hover:text-white">How it works</Link>
              <Link href="/contact" className="transition hover:text-white">Contact us</Link>
              <Link href="/search" className="transition hover:text-white">Search the site</Link>
              <Link href="/" className="transition hover:text-white">All categories</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[var(--editable-container)] flex-col gap-4 px-4 py-6 text-sm text-white/45 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>All copyrights reserved © {year} {SITE_CONFIG.name}</p>
          <div className="flex items-center gap-5">
            <Facebook className="h-4 w-4" />
            <Instagram className="h-4 w-4" />
            <Twitter className="h-4 w-4" />
          </div>
        </div>
      </div>
    </footer>
  )
}
