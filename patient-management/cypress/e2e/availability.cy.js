describe("Doctor Availability Page", () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem(
        "doctorData",
        JSON.stringify({ name: "Dr. Test", doctorID: "doc123" })
      );
    });

    cy.visit("/doctor/set-availability", {
      onBeforeLoad(win) {
        const getDocStub = cy.stub().callsFake(() =>
          Promise.resolve({
            exists: () => true,
            data: () => ({
              availability: [
                {
                  date: "2099-01-01",
                  slots: [{ startTime: "09:00", endTime: "10:00" }],
                },
                {
                  date: "2099-01-02",
                  slots: [],
                },
              ],
            }),
          })
        );
        Object.defineProperty(win, "getDoc", {
          configurable: true,
          enumerable: true,
          value: getDocStub,
        });

        const getDocsStub = cy.stub().callsFake(() =>
          Promise.resolve({
            docs: [],
          })
        );
        Object.defineProperty(win, "getDocs", {
          configurable: true,
          enumerable: true,
          value: getDocsStub,
        });

        const updateDocStub = cy.stub().callsFake(() => Promise.resolve());
        Object.defineProperty(win, "updateDoc", {
          configurable: true,
          enumerable: true,
          value: updateDocStub,
        });
      },
    });
  });

  it("renders availability data from fetched doctor document", () => {
    cy.contains("Set Availability for Dr.").should("be.visible");
    cy.contains("Dr. Test").should("be.visible");

    cy.contains("2099-01-01").should("be.visible");
    cy.contains("09:00 - 10:00").should("be.visible");
  });

  it("shows error when adding a time slot with missing fields", () => {
    cy.get(".add-button").click();
    cy.contains("All fields are required.").should("be.visible");
  });

  it("shows error when start time is not before end time", () => {
    cy.get("#date").type("2099-01-03");
    cy.get("#startTime").type("11:00");
    cy.get("#endTime").type("10:00");
    cy.get(".add-button").click();
    cy.contains("Start time must be before end time.").should("be.visible");
  });

  it("adds a new time slot successfully", () => {
    cy.get("#date").type("2099-01-03");
    cy.get("#startTime").type("08:00");
    cy.get("#endTime").type("09:00");
    cy.get(".add-button").click();

    cy.contains("Time slot added successfully!").should("be.visible");

    cy.get("#date").should("have.value", "");
    cy.get("#startTime").should("have.value", "");
    cy.get("#endTime").should("have.value", "");
  });

  it("removes an existing time slot", () => {
    cy.contains("2099-01-01")
      .parents(".availability-item")
      .within(() => {
        cy.get(".remove-button").first().click();
      });

    cy.contains("09:00 - 10:00").should("not.exist");
  });
});
