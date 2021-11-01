import Head from 'next/head'
import React from "react"
import SEO from "../components/seo";

export default function PrivacyPolicy() {

  return (
    <div className="container">
      <SEO title={"Terms of service"}/>

      <main id="main">

        <div
          className='relative inset-x-0 bottom-0 transition duration-300 mt-32 z-50 text-gray-700 max-w-screen-md my-0 mx-auto text-left'>

          <div className="px-4 md:px-0">
            <h1
              className="font-serif text-7xl font-bold mt-0 mx-auto mb-12 highlight">
              Terms of Service
            </h1>
            <div className="font-sans font-light text-md break-words">
              <p>
                Please read the terms and conditions carefully before you use this website. Your use of the site assumes that you agree to these terms, as well as our privacy policy.
                IPO Warning (the “website” or “site”) may modify these terms at any time.              </p>
              <br/>

              <h3 className="font-serif font-bold text-lg mt-5 mb-2">
                How is your data used
              </h3>
              <p>
                When you enter your email and keyword, your email is stored indefinitely in order to further notify you when your keyword matches any word in the announced company name, case insensitive.
              </p>
              <br/>
              <p>
                We check against stock analysis free api, which means we only have the IPOs going live in the next week.
                If you really really want to get notified earlier than that, consider reading our roadmap and even contributing.
              </p>
              <br/>
              <p>
                We will email when you register, when some company matches your keyword (as stated above) and one email when we you de-activate your account, which happens automatically once you get notified.
              </p>

              <h3 className="font-serif font-bold text-lg mt-5 mb-2">
                Misuse of platform
              </h3>

              <p>
                Any misuse of the platform, such as wrongly typing the email and the keywords are sole responsibility of the user.
                We don’t analyze the already public companies, so if you enter a keyword from a company that went live already changes are
                that you will never receive a warning from us.
              </p>
              <br/>
              <p>
                If any questions remain please feel free to email us at <em>support@ipo-warning.com</em>.
              </p>
            </div>
          </div>

        </div>


      </main>


      <footer>
        <a
          href="javascript:history.back()"
          rel="noopener noreferrer"
        >
          Go back
        </a>
      </footer>


      <style jsx>{`
        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
          Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
          sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
