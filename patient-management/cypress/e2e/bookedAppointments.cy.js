describe("Booked Appointments Page", () => {
  const fakeUser = {
    uid: "fakeUid",
    personalId: "P123",
    firstName: "Test",
    lastName: "Patient",
    email: "test@example.com",
  };

  context("when appointments exist", () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem("user", JSON.stringify(fakeUser));
      });

      cy.visit("/patient/booked-appointments", {
        onBeforeLoad(win) {
          const getDocsStub = cy.stub().callsFake(() =>
            Promise.resolve({
              docs: [
                {
                  id: "apt1",
                  data: () => ({
                    doctorId: "doc1",
                    patientId: "P123",
                    date: "2099-12-31",
                    time: "10:00",
                    reason: "Checkup",
                  }),
                },
                {
                  id: "apt2",
                  data: () => ({
                    doctorId: "doc2",
                    patientId: "P123",
                    date: "2099-12-31",
                    time: "11:00",
                    reason: "Consultation",
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

          const getDocStub = cy.stub();
          getDocStub.onCall(0).callsFake(() =>
            Promise.resolve({
              exists: () => true,
              data: () => ({ name: "Strange", surname: "Strange" }),
            })
          );
          getDocStub.onCall(1).callsFake(() =>
            Promise.resolve({
              exists: () => false,
              data: () => ({}),
            })
          );
          getDocStub.callsFake(() =>
            Promise.resolve({
              exists: () => false,
              data: () => ({}),
            })
          );
          Object.defineProperty(win, "getDoc", {
            configurable: true,
            enumerable: true,
            value: getDocStub,
          });
        },
      });
    });

    it("renders the title and appointment cards", () => {
      cy.contains("Booked Appointments").should("be.visible");
      cy.contains("Manage your appointments here").should("be.visible");

      cy.contains("11:00").should("be.visible");
      cy.contains("Consultation").should("be.visible");
      cy.contains("Appointment with Dr. Unknown Unknown").should("be.visible");
    });
  });

  context("when no appointments exist", () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem("user", JSON.stringify(fakeUser));
      });

      cy.visit("/patient/booked-appointments", {
        onBeforeLoad(win) {
          const getDocsStub = cy
            .stub()
            .callsFake(() => Promise.resolve({ docs: [] }));
          Object.defineProperty(win, "getDocs", {
            configurable: true,
            enumerable: true,
            value: getDocsStub,
          });
        },
      });
    });

    it("shows a message when no booked appointments are found", () => {
      cy.contains("No booked appointments found.").should("be.visible");
    });
  });
});
