import BranchMap from "./components/BranchMap";
import BranchSelector from "./components/BranchSelector";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import logo from "./assets/logo.png";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:1163";

const AUTH_API = `${API_BASE}/api/auth`;
const BRANCH_API = `${API_BASE}/api/branches`;
const WAITING_API = `${API_BASE}/api/waiting`;
const SERVICE_API = `${API_BASE}/api/services`;
const TOKEN_API = `${API_BASE}/api/tokens`;
const NOTIFICATION_API = `${API_BASE}/api/notifications`;
const APPOINTMENT_API = `${API_BASE}/api/appointments`;
const SLOT_API = `${API_BASE}/api/slots`;
const QUEUE_API = `${API_BASE}/api/queue`;
const REPORT_API = `${API_BASE}/api/reports`;
const ANALYTICS_API = `${API_BASE}/api/analytics`;
const ACTIVITY_API = `${API_BASE}/api/activity`;

const SERVICE_OPTIONS = [
  "General Inquiry",
  "License Renewal",
  "Document Verification",
  "Health Service",
  "Passport Renewal",
  "NID Correction",
];

const SLOT_OPTIONS = [
  "09:00 - 09:30",
  "09:30 - 10:00",
  "10:00 - 10:30",
  "10:30 - 11:00",
  "11:00 - 11:30",
  "11:30 - 12:00",
  "14:00 - 14:30",
  "14:30 - 15:00",
  "15:00 - 15:30",
  "15:30 - 16:00",
];

const formatDateForInput = (date) => date.toISOString().split("T")[0];

