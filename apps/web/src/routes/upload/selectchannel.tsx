import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/upload/selectchannel')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/upload/selectchannel"!</div>
}
