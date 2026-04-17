import { AppSidebar } from '@/components/app-sidebar'
import { CallsyDemo } from '@/components/callsy-demo'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

export default function Page() {
  return (
    <SidebarProvider
      defaultOpen={false}
      style={
        {
          "--sidebar-width": "220px",
          "--header-height": "48px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <CallsyDemo />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
