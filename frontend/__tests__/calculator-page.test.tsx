import { render, screen, fireEvent } from "@testing-library/react"
import CalculatorPage from "@/app/app/calculator/page"
import { GenericCalcPage } from "@/components/GenericCalcLayout"
import { FunctionSelector } from "@/components/calculator/FunctionSelector"
import { Keypad } from "@/components/calculator/Keypad"
import { Result } from "@/components/calculator/Result"

describe("calculator", () => {
  it("CalculatorPage renders topic header", () => {
    render(<CalculatorPage />)
    expect(screen.getByText("General")).toBeInTheDocument()
  })

  it("GenericCalcPage has textarea and empty-state text", () => {
    render(<GenericCalcPage topic="Test" />)
    expect(screen.getByPlaceholderText("x\u00B2 - 2x + 1 = 0")).toBeInTheDocument()
    expect(screen.getByText("Enter a problem to be solved")).toBeInTheDocument()
  })

  it("FunctionSelector renders categories", () => {
    render(<FunctionSelector onSelect={jest.fn()} />)
    expect(screen.getByText("Standard")).toBeInTheDocument()
    expect(screen.getByText("Advanced")).toBeInTheDocument()
  })

  it("Keypad fires callback on digit press", () => {
    const onKeyPress = jest.fn()
    render(<Keypad onKeyPress={onKeyPress} onOpenFunctions={jest.fn()} onSwitchToQwerty={jest.fn()} />)
    fireEvent.click(screen.getAllByRole("button", { name: "7" })[0])
    expect(onKeyPress).toHaveBeenCalledWith("7")
  })
})

describe("Result", () => {
  it("shows Solution heading and result value", () => {
    render(<Result />)
    expect(screen.getByText("Solution")).toBeInTheDocument()
    expect(screen.getByDisplayValue("x^2")).toBeInTheDocument()
  })

  it("shows tab buttons: Steps, Hints, Practices", () => {
    render(<Result />)
    expect(screen.getByText(/Steps/i)).toBeInTheDocument()
    expect(screen.getByText(/Hints/i)).toBeInTheDocument()
    expect(screen.getByText(/Practices/i)).toBeInTheDocument()
  })

  it("hides result value when Hide is clicked", () => {
    render(<Result />)
    fireEvent.click(screen.getByLabelText("Hide"))
    expect(screen.queryByDisplayValue("x^2")).not.toBeInTheDocument()
    expect(screen.getByLabelText("Unhide")).toBeInTheDocument()
  })

  it("reveals result value when Unhide is clicked", () => {
    render(<Result />)
    fireEvent.click(screen.getByLabelText("Hide"))
    fireEvent.click(screen.getByLabelText("Unhide"))
    expect(screen.getByDisplayValue("x^2")).toBeInTheDocument()
  })
})
