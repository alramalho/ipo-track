import React from 'react'
import {act, render, screen, waitFor} from '@testing-library/react'
import Contact from '../../src/pages/contact'
import userEvent from "@testing-library/user-event";
import {contact} from "../../src/service/contact";
import {subscribe} from "../../src/service/subscribe";
import Home from "../../src/pages";

jest.mock("../../src/service/contact")

describe('when testing the index page', () => {

  beforeEach(function () {
    jest.useFakeTimers()
    jest.clearAllMocks()
  });

  afterEach(function () {
    jest.useRealTimers()
  });

  it('should not call the contact service if honeypot is filled', () => {
    contact.mockImplementation(() => new Promise(() => {
    }))
    render(<Contact/>)
    const emailInput = screen.getByLabelText(/email/i)
    const subjectInput = screen.getByLabelText(/subject/i)
    const messageInput = screen.getByLabelText(/message/i)
    const honeypotInput = screen.getByTestId(/honeypot/i)
    const submitInput = screen.getByRole('button', {
      name: /submit/i,
    })

    userEvent.type(emailInput, "teste@teste.com")
    userEvent.type(subjectInput, "Alma")
    userEvent.type(messageInput, "message message")
    userEvent.type(honeypotInput, "QQ")
    userEvent.click(submitInput)

    expect(contact).toHaveBeenCalledTimes(0)
  })

  // todo: allow rtl to properly see form html required property
  // it.each`
  // fieldLabel
  // ${/email/i}
  // ${/subject/i}
  // ${/message/i}
  // `('should not call the contact service if required field are not filled', ({fieldLabel}) => {
  //   contact.mockImplementation(() => new Promise(() => {
  //   }))
  //   render(<Contact/>)
  //   const field = screen.getByLabelText(fieldLabel)
  //   const submitInput = screen.getByRole('button', {
  //     name: /submit/i,
  //   })
  //
  //   userEvent.type(field, "dummy")
  //   userEvent.click(submitInput)
  //
  //   expect(contact).toHaveBeenCalledTimes(0)
  // })

  it('should properly call the contact service', () => {
    contact.mockImplementation(() => new Promise(() => {
    }))
    render(<Contact/>)
    const emailInput = screen.getByLabelText(/email/i)
    const subjectInput = screen.getByLabelText(/subject/i)
    const messageInput = screen.getByLabelText(/message/i)
    const submitInput = screen.getByRole('button', {
      name: /submit/i,
    })

    userEvent.type(emailInput, "teste@teste.com")
    userEvent.type(subjectInput, "Alma")
    userEvent.type(messageInput, "message message")
    userEvent.click(submitInput)

    expect(contact).toHaveBeenCalledTimes(1)
    expect(contact).toHaveBeenLastCalledWith({
      email: "teste@teste.com",
      subject: "Alma",
      message: "message message"
    })
  })

  it('should see the popup message for 3 seconds when submitting', async () => {
    contact.mockImplementation(() => Promise.resolve())
    render(<Contact/>)
    const emailInput = screen.getByLabelText(/email/i)
    const subjectInput = screen.getByLabelText(/subject/i)
    const messageInput = screen.getByLabelText(/message/i)
    const submitInput = screen.getByRole('button', {
      name: /submit/i,
    })
    await act(async () => {
      userEvent.type(emailInput, "teste@teste.com")
      userEvent.type(subjectInput, "Alma")
      userEvent.type(messageInput, "message message")
      userEvent.click(submitInput)


      await waitFor(() => {
        expect(screen.queryByText(/Thank you for contacting us! We will get back to you shortly/i)).toBeVisible()
      })
      jest.advanceTimersByTime(3000)
      await waitFor(() => {
        expect(screen.queryByText(/Thank you for contacting us! We will get back to you shortly/i)).not.toBeVisible()
      })
    })
  })

  it('should see the error popup message for 3 seconds when submitting fails', async () => {
    contact.mockImplementation(() => Promise.reject(new Error()))
    render(<Contact/>)
    const emailInput = screen.getByLabelText(/email/i)
    const subjectInput = screen.getByLabelText(/subject/i)
    const messageInput = screen.getByLabelText(/message/i)
    const submitInput = screen.getByRole('button', {
      name: /submit/i,
    })

    await act(async () => {
      userEvent.type(emailInput, "teste@teste.com")
      userEvent.type(subjectInput, "Alma")
      userEvent.type(messageInput, "message message")
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