import React from "react"
import SEO from "../components/seo";

export default function PrivacyPolicy() {

  return (
    <div>
      <SEO title={"Roadmap"} />


      <main id="main">

        <div
          className='relative inset-x-0 bottom-0 transition duration-300 mt-32 z-50 text-gray-700 max-w-screen-md my-0 mx-auto text-left'>

          <div className="px-4 md:px-0">
            <h1
              className="font-serif text-7xl font-bold mt-0 mx-auto mb-12 highlight">
              Feature Roadmap ✨
            </h1>
            <div className="font-sans font-light text-md break-words">
              <p>
                Although this is a fairly simple use case, it could have some improvements:
              </p>
              <br/>

              <ul className="list-disc mb-10">
                <li><em>Add the exact date and price of the IPO to the emails</em></li>
                <li><em>Provide alerts more than 1 week in advance.</em> Unfortunately, to support this we would have to pay a monthly fee on top of the hosting and domain costs, which for a project that doesn’t make any money is impossible.</li>
                <li><em>More than 1 keyword subscription  per email.</em></li>
                <li><em>Create enterprise emails</em> (support@ipo-track.com).</li>

              </ul>

              <a className="font-mono" target="__blank" href="https://ko-fi.com/alramalho">
                Support ipo-track
              </a>
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
