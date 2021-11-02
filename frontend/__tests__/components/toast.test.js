import {render, screen, waitFor} from "@testing-library/react";
import Toast from "../../components/toast";

describe('when testing the toast', () => {

  it('should be able to see the toast', () => {
    render(<Toast isVisible={true} message={"Dummy success message"}/>)

    expect(screen.getByText(/Dummy success message/i)).toBeVisible()
  })

  it('should be able to hide the toast', () => {
    render(<Toast isVisible={false} message={"Dummy success message"}/>)

    expect(screen.getByText(/Dummy success message/i)).not.toBeVisible()
  })

})