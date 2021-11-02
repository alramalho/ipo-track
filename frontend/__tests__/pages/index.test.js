import React from 'react'
import {act, render, screen, waitFor} from '@testing-library/react'
import Home from '../../pages'
import userEvent from "@testing-library/user-event";
import {subscribe} from "../../service/subscribe";

jest.mock("../../service/subscribe")


describe('when testing the index page', () => {
  describe('initial rendering', () => {
    it('should have the title', () => {
      render(<Home/>)

      const heading = screen.getByRole('heading', {
        name: /ipo warning/i,
      })

      expect(heading).toBeInTheDocument()
    })

    it('should have the form', () => {
      render(<Home/>)

      const emailInput = screen.getByLabelText(/email/i)
      const keywordInput = screen.getByLabelText(/keyword/i)
      const submitInput = screen.getByRole('button', {
        name: /submit/i,
      })

      expect(emailInput).toBeInTheDocument()
      expect(keywordInput).toBeInTheDocument()
      expect(submitInput).toBeInTheDocument()
    })
  })


  it('should not call the subscribe service if honeypot is filled', () => {
    subscribe.mockImplementation(() => new Promise(() => {
    }))
    render(<Home/>)
    const emailInput = screen.getByLabelText(/email/i)
    const keywordInput = screen.getByLabelText(/keyword/i)
    const honeypotInput = screen.getByTestId(/honeypot/i)
    const submitInput = screen.getByRole('button', {
      name: /submit/i,
    })

    userEvent.type(emailInput, "teste@teste.com")
    userEvent.type(keywordInput, "Alma")
    userEvent.type(honeypotInput, "QQ")
    userEvent.click(submitInput)

    expect(subscribe).toHaveBeenCalledTimes(0)
  })

  describe('when submitting the form', () => {

    beforeAll(function () {
      jest.useFakeTimers()
    });

    afterAll(function () {
      jest.useRealTimers()
    });

    it('should call the subscribe service on form submit', () => {
      subscribe.mockImplementation(() => new Promise(() => {
      }))
      render(<Home/>)
      const emailInput = screen.getByLabelText(/email/i)
      const keywordInput = screen.getByLabelText(/keyword/i)
      const submitInput = screen.getByRole('button', {
        name: /submit/i,
      })

      userEvent.type(emailInput, "teste@teste.com")
      userEvent.type(keywordInput, "Alma")
      userEvent.click(submitInput)

      expect(subscribe).toHaveBeenCalledTimes(1)
      expect(subscribe).toHaveBeenLastCalledWith({
        email: "teste@teste.com",
        keyword: "Alma"
      })
    })

    it('should see the popup message for 3 seconds when subscribing', async () => {
      subscribe.mockImplementation(() => Promise.resolve())
      render(<Home/>)
      const emailInput = screen.getByLabelText(/email/i)
      const keywordInput = screen.getByLabelText(/keyword/i)
      const submitInput = screen.getByRole('button', {
        name: /submit/i,
      })
      await act(async () => {
        userEvent.type(emailInput, "teste@teste.com")
        userEvent.type(keywordInput, "Alma")
        userEvent.click(submitInput)


        await waitFor(() => {
          expect(screen.queryByText(/Registered successfully! Check your email/i)).toBeVisible()
        })
        jest.advanceTimersByTime(3000)
        await waitFor(() => {
          expect(screen.queryByText(/Registered successfully! Check your email/i)).not.toBeVisible()
        })
      })
    })

    it('should see the error popup message for 3 seconds when subscribing fails', async () => {
      subscribe.mockImplementation(() => Promise.reject(new Error()))

      render(<Home/>)
      const emailInput = screen.getByLabelText(/email/i)
      const keywordInput = screen.getByLabelText(/keyword/i)
      const submitInput = screen.getByRole('button', {
        name: /submit/i,
      })
      await act(async () => {
        userEvent.type(emailInput, "teste@teste.com")
        userEvent.type(keywordInput, "Alma")
        userEvent.click(submitInput)


        await waitFor(() => {
          expect(screen.queryByText(/Oops! Something went wrong. Please try again later/i)).toBeVisible()
        })
        jest.advanceTimersByTime(3000)
        await waitFor(() => {
          expect(screen.queryByText(/Oops! Something went wrong. Please try again later/i)).not.toBeVisible()
        })
      })
    })

  })
})