describe("Doctor Login Page", () => {
  beforeEach(() => {
    cy.visit("/doctor-login", {
      onBeforeLoad(win) {
        const doctorLoginServiceStub = {
          getDoctorById: () => {},
        };

        Object.defineProperty(win, "doctorLoginService", {
          configurable: true,
          enumerable: true,
          get() {
            return doctorLoginServiceStub;
          },
        });

        cy.stub(doctorLoginServiceStub, "getDoctorById").as(
          "getDoctorByIdStub"
        );
      },
    });
  });

  it("displays error when Doctor ID is not found", () => {
    cy.get("@getDoctorByIdStub").then((stub) => {
      stub.callsFake(() => Promise.resolve({ empty: true }));
    });

    cy.get("#doctorId").type("nonexistentDoctor");
    cy.get("#password").type("somePassword");
    cy.get(".doctor-login-button").click();

    cy.contains("Doctor ID not found. Please check your credentials.").should(
      "be.visible"
    );
  });

  it("logs in successfully with valid credentials", () => {
    const fakeDoctorData = { password: "correctPassword", name: "Dr. Test" };

    cy.get("@getDoctorByIdStub").then((stub) => {
      stub.callsFake(() =>
        Promise.resolve({
          empty: false,
          docs: [
            {
              data: () => fakeDoctorData,
            },
          ],
        })
      );
    });

    cy.get("#doctorId").type("validDoctorId");
    cy.get("#password").type("correctPassword");
    cy.get(".doctor-login-button").click();

    cy.url().should("include", "/doctor/home");
  });

  it("displays error when password is invalid", () => {
    const fakeDoctorData = { password: "correctPassword", name: "Dr. Test" };

    cy.get("@getDoctorByIdStub").then((stub) => {
      stub.callsFake(() =>
        Promise.resolve({
          empty: false,
          docs: [
            {
              data: () => fakeDoctorData,
            },
          ],
        })
      );
    });

    cy.get("#doctorId").type("validDoctorId");
    cy.get("#password").type("wrongPassword");
    cy.get(".doctor-login-button").click();

    cy.contains("Invalid password. Please try again.").should("be.visible");
  });
});
