import { useEffect, useState } from "react";
import { fetchBranches, fetchServices } from "../api/tokenApi";
import { createAppointment } from "../api/appointmentApi";

const AppointmentPage = () => {
  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [successData, setSuccessData] = useState(null);

  const [formData, setFormData] = useState({
    branchId: "",
    serviceId: "",
    appointmentDateTime: "",
    citizenName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [branchData, serviceData] = await Promise.all([
          fetchBranches(),
          fetchServices(),
        ]);
        setBranches(branchData);
        setServices(serviceData);
      } catch (error) {
        console.error("Failed to load branches/services:", error);
      }
    };

    loadData();
  }, []);
  
  useEffect(() => {
  if (!successData) return;

  const timer = setTimeout(() => {
    setSuccessData(null);
  }, 5000);

  return () => clearTimeout(timer);
}, [successData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await createAppointment(formData);
      setSuccessData(result.appointment);
    } catch (error) {
      console.error("Appointment create error:", error);
      alert("Failed to create appointment");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="token-card">
        <h1>Book Appointment Slot</h1>

        <div style={{ marginBottom: "20px" }}>
          <a href="/" style={{ marginRight: "16px" }}>Token Page</a>
          <a href="/notifications">Notification Logs</a>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Branch</label>
            <select name="branchId" value={formData.branchId} onChange={handleChange} required>
              <option value="">Select branch</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Service</label>
            <select name="serviceId" value={formData.serviceId} onChange={handleChange} required>
              <option value="">Select service</option>
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Appointment Date & Time</label>
            <input
              type="datetime-local"
              name="appointmentDateTime"
              value={formData.appointmentDateTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Citizen Name</label>
            <input
              type="text"
              name="citizenName"
              value={formData.citizenName}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>

          <button type="submit">Book Appointment</button>
        </form>

        {successData && (
          <div className="result-box">
            <h2>Appointment Booked Successfully</h2>
            <p><strong>Name:</strong> {successData.citizenName || "N/A"}</p>
            <p><strong>Branch:</strong> {successData.branch?.name}</p>
            <p><strong>Service:</strong> {successData.service?.name}</p>
            <p><strong>Date & Time:</strong> {new Date(successData.appointmentDateTime).toLocaleString()}</p>
            <p><strong>Email:</strong> {successData.email || "N/A"}</p>
            <p><strong>Phone:</strong> {successData.phone || "N/A"}</p>
            <p><strong>Status:</strong> {successData.status}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentPage;