import { useState } from "react";
import { db } from "../../firebase-config";
import { doc, setDoc } from "firebase/firestore"; 
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const Register = () => {
  const [formData, setFormData] = useState({
    personalId: "",
    firstName: "",
    lastName: "",
    birthday: "",
    address: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const auth = getAuth();

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      const patientDocRef = doc(db, "patients", user.uid); 
      await setDoc(patientDocRef, {
        personalId: formData.personalId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthday: formData.birthday,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
      });

      alert("Patient registered successfully!");

      setFormData({
        personalId: "",
        firstName: "",
        lastName: "",
        birthday: "",
        address: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error registering user:", error);
      alert(error.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleRegister}>
        <h2>Register</h2>

        <label htmlFor="personalId">Person ID</label>
        <br />
        <input
          type="text"
          id="personalId"
          name="personalId"
          value={formData.personalId}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <label htmlFor="firstName">First Name</label>
        <br />
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <label htmlFor="lastName">Last Name</label>
        <br />
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <label htmlFor="birthday">Birthday</label>
        <br />
        <input
          type="date"
          id="birthday"
          name="birthday"
          value={formData.birthday}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <label htmlFor="address">Address</label>
        <br />
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <label htmlFor="phone">Phone</label>
        <br />
        <input
          type="number"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <label htmlFor="email">Email</label>
        <br />
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <label htmlFor="password">Password</label>
        <br />
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <label htmlFor="confirmPassword">Confirm Password</label>
        <br />
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
