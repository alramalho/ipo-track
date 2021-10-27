import PropTypes from "prop-types"
import React from "react"
import {upperBackgroundColor} from "./theme";


const Header = () => (
  <div className='header' id='header'>
    <a
      href={"https://alramalho.com"}
      target={"__blank"}
      style={{fontSize: "1rem", fontFamily: "Domine"}}>
      Al.
    </a>
    <div className='svg-container'>
      <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120"
           preserveAspectRatio="none">
        <path
          d="M600,112.77C268.63,112.77,0,65.52,0,7.23V120H1200V7.23C1200,65.52,931.37,112.77,600,112.77Z"
          className="shape-fill"></path>
      </svg>
    </div>

    <style jsx>{`
      .header {
        z-index: 1;
        text-align: center;
        color: white;
        
        background-image: url('/test.png');
        object-fit: scale-down;
        position: relative;
        height: 40vh;
      }

      .header a {
        text-decoration: none;
        border: none
      }

      .svg-container {
        position: absolute;
        z-index: 5;
        width: 100%;
        bottom: 0;
      }

      .svg-container svg {
        width: 100%;
        fill: white;
        filter: drop-shadow(0.0rem -2rem 1rem rgb(0, 0, 0, 0.2));
      }

    `}</style>
  </div>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}


export default Header
