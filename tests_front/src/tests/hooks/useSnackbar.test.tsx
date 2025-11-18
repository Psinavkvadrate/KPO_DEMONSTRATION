import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";

import { useSnackbar } from "@frontend/hooks/useSnackbar";

function TestComponent() {
  const { showSnackbar } = useSnackbar();
  const [messages, setMessages] = React.useState<string[]>([]);

  const handleClick = () => {
    showSnackbar("Hello!", "success");
    setMessages(prev => [...prev, "Hello!"]);
  };

  return (
    <div>
      <button onClick={handleClick}>Show</button>
      {messages.map((msg, idx) => (
        <div key={idx}>{msg}</div>
      ))}
    </div>
  );
}

describe("useSnackbar", () => {
  it("renders SnackbarElement and shows a message", () => {
    render(<TestComponent />);
    fireEvent.click(screen.getByText("Show"));
    expect(screen.getByText("Hello!")).toBeInTheDocument();
  });

  it("closes snackbar after timeout", () => {
    vi.useFakeTimers();
    render(<TestComponent />);
    fireEvent.click(screen.getByText("Show"));
    expect(screen.getByText("Hello!")).toBeInTheDocument();

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByText("Hello!")).toBeInTheDocument();
    vi.useRealTimers();
  });
});
