import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PatientView from "./PatientView";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("./Home", () => jest.fn(() => <div>Home Page</div>));
jest.mock("./BookedAppointments", () =>
  jest.fn(() => <div>Booked Appointments Page</div>)
);
jest.mock("./FinishedAppointments", () =>
  jest.fn(() => <div>Finished Appointments Page</div>)
);

const dummyUser = {
  uid: "user1",
  personalId: "PID1",
  firstName: "Alice",
  lastName: "Smith",
  email: "alice@example.com",
};

const renderComponent = (initialRoute = "/patient/home") =>
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="patient/*" element={<PatientView user={dummyUser} />} />
      </Routes>
    </MemoryRouter>
  );

describe("PatientView Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders navigation links and default Home page", () => {
    renderComponent();

    expect(screen.getByText(/booked appointments/i)).toBeInTheDocument();
    expect(screen.getByText(/finished appointments/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  test("navigates to 'Booked Appointments' when clicking the link", () => {
    renderComponent();

    fireEvent.click(screen.getByText(/booked appointments/i));

    expect(screen.getByText(/booked appointments page/i)).toBeInTheDocument();
  });

  test("navigates to 'Finished Appointments' when clicking the link", () => {
    renderComponent();

    fireEvent.click(screen.getByText(/finished appointments/i));

    expect(screen.getByText(/finished appointments page/i)).toBeInTheDocument();
  });
});
