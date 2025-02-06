import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DoctorView from "./DoctorView";

jest.mock("./Home", () => jest.fn(() => <div>Home Page</div>));
jest.mock("./Availability", () =>
  jest.fn(() => <div>Set Availability Page</div>)
);
jest.mock("./UpcomingAppointments", () =>
  jest.fn(() => <div>Upcoming Appointments Page</div>)
);
jest.mock("./ListOfAppointments", () =>
  jest.fn(() => <div>List of Appointments Page</div>)
);
jest.mock("./Profile", () => jest.fn(() => <div>Profile Page</div>));

const dummyDoctorData = {
  doctorID: "doc123",
  email: "doctor@example.com",
  name: "Dr. John Doe",
};

const renderComponent = (initialRoute = "/doctor/home") => {
  localStorage.setItem("doctorData", JSON.stringify(dummyDoctorData));

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="doctor/*" element={<DoctorView />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("DoctorView Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("renders navigation links and default Home page", () => {
    renderComponent();

    expect(screen.getByText(/set availability/i)).toBeInTheDocument();
    expect(screen.getByText(/upcoming appointments/i)).toBeInTheDocument();
    expect(screen.getByText(/list of appointments/i)).toBeInTheDocument();
    expect(screen.getByText(/profile/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();

    expect(screen.getByText(/home page/i)).toBeInTheDocument();
  });

  test("navigates to 'Set Availability' when clicking the link", () => {
    renderComponent();

    fireEvent.click(screen.getByText(/set availability/i));

    expect(screen.getByText(/set availability page/i)).toBeInTheDocument();
  });

  test("navigates to 'Upcoming Appointments' when clicking the link", () => {
    renderComponent();

    fireEvent.click(screen.getByText(/upcoming appointments/i));

    expect(screen.getByText(/upcoming appointments page/i)).toBeInTheDocument();
  });

  test("navigates to 'List of Appointments' when clicking the link", () => {
    renderComponent();

    fireEvent.click(screen.getByText(/list of appointments/i));

    expect(screen.getByText(/list of appointments page/i)).toBeInTheDocument();
  });

  test("navigates to 'Profile' when clicking the link", () => {
    renderComponent();

    fireEvent.click(screen.getByText(/profile/i));

    expect(screen.getByText(/profile page/i)).toBeInTheDocument();
  });
});
