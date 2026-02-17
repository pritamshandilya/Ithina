import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/maker/audits/planogram/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/maker/audits/planogram/"!</div>
}
