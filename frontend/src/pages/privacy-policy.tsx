import React from "react"
import SEO from "../components/seo";

export default function PrivacyPolicy() {

  return (
    <div>
      <SEO title={"Privacy policy"}/>


      <main id="main">

        <div
          className='relative inset-x-0 bottom-0 transition duration-300 mt-32 z-50 text-gray-700 max-w-screen-md my-0 mx-auto text-left'>

          <div className="px-4 md:px-0">
            <h1
              className="font-serif text-7xl font-bold mt-0 mx-auto mb-12 highlight">
              Privacy Policy
            </h1>
            <div className="font-sans font-light text-md break-words">
              <p>
                IPO Warning (the “website” or “site”) takes your privacy and rights seriously. We won’t sell or give your data to any third parties at any point in time.
              </p>
              <br/>

              <h3 className="font-serif font-bold text-lg mt-5 mb-2">
                How is your data used?
              </h3>
              <p>
                This website only collects the user email as it is mandatory for the warning to be sent.
                You can request the deletion of all your personal data stored at any time by reaching us through&nbsp;
                <a href="/contact.html" className="highlight">our contact form</a>.
                All of your data will be delted within the max period of 72hours.
              </p>
            </div>
          </div>

        </div>


      </main>


      <footer>
        <a
          onClick={() => history.back()}
          rel="noopener noreferrer"
        >
          Go back
        </a>
      </footer>

    </div>
  )
}
