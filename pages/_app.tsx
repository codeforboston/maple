import { AppProps } from "next/app"
import { AuthProvider } from "../components/auth"
import { SSRProvider } from "../components/bootstrap"
import "../components/fontawesome"
import "../styles/bootstrap.scss"
import "../styles/globals.css"
import "../styles/Map.css"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SSRProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </SSRProvider>
  )
}

export default MyApp
