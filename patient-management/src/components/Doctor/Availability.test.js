import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SetAvailability from "./Availability";
import { getDoc, updateDoc, getDocs } from "firebase/firestore";

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

const mockDoctorData = {
  doctorID: "doctor123",
  name: "Smith",
};

const mockAvailability = [
  { date: "2025-09-23", slots: [{ startTime: "09:00", endTime: "10:00" }] },
];

const mockBookedSlots = [];

const renderComponent = () =>
  render(<SetAvailability doctorData={mockDoctorData} />);

describe("SetAvailability Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ availability: mockAvailability }),
    });
    getDocs.mockResolvedValue({
      docs: mockBookedSlots.map((slot) => ({ data: () => slot })),
    });
  });

  test("renders availability form and existing slots", async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/Set Availability for Dr. Smith/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Manage your working hours/i)
      ).toBeInTheDocument();
      expect(screen.getByText("2025-09-23")).toBeInTheDocument();
    });
  });

  test("adds a new time slot", async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Date/i), {
      target: { value: "2025-09-24" },
    });
    fireEvent.change(screen.getByLabelText(/Start Time/i), {
      target: { value: "10:00" },
    });
    fireEvent.change(screen.getByLabelText(/End Time/i), {
      target: { value: "11:00" },
    });
    fireEvent.click(screen.getByText(/Add Time Slot/i));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledTimes(1);
      expect(
        screen.getByText(/Time slot added successfully/i)
      ).toBeInTheDocument();
    });
  });

  test("prevents adding invalid time slots", async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Date/i), {
      target: { value: "2025-09-24" },
    });
    fireEvent.change(screen.getByLabelText(/Start Time/i), {
      target: { value: "12:00" },
    });
    fireEvent.change(screen.getByLabelText(/End Time/i), {
      target: { value: "11:00" },
    });
    fireEvent.click(screen.getByText(/Add Time Slot/i));

    await waitFor(() => {
      expect(
        screen.getByText(/Start time must be before end time/i)
      ).toBeInTheDocument();
    });
  });

  test("removes a time slot", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/09:00 - 10:00/i)).toBeInTheDocument();
    });

    const removeButton = await screen.findByRole("button", { name: /remove/i });
    expect(removeButton).toBeInTheDocument();

    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledTimes(1);
      expect(screen.queryByText(/09:00 - 10:00/i)).not.toBeInTheDocument();
    });
  });
});
