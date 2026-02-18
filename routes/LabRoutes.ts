import express from "express";
import LabTest from "../models/labs/LabTest";

const router = express.Router();

/* -------------------------------
   CREATE TEST (Admin)
-------------------------------- */
router.post("/", async (req, res) => {
  try {
    const test = await LabTest.create(req.body);
    res.status(201).json(test);
  } catch (err) {
    res.status(400).json({ error: "Failed to create test" });
  }
});

/* -------------------------------
   GET ALL TESTS
-------------------------------- */
router.get("/", async (_req, res) => {
  const tests = await LabTest.find().sort({ name: 1 });
  res.json(tests);
});

/* -------------------------------
   UPDATE TEST
-------------------------------- */
router.put("/:id", async (req, res) => {
  const test = await LabTest.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(test);
});

/* -------------------------------
   TOGGLE ACTIVE
-------------------------------- */
router.patch("/:id/toggle", async (req, res) => {
  const test = await LabTest.findById(req.params.id);
  if (!test) return res.sendStatus(404);

  test.isActive = req.body.isActive;
  await test.save();

  res.json(test);
});

router.put("/:id", async (req, res) => {
  const test = await LabTest.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(test);
});


export default router;
