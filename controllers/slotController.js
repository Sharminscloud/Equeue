const Branch = require("../models/Branch");
const Appointment = require("../models/Appointment");
const Token = require("../models/Token");

function timeToMinutes(time) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function minutesToTime(minutes) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function generateSlots(open, close, duration = 60) {
  const slots = [];
  let current = timeToMinutes(open);
  const end = timeToMinutes(close);

  while (current + duration <= end) {
    const startTime = minutesToTime(current);
    const endTime = minutesToTime(current + duration);
    slots.push(`${startTime}-${endTime}`);
    current += duration;
  }

  return slots;
}

async function getAvailability(req, res) {
  try {
    const { branchId, serviceType, date } = req.query;

    if (!serviceType || !date) {
      return res.status(400).json({
        message: "serviceType and date are required",
      });
    }

    let branches = [];

    if (branchId) {
      const branch = await Branch.findById(branchId);

      if (!branch) {
        return res.status(404).json({
          message: "Branch not found",
        });
      }

      branches = [branch];
    } else {
      branches = await Branch.find({ status: "Active" });
    }

    const results = [];

    for (const branch of branches) {
      const slots = generateSlots(
        branch.workingHours.open,
        branch.workingHours.close,
        60,
      );

      const bookedAppointments = await Appointment.find({
        branch: branch._id,
        serviceType,
        preferredDate: date,
        status: { $ne: "Cancelled" },
      });

      const bookedSlots = bookedAppointments.map((item) => item.timeSlot);

      results.push({
        branchId: branch._id,
        branchName: branch.name,
        date,
        serviceType,
        allSlots: slots,
        bookedSlots,
        availableSlots: slots.filter((slot) => !bookedSlots.includes(slot)),
      });
    }

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({
      message: "Failed to check slot availability",
      error: error.message,
    });
  }
}

async function searchSlots(req, res) {
  try {
    const { branchId, serviceType, date, timeSlot, maxQueueLength } = req.query;

    if (!serviceType || !date) {
      return res.status(400).json({
        message: "serviceType and date are required",
      });
    }

    const branchFilter = branchId ? { _id: branchId } : { status: "Active" };
    const branches = await Branch.find(branchFilter);

    const results = [];

    for (const branch of branches) {
      const allSlots = generateSlots(
        branch.workingHours.open,
        branch.workingHours.close,
        60,
      );

      const appointments = await Appointment.find({
        branch: branch._id,
        serviceType,
        preferredDate: date,
        status: { $ne: "Cancelled" },
      });

      const bookedSlots = appointments.map((item) => item.timeSlot);

      const queueLength = await Token.countDocuments({
        branch: branch._id,
        preferredDate: date,
        status: "Waiting",
      });

      if (maxQueueLength && queueLength > Number(maxQueueLength)) {
        continue;
      }

      let availableSlots = allSlots.filter(
        (slot) => !bookedSlots.includes(slot),
      );

      if (timeSlot) {
        availableSlots = availableSlots.filter((slot) => slot === timeSlot);
      }

      if (availableSlots.length > 0) {
        results.push({
          branchId: branch._id,
          branchName: branch.name,
          serviceType,
          date,
          queueLength,
          availableSlots,
        });
      }
    }

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({
      message: "Slot search failed",
      error: error.message,
    });
  }
}

module.exports = {
  getAvailability,
  searchSlots,
};
