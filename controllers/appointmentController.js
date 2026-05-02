const Appointment = require("../models/Appointment");
const Branch = require("../models/Branch");
const Service = require("../models/Service");

async function getAppointments(req, res) {
  try {
    const filter = {};

    if (req.query.email) {
      filter.email = req.query.email.toLowerCase();
    }

    if (req.query.branchId) {
      filter.branch = req.query.branchId;
    }

    if (req.query.date) {
      filter.preferredDate = req.query.date;
    }

    const appointments = await Appointment.find(filter)
      .populate("branch")
      .populate("service")
      .sort({ createdAt: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
}

async function createAppointment(req, res) {
  try {
    const { branchId, serviceId, preferredDate, timeSlot, name, email, phone } =
      req.body;

    if (
      !branchId ||
      !serviceId ||
      !preferredDate ||
      !timeSlot ||
      !name ||
      !email ||
      !phone
    ) {
      return res.status(400).json({
        message:
          "branchId, serviceId, preferredDate, timeSlot, name, email, and phone are required",
      });
    }

    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({
        message: "Branch not found",
      });
    }

    if (branch.status !== "Active") {
      return res.status(400).json({
        message: `Appointment cannot be booked because branch is ${branch.status}`,
      });
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    const existingAppointment = await Appointment.findOne({
      branch: branchId,
      service: serviceId,
      preferredDate,
      timeSlot,
      status: { $ne: "Cancelled" },
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: "This slot is already booked",
      });
    }

    const appointment = await Appointment.create({
      branch: branchId,
      service: serviceId,
      serviceType: service.serviceName,
      preferredDate,
      timeSlot,
      name,
      email,
      phone,
      status: "Confirmed",
    });

    const savedAppointment = await Appointment.findById(appointment._id)
      .populate("branch")
      .populate("service");

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: savedAppointment,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to book appointment",
      error: error.message,
    });
  }
}

async function cancelAppointment(req, res) {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    appointment.status = "Cancelled";
    await appointment.save();

    res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to cancel appointment",
      error: error.message,
    });
  }
}

async function rescheduleAppointment(req, res) {
  try {
    const { preferredDate, timeSlot } = req.body;

    if (!preferredDate || !timeSlot) {
      return res.status(400).json({
        message: "preferredDate and timeSlot are required",
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    const slotTaken = await Appointment.findOne({
      _id: { $ne: appointment._id },
      branch: appointment.branch,
      service: appointment.service,
      preferredDate,
      timeSlot,
      status: { $ne: "Cancelled" },
    });

    if (slotTaken) {
      return res.status(400).json({
        message: "New slot is already booked",
      });
    }

    appointment.preferredDate = preferredDate;
    appointment.timeSlot = timeSlot;
    appointment.status = "Rescheduled";

    await appointment.save();

    const savedAppointment = await Appointment.findById(appointment._id)
      .populate("branch")
      .populate("service");

    res.status(200).json({
      message: "Appointment rescheduled successfully",
      appointment: savedAppointment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reschedule appointment",
      error: error.message,
    });
  }
}
async function deleteAppointment(req, res) {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete appointment",
      error: error.message,
    });
  }
}
module.exports = {
  getAppointments,
  createAppointment,
  cancelAppointment,
  rescheduleAppointment,
  deleteAppointment,
};
