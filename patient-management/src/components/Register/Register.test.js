import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "./Register";
import { BrowserRouter } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const createEmptyQuerySnapshot = () => ({
  empty: true,
  docs: [],
});

const createNonEmptyQuerySnapshot = (data) => ({
  empty: false,
  docs: [{ data: () => data }],
});

const renderComponent = () =>
  render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );

describe("Register Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders registration form elements", () => {
    renderComponent();

    expect(
      screen.getByRole("heading", { name: /sign up/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/personal id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/birthday/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  test("shows error when phone number is invalid", async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/personal id/i), {
      target: { value: "PID123" },
    });
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/birthday/i), {
      target: { value: "1990-01-01" },
    });
    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: "123456789" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "john.doe@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Password1" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password1" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /phone number must start with a '\+' followed by digits/i
        )
      ).toBeInTheDocument();
    });
  });

  test("shows error when passwords do not match", async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/personal id/i), {
      target: { value: "PID123" },
    });
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/birthday/i), {
      target: { value: "1990-01-01" },
    });
    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: "+123456789" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "john.doe@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Password1" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password2" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  test("shows error when required name fields are missing", async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/personal id/i), {
      target: { value: "PID123" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/birthday/i), {
      target: { value: "1990-01-01" },
    });
    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: "+123456789" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "john.doe@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Password1" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password1" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/first and last name are required/i)
      ).toBeInTheDocument();
    });
  });

  test("shows error when an account with the email already exists", async () => {
    getDocs.mockImplementation((q) => {
      return Promise.resolve(
        createNonEmptyQuerySnapshot({ email: "john.doe@example.com" })
      );
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/personal id/i), {
      target: { value: "PID123" },
    });
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/birthday/i), {
      target: { value: "1990-01-01" },
    });
    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: "+123456789" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "john.doe@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Password1" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password1" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/an account with this email already exists/i)
      ).toBeInTheDocument();
    });
  });

  test("successful registration navigates to login after a delay", async () => {
    getDocs.mockResolvedValue(createEmptyQuerySnapshot());

    const fakeUser = { uid: "user123" };
    createUserWithEmailAndPassword.mockResolvedValue({ user: fakeUser });
    setDoc.mockResolvedValue();

    jest.useFakeTimers();

    renderComponent();

    fireEvent.change(screen.getByLabelText(/personal id/i), {
      target: { value: "PID123" },
    });
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/birthday/i), {
      target: { value: "1990-01-01" },
    });
    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: "+123456789" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "john.doe@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Password1" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password1" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/sign up successful! redirecting to login/i)
      ).toBeInTheDocument();
    });

    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    jest.useRealTimers();
  });
});
