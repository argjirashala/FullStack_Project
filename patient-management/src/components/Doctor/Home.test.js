import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "./Home";
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
  surname: "Smith",
};

const mockAppointments = [
  {
    id: "appointment1",
    time: "10:00 AM",
    patientFirstName: "John",
    patientLastName: "Doe",
    reason: "Fever",
    date: new Date().toISOString().split("T")[0],
    diagnosis: "",
    therapy: "",
  },
];

const renderComponent = () => render(<Home doctorData={mockDoctorData} />);

describe("Home Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDocs.mockResolvedValue({
      docs: mockAppointments.map((appt) => ({
        id: appt.id,
        data: () => appt,
      })),
    });
  });

  test("renders doctor's name and today's appointments", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/welcome, dr. smith!/i)).toBeInTheDocument();
      expect(screen.getByText(/today's appointments/i)).toBeInTheDocument();
      expect(
        screen.getByText((content) => content.includes("John Doe"))
      ).toBeInTheDocument();
      expect(screen.getByText(/fever/i)).toBeInTheDocument();
    });
  });

  test("opens diagnosis and therapy modal", async () => {
    renderComponent();

    await waitFor(() => {
      const buttons = screen.getAllByText(/add diagnosis and therapy/i);
      expect(buttons.length).toBeGreaterThan(0);
      fireEvent.click(buttons[0]);
    });

    expect(screen.getByLabelText(/diagnosis/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/therapy/i)).toBeInTheDocument();
  });

  test("uploads file to Cloudinary", async () => {
    const mockFile = new File(["file-content"], "report.pdf", {
      type: "application/pdf",
    });

    axios.post.mockResolvedValue({
      data: { secure_url: "https://mock.cloudinary.com/report.pdf" },
    });

    renderComponent();

    await waitFor(() =>
      fireEvent.click(screen.getAllByText(/add diagnosis and therapy/i)[0])
    );

    const fileInput = screen.getByLabelText(/upload file/i);
    Object.defineProperty(fileInput, "files", { value: [mockFile] });
    fireEvent.change(fileInput);

    fireEvent.click(screen.getByText(/Save/i));
  });

  test("saves diagnosis and therapy", async () => {
    updateDoc.mockResolvedValue();

    renderComponent();

    await waitFor(() =>
      fireEvent.click(screen.getAllByText(/add diagnosis and therapy/i)[0])
    );

    fireEvent.change(screen.getByLabelText(/diagnosis/i), {
      target: { value: "Flu" },
    });
    fireEvent.change(screen.getByLabelText(/therapy/i), {
      target: { value: "Rest and fluids" },
    });

    fireEvent.click(screen.getByText(/Save/i));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalled();
      expect(
        screen.queryByText(/add diagnosis and therapy/i)
      ).not.toBeInTheDocument();
    });
  });
});
