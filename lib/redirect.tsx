import { useEffect } from 'react'
import { useRouter } from 'next/router'
import languageDetector from './languageDetector'

export const useRedirect = (dest?: string) => {
  const router = useRouter()
  const to = dest ?? router.asPath

  // language detection
  useEffect(() => {
    const detectedLng = languageDetector.detect()
    if(detectedLng !== undefined) {
      if (to.startsWith('/' + detectedLng) && router.route === '/404') { // prevent endless loop
        router.replace('/' + detectedLng + router.route)
        return
      }

      // languageDetector.cache(detectedLng)
      router.replace('/' + detectedLng + to)
    }
  })

  return <></>
}

export const Redirect = () => {
  useRedirect()
  return <></>
}

export const getRedirect = (to: string) => {
  // eslint-disable-next-line react/display-name
  return () => {
    useRedirect(to)
    return <></>
  }
}