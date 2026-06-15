import "@testing-library/jest-dom"

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ user: { displayName: "Test User" } }),
    headers: new Headers(),
    redirected: false,
    status: 200,
    statusText: "OK",
    type: "basic",
    url: "",
    clone: function () { return this },
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(""),
  } as Response)
)

jest.mock("lucide-react", () => {
  const createMockIcon = (name: string) => {
    const MockComponent = ({ className, ...props }: { className?: string; [key: string]: unknown }) => (
      <svg className={className} data-testid={name} {...props} />
    )
    MockComponent.displayName = name
    return MockComponent
  }

  return {
    UserIcon: createMockIcon("UserIcon"),
    UserPen: createMockIcon("UserPen"),
    LogOut: createMockIcon("LogOut"),
    Menu: createMockIcon("Menu"),
    ChevronDown: createMockIcon("ChevronDown"),
    Send: createMockIcon("Send"),
    Sparkles: createMockIcon("Sparkles"),
    Eye: createMockIcon("Eye"),
    EyeOff: createMockIcon("EyeOff"),
    CopyIcon: createMockIcon("CopyIcon"),
    CheckIcon: createMockIcon("CheckIcon"),
    Loader2: createMockIcon("Loader2"),
    Camera: createMockIcon("Camera"),
    SendHorizontal: createMockIcon("SendHorizontal"),
    X: createMockIcon("X"),
    Search: createMockIcon("Search"),
    Check: createMockIcon("Check"),
    Pencil: createMockIcon("Pencil"),
    Trash2: createMockIcon("Trash2"),
    SquareArrowRightExit: createMockIcon("SquareArrowRightExit"),
  }
})

if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  })
}