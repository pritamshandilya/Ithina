import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { ChatMessage } from "@/types/wizard";

import ChatPanel from "./chat-panel";

jest.mock("@/components/shared/chat-messages", () => ({
  __esModule: true,
  default: ({
    messages,
    isTyping,
  }: {
    messages: ChatMessage[];
    isTyping: boolean;
  }) => (
    <section aria-label="Chat transcript">
      {messages.map((message, index) => (
        <article key={`${message.role}-${index}`}>{message.text}</article>
      ))}
      {isTyping ? <p>Assistant is typing</p> : null}
    </section>
  ),
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({
    children,
    onSelect,
  }: {
    children: React.ReactNode;
    onSelect?: (event: { preventDefault: () => void }) => void;
  }) => (
    <button type="button" onClick={() => onSelect?.({ preventDefault: jest.fn() })}>
      {children}
    </button>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const messages: ChatMessage[] = [
  { role: "user", text: "Promote bakery items" },
  { role: "ai", text: "I found markdown candidates." },
];

function renderChatPanel(
  overrides: Partial<React.ComponentProps<typeof ChatPanel>> = {},
) {
  return render(
    <ChatPanel
      hasSplit
      inputText=""
      isTyping={false}
      messages={messages}
      onInputChange={jest.fn()}
      onSubmit={jest.fn()}
      {...overrides}
    />,
  );
}

describe("ChatPanel", () => {
  beforeEach(() => {
    window.requestAnimationFrame = (callback) => {
      callback(0);
      return 0;
    };
    window.cancelAnimationFrame = jest.fn();
  });

  it("should render the Promo Assistant header and chat transcript", () => {
    renderChatPanel();

    expect(screen.getByRole("heading", { name: /promo assistant/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /chat transcript/i })).toBeInTheDocument();
    expect(screen.getByText("Promote bakery items")).toBeInTheDocument();
    expect(screen.getByText("I found markdown candidates.")).toBeInTheDocument();
  });

  it("should pass prompt text changes to the parent", async () => {
    const user = userEvent.setup();
    const onInputChange = jest.fn();

    renderChatPanel({ onInputChange });

    await user.type(screen.getByRole("textbox", { name: /promotion intent input/i }), "clear dairy");

    expect(onInputChange).toHaveBeenCalledWith("c");
  });

  it("should submit from the send button and Enter key", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    renderChatPanel({ inputText: "clear dairy", onSubmit });

    await user.click(screen.getByRole("button", { name: /send message/i }));
    await user.click(screen.getByRole("textbox", { name: /promotion intent input/i }));
    await user.keyboard("{Enter}");

    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it("should not submit blank prompts from Enter", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    renderChatPanel({ inputText: "   ", onSubmit });

    await user.click(screen.getByRole("textbox", { name: /promotion intent input/i }));
    await user.keyboard("{Enter}");

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should render quick-reply suggestions and call the suggestion handler", async () => {
    const user = userEvent.setup();
    const onSuggestionClick = jest.fn();

    renderChatPanel({
      onSuggestionClick,
      suggestions: ["Yes, apply this", "Reduce discount", "Preview first"],
    });

    await user.click(screen.getByRole("button", { name: /yes, apply this/i }));

    expect(onSuggestionClick).toHaveBeenCalledWith("Yes, apply this");
  });

  it("should hide suggestions and disable submit while typing", () => {
    renderChatPanel({
      isTyping: true,
      suggestions: ["Yes, apply this"],
    });

    expect(screen.getByText("Assistant is typing")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /yes, apply this/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
  });

  it("should call reset and language change handlers", async () => {
    const user = userEvent.setup();
    const onResetChat = jest.fn();
    const onLanguageChange = jest.fn();

    renderChatPanel({
      language: "en",
      languages: [
        {
          code: "en",
          englishName: "English",
          inputPlaceholder: "Describe your promotion intent...",
          nativeName: "English",
        },
        {
          code: "es",
          englishName: "Spanish",
          inputPlaceholder: "Describe la promoción...",
          nativeName: "Español",
        },
      ],
      onLanguageChange,
      onResetChat,
    });

    await user.click(screen.getByRole("button", { name: /reset chat and clear staged skus/i }));
    await user.click(screen.getByRole("button", { name: /español/i }));

    expect(onResetChat).toHaveBeenCalledTimes(1);
    expect(onLanguageChange).toHaveBeenCalledWith("es");
  });
});
