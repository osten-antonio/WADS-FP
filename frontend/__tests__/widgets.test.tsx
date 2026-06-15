import { render, screen, fireEvent, act } from "@testing-library/react"
import { HintBox } from "@/components/widget/HintBox"
import { StepBox } from "@/components/widget/StepBox"
import { PracticeBox } from "@/components/widget/PracticeBox"

jest.mock("@/lib/api", () => ({
  generateExplanation: jest.fn().mockResolvedValue({ explanation: "Generated explanation" }),
  followUpExplanation: jest.fn().mockResolvedValue({ explanation: "Follow up explanation" }),
}))

// HintBox
describe("HintBox", () => {
  it("renders hint number", () => {
    render(<HintBox number={1} hint="Use the power rule" />)
    expect(screen.getByText(/Hint 1:/)).toBeInTheDocument()
  })

  it("shows hint text by default (not hidden)", () => {
    render(<HintBox number={2} hint="Factor out x" />)
    fireEvent.click(screen.getByLabelText("Unhide hint"))
    expect(screen.getByText(/Factor out x/)).toBeInTheDocument()
  })

  it("hides hint text when toggle clicked", () => {
    render(<HintBox number={1} hint="Use the power rule" />)
    fireEvent.click(screen.getByLabelText("Unhide hint"))
    fireEvent.click(screen.getByLabelText("Hide hint"))
    expect(screen.getByLabelText("Unhide hint")).toBeInTheDocument()
  })

  it("reveals hint text again when toggled back", () => {
    render(<HintBox number={1} hint="Use the power rule" />)
    fireEvent.click(screen.getByLabelText("Unhide hint"))
    fireEvent.click(screen.getByLabelText("Hide hint"))
    fireEvent.click(screen.getByLabelText("Unhide hint"))
    expect(screen.getByText(/Use the power rule/)).toBeInTheDocument()
  })
})

// StepBox
describe("StepBox", () => {
  it("renders the step number", () => {
    render(<StepBox step={2} summary="Apply the power rule" />)
    expect(screen.getByText("Step 2")).toBeInTheDocument()
  })

  it("shows summary when defaultOpen", () => {
    render(
      <StepBox step={1} summary="Simplify the expression" expression="x^2 + 2x" defaultOpen />
    )
    expect(screen.getByText("Simplify the expression")).toBeInTheDocument()
  })

  it("shows the Explain button when open", () => {
    render(<StepBox step={1} summary="Some step" defaultOpen />)
    expect(screen.getByRole("button", { name: /explain/i })).toBeInTheDocument()
  })

  it("Explain transitions to Explaining then Explained", async () => {
    render(<StepBox step={1} summary="Some step" defaultOpen />)

    const btn = screen.getByRole("button", { name: /explain/i })
    fireEvent.click(btn)
    expect(screen.getByText(/Explaining/i)).toBeInTheDocument()
    expect(btn).toBeDisabled()

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(screen.getByText(/Explained/i)).toBeInTheDocument()
  })

  it("collapsible opens when trigger is clicked", () => {
    render(<StepBox step={3} summary="Evaluate the derivative" />)
    fireEvent.click(screen.getByRole("button", { name: /toggle step 3/i }))
    expect(screen.getByText("Evaluate the derivative")).toBeInTheDocument()
  })
})

// PracticeBox
describe("PracticeBox", () => {
  it("renders question number", () => {
    render(<PracticeBox number={1} question="Simplify x^2 + 2x" questionLtx="x^2 + 2x" />)
    expect(screen.getByText(/Question 1:/)).toBeInTheDocument()
  })

  it("renders multiple boxes independently", () => {
    render(
      <>
        <PracticeBox number={1} question="Question A" questionLtx="A" />
        <PracticeBox number={2} question="Question B" questionLtx="B" />
      </>
    )
    expect(screen.getByText(/Question 1:/)).toBeInTheDocument()
    expect(screen.getByText(/Question 2:/)).toBeInTheDocument()
  })
})