describe("List Of Appointments Page", () => {
  const fakeDoctorData = {
    name: "TestDoctor",
    doctorID: "doc789",
    surname: "Tester",
  };

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem("doctorData", JSON.stringify(fakeDoctorData));
    });

    cy.visit("/doctor/list-of-appointments", {
      onBeforeLoad(win) {
        const getDocsStub = cy.stub().callsFake(() =>
          Promise.resolve({
            docs: [
              {
                id: "apt1",
                data: () => ({
                  doctorId: fakeDoctorData.doctorID,
                  date: "2099-02-01",
                  time: "09:00",
                  patientFirstName: "Alice",
                  patientLastName: "Smith",
                  patientId: "A123",
                  reason: "Routine Check",
                  diagnosis: "Healthy",
                  therapy: "None",
                }),
              },
              {
                id: "apt2",
                data: () => ({
                  doctorId: fakeDoctorData.doctorID,
                  date: "2099-02-05",
                  time: "10:30",
                  patientFirstName: "Bob",
                  patientLastName: "Jones",
                  patientId: "B456",
                  reason: "Consultation",
                  diagnosis: "Flu",
                  therapy: "Rest",
                  fileUrl: "https://fakefileurl.com/report.pdf",
                  fileType: "application/pdf",
                }),
              },
              {
                id: "apt3",
                data: () => ({
                  doctorId: fakeDoctorData.doctorID,
                  date: "2099-02-10",
                  time: "14:00",
                  patientFirstName: "Charlie",
                  patientLastName: "Brown",
                  patientId: "C789",
                  reason: "Follow-up",
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

  it("renders the list of finished appointments", () => {
    cy.contains("List of Appointments for Dr. Tester").should("be.visible");

    cy.contains("2099-02-01").should("be.visible");
    cy.contains("Alice Smith").should("be.visible");

    cy.contains("2099-02-05").should("be.visible");
    cy.contains("Bob Jones").should("be.visible");

    cy.contains("2099-02-10").should("not.exist");
  });

  it("filters appointments by search criteria", () => {
    cy.get('input[placeholder="First Name"]').type("Alice");
    cy.get(".list-search-button").click();

    cy.contains("Alice Smith").should("be.visible");
    cy.contains("Bob Jones").should("not.exist");

    cy.get('input[placeholder="First Name"]').clear();
    cy.get('input[type="date"]').type("2099-02-05");
    cy.get(".list-search-button").click();

    cy.contains("Bob Jones").should("be.visible");
    cy.contains("Alice Smith").should("not.exist");
  });

  it("opens the edit modal and pre-populates fields", () => {
    cy.contains("View/Edit").first().click();

    cy.get(".modal-overlay").should("be.visible");

    cy.get("#diagnosis").should("have.value", "Healthy");
    cy.get("#therapy").should("have.value", "None");

    cy.get(".cancel-button").click();
    cy.get(".modal-overlay").should("not.exist");
  });

  it("edits diagnosis and therapy successfully", () => {
    cy.contains("View/Edit").click();

    cy.get("#diagnosis").should("have.value", "Healthy");
    cy.get("#therapy").should("have.value", "None");

    cy.get("#diagnosis").clear().type("Severe Flu");
    cy.get("#therapy").clear().type("Medication and rest");

    cy.get(".save-button").click();
  });

  it("downloads a file when Download File button is clicked", () => {
    cy.intercept("GET", "https://fakefileurl.com/report.pdf", {
      statusCode: 200,
      body: "fake-pdf-content",
      headers: { "content-type": "application/pdf" },
    }).as("downloadFile");

    cy.contains("Download File").click();

    cy.wait("@downloadFile");
  });

  it("shows an error if diagnosis and therapy are empty when saving", () => {
    cy.contains("View/Edit").first().click();

    cy.get("#diagnosis").clear();
    cy.get("#therapy").clear();

    cy.get(".save-button").click();

    cy.contains("Diagnosis and therapy cannot be empty.").should("be.visible");

    cy.get(".cancel-button").click();
  });
});
