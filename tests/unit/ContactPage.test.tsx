import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactPage } from "@/pages/ContactPage";

// ContactPage uses no router primitives directly — no TanStack mock needed.

// ---------------------------------------------------------------------------
// Structure
// ---------------------------------------------------------------------------
describe("ContactPage — structure", () => {
  it("renders the main heading", () => {
    render(<ContactPage />);
    expect(
      screen.getByRole("heading", { name: /get in touch/i }),
    ).toBeInTheDocument();
  });

  it("renders the form section heading", () => {
    render(<ContactPage />);
    expect(
      screen.getByRole("heading", { name: /send us a message/i }),
    ).toBeInTheDocument();
  });

  it("renders the three contact info cards", () => {
    render(<ContactPage />);
    expect(screen.getByText("Email us")).toBeInTheDocument();
    expect(screen.getByText("Our office")).toBeInTheDocument();
    expect(screen.getByText("Support hours")).toBeInTheDocument();
  });

  it("renders the support email address", () => {
    render(<ContactPage />);
    expect(screen.getByText("support@holidaze.no")).toBeInTheDocument();
  });

  it("renders the name input field", () => {
    render(<ContactPage />);
    expect(screen.getByLabelText("Your name")).toBeInTheDocument();
  });

  it("renders the email input field", () => {
    render(<ContactPage />);
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });

  it("renders the subject select", () => {
    render(<ContactPage />);
    expect(screen.getByLabelText("Subject")).toBeInTheDocument();
  });

  it("renders the message textarea", () => {
    render(<ContactPage />);
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    render(<ContactPage />);
    expect(
      screen.getByRole("button", { name: /send message/i }),
    ).toBeInTheDocument();
  });

  it("renders all four subject options", () => {
    render(<ContactPage />);
    const select = screen.getByLabelText("Subject") as HTMLSelectElement;
    const values = Array.from(select.options)
      .map((o) => o.value)
      .filter(Boolean);
    expect(values).toEqual(["general", "booking", "hosting", "report"]);
  });
});

// ---------------------------------------------------------------------------
// Validation errors
// ---------------------------------------------------------------------------
describe("ContactPage — validation", () => {
  it("shows name error when name is too short", async () => {
    const user = userEvent.setup();
    render(<ContactPage />);
    await user.type(screen.getByLabelText("Your name"), "Jo");
    await user.click(screen.getByRole("button", { name: /send message/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/name must be at least 3 characters/i),
      ).toBeInTheDocument();
    });
  });

  it("shows email error when email is invalid", async () => {
    const user = userEvent.setup();
    render(<ContactPage />);
    await user.type(screen.getByLabelText("Email address"), "not-an-email");
    await user.click(screen.getByRole("button", { name: /send message/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it("shows message error when message is too short", async () => {
    const user = userEvent.setup();
    render(<ContactPage />);
    await user.type(screen.getByLabelText("Message"), "Too short");
    await user.click(screen.getByRole("button", { name: /send message/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/message must be at least 10 characters/i),
      ).toBeInTheDocument();
    });
  });

  it("shows subject error when no subject is selected", async () => {
    const user = userEvent.setup();
    render(<ContactPage />);
    // Fill all other fields correctly but leave subject blank
    await user.type(screen.getByLabelText("Your name"), "Jane Doe");
    await user.type(screen.getByLabelText("Email address"), "jane@example.com");
    await user.type(
      screen.getByLabelText("Message"),
      "This is a message long enough to pass.",
    );
    await user.click(screen.getByRole("button", { name: /send message/i }));
    await waitFor(() => {
      expect(screen.getByText(/please select a subject/i)).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Successful submission — real timers, 2s waitFor budget (real delay is 600ms)
// ---------------------------------------------------------------------------
describe("ContactPage — successful submission", () => {
  const fillAndSubmit = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText("Your name"), "Jane Doe");
    await user.type(screen.getByLabelText("Email address"), "jane@example.com");
    await user.selectOptions(screen.getByLabelText("Subject"), "general");
    await user.type(
      screen.getByLabelText("Message"),
      "This is a test message that is definitely long enough to pass validation.",
    );
    await user.click(screen.getByRole("button", { name: /send message/i }));
  };

  it("shows the success heading after valid submission", async () => {
    const user = userEvent.setup();
    render(<ContactPage />);
    await fillAndSubmit(user);
    await waitFor(
      () =>
        expect(
          screen.getByRole("heading", { name: /message sent/i }),
        ).toBeInTheDocument(),
      { timeout: 2000 },
    );
  });

  it("shows the 'Send another message' button after submission", async () => {
    const user = userEvent.setup();
    render(<ContactPage />);
    await fillAndSubmit(user);
    await waitFor(
      () =>
        expect(
          screen.getByRole("button", { name: /send another message/i }),
        ).toBeInTheDocument(),
      { timeout: 2000 },
    );
  });

  it("resets back to the form when 'Send another message' is clicked", async () => {
    const user = userEvent.setup();
    render(<ContactPage />);
    await fillAndSubmit(user);
    await waitFor(
      () =>
        expect(
          screen.getByRole("button", { name: /send another message/i }),
        ).toBeInTheDocument(),
      { timeout: 2000 },
    );
    await user.click(
      screen.getByRole("button", { name: /send another message/i }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /send us a message/i }),
      ).toBeInTheDocument(),
    );
  });
});
