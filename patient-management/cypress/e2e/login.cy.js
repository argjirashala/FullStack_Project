describe("Login Page", () => {
  beforeEach(() => {
    cy.visit("/login", {
      onBeforeLoad(win) {
        const firebaseServiceStub = {
          getPatientByEmail: () => {},
          signIn: () => {},
          getPatientData: () => {},
          sendPasswordReset: () => {},
        };

        Object.defineProperty(win, "firebaseService", {
          configurable: true,
          enumerable: true,
          get() {
            return firebaseServiceStub;
          },
          set(value) {
            console.log("Ignoring override of firebaseService", value);
          },
        });

        Object.defineProperty(win, "getAuth", {
          configurable: true,
          enumerable: true,
          value: () => ({ currentUser: { uid: "fakeUid" } }),
        });

        Object.defineProperty(win, "onAuthStateChanged", {
          configurable: true,
          enumerable: true,
          value: (auth, callback) => {
            callback({ uid: "fakeUid" });
          },
        });

        cy.stub(win.firebaseService, "getPatientByEmail").as(
          "getPatientByEmailStub"
        );
        cy.stub(win.firebaseService, "signIn").as("signInStub");
        cy.stub(win.firebaseService, "getPatientData").as("getPatientDataStub");
        cy.stub(win.firebaseService, "sendPasswordReset").as(
          "sendPasswordResetStub"
        );
      },
    });
  });

  it("displays error when email is not found", () => {
    cy.get("@getPatientByEmailStub").then((stub) => {
      stub.callsFake(() => Promise.resolve({ empty: true }));
    });
    cy.get("#email").type("nonexistent@example.com");
    cy.get("#password").type("somePassword");
    cy.get(".login-button").click();
    cy.contains("No account found with this email").should("be.visible");
  });

  it("logs in successfully with valid credentials", () => {
    cy.get("@getPatientByEmailStub").then((stub) => {
      stub.callsFake(() => Promise.resolve({ empty: false }));
    });
    cy.get("@signInStub").then((stub) => {
      stub.callsFake(() => Promise.resolve());
    });
    cy.get("@getPatientDataStub").then((stub) => {
      stub.callsFake(() =>
        Promise.resolve({
          exists: () => true,
          data: () => ({ name: "Test Patient", email: "test@example.com" }),
        })
      );
    });
    cy.get("#email").type("test@example.com");
    cy.get("#password").type("correctPassword");
    cy.get(".login-button").click();

    cy.url().should("include", "/patient/home");
  });

  it("sends a password reset email when requested", () => {
    cy.get("@sendPasswordResetStub").then((stub) => {
      stub.callsFake(() => Promise.resolve());
    });
    cy.get("#email").type("test@example.com");
    cy.get(".forgot-password").click();
    cy.wait(500);
    cy.contains("Password reset email sent").should("be.visible");
  });
});
