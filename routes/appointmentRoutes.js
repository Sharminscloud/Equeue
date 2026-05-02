const express = require("express");
const router = express.Router();

const {
  getAppointments,
  createAppointment,
  cancelAppointment,
  rescheduleAppointment,
  deleteAppointment,
} = require("../controllers/appointmentController");

router.get("/", getAppointments);
router.post("/", createAppointment);
router.patch("/:id/cancel", cancelAppointment);
router.patch("/:id/reschedule", rescheduleAppointment);
router.delete("/:id", deleteAppointment);

module.exports = router;
