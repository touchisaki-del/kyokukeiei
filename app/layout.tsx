import type { Metadata } from 'next'
import './globals.css'
import { DataProvider } from './context/DataContext'
import SidebarLayout from './SidebarLayout'

export const metadata: Metadata = {
  title: '局経営ダッシュボード',
  description: '営業局 目標管理・可視化ツール',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        <DataProvider>
          <SidebarLayout>{children}</SidebarLayout>
        </DataProvider>
      </body>
    </html>
  )
}
