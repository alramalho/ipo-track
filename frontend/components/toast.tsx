import React, {useRef} from 'react'

interface ToastProps {
  isVisible: boolean
  type?: "success" | "error"
  message: string
}

const Toast = ({isVisible, type, message}: ToastProps) => {
  const toastRef = useRef(null)

  return (
    <>
      <div className="toast" ref={toastRef}>
        {type == "success" ? `✅  ${message}` : `❌  ${message}`}
      </div>
      <style jsx>{`

        .toast {
          visibility: ${isVisible ? 'visible' : 'hidden'};
          min-width: 10rem;
          margin: 0.25rem auto;
          color: #fdfdfd;
          background-color: ${type == 'success' ? '#84CC16' : '#F87171'};
          text-align: center;
          border-radius: 0.25rem;
          padding: 1rem;
          position: fixed;
          z-index: 1;
          bottom: 30px;
          -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
          animation: fadein 0.5s, fadeout 0.5s 2.5s;
        }

        @-webkit-keyframes fadein {
          from {
            bottom: 0;
            opacity: 0;
          }
          to {
            bottom: 30px;
            opacity: 1;
          }
        }

        @keyframes fadein {
          from {
            bottom: 0;
            opacity: 0;
          }
          to {
            bottom: 30px;
            opacity: 1;
          }
        }

        @-webkit-keyframes fadeout {
          from {
            bottom: 30px;
            opacity: 1;
          }
          to {
            bottom: 0;
            opacity: 0;
          }
        }

        @keyframes fadeout {
          from {
            bottom: 30px;
            opacity: 1;
          }
          to {
            bottom: 0;
            opacity: 0;
          }
        }

      `}</style>

    </>

  )


}

Toast.defaultProps = {
  type: "success"
}


export default Toast
export type {ToastProps}