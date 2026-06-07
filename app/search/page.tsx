import { UniversityDashboard } from '../_components/UniversityDashboard'
import { getSession } from '../_lib/auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'University Education China — Search Universities',
  description: 'Find and compare Chinese universities for international students.',
}

export default async function SearchPage() {
  const user = await getSession()
  if (!user) redirect('/')

  return <UniversityDashboard user={user} />
}
