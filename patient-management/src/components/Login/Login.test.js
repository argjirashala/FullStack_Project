import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./Login";
import { BrowserRouter } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getDocs, getDoc } from "firebase/firestore";

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
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
      <Login />
    </BrowserRouter>
  );

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders login form elements", () => {
    renderComponent();

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Forgot password\?/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
  });

  test("shows error when no account is found for the entered email", async () => {
    getDocs.mockResolvedValue(createEmptyQuerySnapshot());

    renderComponent();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "nonexistent@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "anyPassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/no account found with this email/i)
      ).toBeInTheDocument()
    );
  });

  test("handles login error for invalid credentials", async () => {
    getDocs.mockResolvedValue(
      createNonEmptyQuerySnapshot({ email: "user@example.com" })
    );

    signInWithEmailAndPassword.mockRejectedValue({
      code: "auth/invalid-credential",
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongPassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/incorrect password\. please try again\./i)
      ).toBeInTheDocument()
    );
  });

  test("successful login navigates to patient home", async () => {
    getDocs.mockResolvedValue(
      createNonEmptyQuerySnapshot({ email: "user@example.com" })
    );

    signInWithEmailAndPassword.mockResolvedValue({});

    const fakeUser = { uid: "12345" };
    getAuth.mockReturnValue({ currentUser: fakeUser });

    const patientData = { name: "John Doe", email: "user@example.com" };
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => patientData,
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "correctPassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/patient/home", {
        state: { patientData },
      })
    );
  });

  test("sends a password reset email when email is provided", async () => {
    sendPasswordResetEmail.mockResolvedValue();

    renderComponent();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /forgot password\?/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/password reset email sent! check your inbox\./i)
      ).toBeInTheDocument()
    );
  });
});
