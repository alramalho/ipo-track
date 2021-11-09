import React from "react"
import Script from 'next/script'

const Analytics = () => {
  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-KJ6MKYQ25L"/>
      <Script
        id="analytics" strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
        
          gtag('config', 'G-KJ6MKYQ25L');`
        }}
      />
    </>
  )
}

export default Analytics

