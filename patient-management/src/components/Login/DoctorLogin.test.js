import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DoctorLogin from "./DoctorLogin";
import { BrowserRouter } from "react-router-dom";
import { getDocs } from "firebase/firestore";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const createEmptyQuerySnapshot = () => ({
  empty: true,
});

const createNonEmptyQuerySnapshot = (data) => ({
  empty: false,
  docs: [
    {
      data: () => data,
    },
  ],
});

const renderComponent = () =>
  render(
    <BrowserRouter>
      <DoctorLogin />
    </BrowserRouter>
  );

describe("DoctorLogin Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("renders login form elements", () => {
    renderComponent();

    expect(screen.getByText(/doctor login/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/doctor id/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("shows error when Doctor ID is not found", async () => {
    getDocs.mockResolvedValue(createEmptyQuerySnapshot());

    renderComponent();

    fireEvent.change(screen.getByLabelText(/doctor id/i), {
      target: { value: "nonexistent-doctor" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "anyPassword" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /login/i }));

    await waitFor(() =>
      expect(
        screen.getByText(
          /doctor id not found\. please check your credentials\./i
        )
      ).toBeInTheDocument()
    );
  });

  test("shows error when password is invalid", async () => {
    const doctorData = { doctorID: "doctor123", password: "correctPassword" };
    getDocs.mockResolvedValue(createNonEmptyQuerySnapshot(doctorData));

    renderComponent();

    fireEvent.change(screen.getByLabelText(/doctor id/i), {
      target: { value: "doctor123" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongPassword" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /login/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/invalid password\. please try again\./i)
      ).toBeInTheDocument()
    );
  });

  test("successful login stores doctor data and navigates to doctor home", async () => {
    const doctorData = { doctorID: "doctor123", password: "secret" };
    getDocs.mockResolvedValue(createNonEmptyQuerySnapshot(doctorData));

    renderComponent();

    fireEvent.change(screen.getByLabelText(/doctor id/i), {
      target: { value: "doctor123" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "secret" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(localStorage.getItem("doctorData")).toBe(
        JSON.stringify(doctorData)
      );
      expect(mockNavigate).toHaveBeenCalledWith("/doctor/home");
    });
  });
});
