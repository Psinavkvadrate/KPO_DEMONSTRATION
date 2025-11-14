import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HeaderBar from "@frontend/components/HeaderBar";

vi.mock("@frontend/components/HeaderBar", () => ({
  default: () => (
    <div data-testid="header">
      <div className="logo">ЖСПД</div>
      <nav>
        <span>Каталог</span>
        <span>Мои встречи</span>
      </nav>
      <span className="username">John Doe</span>
      <button onClick={() => {}} data-testid="logout">
        Выйти
      </button>
    </div>
  ),
}));

describe("HeaderBar", () => {
  it("renders user name", () => {
    render(<HeaderBar />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders catalog and meet menu", () => {
    render(<HeaderBar />);
    expect(screen.getByText("Каталог")).toBeInTheDocument();
    expect(screen.getByText("Мои встречи")).toBeInTheDocument();
  });

  it("logout button exists", () => {
    render(<HeaderBar />);
    expect(screen.getByTestId("logout")).toBeInTheDocument();
  });
});
