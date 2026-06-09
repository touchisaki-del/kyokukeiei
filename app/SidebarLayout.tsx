'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Target, TrendingUp, BarChart2,
  Users, Radio, Database, Menu, X, ChevronRight
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/projects', label: '案件目標', icon: Target },
  { href: '/growth', label: '成長分析', icon: TrendingUp },
  { href: '/market', label: '市況比較', icon: BarChart2 },
  { href: '/members', label: 'メンバー生産性', icon: Users },
  { href: '/media', label: '媒体別分析', icon: Radio },
  { href: '/data', label: 'データ管理', icon: Database },
]

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={onClose} />}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-blue-900 text-white z-30 flex flex-col
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-auto
      `}>
        <div className="flex items-center justify-between p-4 border-b border-blue-700">
          <div>
            <div className="text-xs text-blue-300 font-medium">営業局</div>
            <div className="text-lg font-bold">局経営ダッシュボード</div>
          </div>
          <button className="md:hidden" onClick={onClose}><X size={20} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href} onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg mb-1 transition-colors
                  ${active ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{label}</span>
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-blue-700">
          <div className="text-xs text-blue-400">FY2025</div>
          <div className="text-xs text-blue-300">営業部門管理ツール</div>
        </div>
      </aside>
    </>
  )
}

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 md:hidden">
          <button onClick={() => setOpen(true)} className="text-gray-600 hover:text-gray-900">
            <Menu size={22} />
          </button>
          <span className="font-bold text-blue-900">局経営ダッシュボード</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
