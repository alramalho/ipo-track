import '../styles/globals.css'
import '../styles/form.css'
import Analytics from "../components/analytics";

export default function MyApp({Component, pageProps}) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics/>
    </>
  )
}