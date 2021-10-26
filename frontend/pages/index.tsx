import Head from 'next/head'
import React, {useState} from "react"
import {subscribe} from "../service/service";


export default function Home() {

  const [formData, setFormData] = useState<FormData>()

  function handleSubmit(event) {
    event.preventDefault()
    subscribe(formData).then(() => alert('success'))
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({...formData, [event.target.name]: event.target.value})
  }


  return (
    <div className="container">
      <Head>
        <title>IPO Warning</title>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <main>

        <h1 className="title">
          Welcome to IPO Warning
        </h1>

        <form onSubmit={handleSubmit} method="post" className="form-example">
          <div className="form-example">
            <label htmlFor="email">Enter your email: </label>
            <input className='input' type="email" name="email" id="email" required
                   onChange={handleInputChange}/>
          </div>
          <div className="form-example">
            <label htmlFor="keyword">Enter your keyword: </label>
            <input className='input' type="text" name="keyword" id="keyword" required
                   onChange={handleInputChange}/>
          </div>
          <div className="form-example">
            <input className='button' type="submit" value="Submit &rarr;"
                   onClick={handleSubmit}/>
          </div>
        </form>

      </main>

      <footer>
        <a
          href="/terms-of-service.html"
          rel="noopener noreferrer"
        >
          Terms of service
        </a>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

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

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
          DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .button {
          padding: 10px 20px;
          border-radius: 5px;
          background: linear-gradient(145deg, #f0f0f0, #cacaca);
          box-shadow: 2px 2px 6px #bebebe,
            -2px -2px 6px #ffffff;
        }

        .button :focus {
          border-radius: 5px;
          background: #e0e0e0;
          box-shadow: 2px 2px 6px #bebebe,
            -2px -2px 6px #ffffff;
        }

        .logo {
          height: 1em;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
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
