import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "./Home";
import { BrowserRouter } from "react-router-dom";

const dummyUser = {
  uid: "user123",
  personalId: "PID123",
  firstName: "Alice",
  lastName: "Smith",
  email: "alice@example.com",
};

const renderComponent = () =>
  render(
    <BrowserRouter>
      <Home user={dummyUser} />
    </BrowserRouter>
  );

import { getDocs, addDoc, getDoc } from "firebase/firestore";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

const createQuerySnapshot = (docsData) => ({
  empty: docsData.length === 0,
  docs: docsData.map((data, index) => ({
    id: `doc${index}`,
    data: () => data,
  })),
});

const createDocSnapshot = (data) => ({
  exists: () => true,
  data: () => data,
});

describe("Home Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders welcome message and appointment section", () => {
    renderComponent();

    expect(screen.getByText(/welcome, alice!/i)).toBeInTheDocument();
    expect(screen.getByText(/book an appointment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select specialization/i)).toBeInTheDocument();
  });

  test("fetches and displays doctors when a specialization is selected", async () => {
    const doctorData = {
      name: "John",
      surname: "Doe",
      email: "john.doe@example.com",
      clinicName: "Health Clinic",
      clinicAddress: "123 Clinic St",
      specialization: "Cardiologist",
    };

    getDocs.mockResolvedValue(createQuerySnapshot([doctorData]));

    renderComponent();

    const specializationSelect = screen.getByLabelText(
      /select specialization/i
    );
    fireEvent.change(specializationSelect, {
      target: { value: "Cardiologist" },
    });

    await waitFor(() => {
      expect(screen.getByText(/dr\. john doe/i)).toBeInTheDocument();
      expect(
        screen.getByText(/email: john\.doe@example\.com/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/clinic: health clinic/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /book appointment/i })
      ).toBeInTheDocument();
    });
  });

  test("opens modal when 'Book Appointment' button is clicked", async () => {
    const doctorData = {
      id: "doc1",
      name: "John",
      surname: "Doe",
      email: "john.doe@example.com",
      clinicName: "Health Clinic",
      clinicAddress: "123 Clinic St",
    };

    getDocs.mockResolvedValue(createQuerySnapshot([doctorData]));

    renderComponent();

    const specializationSelect = screen.getByLabelText(
      /select specialization/i
    );
    fireEvent.change(specializationSelect, {
      target: { value: "Cardiologist" },
    });

    await waitFor(() => {
      expect(screen.getByText(/dr\. john doe/i)).toBeInTheDocument();
    });

    const bookBtn = screen.getByRole("button", { name: /book appointment/i });
    fireEvent.click(bookBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/book appointment with dr\. john/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/select date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/select time slot/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/reason for appointment/i)
      ).toBeInTheDocument();
    });
  });

  test("displays error when a past date is selected", async () => {
    const doctorData = {
      id: "doc1",
      name: "John",
      surname: "Doe",
      email: "john.doe@example.com",
      clinicName: "Health Clinic",
      clinicAddress: "123 Clinic St",
    };
    getDocs.mockResolvedValue(createQuerySnapshot([doctorData]));

    renderComponent();

    const specializationSelect = screen.getByLabelText(
      /select specialization/i
    );
    fireEvent.change(specializationSelect, {
      target: { value: "Cardiologist" },
    });
    await waitFor(() => {
      expect(screen.getByText(/dr\. john doe/i)).toBeInTheDocument();
    });

    const bookBtn = screen.getByRole("button", { name: /book appointment/i });
    fireEvent.click(bookBtn);

    const dateInput = screen.getByLabelText(/select date/i);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pastDateStr = yesterday.toISOString().split("T")[0];
    fireEvent.change(dateInput, { target: { value: pastDateStr } });

    await waitFor(() => {
      expect(
        screen.getByText(/you cannot select a date in the past/i)
      ).toBeInTheDocument();
    });
  });

  test("fetches available slots when a valid date is selected", async () => {
    const doctorData = {
      id: "doc1",
      name: "John",
      surname: "Doe",
      email: "john.doe@example.com",
      clinicName: "Health Clinic",
      clinicAddress: "123 Clinic St",
      availability: [
        {
          date: "2030-01-01",
          slots: [
            { startTime: "09:00", endTime: "09:30" },
            { startTime: "09:30", endTime: "10:00" },
          ],
        },
      ],
    };

    getDoc.mockResolvedValue(createDocSnapshot(doctorData));
    getDocs.mockResolvedValue(createQuerySnapshot([]));

    renderComponent();

    getDocs.mockResolvedValue(createQuerySnapshot([doctorData]));
    const specializationSelect = screen.getByLabelText(
      /select specialization/i
    );
    fireEvent.change(specializationSelect, {
      target: { value: "Cardiologist" },
    });
    await waitFor(() => {
      expect(screen.getByText(/dr\. john doe/i)).toBeInTheDocument();
    });

    const bookBtn = screen.getByRole("button", { name: /book appointment/i });
    fireEvent.click(bookBtn);

    const dateInput = screen.getByLabelText(/select date/i);
    fireEvent.change(dateInput, { target: { value: "2030-01-01" } });

    await waitFor(() => {
      expect(
        screen.getByRole("option", { name: /09:00 - 09:30/i })
      ).toBeInTheDocument();
    });
  });

  test("books an appointment successfully", async () => {
    const doctorData = {
      id: "doc1",
      name: "John",
      surname: "Doe",
      email: "john.doe@example.com",
      clinicName: "Health Clinic",
      clinicAddress: "123 Clinic St",
      availability: [
        {
          date: "2030-01-01",
          slots: [
            { startTime: "09:00", endTime: "09:30" },
            { startTime: "09:30", endTime: "10:00" },
          ],
        },
      ],
    };

    getDoc.mockResolvedValue(createDocSnapshot(doctorData));
    getDocs.mockResolvedValue(createQuerySnapshot([]));

    addDoc.mockResolvedValue({ id: "appointment123" });

    jest.useFakeTimers();

    renderComponent();

    getDocs.mockResolvedValue(createQuerySnapshot([doctorData]));
    const specializationSelect = screen.getByLabelText(
      /select specialization/i
    );
    fireEvent.change(specializationSelect, {
      target: { value: "Cardiologist" },
    });
    await waitFor(() => {
      expect(screen.getByText(/dr\. john doe/i)).toBeInTheDocument();
    });

    const bookBtn = screen.getByRole("button", { name: /book appointment/i });
    fireEvent.click(bookBtn);

    const dateInput = screen.getByLabelText(/select date/i);
    fireEvent.change(dateInput, { target: { value: "2030-01-01" } });
    await waitFor(() => {
      expect(
        screen.getByRole("option", { name: /09:00 - 09:30/i })
      ).toBeInTheDocument();
    });

    const timeSlotSelect = screen.getByLabelText(/select time slot/i);
    fireEvent.change(timeSlotSelect, { target: { value: "09:00 - 09:30" } });

    const reasonTextarea = screen.getByLabelText(/reason for appointment/i);
    fireEvent.change(reasonTextarea, { target: { value: "General checkup" } });

    const confirmButton = screen.getByRole("button", {
      name: /confirm booking/i,
    });
    fireEvent.click(confirmButton);

    jest.advanceTimersByTime(3000);
    await waitFor(() => {
      expect(
        screen.queryByText(/book appointment with dr\./i)
      ).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  test("shows error if booking appointment without selecting a time slot", async () => {
    const doctorData = {
      id: "doc1",
      name: "John",
      surname: "Doe",
      email: "john.doe@example.com",
      clinicName: "Health Clinic",
      clinicAddress: "123 Clinic St",
      availability: [
        {
          date: "2030-01-01",
          slots: [
            { startTime: "09:00", endTime: "09:30" },
            { startTime: "09:30", endTime: "10:00" },
          ],
        },
      ],
    };

    getDoc.mockResolvedValue(createDocSnapshot(doctorData));
    getDocs.mockResolvedValue(createQuerySnapshot([]));

    renderComponent();

    getDocs.mockResolvedValue(createQuerySnapshot([doctorData]));
    const specializationSelect = screen.getByLabelText(
      /select specialization/i
    );
    fireEvent.change(specializationSelect, {
      target: { value: "Cardiologist" },
    });
    await waitFor(() => {
      expect(screen.getByText(/dr\. john doe/i)).toBeInTheDocument();
    });

    const bookBtn = screen.getByRole("button", { name: /book appointment/i });
    fireEvent.click(bookBtn);

    const dateInput = screen.getByLabelText(/select date/i);
    fireEvent.change(dateInput, { target: { value: "2030-01-01" } });
    await waitFor(() => {
      expect(
        screen.getByRole("option", { name: /09:00 - 09:30/i })
      ).toBeInTheDocument();
    });

    const reasonTextarea = screen.getByLabelText(/reason for appointment/i);
    fireEvent.change(reasonTextarea, { target: { value: "General checkup" } });

    const confirmButton = screen.getByRole("button", {
      name: /confirm booking/i,
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(
        screen.getByText(/please select a time slot/i)
      ).toBeInTheDocument();
    });
  });
});
