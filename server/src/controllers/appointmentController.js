import Appointment from "../models/Appointment.js";
import Branch from "../models/Branch.js";
import Service from "../models/Service.js";

export const createAppointment = async (req, res) => {
  try {
    const {
      citizenName,
      email,
      phone,
      branchId,
      serviceId,
      appointmentDateTime,
    } = req.body;

    if (!branchId || !serviceId || !appointmentDateTime) {
      return res.status(400).json({
        message: "branchId, serviceId and appointmentDateTime are required",
      });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const appointment = await Appointment.create({
      citizenName: citizenName || "",
      email: email || "",
      phone: phone || "",
      branch: branchId,
      service: serviceId,
      appointmentDateTime,
      status: "confirmed",
      reminderSent: false,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("branch", "name")
      .populate("service", "name");

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error("Create appointment error:", error);
    res.status(500).json({ message: "Failed to create appointment" });
  }
};