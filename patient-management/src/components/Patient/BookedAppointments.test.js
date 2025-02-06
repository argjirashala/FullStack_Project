import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import BookedAppointments from "./BookedAppointments";
import { BrowserRouter } from "react-router-dom";

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
      <BookedAppointments user={dummyUser} />
    </BrowserRouter>
  );

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

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

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

describe("BookedAppointments Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders booked appointments when appointments exist", async () => {
    const futureDate = "2099-12-31";
    const appointmentData = {
      doctorId: "doc1",
      date: futureDate,
      time: "10:00 AM",
      reason: "Routine checkup",
    };

    getDocs.mockResolvedValue(createQuerySnapshot([appointmentData]));

    const doctorData = { name: "John", surname: "Doe" };
    getDoc.mockResolvedValue(createDocSnapshot(doctorData));

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/appointment with dr\. john doe/i)
      ).toBeInTheDocument();
    });
    expect(screen.getByText(new RegExp(futureDate, "i"))).toBeInTheDocument();
    expect(screen.getByText(/10:00 am/i)).toBeInTheDocument();
    expect(screen.getByText(/routine checkup/i)).toBeInTheDocument();
  });

  test("renders no appointments message when there are no booked appointments", async () => {
    getDocs.mockResolvedValue(createQuerySnapshot([]));

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/no booked appointments found/i)
      ).toBeInTheDocument();
    });
  });
});
