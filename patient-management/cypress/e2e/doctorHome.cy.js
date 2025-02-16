describe("Doctor Home Page", () => {
  const today = new Date().toISOString().split("T")[0];

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem(
        "doctorData",
        JSON.stringify({ name: "Test", doctorID: "doc123", surname: "Doctor" })
      );
    });

    cy.visit("/doctor/home", {
      onBeforeLoad(win) {
        const getDocsStub = cy.stub().callsFake(() =>
          Promise.resolve({
            docs: [
              {
                id: "apt1",
                data: () => ({
                  time: "10:00",
                  date: today,
                  patientFirstName: "John",
                  patientLastName: "Doe",
                  reason: "Checkup",
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

        const updateDocStub = cy.stub().callsFake(() => Promise.resolve());
        Object.defineProperty(win, "updateDoc", {
          configurable: true,
          enumerable: true,
          value: updateDocStub,
        });

        const getEnvVarStub = (key) => {
          if (key === "VITE_APP_CLOUDINARY_CLOUD_NAME") return "fakeCloud";
          if (key === "VITE_APP_CLOUDINARY_UPLOAD_PRESET") return "fakePreset";
          if (key === "VITE_APP_CLOUDINARY_IMAGE_UPLOAD_URL")
            return "https://fakeimageupload.com";
          if (key === "VITE_APP_CLOUDINARY_RAW_UPLOAD_URL")
            return "https://fakerawupload.com";
          return "";
        };
        Object.defineProperty(win, "getEnvVar", {
          configurable: true,
          enumerable: true,
          value: getEnvVarStub,
        });
      },
    });
  });

  it("renders header and today's appointments", () => {
    cy.contains("Welcome, Dr. Doctor!").should("be.visible");
    cy.contains("John Doe").should("be.visible");
    cy.contains("Checkup").should("be.visible");
    cy.contains("10:00").should("be.visible");
    cy.contains("Add Diagnosis and Therapy").should("be.visible");
  });

  it("opens modal and validates required fields", () => {
    cy.contains("Add Diagnosis and Therapy").click();

    cy.get("#diagnosis").should("be.visible");
    cy.get("#therapy").should("be.visible");

    cy.contains("Save").click();
    cy.contains("Diagnosis is required.").should("be.visible");
    cy.contains("Therapy is required.").should("be.visible");
  });

  it("saves diagnosis and therapy successfully", () => {
    cy.contains("Add Diagnosis and Therapy").click();

    cy.get("#diagnosis").clear().type("Flu");
    cy.get("#therapy").clear().type("Rest and hydration");

    cy.contains("Save").click();

    cy.get(".home-modal-overlay").should("not.exist");
    cy.contains("View Diagnosis and Therapy").should("be.visible");
  });

  it("views diagnosis and therapy", () => {
    cy.visit("/doctor/home", {
      onBeforeLoad(win) {
        const getDocsStub = cy.stub().callsFake(() =>
          Promise.resolve({
            docs: [
              {
                id: "apt2",
                data: () => ({
                  time: "11:00",
                  date: today,
                  patientFirstName: "Jane",
                  patientLastName: "Doe",
                  reason: "Consultation",
                  diagnosis: "Headache",
                  therapy: "Painkillers",
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

        const updateDocStub = cy.stub().callsFake(() => Promise.resolve());
        Object.defineProperty(win, "updateDoc", {
          configurable: true,
          enumerable: true,
          value: updateDocStub,
        });

        Object.defineProperty(win, "getEnvVar", {
          configurable: true,
          enumerable: true,
        });
      },
    });

    cy.contains("View Diagnosis and Therapy").click();
  });
});
