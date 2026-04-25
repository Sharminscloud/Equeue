import { useEffect, useState } from "react";
import axios from "axios";
import logo from "./assets/logo.png";
import "./App.css";

const BRANCH_API = "http://localhost:1163/api/branches";
const WAITING_API = "http://localhost:1163/api/waiting";

function App() {
  const [branches, setBranches] = useState([]);

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

  const DEFAULT_AVG_PROCESSING_TIME = 15;

  function getBranchStatus(branch) {
    if (branch.status) {
      return branch.status;
    }

    return "Active";
  }

  const totalBranches = branches.length;

  const activeBranches = branches.filter(
    (branch) => getBranchStatus(branch) === "Active"
  ).length;

  const inactiveBranches = branches.filter(
    (branch) => getBranchStatus(branch) === "Inactive"
  ).length;

  const maintenanceBranches = branches.filter(
    (branch) => getBranchStatus(branch) === "Maintenance"
  ).length;

  function timeToMinutes(time) {
    if (!time) {
      return null;
    }

    const parts = time.split(":").map(Number);

    if (parts.length !== 2) {
      return null;
    }

    if (Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
      return null;
    }

    return parts[0] * 60 + parts[1];
  }

  function getFeasibleCapacity(branch) {
    const openTime = branch.workingHours?.open;
    const closeTime = branch.workingHours?.close;

    const openMinutes = timeToMinutes(openTime);
    const closeMinutes = timeToMinutes(closeTime);

    if (openMinutes === null || closeMinutes === null) {
      return null;
    }

    const workingMinutes = closeMinutes - openMinutes;

    if (workingMinutes <= 0) {
      return null;
    }

    const counters = Number(branch.activeCounters || 0);

    if (counters <= 0) {
      return null;
    }

    return Math.floor(
      (workingMinutes / DEFAULT_AVG_PROCESSING_TIME) * counters
    );
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

      if (search) {
        params.push(`search=${encodeURIComponent(search)}`);
      }

      if (filterStatus) {
        params.push(`status=${encodeURIComponent(filterStatus)}`);
      }

      if (params.length > 0) {
        url = `${BRANCH_API}?${params.join("&")}`;
      }

      const res = await axios.get(url);
      setBranches(res.data);
    } catch {
      setBranchMessage("Failed to load branches");
    }
  };

  useEffect(() => {
    getBranches();
  }, [search, filterStatus]);

  const handleBranchSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(BRANCH_API, {
        name,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
        workingHours: {
          open,
          close,
        },
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
      setBranchMessage(err.response?.data?.message || "Failed to create branch");
    }
  };

  const changeStatus = async (id, newStatus) => {
    try {
      await axios.put(`${BRANCH_API}/${id}`, {
        status: newStatus,
      });

      setBranches(
        branches.map((branch) =>
          branch._id === id ? { ...branch, status: newStatus } : branch
        )
      );

      setBranchMessage(`Status changed to ${newStatus}`);
    } catch (err) {
      setBranchMessage(err.response?.data?.message || "Failed to update status");
    }
  };

  const deleteBranch = async (id) => {
    try {
      await axios.delete(`${BRANCH_API}/${id}`);

      setBranches(branches.filter((branch) => branch._id !== id));

      setBranchMessage("Branch deleted successfully");
    } catch {
      setBranchMessage("Failed to delete branch");
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
      setWaitingMessage(
        err.response?.data?.message || "Failed to get waiting time"
      );
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
    } catch {
      setHolidayResult(null);
      setHolidayMessage("Failed to check holiday");
    }
  };

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
              21301163 · Sharmin — Branch Management, Capacity Control, Waiting Time, and Holiday Check
            </p>
          </div>
        </div>

        {branchMessage && <div className="message">{branchMessage}</div>}

        <div className="card">
          <h2>Search Branches</h2>

          <div className="form">
            <input
              type="text"
              placeholder="Search by branch name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        <div className="card">
          <h2>Create Branch</h2>

          <form className="form" onSubmit={handleBranchSubmit}>
            <input
              type="text"
              placeholder="Branch Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />

            <input
              type="number"
              step="any"
              placeholder="Latitude example 23.7772"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              required
            />

            <input
              type="number"
              step="any"
              placeholder="Longitude example 90.3760"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              required
            />

            <input
              type="time"
              value={open}
              onChange={(e) => setOpen(e.target.value)}
              required
            />

            <input
              type="time"
              value={close}
              onChange={(e) => setClose(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Daily Capacity"
              value={dailyCapacity}
              onChange={(e) => setDailyCapacity(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Active Counters"
              value={activeCounters}
              onChange={(e) => setActiveCounters(e.target.value)}
              required
            />

            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Maintenance">Maintenance</option>
            </select>

            <button type="submit">Create Branch</button>
          </form>
        </div>

        <div className="card">
          <h2>Branch Dashboard Summary</h2>

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
          <h2>Branch List</h2>

          {branches.length === 0 ? (
            <p>No branches found</p>
          ) : (
            <div className="branch-list">
              {branches.map((branch) => (
                <div className="branch-card" key={branch._id}>
                  <div className="branch-top">
                    <h3>{branch.name}</h3>

                    <span
                      className={`status-badge ${getBranchStatus(
                        branch
                      ).toLowerCase()}`}
                    >
                      {getBranchStatus(branch)}
                    </span>
                  </div>

                  <p>
                    <strong>Address:</strong> {branch.address}
                  </p>

                  <p>
                    <strong>Location:</strong> {branch.latitude},{" "}
                    {branch.longitude}
                  </p>

                  <p>
                    <strong>Hours:</strong> {branch.workingHours?.open || "—"} -{" "}
                    {branch.workingHours?.close || "—"}
                  </p>

                  <p>
                    <strong>Daily Capacity:</strong> {branch.dailyCapacity}
                  </p>

                  <p>
                    <strong>Active Counters:</strong> {branch.activeCounters}
                  </p>

                  {getCapacityWarning(branch) && (
                    <div className="capacity-warning">
                      {getCapacityWarning(branch)}
                    </div>
                  )}

                  <div className="buttons">
                    <button
                      type="button"
                      onClick={() => changeStatus(branch._id, "Active")}
                    >
                      Active
                    </button>

                    <button
                      type="button"
                      onClick={() => changeStatus(branch._id, "Inactive")}
                    >
                      Inactive
                    </button>

                    <button
                      type="button"
                      onClick={() => changeStatus(branch._id, "Maintenance")}
                    >
                      Maintenance
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => deleteBranch(branch._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2>Real-Time Waiting Time</h2>

          <div className="form">
            <select
              value={waitingBranchId}
              onChange={(e) => setWaitingBranchId(e.target.value)}
            >
              <option value="">Select Branch</option>

              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="People waiting"
              value={waitingPeople}
              onChange={(e) => setWaitingPeople(e.target.value)}
            />

            <button type="button" onClick={checkWaitingTime}>
              Check Waiting Time
            </button>
          </div>

          {waitingMessage && (
            <div className="message" style={{ marginTop: "1rem" }}>
              {waitingMessage}
            </div>
          )}

          {waitingResult && (
            <div className="branch-card" style={{ marginTop: "1rem" }}>
              <p>
                <strong>Branch:</strong> {waitingResult.branchName}
              </p>

              <p>
                <strong>Date:</strong> {waitingResult.date}
              </p>

              <p>
                <strong>People Waiting:</strong> {waitingResult.waitingPeople}
              </p>

              <p>
                <strong>Active Counters:</strong> {waitingResult.activeCounters}
              </p>

              <p>
                <strong>Estimated Wait:</strong>{" "}
                {waitingResult.estimatedWaitMinutes} minutes
              </p>
            </div>
          )}
        </div>

        <div className="card">
          <h2>Public Holiday Check</h2>

          <div className="form">
            <input
              type="date"
              value={holidayDate}
              onChange={(e) => setHolidayDate(e.target.value)}
            />

            <button type="button" onClick={checkHoliday}>
              Check Holiday
            </button>
          </div>

          {holidayMessage && (
            <div className="message" style={{ marginTop: "1rem" }}>
              {holidayMessage}
            </div>
          )}

          {holidayResult && (
            <div className="branch-card" style={{ marginTop: "1rem" }}>
              <p>
                <strong>Date:</strong> {holidayResult.date}
              </p>

              <p>
                <strong>Is Holiday:</strong>{" "}
                {holidayResult.isHoliday === null
                  ? "Unknown"
                  : holidayResult.isHoliday
                  ? "Yes"
                  : "No"}
              </p>

              <p>
                <strong>Booking Allowed:</strong>{" "}
                {holidayResult.bookingAllowed ? "Yes" : "No"}
              </p>

              {holidayResult.holidayName && (
                <p>
                  <strong>Holiday:</strong> {holidayResult.holidayName}
                </p>
              )}

              <p>{holidayResult.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;