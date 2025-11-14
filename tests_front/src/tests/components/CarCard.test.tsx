import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import CarCard from "@frontend/components/CarCard"

vi.mock("@frontend/components/CarModal", () => ({
  default: () => <div data-testid="modal">Mocked Modal</div>
}))

describe("CarCard", () => {
  it("renders car info correctly", () => {
    const fakeCar = {
      VIN: "123",
      mark: "TestCar",
      model: "test",
      prodYear: 2020,
      amount: 5000000,
      mileage: 15000,
      status: "Available",
      condition: "New",
      postDate: "2024-11-13",
      img: undefined
    }

    render(<CarCard car={fakeCar} />)

    expect(
      screen.getByText((content, node) => {
        if (!node) return false
        const text = node.textContent?.replace(/\s+/g, " ").trim()
        return text === "TestCar test (2020)"
      })
    ).toBeInTheDocument()

    expect(screen.getByText("5.000.000 ₽")).toBeInTheDocument()
    expect(screen.getByText(/Пробег:\s*15\.000 км/i)).toBeInTheDocument()
  })
})
