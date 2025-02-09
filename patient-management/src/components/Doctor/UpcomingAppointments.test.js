import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import UpcomingAppointments from "./UpcomingAppointments";
import { getDocs } from "firebase/firestore";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

const mockDoctorData = {
  doctorID: "doctor123",
  name: "Smith",
};

const mockUpcomingAppointments = [
  {
    id: "appt1",
    date: "2025-03-01",
    time: "10:00 AM",
    patientFirstName: "John",
    patientLastName: "Doe",
    reason: "Routine check-up",
  },
  {
    id: "appt2",
    date: "2025-03-05",
    time: "02:00 PM",
    patientFirstName: "Jane",
    patientLastName: "Smith",
    reason: "Follow-up",
  },
];

const renderComponent = () =>
  render(<UpcomingAppointments doctorData={mockDoctorData} />);

describe("UpcomingAppointments Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders upcoming appointments correctly", async () => {
    getDocs.mockResolvedValue({
      docs: mockUpcomingAppointments.map((appt) => ({
        id: appt.id,
        data: () => appt,
      })),
    });

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/Upcoming Appointments for Dr. Smith/i)
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Routine check-up/i)).toBeInTheDocument();
      expect(screen.getByText(/Follow-up/i)).toBeInTheDocument();
    });
  });

  test("shows 'No upcoming appointments' when there are no future appointments", async () => {
    getDocs.mockResolvedValue({ docs: [] });

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/No upcoming appointments found/i)
      ).toBeInTheDocument();
    });
  });

  test("does not show past appointments", async () => {
    const mockPastAppointments = [
      {
        id: "appt1",
        date: "2024-02-01",
        time: "10:00 AM",
        patientFirstName: "John",
        patientLastName: "Doe",
        reason: "Past appointment",
      },
    ];

    getDocs.mockResolvedValue({
      docs: mockPastAppointments.map((appt) => ({
        id: appt.id,
        data: () => appt,
      })),
    });

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/No upcoming appointments found/i)
      ).toBeInTheDocument();
    });
  });
});
