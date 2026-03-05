import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import AccountPage from "@/app/account/page"

describe("AccountPage", () => {
  it("allows editing the displayed name", async () => {
    render(<AccountPage />)

    const user = userEvent.setup()
    const editButtons = screen.getAllByLabelText("Edit name")
    await user.click(editButtons[0])

    const inputs = screen.getAllByRole("textbox")
    await user.clear(inputs[0])
    await user.type(inputs[0], "Ada Lovelace{enter}")

    const updatedNames = screen.getAllByText("Ada Lovelace")
    expect(updatedNames.length).toBeGreaterThan(0)
  })
})
