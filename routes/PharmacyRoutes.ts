import express from "express";
import Drug from "../models/drugs/Drug";
import Prescription from "../models/drugs/Prescription";
import Dispense from "../models/drugs/Dispense";
import Inventory from "../models/drugs/Inventory";

const router = express.Router();

/* -------------------- DRUG CATALOG -------------------- */
// Get all drugs
router.get("/drugs", async (req, res) => {
  try {
    const drugs = await Drug.find();
    res.json(drugs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching drugs" });
  }
});

// Add new drug
router.post("/drugs", async (req, res) => {
  try {
    const drug = new Drug(req.body);
    await drug.save();
    res.json({ success: true, drug });
  } catch (err) {
    res.status(400).json({ message: "Error adding drug" });
  }
});

// Update drug
router.put("/drugs/:id", async (req, res) => {
  try {
    const drug = await Drug.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(drug);
  } catch (err) {
    res.status(400).json({ message: "Error updating drug" });
  }
});

// Delete drug
router.delete("/drugs/:id", async (req, res) => {
  try {
    await Drug.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: "Error deleting drug" });
  }
});

/* -------------------- PRESCRIPTIONS -------------------- */
// Get all prescriptions
router.get("/prescriptions", async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate("patientId", "name")
      .populate("doctorId", "name")
      .populate("drugs.drug", "name");
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching prescriptions" });
  }
});

// Add prescription
router.post("/prescriptions", async (req, res) => {
  try {
    const prescription = new Prescription(req.body);
    await prescription.save();
    res.json({ success: true, prescription });
  } catch (err) {
    res.status(400).json({ message: "Error adding prescription" });
  }
});

/* -------------------- DISPENSING -------------------- */
// Get all dispenses
router.get("/dispenses", async (req, res) => {
  try {
    const dispenses = await Dispense.find()
      .populate("prescriptionId")
      .populate("patientId", "name")
      .populate("pharmacistId", "name")
      .populate("items.drug", "name");
    res.json(dispenses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching dispenses" });
  }
});

// Dispense medicine
router.post("/dispenses", async (req, res) => {
  try {
    const dispense = new Dispense(req.body);
    await dispense.save();

    // Reduce stock in Drug model
    for (const item of dispense.items) {
      await Drug.findByIdAndUpdate(item.drug, { $inc: { stock: -item.quantity } });
    }

    res.json({ success: true, dispense });
  } catch (err) {
    res.status(400).json({ message: "Error dispensing drugs" });
  }
});

/* -------------------- INVENTORY -------------------- */
// Get all inventory items
router.get("/inventory", async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching inventory" });
  }
});

// Add inventory item
router.post("/inventory", async (req, res) => {
  try {
    const item = new Inventory(req.body);
    await item.save();
    res.json({ success: true, item });
  } catch (err) {
    res.status(400).json({ message: "Error adding inventory item" });
  }
});

// Update inventory item
router.put("/inventory/:id", async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: "Error updating inventory item" });
  }
});

// Delete inventory item
router.delete("/inventory/:id", async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: "Error deleting inventory item" });
  }
});

export default router;
