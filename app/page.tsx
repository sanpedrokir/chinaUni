import { Suspense } from 'react'
import { LandingPage } from './_components/LandingPage'

export const metadata = {
  title: 'University Education China — Study in China',
  description: 'Expert guidance for international students. Search 91+ Chinese universities and get personalised consultation.',
}

export default function Home() {
  return (
    <Suspense>
      <LandingPage />
    </Suspense>
  )
}
