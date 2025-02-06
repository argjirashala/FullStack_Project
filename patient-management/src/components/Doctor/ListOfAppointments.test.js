import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ListOfAppointments from "./ListOfAppointments";
import { getDocs, updateDoc } from "firebase/firestore";
import axios from "axios";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
}));

jest.mock("axios");

const mockDoctorData = {
  doctorID: "doctor123",
  name: "Smith",
  surname: "Johnson",
};

const mockAppointments = [
  {
    id: "appt1",
    date: "2025-03-01",
    time: "10:00 AM",
    patientFirstName: "John",
    patientLastName: "Doe",
    patientId: "12345",
    reason: "Routine check-up",
    diagnosis: "Flu",
    therapy: "Rest and fluids",
    fileUrl: "https://mock.cloudinary.com/file.pdf",
    fileType: "application/pdf",
  },
  {
    id: "appt2",
    date: "2025-03-05",
    time: "02:00 PM",
    patientFirstName: "Jane",
    patientLastName: "Smith",
    patientId: "67890",
    reason: "Follow-up",
    diagnosis: "Cold",
    therapy: "Medication",
    fileUrl: null,
  },
];

const renderComponent = () =>
  render(<ListOfAppointments doctorData={mockDoctorData} />);

describe("ListOfAppointments Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDocs.mockResolvedValue({
      docs: mockAppointments.map((appt) => ({
        id: appt.id,
        data: () => appt,
      })),
    });
  });

  test("renders list of finished appointments", async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/List of Appointments for Dr. Johnson/i)
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });
  });

  test("filters appointments based on search criteria", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/First Name/i), {
      target: { value: "Jane" },
    });
    fireEvent.click(screen.getByText(/Search/i));

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });
  });

  test("opens and closes the edit modal", async () => {
    renderComponent();

    await waitFor(() => {
      fireEvent.click(screen.getAllByText(/View\/Edit/i)[0]);
    });

    expect(screen.getByText(/Edit Diagnosis and Therapy/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/Diagnosis:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Therapy:/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Cancel/i));

    await waitFor(() => {
      expect(
        screen.queryByText(/Edit Diagnosis and Therapy/i)
      ).not.toBeInTheDocument();
    });
  });

  test("downloads file correctly", async () => {
    axios.get.mockResolvedValue({
      data: new Blob(["Mock file content"], { type: "application/pdf" }),
    });

    renderComponent();

    await waitFor(() => {
      fireEvent.click(screen.getByText(/Download File/i));
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "https://mock.cloudinary.com/file.pdf",
        { responseType: "blob" }
      );
    });
  });

  test("updates diagnosis and therapy", async () => {
    updateDoc.mockResolvedValue();

    renderComponent();

    await waitFor(() => {
      fireEvent.click(screen.getAllByText(/View\/Edit/i)[0]);
    });

    fireEvent.change(screen.getByLabelText(/Diagnosis:/i), {
      target: { value: "Updated Flu" },
    });
    fireEvent.change(screen.getByLabelText(/Therapy:/i), {
      target: { value: "New Medication" },
    });

    fireEvent.click(screen.getByText(/Save/i));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalled();
      expect(
        screen.getByText(
          /Diagnosis, therapy, and\/or file updated successfully!/i
        )
      ).toBeInTheDocument();
    });
  });

  test("shows error if diagnosis or therapy fields are empty", async () => {
    renderComponent();

    await waitFor(() => {
      fireEvent.click(screen.getAllByText(/View\/Edit/i)[0]);
    });

    fireEvent.change(screen.getByLabelText(/Diagnosis:/i), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText(/Therapy:/i), {
      target: { value: "" },
    });

    fireEvent.click(screen.getByText(/Save/i));

    await waitFor(() => {
      expect(
        screen.getByText(/Diagnosis and therapy cannot be empty./i)
      ).toBeInTheDocument();
    });
  });
});
