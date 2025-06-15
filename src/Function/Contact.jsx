import React, { useState } from "react";
import './Contact.css'

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    eventType: "",
    eventDate: "",
    referralSource: "",
    referralName: "",
    planningNeeds: "",
    estimatedBudget: "",
    guestCount: "",
    additionalInfo: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "eventType",
      "eventDate",
      "referralSource",
      "planningNeeds",
      "estimatedBudget",
      "guestCount",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (e) => {
  let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
  if (value.length > 2 && value.length <= 4) {
    value = value.slice(0, 2) + '-' + value.slice(2);
  } else if (value.length > 4) {
    value = value.slice(0, 2) + '-' + value.slice(2, 4) + '-' + value.slice(4, 8);
  }
  setFormData({ ...formData, eventDate: value });
};

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Here you can handle the form submission
       const message = `Contact Form Details:\n
First Name: ${formData.firstName}
Last Name: ${formData.lastName}
Email: ${formData.email}
Event Type: ${formData.eventType}
Event Date: ${formData.eventDate}
Referral Source: ${formData.referralSource}
Referral Name: ${formData.referralName}
Planning Needs: ${formData.planningNeeds}
Estimated Budget: ${formData.estimatedBudget}
Guest Count: ${formData.guestCount}
Additional Info: ${formData.additionalInfo}`;

 const encodedMessage = encodeURIComponent(message);
    const phoneNumber = "919562420067"; // 👉 replace with your WhatsApp number

    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");

      console.log("Form Data Submitted:", formData);
      alert("Form submitted successfully!");
    }
  };
  return (
<div className="contact-container container py-5">
  <div className="text-center mb-4 position-relative d-inline-block">
  <i className="bi bi-envelope fs-1 text-dark thin-envelope"></i>
  
    <h2 className="mt-3 " >Let’s Get This Party Started</h2>
      <p>
        For general business, press, and career inquiries:
        <br />
        <strong>empireeventskechery@gmail.com</strong>
        <br />
        <strong>Ph: 9562420067</strong>
      </p>
      <p>
        For event inquiries, please fill out the form below and one of our team
        members will get back to you within 48 hours.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label>First Name *</label>
            <input
              type="text"
              className="form-control"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
            {errors.firstName && <small className="text-danger">{errors.firstName}</small>}
          </div>

          <div className="col-md-6 mb-3">
            <label>Last Name *</label>
            <input
              type="text"
              className="form-control"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
            {errors.lastName && <small className="text-danger">{errors.lastName}</small>}
          </div>

          <div className="col-md-6 mb-3">
            <label>Email *</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <small className="text-danger">{errors.email}</small>}
          </div>

          <div className="col-md-6 mb-3">
            <label>Event Type *</label>
            <select
              className="form-control"
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
            >
              <option value="">-- Select --</option>
             
              <option>Anniversary</option>
              <option>Baptism</option>
              <option>Birthday</option>
              <option>Corporate</option>
               <option>Wedding</option>
              <option>Personal</option>
              <option>Other</option>
            </select>
            {errors.eventType && <small className="text-danger">{errors.eventType}</small>}
          </div>

          <div className="col-md-6 mb-3">
            <label>Event Date (dd-mm-yyyy) *</label>
            <input
              type="text"
              className="form-control"
              name="eventDate"
              placeholder="dd-mm-yyyy"
              value={formData.eventDate}
              onChange={handleDateChange}
            />
            {errors.eventDate && <small className="text-danger">{errors.eventDate}</small>}
          </div>

          <div className="col-md-6 mb-3">
            <label>Referral Source *</label>
            <select
              className="form-control"
              name="referralSource"
              value={formData.referralSource}
              onChange={handleChange}
            >
              <option value="">-- Select --</option>
              <option>Empire Events Client</option>
              <option>Instagram</option>
              <option>Online Search</option>
              <option>Friend/Family</option>
            </select>
            {errors.referralSource && <small className="text-danger">{errors.referralSource}</small>}
          </div>

          <div className="col-md-6 mb-3">
            <label>Name of Referral</label>
            <input
              type="text"
              className="form-control"
              name="referralName"
              value={formData.referralName}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Planning Needs *</label>
            <input
              type="text"
              className="form-control"
              name="planningNeeds"
              value={formData.planningNeeds}
              onChange={handleChange}
            />
            {errors.planningNeeds && <small className="text-danger">{errors.planningNeeds}</small>}
          </div>

          <div className="col-md-6 mb-3">
            <label>Estimated Budget *</label>
            <input
              type="text"
              className="form-control"
              name="estimatedBudget"
              value={formData.estimatedBudget}
              onChange={handleChange}
            />
            {errors.estimatedBudget && <small className="text-danger">{errors.estimatedBudget}</small>}
          </div>

          <div className="col-md-6 mb-3">
            <label>Estimated Guest Count *</label>
            <input
              type="number"
              className="form-control"
              name="guestCount"
              value={formData.guestCount}
              onChange={handleChange}
            />
            {errors.guestCount && <small className="text-danger">{errors.guestCount}</small>}
          </div>

          <div className="col-md-12 mb-3">
            <label>Additional Information</label>
            <textarea
              className="form-control"
              name="additionalInfo"
              rows="4"
              value={formData.additionalInfo}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="col-12">
            <button type="submit" className="button">
              SUBMIT
            </button>
          </div>
        </div>
      </form>
</div>
    </div>
  )
}

export default Contact
