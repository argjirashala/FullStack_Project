# Patient Management Application

This web application is designed to enhance the interaction between doctors and patients by streamlining appointment bookings, healthcare records, and follow-ups.

---

## Application Link

You can access the application here:  
**[patient-management application](https://patient-management.fly.dev/)**

---

## Overview

This application is built using **Vite + React** for the frontend, ensuring a fast and efficient user experience, and leverages **Firebase** (Firestore and Authentication) as the backend service for secure data management and user authentication. Additionally, **Cloudinary** is used as a a third-party file upload/download service to handle file storage, enabling doctors to upload and share files such as PDFs or images.

This application was built entirely from scratch using the concepts studied in the FullStack course. No specific tutorial was followed.

The primary goal of this application is to provide an integrated platform for patient management that allows both patients and doctors to efficiently manage appointments and communicate health information.

---

## Features

### For Patients

- **User Registration & Login:**  
  Patients can sign up and log in securely using Firebase Authentication.

- **Home Page:**

  - Select a doctor specialization to view available doctors.
  - View a list of doctors based on the selected specialization.
  - Book appointments by providing the reason and selecting a date and time according to the doctor's set availability.

- **Booked Appointments:**

  - View upcoming appointments displayed as cards.
  - Each card includes details such as the doctor's name, appointment time and date, and the reason for the appointment.

- **Finished Appointments:**
  - Access past appointments where the doctor has provided feedback.
  - Each finished appointment is displayed as a card with a **Show Diagnosis and Therapy** button.
  - Clicking the button opens a modal with detailed feedback, including therapy, diagnosis, and/or downloadable files (PDF or image).

### For Doctors

- **User Login (Access Granted by Administration):**  
  Doctors receive a unique doctor ID and password for secure login.

- **Home Page:**

  - View today’s appointments displayed as cards with detailed patient information.
  - Use the **Add Diagnosis and Therapy** button (with file upload capability) during or after the appointment. This information remains available for the day for any further reference.

- **Set Availability:**

  - Configure and update preferred appointment schedules.

- **Upcoming Appointments:**

  - Access a list of future appointments, presented as cards. This section is read-only for viewing purposes.

- **List of Appointments:**

  - After adding diagnosis and therapy or uploading files for an appointment, the completed appointment is added to a comprehensive list.
  - The list is filterable by patient’s name, surname, personal ID, or appointment date.
  - Detailed appointment information (including therapy, diagnosis, and file uploads) can be viewed and edited.

- **Profile Management:**
  - Update personal profile details such as email address, specialization, clinic address, and phone number.
  - Change passwords at any time.

---

## Credentials

For testing the application, please use the following pre-registered doctor accounts:

### Doctor Accounts

- **Doctor 1 – Neurologist:**

  - **Doctor ID:** `doc3452`
  - **Password:** `doctor1234`

- **Doctor 2 – Pediatrician:**
  - **Doctor ID:** `doc7186`
  - **Password:** `saraa1234`

### Patient Account (with a Finished Appointment) --> optional (the patient's can register themselves)

- **Email:** `mirishala@gmail.com`
- **Password:** `miri1234`

---

## Technology Stack

- **Frontend:**

  - **Vite + React:** Provides a modern and fast development environment with a highly responsive user interface.

- **Backend:**

  - **Firebase (Firestore & Authentication):** Handles data storage, retrieval, and secure user authentication.

- **Third-Party Services:**

  - **Cloudinary:** Manages file uploads and downloads efficiently, supporting images and PDFs.
  - Additional file upload/download services are integrated for enhanced file management capabilities.

- **Testing:**

  - **Jest:** Used for unit testing to ensure components and utilities function correctly.
  - **Cypress:** Employed for end-to-end testing, simulating user interactions to validate the overall application workflow.

- **CI/CD Automation:**

  - **GitHub Actions:** A CI/CD pipeline is set up using GitHub Actions, which runs automated processes including checkout, dependency installation, unit and end-to-end testing (with Jest and Cypress), linting, and finally building and deploying the production bundle to Fly. This ensures the application maintains high quality and seamless deployments.

---

## Work Hours Listing

Below is the detailed work hours listing for the development of this project:

| Day                         | Time    | What Did I Do                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **20.01.2025**              | 7       | • setting up the project<br>• creating basic Login and Signup pages<br>• setting up Firebase, Firestore, and Authentication<br>• fixing login and signup processes accordingly<br>• adding reset password feature via Firestore                                                                                                                                     |
| **21.01.2025**              | 5       | • simple patient UI<br>• connecting patients to their data in Firestore<br>• adding personalized view for each patient<br>• login for doctors<br>• simple doctor UI<br>• connecting doctors to Firestore data                                                                                                                                                       |
| **22.01.2025**              | 4       | • doctors can add profile data which will be saved in Firestore<br>• patients can access doctors                                                                                                                                                                                                                                                                    |
| **23.01.2025**              | 6       | • doctors can set their availability<br>• patients can book an appointment<br>• appointment details are saved in Firestore<br>• connecting patients and doctors through appointments                                                                                                                                                                                |
| **24.01.2025**              | 11      | • doctors can add diagnosis and therapy<br>• appointment data is updated<br>• dividing today’s and upcoming appointments<br>• doctors can update today’s appointments<br>• patients can see all booked and finished appointments<br>• finished appointments contain details added by the doctor<br>• doctors can view and update all past appointments with filters |
| **25.01.2025**              | 3       | • fixing some issues with doctor login and Firebase<br>• doctors can change their passwords                                                                                                                                                                                                                                                                         |
| **26.01.2025 – 28.01.2025** | 25      | • doctors can upload a file (PDF or image) on an appointment<br>• doctors can download the uploaded file<br>• patients can download the uploaded file (using a third-party service; Cloudinary was chosen)                                                                                                                                                          |
| **30.01.2025**              | 5       | • styling the Login for both patients and doctors<br>• adding better error handling<br>• displaying errors appropriately                                                                                                                                                                                                                                            |
| **31.01.2025**              | 2       | • styling the Signup page<br>• adding error handling and data validation<br>• displaying errors appropriately                                                                                                                                                                                                                                                       |
| **01.02.2025**              | 8       | • styling the whole patient UI<br>• adding feedback messages where needed<br>• displaying feedback messages appropriately                                                                                                                                                                                                                                           |
| **02.02.2025 – 03.02.2025** | 22      | • styling the whole doctor UI<br>• adding error/feedback messages where needed<br>• displaying error/feedback messages appropriately<br>• making functionality changes and fixes                                                                                                                                                                                    |
| **04.02.2025 – 06.02.2025** | 30      | • unit testing with Jest for the whole project (challenges included mocking Firestore data and Cloudinary file upload/download functionality)                                                                                                                                                                                                                       |
| **09.02.2025**              | 3       | • adding GitHub Actions<br>• setting up test and lint steps (linting was challenging due to Babel with Jest)                                                                                                                                                                                                                                                        |
| **10.02.2025 – 16.02.2025** | 35      | • end-to-end testing with Cypress for the whole project (challenges included mocking Firebase authentication and Firestore data)<br>• updating GitHub Actions to include Cypress testing (resolved initial errors)                                                                                                                                                  |
| **18.02.2025**              | 2       | • code cleanup<br>• formatting with Prettier                                                                                                                                                                                                                                                                                                                        |
| **19.02.2025**              | 3       | • fixes and changes before deployment<br>• manual testing of the project                                                                                                                                                                                                                                                                                            |
| **20.02.2025**              | 4       | • final changes<br>• deploying the project<br>• updating GitHub Actions<br>• fixing some errors                                                                                                                                                                                                                                                                     |
| **21.02.2025**              | 2       | • fixes related to Firebase and deployment issues                                                                                                                                                                                                                                                                                                                   |
| **23.02.2025**              | 2       | • formulating the content of README files                                                                                                                                                                                                                                                                                                                           |
| **TOTAL**                   | **179** |                                                                                                                                                                                                                                                                                                                                                                     |

---
