import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert } from "@/components/ui/alert";

describe("Alert", () => {
  it("is announced as an alert and shows its title and body", () => {
    render(
      <Alert variant="destructive" title="Booking failed">
        Those dates are taken.
      </Alert>,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Booking failed");
    expect(alert).toHaveTextContent("Those dates are taken.");
  });

  it("stays out of the tab order by default", () => {
    render(<Alert>Heads up.</Alert>);
    expect(screen.getByRole("alert")).not.toHaveAttribute("tabindex");
    expect(document.body).toHaveFocus();
  });

  it("takes focus when focusOnMount is set", () => {
    // A submit error is announced by role="alert", but a keyboard user is
    // left standing on the button they just pressed, which may now be off
    // screen. The server-error alerts pull focus to themselves instead.
    render(<Alert focusOnMount>Incorrect email or password.</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("tabindex", "-1");
    expect(alert).toHaveFocus();
  });
});
