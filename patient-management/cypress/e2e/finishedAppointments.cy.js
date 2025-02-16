describe("Finished Appointments Page", () => {
  const fakeUser = {
    uid: "fakeUid",
    personalId: "P123",
    firstName: "Test",
    lastName: "Patient",
    email: "test@example.com",
  };

  context("when finished appointments exist", () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem("user", JSON.stringify(fakeUser));
      });

      cy.visit("/patient/finished-appointments", {
        onBeforeLoad(win) {
          const getDocsStub = cy.stub().callsFake(() =>
            Promise.resolve({
              docs: [
                {
                  id: "apt1",
                  data: () => ({
                    doctorId: "doc1",
                    date: "2099-12-31",
                    time: "10:00",
                    reason: "Follow-up",
                    diagnosis: "Diagnosis details",
                    therapy: "Therapy details",
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
          const getDocStub = cy.stub().callsFake(() =>
            Promise.resolve({
              exists: () => true,
              data: () => ({ name: "Strange", surname: "Strange" }),
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

    it("renders the title, description, and appointment card", () => {
      cy.contains("Finished Appointments").should("be.visible");
      cy.contains("Review your past appointments").should("be.visible");

      cy.contains("10:00").should("be.visible");
      cy.contains("2099-12-31").should("be.visible");
      cy.contains("Appointment with Dr. Strange Strange").should("be.visible");
    });

    it("opens modal and shows diagnosis, therapy, and download button when available", () => {
      cy.contains("Show Diagnosis and Therapy").click();

      cy.get(".modal-overlay").should("be.visible");

      cy.get(".modal-content").within(() => {
        cy.contains("Diagnosis and Therapy from Dr. Strange Strange").should(
          "be.visible"
        );
        cy.contains("Reason: Follow-up").should("be.visible");
        cy.contains("Diagnosis: Diagnosis details").should("be.visible");
        cy.contains("Therapy: Therapy details").should("be.visible");
      });
    });
  });

  context("when no finished appointments exist", () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem("user", JSON.stringify(fakeUser));
      });

      cy.visit("/patient/finished-appointments", {
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

    it("shows a message when no finished appointments are found", () => {
      cy.contains("No finished appointments found.").should("be.visible");
    });
  });
});
