describe("Doctor Profile Page", () => {
  const fakeDoctorData = {
    doctorID: "doc001",
    email: "old@example.com",
    specialization: "Cardiologist",
    clinicName: "Old Clinic",
    clinicAddress: "Old Address",
    phone: "+1111111111",
    password: "oldPass123",
  };

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem("doctorData", JSON.stringify(fakeDoctorData));
    });

    cy.visit("/doctor/profile", {
      onBeforeLoad(win) {
        const getDocStub = cy.stub().callsFake(() =>
          Promise.resolve({
            exists: () => true,
            data: () => ({
              email: "doctor@example.com",
              specialization: "Cardiologist",
              clinicName: "Heart Clinic",
              clinicAddress: "123 Clinic Rd",
              phone: "+1234567890",
              password: "oldPass123",
            }),
          })
        );
        Object.defineProperty(win, "getDoc", {
          configurable: true,
          enumerable: true,
          value: getDocStub,
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

  it("renders profile with pre-populated fields", () => {
    cy.get('[data-testid="email"]').should("have.value", "doctor@example.com");
    cy.get('[data-testid="specialization"]').should(
      "have.value",
      "Cardiologist"
    );
    cy.get('[data-testid="clinic"]').should("have.value", "123 Clinic Rd");
    cy.get('[data-testid="phone"]').should("have.value", "+1234567890");
  });

  it("shows error for invalid phone number and prevents saving", () => {
    cy.get('[data-testid="phone"]').clear().type("123456");
    cy.contains("Phone must start with + and contain only numbers.").should(
      "be.visible"
    );
  });

  it("saves profile successfully when valid", () => {
    cy.get('[data-testid="clinic"]').clear().type("New Clinic Address");
    cy.get('[data-testid="phone"]').clear().type("+9876543210");
    cy.get('[data-testid="specialization"]').should(
      "have.value",
      "Cardiologist"
    );
    cy.get('[data-testid="save-profile"]').click();
    cy.contains("Profile updated successfully!").should("be.visible");
  });

  describe("Change Password", () => {
    it("shows error when current password is incorrect", () => {
      cy.get('[data-testid="current-password"]').type("wrongPass");
      cy.get('[data-testid="new-password-input"]').type("NewPass123");
      cy.get('[data-testid="confirm-new-password-input"]').type("NewPass123");
      cy.get('[data-testid="chngpass"]').click();
      cy.contains("Current password is incorrect.").should("be.visible");
    });

    it("shows error when new passwords do not match", () => {
      cy.get('[data-testid="current-password"]').type("oldPass123");
      cy.get('[data-testid="new-password-input"]').type("NewPass123");
      cy.get('[data-testid="confirm-new-password-input"]').type("NewPass124");
      cy.get('[data-testid="chngpass"]').click();
      cy.contains("New passwords do not match.").should("be.visible");
    });

    it("shows error when new password does not meet criteria", () => {
      cy.get('[data-testid="current-password"]').type("oldPass123");
      cy.get('[data-testid="new-password-input"]').type("short");
      cy.get('[data-testid="confirm-new-password-input"]').type("short");
      cy.get('[data-testid="chngpass"]').click();
      cy.contains(
        "Password must be at least 8 characters long and contain both letters and numbers."
      ).should("be.visible");
    });

    it("changes password successfully when valid", () => {
      cy.get('[data-testid="current-password"]').type("oldPass123");
      cy.get('[data-testid="new-password-input"]').type("NewPass123");
      cy.get('[data-testid="confirm-new-password-input"]').type("NewPass123");
      cy.get('[data-testid="chngpass"]').click();
      cy.contains("Password updated successfully!").should("be.visible");
      cy.get('[data-testid="current-password"]').should("have.value", "");
      cy.get('[data-testid="new-password-input"]').should("have.value", "");
      cy.get('[data-testid="confirm-new-password-input"]').should(
        "have.value",
        ""
      );
    });
  });
});
