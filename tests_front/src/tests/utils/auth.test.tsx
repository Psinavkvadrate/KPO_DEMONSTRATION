import { describe, it, expect, beforeEach } from "vitest";
import { setUser, getUser, clearUser, getFirstAndFatherName } from "@frontend/utils/auth";

describe("auth utils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("setUser saves user to localStorage", () => {
    const user = { full_name: "Иванов Иван Иванович", role: "User" };

    setUser(user);

    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    expect(stored.full_name).toBe("Иванов Иван Иванович");
  });

  it("getUser returns stored user", () => {
    const user = { full_name: "Petrov Petr", role: "Admin" };
    localStorage.setItem("user", JSON.stringify(user));

    const result = getUser();
    expect(result?.role).toBe("Admin");
  });

  it("clearUser removes user from storage", () => {
    localStorage.setItem("user", JSON.stringify({ a: 1 }));
    clearUser();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("getFirstAndFatherName extracts name and patronymic", () => {
    const fullName = "Иванов Иван Сергеевич";
    expect(getFirstAndFatherName(fullName)).toBe("Иван Сергеевич");
  });

  it("getFirstAndFatherName handles missing values", () => {
    expect(getFirstAndFatherName("Иванов")).toBe("Иванов");
    });
});
