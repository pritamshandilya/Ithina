import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/checker/reports/store-level/')({
  component: StoreLevelReport,
})

export function StoreLevelReport() {
  return <div>Hello "/checker/reports/store-level/"!</div>
}
