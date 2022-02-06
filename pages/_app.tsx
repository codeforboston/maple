import 'bootstrap/dist/css/bootstrap.min.css'
import { AppProps } from 'next/app'
import { SSRProvider } from '../components/bootstrap'
import '../styles/globals.css'
import '../styles/Map.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SSRProvider>
      <Component {...pageProps} />
    </SSRProvider>
  )
}

export default MyApp
