const Design = require("../models/Design");

const createDesign = async (req, res) => {
  try {
    const {
      name,
      creator,
      // canvasPreview,
      color,
      elements,
      previewImage,
      cloudinaryImage,
      price,
      note,
    } = req.body;

    const newDesign = new Design({
      name: name || "Untitled Design",
      creator,
      // canvasPreview,
      color,
      elements,
      previewImage,
      price,
      cloudinaryImage,
      isNFT: false,
      note,
    });

    const savedDesign = await newDesign.save();

    res.status(201).json({
      success: true,
      message: "Design created successfully",
      design: savedDesign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating design",
      error: error.message,
    });
  }
};

const updateDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedDesign = await Design.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedDesign) {
      return res.status(404).json({
        success: false,
        message: "Design not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Design updated successfully",
      design: updatedDesign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating design",
      error: error.message,
    });
  }
};

const getDesignById = async (req, res) => {
  try {
    const { id } = req.params;

    const design = await Design.findById(id);

    if (!design) {
      return res.status(404).json({
        success: false,
        message: "Design not found",
      });
    }

    res.status(200).json({
      success: true,
      design,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching design",
      error: error.message,
    });
  }
};

const deleteDesign = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDesign = await Design.findByIdAndDelete(id);

    if (!deletedDesign) {
      return res.status(404).json({
        success: false,
        message: "Design not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Design deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting design",
      error: error.message,
    });
  }
};

const getUserDesigns = async (req, res) => {
  try {
    const { id } = req.user;

    const designs = await Design.find({ creator: id });

    res.status(200).json({
      success: true,
      designs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching designs",
      error: error.message,
    });
  }
};

module.exports = {
  createDesign,
  updateDesign,
  getDesignById,
  deleteDesign,
  getUserDesigns,
};
