import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Profile from "./Profile";
import { updateDoc, getDoc } from "firebase/firestore";

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

const mockDoctorData = {
  doctorID: "doctor123",
  email: "doctor@example.com",
  specialization: "Cardiologist",
  clinicName: "Health Clinic",
  clinicAddress: "123 Main St",
  phone: "+123456789",
  password: "securePass123",
};

const renderComponent = () => render(<Profile doctorData={mockDoctorData} />);

describe("Profile Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockDoctorData,
    });
  });

  test("renders the profile form", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Update Your Profile/i)).toBeInTheDocument();
      expect(screen.getByTestId("email")).toBeInTheDocument();
      expect(screen.getByTestId("specialization")).toBeInTheDocument();
      expect(screen.getByTestId("clinic")).toBeInTheDocument();
      expect(screen.getByTestId("phone")).toBeInTheDocument();
    });
  });

  test("updates profile information", async () => {
    renderComponent();

    fireEvent.change(screen.getByTestId("clinic"), {
      target: { value: "456 New Address" },
    });

    fireEvent.click(screen.getByText(/Save Profile/i));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalled();
      expect(
        screen.getByText(/Profile updated successfully!/i)
      ).toBeInTheDocument();
    });
  });

  test("validates phone number input", async () => {
    renderComponent();

    fireEvent.change(screen.getByTestId("phone"), {
      target: { value: "invalidPhone" },
    });

    fireEvent.click(screen.getByText(/Save Profile/i));

    await waitFor(() => {
      expect(
        screen.queryByText(
          /Phone must start with \+ and contain only numbers./i
        )
      ).toBeInTheDocument();

      expect(updateDoc).not.toHaveBeenCalled();
    });
  });

  test("updates password successfully", async () => {
    renderComponent();

    fireEvent.change(screen.getByTestId("current-password"), {
      target: { value: "securePass123" },
    });
    fireEvent.change(screen.getByTestId("new-password-input"), {
      target: { value: "newPass123" },
    });

    fireEvent.change(screen.getByTestId("confirm-new-password-input"), {
      target: { value: "newPass123" },
    });

    fireEvent.click(screen.getByTestId("chngpass"));

    await waitFor(() => {
      expect(
        screen.getByText(/Password updated successfully!/i)
      ).toBeInTheDocument();
    });
  });

  test("prevents password update with mismatched passwords", async () => {
    renderComponent();

    fireEvent.change(screen.getByTestId("current-password"), {
      target: { value: "securePass123" },
    });
    fireEvent.change(screen.getByTestId("new-password-input"), {
      target: { value: "newPass123" },
    });

    fireEvent.change(screen.getByTestId("confirm-new-password-input"), {
      target: { value: "mismatchPass123" },
    });

    fireEvent.click(screen.getByTestId("chngpass"));

    await waitFor(() => {
      expect(
        screen.getByText(/New passwords do not match./i)
      ).toBeInTheDocument();
      expect(updateDoc).not.toHaveBeenCalled();
    });
  });

  test("prevents password update with incorrect current password", async () => {
    renderComponent();

    fireEvent.change(screen.getByTestId("current-password"), {
      target: { value: "wrongpass123" },
    });
    fireEvent.change(screen.getByTestId("new-password-input"), {
      target: { value: "newPass123" },
    });

    fireEvent.change(screen.getByTestId("confirm-new-password-input"), {
      target: { value: "newPass123" },
    });

    fireEvent.click(screen.getByTestId("chngpass"));

    await waitFor(() => {
      expect(
        screen.getByText(/Current password is incorrect./i)
      ).toBeInTheDocument();
      expect(updateDoc).not.toHaveBeenCalled();
    });
  });

  test("prevents password update with weak password", async () => {
    renderComponent();

    fireEvent.change(screen.getByTestId("current-password"), {
      target: { value: "securePass123" },
    });
    fireEvent.change(screen.getByTestId("new-password-input"), {
      target: { value: "weak" },
    });

    fireEvent.change(screen.getByTestId("confirm-new-password-input"), {
      target: { value: "weak" },
    });

    fireEvent.click(screen.getByTestId("chngpass"));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Password must be at least 8 characters long and contain both letters and numbers./i
        )
      ).toBeInTheDocument();
      expect(updateDoc).not.toHaveBeenCalled();
    });
  });
});
