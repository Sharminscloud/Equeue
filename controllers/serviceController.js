const Service = require("../models/Service");

async function getServices(req, res) {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch services",
      error: error.message,
    });
  }
}

async function createService(req, res) {
  try {
    const service = await Service.create(req.body);

    res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create service",
      error: error.message,
    });
  }
}

async function updateService(req, res) {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    res.status(200).json({
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update service",
      error: error.message,
    });
  }
}

async function deleteService(req, res) {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    res.status(200).json({
      message: "Service deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete service",
      error: error.message,
    });
  }
}

module.exports = {
  getServices,
  createService,
  updateService,
  deleteService,
};
