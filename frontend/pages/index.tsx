import React, {useState} from "react"
import {subscribe} from "../service/subscribe";
import SEO from "../components/seo";
import Toast, {ToastProps} from "../components/toast";

export default function Home() {

  const [formData, setFormData] = useState<FormData>(undefined)
  const [toastProps, setToastProps]= useState<ToastProps>({
    isVisible: false,
    message: ""
  })

  function setKeyword(keyword) {
    document.getElementById("keyword").setAttribute('value', keyword)
    document.getElementById("keyword").focus()
    document.getElementById("main").scrollIntoView()
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (formData && formData.honeypot !== undefined) return

    subscribe(formData)
      .then(() => {
        setToastProps({
          isVisible: true,
          type: "success",
          message: 'Registered successfully! Check your email'
        })
      })
      .catch(() => {
        setToastProps({
          isVisible: true,
          type: "error",
          message: 'Oops! Something went wrong. Please try again later\''
        })
      })
      .finally(async () => {
        await setTimeout(() => {
          setToastProps(prev => ({...prev, isVisible: false}))
        }, 3000)
      })
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({...formData, [event.target.name]: event.target.value})
  }


  return (
    <div>
      <SEO description={"Be the first to know when some company goes public."}/>

      <main id="main">

        <div
          className='relative inset-x-0 bottom-0 transition duration-300 mt-32 z-50 text-gray-700 max-w-screen-md my-0 mx-auto text-left'>

          <div className="px-4 md:px-0">
            <h1
              className="font-serif text-7xl font-bold mt-0 mx-auto mb-8 highlight">
              IPO Warning&nbsp;
              <img className="inline object-left max-h-16 -mt-2 object-scale-down"
                   src="./static/ringing-bell.svg" alt="Ringing bell"/>
            </h1>

            <p className="font-sans text-lg font-light mt-0 mb-3 mx-auto ">
              Be the first to know when some company goes public.&nbsp;
              <em>(it's <span className="font-medium"> free</span>)</em>
            </p>
          </div>

          <div
            className='rounded-3xl bg-gray-115 text-gray-900 pt-12 pb-14 px-8 rounded-10 shadow-neum mt-24 mb-32 xl:mx-0'>

            <form className="flex flex-col md:flex-row justify-around md:items-end"
                  onSubmit={handleSubmit}
                  method="post">
              <div className="mb-6 md:mb-0">
                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="email">
                  Email
                </label>
                <input
                  className="shadow-inner-neum appearance-none block w-full bg-gray-130 text-gray-700 border-2 border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none"
                  type="email" name="email" id="email" required
                  placeholder="my@email.com"
                  onChange={handleInputChange}/>
              </div>
              <div className="mb-6 md:mb-0">
                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="keyword">
                  Keyword
                </label>
                <input
                  className="shadow-inner-neum appearance-none block w-full bg-gray-130 text-gray-700 border-2 border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none"
                  type="text" name="keyword" id="keyword" required
                  placeholder="stripe"
                  onChange={handleInputChange}/>
              </div>
              <input
                data-testid="honeypot"
                className="hidden"
                name="honeypot" id="honeypot"
                onChange={handleInputChange}/>
              <input
                className="submit-button cursor-pointer	transform transition duration-300 rounded uppercase tracking-wide text-gray-700 leading-tight text-s font-bold py-5 px-4"
                type="submit" value="Submit &rarr;"
              />
            </form>
            <Toast type={toastProps.type} message={toastProps.message} isVisible={toastProps.isVisible}/>

          </div>

          <div className='mt-32 mx-8 xl:mx-0 text-left'>
            <h1 className="font-serif text-5xl font-bold mb-5 text-gray-700">
              What is an IPO? 🤔
            </h1>
            <div className="font-sans font-light text-md text-gray-800 break-words">
              <p>
                An IPO is an <em>initial public offering</em>. In an
                IPO, a privately owned company lists its shares on a stock exchange,
                making them available for purchase by the general public.

              </p>

              <h3 className="font-serif font-bold text-lg mt-5 mb-2">
                Why are IPOs important?
              </h3>
              <p>
                The <em>IPO provides the company</em> with access to raising a lot of
                money.
                This gives the company a greater <em>ability to grow and
                expand.</em> The
                increased transparency and share listing credibility can also be a
                factor in helping it obtain better terms when seeking borrowed funds as
                well.
                This makes IPOs a possible good investment, with some previous private
                companies having experienced a huge stock price increase some days or
                weeks
                after its

              </p>

              <p>
                <br/>
                You can learn more about this in the&nbsp;
                <a href="https://www.investopedia.com/terms/i/ipo.asp" target="__blank"
                   className="highlight" rel="external noopener">
                  Investopedia article regarding IPOs
                </a>
              </p>
            </div>
          </div>

          <div className='mt-32 mx-8 xl:mx-0 text-left text-gray-800 '>
            <h1 className="font-serif text-5xl font-bold mb-5 text-gray-700">
              🧐 How does this work?
            </h1>
            <div className="font-sans font-light text-md break-words">
              <p>
                It is very simple:<br/><br/> <em>IPO Warning checks on a regular basis
                for
                recently
                announced upcoming IPOs</em>. We analyse them
                and <em>if your keyword matches any word on their full company name</em>,
                then we
                consider it a match! (don't
                worry about casing)
              </p>
              <br/>
              <p>We then <em>alert you via the provided email</em> and we immediately
                de-activate
                your account,
                meaning that you won't receive any more emails from us 😊</p>


              <h3 className="font-serif font-bold text-lg mt-5 mb-2">
                When will I get the warning?
              </h3>
              <p>
                We check against stock analysis free api, which means we only have the
                IPOs
                going live in the next week. That translates to you getting your
                warning&nbsp;
                <em>with 1 week in advance</em>.
                If you really really want to get notified earlier than that, consider
                reading our roadmap and even contributing.
                I will implement more features as soon as this is auto-sufficient.
              </p>

              <h3 className="font-serif font-bold text-lg mt-5 mb-2">
                What happens if I submit multiple times?
              </h3>
              <p>
                Currently, <em>only 1 keyword per email is allowed</em>.
                That means if you fill the small form multiple times <em>only the last
                one
                will be accounted</em> for and you will be warned about it.

                If you really really want to be alerted about multiple IPOs on the same
                email
                than I recommend checking out our&nbsp;
                <a className="highlight" href="/roadmap.html">roadmap</a> and maybe even
                contributing.
              </p>

            </div>
          </div>

          <div className='mt-32 mx-8 xl:mx-0 text-left text-gray-800 '>
            <h1 className="font-serif text-5xl font-bold mb-5 text-gray-700">
              Who is this for? 🙋
            </h1>
            <div className="font-sans font-light text-md break-words">
              <p>
                Unfortunately investing in private companies without having inside
                connections
                is very hard or it requires a lot of money. I remember trying to sign up
                for this private companies investment platform for and they required me
                to do a 10 000$ initial deposit. 🤯
                <br/>
                Timing is everything! So <em>this is for anyone that wants to be the
                first to invest in a private company </em>once it goes public but
                doesn't want to be constantly browsing the markets to check if its
                IPO date was already announced.
              </p>
            </div>
          </div>


          <div className='mt-32 mx-8 xl:mx-0 text-left text-gray-800'>
            <h1
              className="font-serif text-4+xl font-bold mb-5 mb-8 text-gray-700 ">
              🔜 Some upcoming IPOs
            </h1>
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-16 md:gap-4 place-items-center mb-8">
              <img onClick={() => setKeyword("discord")}
                   className="cursor-pointer object-fit h-8"
                   src="./static/logos/discord.svg" alt="Discord"/>
              <img onClick={() => setKeyword("impossible")}
                   className="cursor-pointer object-fit h-8"
                   src="./static/logos/impossible-foods.svg" alt="Impossible Foods"/>
              <img onClick={() => setKeyword("stripe")}
                   className="cursor-pointer object-fit h-8"
                   src="./static/logos/stripe.svg" alt="Stripe"/>
              <img onClick={() => setKeyword("instacart")}
                   className="cursor-pointer object-fit h-8"
                   src="./static/logos/instacart.svg" alt="Instacart"/>
            </div>

            <p>
              Some of them don't have a fixed date yet! Do you want to know when they
              do?&nbsp;
              <em>Click them!</em>
            </p>
          </div>


        </div>

        <div className="w-full flex justify-center mb-8 mt-44">
          <a className="text-gray-800 highlight" href="#main">&uarr;</a>
        </div>
      </main>

      <footer>
        <div className="grid grid-cols-2 gap-5 place-items-center">
          <a
            href="/terms-of-service.html"
            rel="noopener noreferrer"
          >
            Terms of service
          </a>

          <a
            href="/privacy-policy.html"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>

          <a
            href="/roadmap.html"
            rel="noopener noreferrer"
          >
            Roadmap
          </a>

          <a
            href="/contact.html"
            rel="noopener noreferrer"
          >
            Contact us
          </a>
        </div>
      </footer>

    </div>
  )
}
