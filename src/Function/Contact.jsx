import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { businessInfo, whatsappLink, emailLink } from "../Constants/BusinessInfo";
import './Contact.css'

const emptyForm = {
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
};

// Checks that a "dd-mm-yyyy" text is a real calendar date that is today or later
const checkEventDate = (value) => {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  if (!match) return "Please enter the date as dd-mm-yyyy";

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  // new Date() quietly "fixes" dates like 31-02-2026, so check it didn't change
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return "Please enter a valid date";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return "The event date cannot be in the past";

  return "";
};

// Small helper that shows the red error text under a field
const FieldError = ({ message }) =>
  message ? <div className="invalid-feedback d-block">{message}</div> : null;

const Contact = () => {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  // "idle" = nothing sent yet, "opened" = WhatsApp opened, "blocked" = browser blocked the new tab
  const [status, setStatus] = useState("idle");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Remove the error for this field as soon as the user edits it
    if (errors[name]) setErrors({ ...errors, [name]: "" });
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
      if (!formData[field].toString().trim()) {
        newErrors[field] = "This field is required";
      }
    });

    if (!newErrors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!newErrors.eventDate) {
      const dateError = checkEventDate(formData.eventDate);
      if (dateError) newErrors.eventDate = dateError;
    }

    if (!newErrors.guestCount && Number(formData.guestCount) < 1) {
      newErrors.guestCount = "Guest count must be at least 1";
    }

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
  if (errors.eventDate) setErrors({ ...errors, eventDate: "" });
};

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setStatus("idle");
      return;
    }

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

    const url = `${whatsappLink}?text=${encodeURIComponent(message)}`;
    setWhatsappUrl(url);

    // window.open returns null when the browser blocks the new tab
    const newTab = window.open(url, "_blank");
    setStatus(newTab ? "opened" : "blocked");
  };

  const handleClear = () => {
    setFormData(emptyForm);
    setErrors({});
    setStatus("idle");
  };

  // Adds Bootstrap's red border to fields that have an error
  const inputClass = (field) => `form-control${errors[field] ? " is-invalid" : ""}`;

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <section id="contact" className="section">
      <Container>
        <Row className="g-4 align-items-stretch">

          {/* Left: contact details */}
          <Col xs={12} lg={4}>
            <div className="contact-info">
              <i className="bi bi-envelope-heart contact-info-icon"></i>
              <h2>Let’s Get This Party Started</h2>
              <p>
                For event inquiries, please fill out the form and one of our team
                members will get back to you within 48 hours.
              </p>
              <p className="small mb-2">For general business, press, and career inquiries:</p>
              <ul className="contact-list">
                <li>
                  <a href={emailLink}><i className="bi bi-envelope"></i><span className="text-break">{businessInfo.email}</span></a>
                </li>
                <li>
                  <a href={`tel:${businessInfo.phone}`}><i className="bi bi-telephone"></i>Ph: {businessInfo.phone}</a>
                </li>
                <li>
                  <a href={whatsappLink} target="_blank" rel="noreferrer"><i className="bi bi-whatsapp"></i>Chat on WhatsApp</a>
                </li>
                <li>
                  <a href={businessInfo.instagram} target="_blank" rel="noreferrer"><i className="bi bi-instagram"></i>@empire_eventss</a>
                </li>
              </ul>
            </div>
          </Col>

          {/* Right: enquiry form */}
          <Col xs={12} lg={8}>
            <div className="contact-container">
              <h3 className="form-title">Event Enquiry Form</h3>
              <p className="form-note">Fields marked * are required.</p>

              {errorCount > 0 && (
                <div className="alert alert-danger" role="alert">
                  Please correct the {errorCount} highlighted field{errorCount > 1 ? "s" : ""} below.
                </div>
              )}

              {status === "opened" && (
                <div className="alert alert-success" role="status">
                  <i className="bi bi-whatsapp me-2"></i>
                  WhatsApp has opened with your enquiry details. Please press <strong>Send</strong> in
                  WhatsApp to deliver your message to us.
                </div>
              )}

              {status === "blocked" && (
                <div className="alert alert-warning" role="status">
                  Your browser blocked WhatsApp from opening.{" "}
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="alert-link">
                    Click here to open WhatsApp
                  </a>{" "}
                  and send your enquiry.
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="firstName" className="form-label">First Name *</label>
                    <input
                      id="firstName"
                      type="text"
                      className={inputClass("firstName")}
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      autoComplete="given-name"
                    />
                    <FieldError message={errors.firstName} />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="lastName" className="form-label">Last Name *</label>
                    <input
                      id="lastName"
                      type="text"
                      className={inputClass("lastName")}
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      autoComplete="family-name"
                    />
                    <FieldError message={errors.lastName} />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Email *</label>
                    <input
                      id="email"
                      type="email"
                      className={inputClass("email")}
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                    />
                    <FieldError message={errors.email} />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="eventType" className="form-label">Event Type *</label>
                    <select
                      id="eventType"
                      className={`form-select${errors.eventType ? " is-invalid" : ""}`}
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
                    <FieldError message={errors.eventType} />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="eventDate" className="form-label">Event Date (dd-mm-yyyy) *</label>
                    <input
                      id="eventDate"
                      type="text"
                      inputMode="numeric"
                      className={inputClass("eventDate")}
                      name="eventDate"
                      placeholder="dd-mm-yyyy"
                      value={formData.eventDate}
                      onChange={handleDateChange}
                    />
                    <FieldError message={errors.eventDate} />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="referralSource" className="form-label">Referral Source *</label>
                    <select
                      id="referralSource"
                      className={`form-select${errors.referralSource ? " is-invalid" : ""}`}
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
                    <FieldError message={errors.referralSource} />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="referralName" className="form-label">Name of Referral</label>
                    <input
                      id="referralName"
                      type="text"
                      className="form-control"
                      name="referralName"
                      value={formData.referralName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="planningNeeds" className="form-label">Planning Needs *</label>
                    <input
                      id="planningNeeds"
                      type="text"
                      className={inputClass("planningNeeds")}
                      name="planningNeeds"
                      value={formData.planningNeeds}
                      onChange={handleChange}
                    />
                    <FieldError message={errors.planningNeeds} />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="estimatedBudget" className="form-label">Estimated Budget *</label>
                    <input
                      id="estimatedBudget"
                      type="text"
                      className={inputClass("estimatedBudget")}
                      name="estimatedBudget"
                      value={formData.estimatedBudget}
                      onChange={handleChange}
                    />
                    <FieldError message={errors.estimatedBudget} />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="guestCount" className="form-label">Estimated Guest Count *</label>
                    <input
                      id="guestCount"
                      type="number"
                      min="1"
                      className={inputClass("guestCount")}
                      name="guestCount"
                      value={formData.guestCount}
                      onChange={handleChange}
                    />
                    <FieldError message={errors.guestCount} />
                  </div>

                  <div className="col-md-12 mb-3">
                    <label htmlFor="additionalInfo" className="form-label">Additional Information</label>
                    <textarea
                      id="additionalInfo"
                      className="form-control"
                      name="additionalInfo"
                      rows="4"
                      value={formData.additionalInfo}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="col-12 d-flex flex-wrap gap-3 align-items-center">
                    <button type="submit" className="btn-brand">
                      <i className="bi bi-whatsapp me-2"></i>SEND VIA WHATSAPP
                    </button>
                    <button type="button" className="btn-outline-brand" onClick={handleClear}>
                      Clear Form
                    </button>
                  </div>
                  <p className="form-note mt-3 mb-0">
                    Your enquiry is sent through WhatsApp. It is not stored on this website.
                  </p>
                </div>
              </form>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default Contact
