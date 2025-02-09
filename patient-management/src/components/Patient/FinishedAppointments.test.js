import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FinishedAppointments from "./FinishedAppointments";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";

import { getDocs, getDoc } from "firebase/firestore";

const dummyUser = {
  uid: "user1",
  personalId: "PID1",
  firstName: "Alice",
  lastName: "Smith",
  email: "alice@example.com",
};

const renderComponent = () =>
  render(
    <BrowserRouter>
      <FinishedAppointments user={dummyUser} />
    </BrowserRouter>
  );

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock("axios");

const createQuerySnapshot = (docsData) => ({
  empty: docsData.length === 0,
  docs: docsData.map((data, index) => ({
    id: `appointment${index}`,
    data: () => data,
  })),
});

const createDocSnapshot = (data) => ({
  exists: () => true,
  data: () => data,
});

describe("FinishedAppointments Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders finished appointments when they exist", async () => {
    const finishedAppointments = [
      {
        doctorId: "doc1",
        date: "2024-01-10",
        time: "10:00 AM",
        reason: "General Checkup",
        diagnosis: "Flu",
        therapy: "Rest and hydration",
      },
    ];

    getDocs.mockResolvedValue(createQuerySnapshot(finishedAppointments));
    getDoc.mockResolvedValue(
      createDocSnapshot({ name: "John", surname: "Doe" })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/finished appointments/i)).toBeInTheDocument();
      expect(
        screen.getByText(/review your past appointments, alice/i)
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/appointment with dr. john doe/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/10:00 am/i)).toBeInTheDocument();
  });

  test("renders no appointments message when no finished appointments exist", async () => {
    getDocs.mockResolvedValue(createQuerySnapshot([]));

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/no finished appointments found/i)
      ).toBeInTheDocument();
    });
  });

  test("opens modal with diagnosis and therapy details", async () => {
    const finishedAppointments = [
      {
        doctorId: "doc1",
        date: "2024-01-10",
        time: "10:00 AM",
        reason: "General Checkup",
        diagnosis: "Flu",
        therapy: "Rest and hydration",
      },
    ];

    getDocs.mockResolvedValue(createQuerySnapshot(finishedAppointments));
    getDoc.mockResolvedValue(
      createDocSnapshot({ name: "John", surname: "Doe" })
    );

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/appointment with dr. john doe/i)
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/show diagnosis and therapy/i));

    await waitFor(() => {
      expect(
        screen.getByText(/diagnosis and therapy from dr. john doe/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/flu/i)).toBeInTheDocument();
      expect(screen.getByText(/rest and hydration/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("Close"));
    await waitFor(() => {
      expect(
        screen.queryByText(/diagnosis and therapy from dr. john doe/i)
      ).not.toBeInTheDocument();
    });
  });

  test("triggers file download when download button is clicked", async () => {
    const finishedAppointments = [
      {
        doctorId: "doc1",
        date: "2024-01-10",
        time: "10:00 AM",
        reason: "General Checkup",
        diagnosis: "Flu",
        therapy: "Rest and hydration",
        fileUrl: "https://example.com/report.pdf",
        fileType: "application/pdf",
      },
    ];

    getDocs.mockResolvedValue(createQuerySnapshot(finishedAppointments));
    getDoc.mockResolvedValue(
      createDocSnapshot({ name: "John", surname: "Doe" })
    );

    axios.get.mockResolvedValue({
      data: new Blob(["dummy content"], { type: "application/pdf" }),
    });

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/appointment with dr. john doe/i)
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/show diagnosis and therapy/i));

    await waitFor(() => {
      expect(
        screen.getByText(/diagnosis and therapy from dr. john doe/i)
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/download file/i));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("https://example.com/report.pdf", {
        responseType: "blob",
      });
    });
  });
});
