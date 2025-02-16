describe("Patient Home Page - Book Appointment", () => {
  const fakeUser = {
    uid: "patient123",
    personalId: "P123",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
  };

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem("user", JSON.stringify(fakeUser));
    });

    cy.visit("/patient/home", {
      onBeforeLoad(win) {
        const getDocsStub = cy.stub();

        getDocsStub.onCall(0).callsFake(() =>
          Promise.resolve({
            docs: [
              {
                id: "doc1",
                data: () => ({
                  name: "Strange",
                  surname: "Strange",
                  email: "drstrange@example.com",
                  clinicName: "Magic Clinic",
                  clinicAddress: "123 Mystic Ln",
                  availability: [
                    {
                      date: "2099-12-31",
                      slots: [{ startTime: "09:00", endTime: "10:00" }],
                    },
                  ],
                }),
              },
            ],
          })
        );

        getDocsStub.onCall(1).callsFake(() => Promise.resolve({ docs: [] }));

        getDocsStub.onCall(2).callsFake(() =>
          Promise.resolve({
            exists: () => true,
            data: () => ({
              availability: [
                {
                  date: "2099-12-31",
                  slots: [{ startTime: "09:00", endTime: "10:00" }],
                },
              ],
            }),
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
            data: () => ({
              availability: [
                {
                  date: "2099-12-31",
                  slots: [{ startTime: "09:00", endTime: "10:00" }],
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

        const addDocStub = cy
          .stub()
          .callsFake(() => Promise.resolve({ id: "apt123" }));
        Object.defineProperty(win, "addDoc", {
          configurable: true,
          enumerable: true,
          value: addDocStub,
        });
      },
    });
  });

  it("renders the welcome message", () => {
    cy.contains("Welcome").should("be.visible");
  });

  it("books an appointment successfully", () => {
    cy.get("#specialization").select("Cardiologist");

    cy.contains("Dr. Strange Strange").should("be.visible");

    cy.contains("Book Appointment").click();

    cy.get(".modal-overlay").should("be.visible");

    cy.get("#date").type("2099-12-31");

    cy.get("#timeSlot").find("option").should("have.length.greaterThan", 1);
    cy.get("#timeSlot option").contains("09:00 - 10:00").should("be.visible");
    cy.get("#timeSlot").select("09:00 - 10:00");

    cy.get("#reason").type("Routine check-up");

    cy.contains("Confirm Booking").click();
  });
});
