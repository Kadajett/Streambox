import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/channel/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/channel/create"!</div>
}
