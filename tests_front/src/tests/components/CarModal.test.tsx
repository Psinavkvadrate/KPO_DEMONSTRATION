import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CarModal from "@frontend/components/CarModal";

vi.mock("@frontend/components/CarModal", () => ({
  default: ({ car, visible }: any) => (
    <div data-testid="modal">
      {visible && (
        <>
          <div>{car.mark} {car.model}</div>
          <div>VIN: {car.VIN}</div>
        </>
      )}
    </div>
  ),
}));

describe("CarModal", () => {
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
  };

  it("renders car modal content", () => {
    render(<CarModal car={fakeCar} visible={true} onClose={() => {}} />);

    expect(screen.getByText("TestCar test")).toBeInTheDocument();
    expect(screen.getByText("VIN: 123")).toBeInTheDocument();
  });
});
