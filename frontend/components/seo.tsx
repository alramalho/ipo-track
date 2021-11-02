import Head from 'next/head'
import React from "react"
import Script from 'next/script'

interface SEOProps {
  title?: string,
  description?: string,
}

const SEO = ({title, description}: SEOProps) => {
  const renderedTitle = `IPO Warning${title ? ` | ${title}` : ""}`
  return (

    <Head>
      <title>{renderedTitle}</title>
      <link rel="icon" href={"./static/favicon.ico"}/>
      <meta property="og:type" content="website"/>
      <meta property="og:title" content={renderedTitle}/>
      <meta property="og:image" content="./static/ipo-bell.png"/>
      <meta property="og:url" content="www.ipo-warning.com"/>
      <meta property="og:site_name" content="IPO Warning"/>
      <meta name="twitter:title" content={renderedTitle}/>
      <meta name="twitter:image" content="./static/ipo-bell.png"/>
      <meta name="twitter:creator" content="@_alramalho"/>
      <meta name="robots" content="index, follow"/>
      <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
      {description
        ? <>
          <meta name="description" content={description}/>
          <meta name="twitter:description" content={description}/>
          <meta property="og:description" content={description}/>
        </>
        : <></>
      }
    </Head>
  )
}

export default SEO