function App() {
  const [authMode, setAuthMode] = useState("login");
  const [loggedInUser, setLoggedInUser] = useState(() => {
    const savedUser = localStorage.getItem("equeueUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  const [currentView, setCurrentView] = useState("sharmin");

  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [queueTokens, setQueueTokens] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("23.7772");
  const [longitude, setLongitude] = useState("90.3760");
  const [open, setOpen] = useState("");
  const [close, setClose] = useState("");
  const [dailyCapacity, setDailyCapacity] = useState("");
  const [activeCounters, setActiveCounters] = useState("");
  const [status, setStatus] = useState("Active");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [branchMessage, setBranchMessage] = useState("");

  const [waitingBranchId, setWaitingBranchId] = useState("");
  const [waitingPeople, setWaitingPeople] = useState("");
  const [waitingResult, setWaitingResult] = useState(null);
  const [waitingMessage, setWaitingMessage] = useState("");

  const [holidayDate, setHolidayDate] = useState("");
  const [holidayResult, setHolidayResult] = useState(null);
  const [holidayMessage, setHolidayMessage] = useState("");

  const [tokenBranchId, setTokenBranchId] = useState("");
  const [tokenServiceId, setTokenServiceId] = useState("");
  const [preferredDate, setPreferredDate] = useState(formatDateForInput(new Date()));
  const [isPriority, setIsPriority] = useState(false);
  const [citizenName, setCitizenName] = useState("");
  const [citizenEmail, setCitizenEmail] = useState("");
  const [citizenPhone, setCitizenPhone] = useState("");
  const [tokenMessage, setTokenMessage] = useState("");

  const [activityEmail, setActivityEmail] = useState("");
  const [activityResult, setActivityResult] = useState(null);
  const [activityMessage, setActivityMessage] = useState("");

  const [slotSearchBranchId, setSlotSearchBranchId] = useState("");
  const [slotSearchServiceType, setSlotSearchServiceType] = useState("");
  const [slotSearchDate, setSlotSearchDate] = useState(formatDateForInput(new Date()));
  const [slotSearchTimeSlot, setSlotSearchTimeSlot] = useState("");
  const [maxQueueLength, setMaxQueueLength] = useState("");
  const [slotSearchResult, setSlotSearchResult] = useState(null);
  const [slotSearchMessage, setSlotSearchMessage] = useState("");

  const [serviceName, setServiceName] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [avgProcessingTime, setAvgProcessingTime] = useState("15");
  const [serviceFee, setServiceFee] = useState("0");
  const [servicePriority, setServicePriority] = useState("Medium");
  const [serviceMessage, setServiceMessage] = useState("");

  const [queueBranchId, setQueueBranchId] = useState("");
  const [queueServiceId, setQueueServiceId] = useState("");
  const [queueCitizenName, setQueueCitizenName] = useState("");
  const [queuePriority, setQueuePriority] = useState("Normal");
  const [queueMessage, setQueueMessage] = useState("");

  const [analyticsCompare, setAnalyticsCompare] = useState(null);
  const [leastCrowded, setLeastCrowded] = useState(null);
  const [analyticsMessage, setAnalyticsMessage] = useState("");

  const [appointmentServiceType, setAppointmentServiceType] = useState(SERVICE_OPTIONS[0]);
  const [appointmentDate, setAppointmentDate] = useState(formatDateForInput(new Date()));
  const [availableSlots, setAvailableSlots] = useState([]);
  const [appointmentTimeSlot, setAppointmentTimeSlot] = useState("");
  const [appointmentName, setAppointmentName] = useState("");
  const [appointmentEmail, setAppointmentEmail] = useState("");
  const [appointmentPhone, setAppointmentPhone] = useState("");
  const [appointmentMessage, setAppointmentMessage] = useState("");
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(formatDateForInput(new Date()));
  const [rescheduleSlot, setRescheduleSlot] = useState("");

  const [reportStartDate, setReportStartDate] = useState("2026-04-01");
  const [reportEndDate, setReportEndDate] = useState("2026-04-30");
  const [reportBranchId, setReportBranchId] = useState("");
  const [reportResult, setReportResult] = useState(null);
  const [reportMessage, setReportMessage] = useState("");

  const DEFAULT_AVG_PROCESSING_TIME = 15;

  const appointmentSlots = useMemo(() => {
    return availableSlots.length > 0 ? availableSlots : SLOT_OPTIONS;
  }, [availableSlots]);

  const showError = (setter, error, fallback) => {
    setter(error?.response?.data?.message || error?.response?.data?.error || fallback);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${AUTH_API}/login`, {
        email: loginEmail,
        password: loginPassword,
      });

      const user = res.data?.user || { email: loginEmail };
      localStorage.setItem("equeueUser", JSON.stringify(user));
      setLoggedInUser(user);
      setAuthMessage("");
    } catch (err) {
      showError(setAuthMessage, err, "Login failed");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${AUTH_API}/register`, {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      });

      setAuthMessage("Account created. Please login now.");
      setAuthMode("login");
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
    } catch (err) {
      showError(setAuthMessage, err, "Registration failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("equeueUser");
    setLoggedInUser(null);
    setAuthMode("login");
  };

  function getBranchStatus(branch) {
    return branch.status || "Active";
  }

  const totalBranches = branches.length;
  const activeBranches = branches.filter((branch) => getBranchStatus(branch) === "Active").length;
  const inactiveBranches = branches.filter((branch) => getBranchStatus(branch) === "Inactive").length;
  const maintenanceBranches = branches.filter((branch) => getBranchStatus(branch) === "Maintenance").length;

  function timeToMinutes(time) {
    if (!time) return null;

    const parts = time.split(":").map(Number);

    if (parts.length !== 2) return null;
    if (Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return null;

    return parts[0] * 60 + parts[1];
  }

  function getFeasibleCapacity(branch) {
    const openTime = branch.workingHours?.open;
    const closeTime = branch.workingHours?.close;

    const openMinutes = timeToMinutes(openTime);
    const closeMinutes = timeToMinutes(closeTime);

    if (openMinutes === null || closeMinutes === null) return null;

    const workingMinutes = closeMinutes - openMinutes;

    if (workingMinutes <= 0) return null;

    const counters = Number(branch.activeCounters || 0);

    if (counters <= 0) return null;

    return Math.floor((workingMinutes / DEFAULT_AVG_PROCESSING_TIME) * counters);
  }

  function getCapacityWarning(branch) {
    const feasibleCapacity = getFeasibleCapacity(branch);

    if (feasibleCapacity === null) {
      return "Capacity could not be calculated. Please check working hours.";
    }

    if (branch.dailyCapacity > feasibleCapacity) {
      return `Warning: Daily capacity ${branch.dailyCapacity} is higher than feasible capacity ${feasibleCapacity}.`;
    }

    return "";
  }

  const getBranches = async () => {
    try {
      let url = BRANCH_API;
      const params = [];

      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (filterStatus) params.push(`status=${encodeURIComponent(filterStatus)}`);

      if (params.length > 0) {
        url = `${BRANCH_API}?${params.join("&")}`;
      }

      const res = await axios.get(url);
      setBranches(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showError(setBranchMessage, err, "Failed to load branches");
    }
  };

  const getServices = async () => {
    try {
      const res = await axios.get(SERVICE_API);
      setServices(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch {
      setServices([]);
    }
  };

  const getTokens = async () => {
    try {
      const res = await axios.get(TOKEN_API);
      setTokens(Array.isArray(res.data) ? res.data : res.data.data || res.data.tokens || []);
    } catch {
      setTokens([]);
    }
  };

  const getQueueTokens = async () => {
    try {
      const res = await axios.get(`${QUEUE_API}/tokens`);
      setQueueTokens(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch {
      setQueueTokens([]);
    }
  };

  const getAppointments = async () => {
    try {
      const res = await axios.get(APPOINTMENT_API);
      setAppointments(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch {
      setAppointments([]);
    }
  };

  const getNotifications = async () => {
    try {
      const res = await axios.get(`${NOTIFICATION_API}?limit=10`);
      setNotifications(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch {
      setNotifications([]);
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      getBranches(),
      getServices(),
      getTokens(),
      getQueueTokens(),
      getAppointments(),
      getNotifications(),
    ]);
  };

  useEffect(() => {
    getBranches();
  }, [search, filterStatus]);

  useEffect(() => {
    if (loggedInUser) {
      refreshAll();
    }
  }, [loggedInUser]);

  useEffect(() => {
    if (loggedInUser) {
      fetchAppointmentAvailability();
    }
  }, [appointmentServiceType, appointmentDate, loggedInUser]);

  const handleBranchSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(BRANCH_API, {
        name,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
        workingHours: { open, close },
        dailyCapacity: Number(dailyCapacity),
        activeCounters: Number(activeCounters),
        status,
      });

      setBranchMessage("Branch created successfully");
      setName("");
      setAddress("");
      setLatitude("23.7772");
      setLongitude("90.3760");
      setOpen("");
      setClose("");
      setDailyCapacity("");
      setActiveCounters("");
      setStatus("Active");
      getBranches();
    } catch (err) {
      showError(setBranchMessage, err, "Failed to create branch");
    }
  };

  const changeStatus = async (id, newStatus) => {
    try {
      await axios.put(`${BRANCH_API}/${id}`, { status: newStatus });

      setBranches(
        branches.map((branch) =>
          branch._id === id ? { ...branch, status: newStatus } : branch
        )
      );

      setBranchMessage(`Status changed to ${newStatus}`);
    } catch (err) {
      showError(setBranchMessage, err, "Failed to update status");
    }
  };

  const deleteBranch = async (id) => {
    try {
      await axios.delete(`${BRANCH_API}/${id}`);
      setBranches(branches.filter((branch) => branch._id !== id));
      setBranchMessage("Branch deleted successfully");
    } catch (err) {
      showError(setBranchMessage, err, "Failed to delete branch");
    }
  };

  const checkWaitingTime = async () => {
    if (!waitingBranchId) {
      setWaitingMessage("Please select a branch");
      return;
    }

    try {
      const res = await axios.get(
        `${WAITING_API}/${waitingBranchId}?waitingPeople=${waitingPeople || 0}`
      );

      setWaitingResult(res.data);
      setWaitingMessage("");
    } catch (err) {
      setWaitingResult(null);
      showError(setWaitingMessage, err, "Failed to get waiting time");
    }
  };

  const checkHoliday = async () => {
    if (!holidayDate) {
      setHolidayMessage("Please select a date");
      return;
    }

    try {
      const res = await axios.get(
        `${WAITING_API}/holiday/check?date=${holidayDate}&country=BD`
      );

      setHolidayResult(res.data);
      setHolidayMessage("");
    } catch (err) {
      setHolidayResult(null);
      showError(setHolidayMessage, err, "Failed to check holiday");
    }
  };

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    setShowMap(false);

    if (branch?._id) {
      setWaitingBranchId(branch._id);
      setTokenBranchId(branch._id);
      setQueueBranchId(branch._id);
      setSlotSearchBranchId(branch._id);
      setReportBranchId(branch._id);
    }
  };

  const handleClearBranch = () => {
    setSelectedBranch(null);
  };

  const issueToken = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(TOKEN_API, {
        branchId: tokenBranchId,
        serviceId: tokenServiceId,
        preferredDate,
        isPriority,
        citizenName,
        email: citizenEmail,
        phone: citizenPhone,
      });

      setTokenMessage(res.data.message || "Token created successfully");
      setCitizenName("");
      setCitizenEmail("");
      setCitizenPhone("");
      getTokens();
      getNotifications();
    } catch (err) {
      showError(setTokenMessage, err, "Failed to issue token");
    }
  };

  const checkActivity = async () => {
    if (!activityEmail) {
      setActivityMessage("Citizen email is required");
      return;
    }

    try {
      const res = await axios.get(`${ACTIVITY_API}?email=${encodeURIComponent(activityEmail)}`);
      setActivityResult(res.data);
      setActivityMessage("");
    } catch (err) {
      setActivityResult(null);
      showError(setActivityMessage, err, "Failed to fetch activity");
    }
  };

  const searchSlots = async () => {
    try {
      const params = new URLSearchParams();

      if (slotSearchBranchId) params.append("branchId", slotSearchBranchId);
      if (slotSearchServiceType) params.append("serviceType", slotSearchServiceType);
      if (slotSearchDate) params.append("date", slotSearchDate);
      if (slotSearchTimeSlot) params.append("timeSlot", slotSearchTimeSlot);
      if (maxQueueLength) params.append("maxQueueLength", maxQueueLength);

      const res = await axios.get(`${SLOT_API}/search?${params.toString()}`);
      setSlotSearchResult(res.data);
      setSlotSearchMessage("");
    } catch (err) {
      setSlotSearchResult(null);
      showError(setSlotSearchMessage, err, "Failed to search slots");
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(SERVICE_API, {
        name: serviceName,
        category: serviceCategory,
        description: serviceDescription,
        avgProcessingTime: Number(avgProcessingTime),
        fee: Number(serviceFee),
        priority: servicePriority,
      });

      setServiceMessage("Service created successfully");
      setServiceName("");
      setServiceCategory("");
      setServiceDescription("");
      setAvgProcessingTime("15");
      setServiceFee("0");
      setServicePriority("Medium");
      getServices();
    } catch (err) {
      showError(setServiceMessage, err, "Failed to create service");
    }
  };

  const createQueueToken = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${QUEUE_API}/tokens`, {
        serviceId: queueServiceId,
        branchId: queueBranchId || null,
        citizenName: queueCitizenName,
        priority: queuePriority,
      });

      setQueueMessage("Real time queue token created");
      setQueueCitizenName("");
      getQueueTokens();
    } catch (err) {
      showError(setQueueMessage, err, "Failed to create queue token");
    }
  };

  const updateQueueStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${QUEUE_API}/tokens/${id}/status`, { status: newStatus });
      setQueueMessage(`Queue status updated to ${newStatus}`);
      getQueueTokens();
    } catch (err) {
      showError(setQueueMessage, err, "Failed to update queue status");
    }
  };

  const fetchAnalyticsCompare = async () => {
    try {
      const res = await axios.get(`${ANALYTICS_API}/compare`);
      setAnalyticsCompare(res.data);
      setAnalyticsMessage("");
    } catch (err) {
      setAnalyticsCompare(null);
      showError(setAnalyticsMessage, err, "Failed to compare branches");
    }
  };

  const fetchLeastCrowded = async () => {
    try {
      const res = await axios.get(`${ANALYTICS_API}/least-crowded`);
      setLeastCrowded(res.data);
      setAnalyticsMessage("");
    } catch (err) {
      setLeastCrowded(null);
      showError(setAnalyticsMessage, err, "Failed to find least crowded branch");
    }
  };

  async function fetchAppointmentAvailability() {
    if (!appointmentServiceType || !appointmentDate) return;

    try {
      const res = await axios.get(
        `${SLOT_API}/availability?serviceType=${encodeURIComponent(
          appointmentServiceType
        )}&date=${appointmentDate}`
      );

      const slots = res.data.availableSlots || [];
      setAvailableSlots(slots);
      setAppointmentTimeSlot(slots[0] || "");
    } catch {
      setAvailableSlots([]);
    }
  }

  const bookAppointment = async (e) => {
    e.preventDefault();

    if (!appointmentTimeSlot) {
      setAppointmentMessage("Please select a time slot");
      return;
    }

    const payload = {
      serviceType: appointmentServiceType,
      date: appointmentDate,
      timeSlot: appointmentTimeSlot,
      userName: appointmentName,
      userEmail: appointmentEmail,
      userPhone: appointmentPhone,
    };

    if (selectedBranch?._id) {
      payload.branch = selectedBranch._id;
    }

    try {
      await axios.post(APPOINTMENT_API, payload);
      setAppointmentMessage("Appointment booked successfully");
      setAppointmentName("");
      setAppointmentEmail("");
      setAppointmentPhone("");
      getAppointments();
      fetchAppointmentAvailability();
    } catch (err) {
      showError(setAppointmentMessage, err, "Appointment booking failed");
    }
  };

  const cancelAppointment = async (id) => {
    try {
      await axios.patch(`${APPOINTMENT_API}/${id}/cancel`);
      setAppointmentMessage("Appointment cancelled");
      getAppointments();
      fetchAppointmentAvailability();
    } catch (err) {
      showError(setAppointmentMessage, err, "Cancellation failed");
    }
  };

  const startReschedule = (appointment) => {
    setRescheduleId(appointment._id);
    setRescheduleDate(formatDateForInput(new Date(appointment.date)));
    setRescheduleSlot(appointment.timeSlot);
  };

  const submitReschedule = async (e) => {
    e.preventDefault();

    if (!rescheduleId || !rescheduleSlot) {
      setAppointmentMessage("Please select a new slot");
      return;
    }

    try {
      await axios.patch(`${APPOINTMENT_API}/${rescheduleId}/reschedule`, {
        date: rescheduleDate,
        timeSlot: rescheduleSlot,
      });

      setAppointmentMessage("Appointment rescheduled successfully");
      setRescheduleId(null);
      setRescheduleSlot("");
      getAppointments();
      fetchAppointmentAvailability();
    } catch (err) {
      showError(setAppointmentMessage, err, "Reschedule failed");
    }
  };

  const generateReport = async () => {
    try {
      const params = new URLSearchParams();
      params.append("startDate", reportStartDate);
      params.append("endDate", reportEndDate);

      if (reportBranchId) {
        params.append("branchId", reportBranchId);
      }

      const res = await axios.get(`${REPORT_API}/generate?${params.toString()}`);
      setReportResult(res.data);
      setReportMessage("");
    } catch (err) {
      setReportResult(null);
      showError(setReportMessage, err, "Failed to generate report");
    }
  };

  const navButtonClass = (view) =>
    currentView === view ? "nav-btn active" : "nav-btn";

  if (!loggedInUser) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: "520px" }}>
          <div className="hero" style={{ justifyContent: "center" }}>
            <img src={logo} alt="EQueue Logo" className="logo" />
          </div>

          <div className="card">
            <h2 style={{ textAlign: "center" }}>
              {authMode === "login" ? "Login" : "Sign Up"}
            </h2>

            {authMessage && <div className="message">{authMessage}</div>}

            <div className="auth-tabs">
              <button
                type="button"
                className={authMode === "login" ? "nav-btn active" : "nav-btn"}
                onClick={() => setAuthMode("login")}
              >
                Login
              </button>

              <button
                type="button"
                className={authMode === "signup" ? "nav-btn active" : "nav-btn"}
                onClick={() => setAuthMode("signup")}
              >
                Signup
              </button>
            </div>

            {authMode === "login" ? (
              <form className="form" style={{ gridTemplateColumns: "1fr" }} onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />

                <button type="submit">Login</button>
              </form>
            ) : (
              <form className="form" style={{ gridTemplateColumns: "1fr" }} onSubmit={handleSignup}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />

                <button type="submit">Create Account</button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="hero">
          <img src={logo} alt="EQueue Logo" className="logo" />

          <div>
            <p className="project-name">
              Government Service Queue Transparency and Smart Slot Management System
            </p>

            <p className="subtitle">
              Integrated dashboard grouped by team member features.
            </p>

            <div className="logout-row">
              <span>
                Logged in as: {loggedInUser?.name || loggedInUser?.email || "User"}
              </span>

              <button type="button" className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="nav-tabs">
          <button className={navButtonClass("sharmin")} onClick={() => setCurrentView("sharmin")}>
            Sharmin Features
          </button>

          <button className={navButtonClass("jakia")} onClick={() => setCurrentView("jakia")}>
            Jakia Features
          </button>

          <button className={navButtonClass("gunjan")} onClick={() => setCurrentView("gunjan")}>
            Gunjan Features
          </button>

          <button className={navButtonClass("shahrin")} onClick={() => setCurrentView("shahrin")}>
            Shahrin Features
          </button>
        </div>

        {currentView === "sharmin" && (
          <>
            <div className="card">
              <h2>Sharmin Feature 1: Branch Search and Filtering</h2>

              {branchMessage && <div className="message">{branchMessage}</div>}

              <div className="form">
                <input
                  type="text"
                  placeholder="Search by branch name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="card">
              <h2>Sharmin Feature 2: Branch Management</h2>

              <form className="form" onSubmit={handleBranchSubmit}>
                <input type="text" placeholder="Branch Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                <input type="number" step="any" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
                <input type="number" step="any" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
                <input type="time" value={open} onChange={(e) => setOpen(e.target.value)} required />
                <input type="time" value={close} onChange={(e) => setClose(e.target.value)} required />
                <input type="number" placeholder="Daily Capacity" value={dailyCapacity} onChange={(e) => setDailyCapacity(e.target.value)} required />
                <input type="number" placeholder="Active Counters" value={activeCounters} onChange={(e) => setActiveCounters(e.target.value)} required />

                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Maintenance">Maintenance</option>
                </select>

                <button type="submit">Create Branch</button>
              </form>
            </div>

            <div className="card">
              <h2>Sharmin Feature 3: Capacity Control Dashboard</h2>

              <div className="summary-grid">
                <div className="summary-box">
                  <h3>{totalBranches}</h3>
                  <p>Total Branches</p>
                </div>

                <div className="summary-box">
                  <h3>{activeBranches}</h3>
                  <p>Active Branches</p>
                </div>

                <div className="summary-box">
                  <h3>{inactiveBranches}</h3>
                  <p>Inactive Branches</p>
                </div>

                <div className="summary-box">
                  <h3>{maintenanceBranches}</h3>
                  <p>Maintenance Branches</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h2>Branch List and Status Control</h2>

              {branches.length === 0 ? (
                <p>No branches found</p>
              ) : (
                <div className="branch-list">
                  {branches.map((branch) => (
                    <div className="branch-card" key={branch._id}>
                      <div className="branch-top">
                        <h3>{branch.name}</h3>
                        <span className={`status-badge ${getBranchStatus(branch).toLowerCase()}`}>
                          {getBranchStatus(branch)}
                        </span>
                      </div>

                      <p><strong>Address:</strong> {branch.address}</p>
                      <p><strong>Location:</strong> {branch.latitude}, {branch.longitude}</p>
                      <p><strong>Hours:</strong> {branch.workingHours?.open || "—"} - {branch.workingHours?.close || "—"}</p>
                      <p><strong>Daily Capacity:</strong> {branch.dailyCapacity}</p>
                      <p><strong>Active Counters:</strong> {branch.activeCounters}</p>

                      {getCapacityWarning(branch) && (
                        <div className="capacity-warning">{getCapacityWarning(branch)}</div>
                      )}

                      <div className="buttons">
                        <button type="button" onClick={() => changeStatus(branch._id, "Active")}>Active</button>
                        <button type="button" onClick={() => changeStatus(branch._id, "Inactive")}>Inactive</button>
                        <button type="button" onClick={() => changeStatus(branch._id, "Maintenance")}>Maintenance</button>
                        <button type="button" className="delete-btn" onClick={() => deleteBranch(branch._id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h2>Sharmin Feature 4: Waiting Time and Holiday Check</h2>

              <div className="form">
                <select value={waitingBranchId} onChange={(e) => setWaitingBranchId(e.target.value)}>
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>{branch.name}</option>
                  ))}
                </select>

                <input type="number" placeholder="People waiting" value={waitingPeople} onChange={(e) => setWaitingPeople(e.target.value)} />
                <button type="button" onClick={checkWaitingTime}>Check Waiting Time</button>
              </div>

              {waitingMessage && <div className="message">{waitingMessage}</div>}

              {waitingResult && (
                <div className="branch-card">
                  <p><strong>Branch:</strong> {waitingResult.branchName}</p>
                  <p><strong>People Waiting:</strong> {waitingResult.waitingPeople}</p>
                  <p><strong>Estimated Wait:</strong> {waitingResult.estimatedWaitMinutes} minutes</p>
                </div>
              )}

              <div className="form" style={{ marginTop: "1rem" }}>
                <input type="date" value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} />
                <button type="button" onClick={checkHoliday}>Check Holiday</button>
              </div>

              {holidayMessage && <div className="message">{holidayMessage}</div>}

              {holidayResult && (
                <div className="branch-card">
                  <p><strong>Date:</strong> {holidayResult.date}</p>
                  <p><strong>Is Holiday:</strong> {holidayResult.isHoliday ? "Yes" : "No"}</p>
                  <p><strong>Booking Allowed:</strong> {holidayResult.bookingAllowed ? "Yes" : "No"}</p>
                  {holidayResult.holidayName && <p><strong>Holiday:</strong> {holidayResult.holidayName}</p>}
                  <p>{holidayResult.message}</p>
                </div>
              )}
            </div>
          </>
        )}

        {currentView === "jakia" && (
          <>
            <div className="card">
              <h2>Jakia Feature 1: Token Generation</h2>

              {tokenMessage && <div className="message">{tokenMessage}</div>}

              <form className="form" onSubmit={issueToken}>
                <select value={tokenBranchId} onChange={(e) => setTokenBranchId(e.target.value)} required>
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>{branch.name}</option>
                  ))}
                </select>

                <select value={tokenServiceId} onChange={(e) => setTokenServiceId(e.target.value)} required>
                  <option value="">Select Service</option>
                  {services.map((service) => (
                    <option key={service._id} value={service._id}>{service.name}</option>
                  ))}
                </select>

                <input type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} required />
                <input type="text" placeholder="Citizen name" value={citizenName} onChange={(e) => setCitizenName(e.target.value)} />
                <input type="email" placeholder="Citizen email" value={citizenEmail} onChange={(e) => setCitizenEmail(e.target.value)} />
                <input type="text" placeholder="Citizen phone" value={citizenPhone} onChange={(e) => setCitizenPhone(e.target.value)} />

                <label className="inline-check">
                  <input type="checkbox" checked={isPriority} onChange={(e) => setIsPriority(e.target.checked)} />
                  Priority token
                </label>

                <button type="submit">Issue Token</button>
              </form>
            </div>

            <div className="card">
              <h2>Jakia Feature 2: Notification Logs and Email Alerts</h2>

              {notifications.length === 0 ? (
                <p>No notifications found</p>
              ) : (
                <div className="branch-list">
                  {notifications.map((notification) => (
                    <div className="branch-card" key={notification._id}>
                      <h3>{notification.type}</h3>
                      <p><strong>Channel:</strong> {notification.channel}</p>
                      <p><strong>Status:</strong> {notification.status}</p>
                      <p><strong>Email:</strong> {notification.recipientEmail || "—"}</p>
                      <p><strong>Phone:</strong> {notification.recipientPhone || "—"}</p>
                      <p>{notification.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h2>Jakia Feature 3: Citizen Activity Search</h2>

              <div className="form">
                <input type="email" placeholder="Citizen email" value={activityEmail} onChange={(e) => setActivityEmail(e.target.value)} />
                <button type="button" onClick={checkActivity}>Check Activity</button>
              </div>

              {activityMessage && <div className="message">{activityMessage}</div>}
              {activityResult && <pre className="json-box">{JSON.stringify(activityResult, null, 2)}</pre>}
            </div>

            <div className="card">
              <h2>Jakia Feature 4: Advanced Slot Search</h2>

              {slotSearchMessage && <div className="message">{slotSearchMessage}</div>}

              <div className="form">
                <select value={slotSearchBranchId} onChange={(e) => setSlotSearchBranchId(e.target.value)}>
                  <option value="">All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>{branch.name}</option>
                  ))}
                </select>

                <select value={slotSearchServiceType} onChange={(e) => setSlotSearchServiceType(e.target.value)}>
                  <option value="">Any Service</option>
                  {SERVICE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>

                <input type="date" value={slotSearchDate} onChange={(e) => setSlotSearchDate(e.target.value)} />

                <select value={slotSearchTimeSlot} onChange={(e) => setSlotSearchTimeSlot(e.target.value)}>
                  <option value="">Any Time Slot</option>
                  {SLOT_OPTIONS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>

                <input type="number" placeholder="Max queue length" value={maxQueueLength} onChange={(e) => setMaxQueueLength(e.target.value)} />
                <button type="button" onClick={searchSlots}>Search Slots</button>
              </div>

              {slotSearchResult && <pre className="json-box">{JSON.stringify(slotSearchResult, null, 2)}</pre>}
            </div>

            <div className="card">
              <h2>Recent Tokens</h2>

              {tokens.length === 0 ? (
                <p>No tokens found</p>
              ) : (
                <div className="branch-list">
                  {tokens.slice(0, 10).map((token) => (
                    <div className="branch-card" key={token._id}>
                      <h3>{token.tokenNumber || token.queueNumber || token._id}</h3>
                      <p><strong>Status:</strong> {token.status}</p>
                      <p><strong>Citizen:</strong> {token.citizenName || "—"}</p>
                      <p><strong>Email:</strong> {token.email || "—"}</p>
                      <p><strong>Phone:</strong> {token.phone || "—"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {currentView === "gunjan" && (
          <>
            <div className="card">
              <h2>Gunjan Feature 1: Service Configuration</h2>

              {serviceMessage && <div className="message">{serviceMessage}</div>}

              <form className="form" onSubmit={handleServiceSubmit}>
                <input type="text" placeholder="Service name" value={serviceName} onChange={(e) => setServiceName(e.target.value)} required />
                <input type="text" placeholder="Category" value={serviceCategory} onChange={(e) => setServiceCategory(e.target.value)} />
                <input type="text" placeholder="Description" value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} />
                <input type="number" placeholder="Average processing time" value={avgProcessingTime} onChange={(e) => setAvgProcessingTime(e.target.value)} required />
                <input type="number" placeholder="Fee" value={serviceFee} onChange={(e) => setServiceFee(e.target.value)} />

                <select value={servicePriority} onChange={(e) => setServicePriority(e.target.value)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>

                <button type="submit">Create Service</button>
              </form>
            </div>

            <div className="card">
              <h2>Gunjan Feature 2: Service List</h2>

              {services.length === 0 ? (
                <p>No services found</p>
              ) : (
                <div className="branch-list">
                  {services.map((service) => (
                    <div className="branch-card" key={service._id}>
                      <h3>{service.name}</h3>
                      <p><strong>Category:</strong> {service.category || "—"}</p>
                      <p><strong>Description:</strong> {service.description || "—"}</p>
                      <p><strong>Average Time:</strong> {service.avgProcessingTime || service.processingTime || "—"} minutes</p>
                      <p><strong>Fee:</strong> {service.fee ?? 0}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h2>Gunjan Feature 3: Real Time Queue Token</h2>

              {queueMessage && <div className="message">{queueMessage}</div>}

              <form className="form" onSubmit={createQueueToken}>
                <select value={queueBranchId} onChange={(e) => setQueueBranchId(e.target.value)}>
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>{branch.name}</option>
                  ))}
                </select>

                <select value={queueServiceId} onChange={(e) => setQueueServiceId(e.target.value)} required>
                  <option value="">Select Service</option>
                  {services.map((service) => (
                    <option key={service._id} value={service._id}>{service.name}</option>
                  ))}
                </select>

                <input type="text" placeholder="Citizen name" value={queueCitizenName} onChange={(e) => setQueueCitizenName(e.target.value)} required />

                <select value={queuePriority} onChange={(e) => setQueuePriority(e.target.value)}>
                  <option value="Normal">Normal</option>
                  <option value="Priority">Priority</option>
                </select>

                <button type="submit">Create Queue Token</button>
              </form>
            </div>

            <div className="card">
              <h2>Gunjan Feature 4: Queue Status and Analytics</h2>

              {queueTokens.length === 0 ? (
                <p>No queue tokens found</p>
              ) : (
                <div className="branch-list">
                  {queueTokens.map((queueToken) => (
                    <div className="branch-card" key={queueToken._id}>
                      <h3>{queueToken.tokenNumber || queueToken._id}</h3>
                      <p><strong>Citizen:</strong> {queueToken.citizenName || "—"}</p>
                      <p><strong>Status:</strong> {queueToken.status}</p>

                      <div className="buttons">
                        <button type="button" onClick={() => updateQueueStatus(queueToken._id, "Waiting")}>Waiting</button>
                        <button type="button" onClick={() => updateQueueStatus(queueToken._id, "Serving")}>Serving</button>
                        <button type="button" onClick={() => updateQueueStatus(queueToken._id, "Completed")}>Completed</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="buttons" style={{ marginTop: "1rem" }}>
                <button type="button" onClick={fetchAnalyticsCompare}>Compare Branches</button>
                <button type="button" onClick={fetchLeastCrowded}>Find Least Crowded Branch</button>
              </div>

              {analyticsMessage && <div className="message">{analyticsMessage}</div>}
              {analyticsCompare && <pre className="json-box">{JSON.stringify(analyticsCompare, null, 2)}</pre>}
              {leastCrowded && <pre className="json-box">{JSON.stringify(leastCrowded, null, 2)}</pre>}
            </div>
          </>
        )}

        {currentView === "shahrin" && (
          <>
            <div className="card map-section">
              <h2>Shahrin Feature 1: Google Maps Branch Selection</h2>

              <button type="button" onClick={() => setShowMap(!showMap)} className="map-toggle-btn">
                {showMap ? "Hide Map" : "Choose Branch from Map"}
              </button>

              {selectedBranch && (
                <BranchSelector selectedBranch={selectedBranch} onClear={handleClearBranch} />
              )}

              {showMap && (
                <div className="map-box">
                  <BranchMap selectedService="" onBranchSelect={handleBranchSelect} />
                </div>
              )}
            </div>

            <div className="card">
              <h2>Shahrin Feature 2: Appointment Booking and Slot Availability</h2>

              {appointmentMessage && <div className="message">{appointmentMessage}</div>}

              <form className="form" onSubmit={bookAppointment}>
                <select value={appointmentServiceType} onChange={(e) => setAppointmentServiceType(e.target.value)}>
                  {SERVICE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>

                <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />

                <select value={appointmentTimeSlot} onChange={(e) => setAppointmentTimeSlot(e.target.value)}>
                  <option value="">Select Time Slot</option>
                  {appointmentSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>

                <input type="text" placeholder="User name" value={appointmentName} onChange={(e) => setAppointmentName(e.target.value)} required />
                <input type="email" placeholder="User email" value={appointmentEmail} onChange={(e) => setAppointmentEmail(e.target.value)} />
                <input type="text" placeholder="User phone" value={appointmentPhone} onChange={(e) => setAppointmentPhone(e.target.value)} />

                <button type="submit">Book Appointment</button>
              </form>
            </div>

            <div className="card">
              <h2>Shahrin Feature 3: Appointment Cancel and Reschedule</h2>

              {appointments.length === 0 ? (
                <p>No appointments found</p>
              ) : (
                <div className="branch-list">
                  {appointments.map((appointment) => (
                    <div className="branch-card" key={appointment._id}>
                      <h3>{appointment.serviceType}</h3>
                      <p><strong>Date:</strong> {appointment.date ? formatDateForInput(new Date(appointment.date)) : "—"}</p>
                      <p><strong>Time Slot:</strong> {appointment.timeSlot}</p>
                      <p><strong>User:</strong> {appointment.userName || "—"}</p>
                      <p><strong>Status:</strong> {appointment.status}</p>

                      {rescheduleId === appointment._id ? (
                        <form className="form" onSubmit={submitReschedule}>
                          <input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />

                          <select value={rescheduleSlot} onChange={(e) => setRescheduleSlot(e.target.value)}>
                            {SLOT_OPTIONS.map((slot) => (
                              <option key={slot} value={slot}>{slot}</option>
                            ))}
                          </select>

                          <button type="submit">Save Reschedule</button>
                          <button type="button" onClick={() => setRescheduleId(null)}>Cancel</button>
                        </form>
                      ) : (
                        <div className="buttons">
                          <button type="button" onClick={() => startReschedule(appointment)}>Reschedule</button>
                          <button type="button" className="delete-btn" onClick={() => cancelAppointment(appointment._id)}>Cancel Appointment</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h2>Shahrin Feature 4: Reports</h2>

              {reportMessage && <div className="message">{reportMessage}</div>}

              <div className="form">
                <input type="date" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)} />
                <input type="date" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)} />

                <select value={reportBranchId} onChange={(e) => setReportBranchId(e.target.value)}>
                  <option value="">All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>{branch.name}</option>
                  ))}
                </select>

                <button type="button" onClick={generateReport}>Generate Report</button>
              </div>

              {reportResult && <pre className="json-box">{JSON.stringify(reportResult, null, 2)}</pre>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;