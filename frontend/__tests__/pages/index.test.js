import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from '../../pages'
import userEvent from "@testing-library/user-event";
import {subscribe} from "../../service/service";

jest.mock("../../service/service")

describe('when testing the index page', () => {
  describe('initial rendering', () => {
    it('should have the title', () => {
      render(<Home />)

      const heading = screen.getByRole('heading', {
        name: /ipo warning/i,
      })

      expect(heading).toBeInTheDocument()
    })

    it('should have the form', () => {
      render(<Home />)

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

  it('should call the subscribe service on form submit', () => {
    subscribe.mockImplementation(() => new Promise(() => {}))
    render(<Home />)
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
})