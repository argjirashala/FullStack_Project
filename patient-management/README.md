# Patient Management Application

This web application is designed to enhance the interaction between doctors and patients by streamlining appointment bookings, helthcare records, and follow-ups.

## Getting Started

### Prerequisites

- **Node.js** (v14 or later)
- **npm** or **yarn**
- A **Firebase project** with Firestore and Authentication enabled
- A **Cloudinary account** for file storage

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/argjirashala/FullStack_Project.git
   cd patient-management-app
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

   or

   ```bash
   yarn install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the root directory and add your Firebase and Cloudinary configuration:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_preset
   VITE_CLOUDINARY_IMAGE_UPLOAD_URL=your_cloudinary_image_upload_url
   VITE_APP_CLOUDINARY_RAW_UPLOAD_URL=your_cloudinary_raw_upload_url
   ```

4. **Start the Development Server:**

   ```bash
   npm run dev
   ```

   or

   ```bash
   yarn dev
   ```

5. **Access the Application:**
   Open your browser and navigate to [http://localhost:5173](http://localhost:5173) (or the configured port).

---

## Usage

### As a Patient

- **Sign Up:** Create an account.
- **Log In:** Access your dashboard.
- **Book Appointments:** Select a specialization, choose a doctor, and schedule an appointment.
- **View Appointments:** Check upcoming and finished appointments, and review doctor feedback.

### As a Doctor

- **Log In:** Use your doctor ID and password.
- **Manage Today’s Appointments:** View patient details and add diagnosis/therapy information.
- **Set Availability:** Update your appointment schedule.
- **Review Past Appointments:** Access a detailed list of all completed appointments with filtering options.
- **Update Profile:** Ensure your personal and clinic information is current.

---

## Testing

This project employs automated testing to maintain code quality and application reliability:

- **Jest:**  
  Unit tests are written using Jest to verify the functionality of individual components and utilities. Run the tests with:

  ```bash
  npm run test
  ```

- **Cypress:**  
  End-to-end tests are implemented using Cypress to simulate real user interactions and validate workflows across the application. To launch Cypress, use:
  ```bash
  npm run cypress:open
  ```
