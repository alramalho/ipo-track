import React, {useState} from "react"
import SEO from "../components/seo";
import {contact} from "../service/contact";
import Toast, {ToastProps} from "../components/toast";


export default function Contact() {

  const [contactFormData, setContactFormData] = useState<ContactData>(undefined)
  const [toastProps, setToastProps] = useState<ToastProps>({
    isVisible: false,
    message: ""
  })

  function handleSubmit(event) {
    event.preventDefault()
    if (contactFormData && contactFormData.honeypot !== undefined) return

    contact(contactFormData)
      .then(() => {
        setToastProps({
          isVisible: true,
          type: "success",
          message: 'Thank you for contacting us! We will get back to you shortly'
        })
      })
      .catch(() => {
        setToastProps({
          isVisible: true,
          type: "error",
          message: 'Oops! Something went wrong. Please try again later\''
        })
      })
      .finally(() => {
        setTimeout(() => {
          setToastProps(prev => ({...prev, isVisible: false}))
        }, 3000)
      })
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setContactFormData({...contactFormData, [event.target.name]: event.target.value})
  }

  function handleHoneypot(event: React.ChangeEvent<HTMLInputElement>) {
    setContactFormData({...contactFormData, honeypot: event.target.value})
  }

  return (
    <div>
      <SEO title={"Contact page"}/>

      <main id="main">

        <div
          className='relative inset-x-0 bottom-0 transition duration-300 mt-32 z-50 text-gray-700 max-w-screen-md my-0 mx-auto text-left px-4 md:px-0'>

          <h1
            className="font-serif text-7xl font-bold mt-0 mx-auto mb-12 highlight">
            Contact form 📢
          </h1>
          <div className="font-sans font-light text-md break-words">
            <p>
              Fill this contact form and we'll get back to you as soon as we can.
            </p>
            <br/>

            <form
              className="flex flex-col justify-around"
              onSubmit={handleSubmit}
              method="post">
              <div className="mb-8">
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

              <div className="mb-8">
                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="subject">
                  Subject
                </label>
                <input
                  className="shadow-inner-neum appearance-none block w-full bg-gray-130 text-gray-700 border-2 border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none"
                  type="text" name="subject" id="subject" required
                  placeholder="Enter your subject here"
                  onChange={handleInputChange}/>
              </div>

              <div className="mb-12">
                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="message">
                  Message
                </label>
                <textarea
                  className="shadow-inner-neum appearance-none block w-full bg-gray-130 text-gray-700 border-2 border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none"
                  name="message" id="message" required
                  placeholder="Enter your message here"
                  onChange={handleInputChange}
                />
              </div>

              <input
                data-testid="honeypot"
                className="no-show"
                type="text"
                placeholder="Your last name"
                name="Last Name" id="last_name"
                onChange={handleHoneypot}/>
              <input
                className="submit-button cursor-pointer	transform transition duration-300 rounded uppercase tracking-wide text-gray-700 leading-tight text-s font-bold py-5 px-4"
                type="submit" value="Submit &rarr;"
              />
            </form>
            <Toast
              type={toastProps.type}
              message={toastProps.message}
              isVisible={toastProps.isVisible}
            />

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
