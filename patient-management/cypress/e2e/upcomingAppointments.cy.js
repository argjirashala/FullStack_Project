describe("Upcoming Appointments Page", () => {
  const fakeDoctorData = {
    name: "Dr. Future",
    doctorID: "doc456",
    surname: "Dr. Future",
  };

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem("doctorData", JSON.stringify(fakeDoctorData));
    });

    cy.visit("/doctor/upcoming-appointments", {
      onBeforeLoad(win) {
        const getDocsStub = cy.stub().callsFake(() =>
          Promise.resolve({
            docs: [
              {
                id: "apt1",
                data: () => ({
                  doctorId: "doc456",
                  date: "2020-01-01",
                  time: "10:00",
                  patientFirstName: "Old",
                  patientLastName: "Patient",
                  reason: "Old checkup",
                }),
              },
              {
                id: "apt2",
                data: () => ({
                  doctorId: "doc456",
                  date: "2099-01-02",
                  time: "14:00",
                  patientFirstName: "Future",
                  patientLastName: "Patient",
                  reason: "Upcoming consultation",
                }),
              },
            ],
          })
        );

        Object.defineProperty(win, "getDocs", {
          configurable: true,
          enumerable: true,
          value: getDocsStub,
        });
      },
    });
  });

  it("renders upcoming appointments if found", () => {
    cy.contains("Upcoming Appointments for Dr.").should("be.visible");
    cy.contains("Dr. Future").should("be.visible");

    cy.contains("2099-01-02").should("be.visible");
    cy.contains("14:00").should("be.visible");
    cy.contains("Future Patient").should("be.visible");
    cy.contains("Upcoming consultation").should("be.visible");

    cy.contains("2020-01-01").should("not.exist");
  });

  it("shows a message when there are no upcoming appointments", () => {
    cy.visit("/doctor/upcoming-appointments", {
      onBeforeLoad(win) {
        const getDocsStub = cy.stub().callsFake(() =>
          Promise.resolve({
            docs: [
              {
                id: "apt1",
                data: () => ({
                  doctorId: "doc456",
                  date: "2020-01-01",
                  time: "10:00",
                  patientFirstName: "Old",
                  patientLastName: "Patient",
                  reason: "Old checkup",
                }),
              },
            ],
          })
        );
        Object.defineProperty(win, "getDocs", {
          configurable: true,
          enumerable: true,
          value: getDocsStub,
        });
      },
    });

    cy.contains("No upcoming appointments found.").should("be.visible");
  });
});
