import express from "express";
import Payment from "../models/Payment";
import Appointment from "../models/Appointment";
import LabOrder from "../models/labs/LabOrder";

const router = express.Router();

/**
 * ---------------------------------------------------------
 * POST /payments/initiate
 * Create a payment intent (Appointment or Lab Order)
 * ---------------------------------------------------------
 */
router.post("/initiate", async (req, res) => {
  try {
    const {
      referenceType, // APPOINTMENT | TEST_BOOKING
      referenceId,
      amount,
      method, // CARD | UPI | NETBANKING | WALLET | CASH
    } = req.body;

    // 🔒 Validate reference
    if (referenceType === "APPOINTMENT") {
      const appt = await Appointment.findById(referenceId);
      if (!appt)
        return res.status(404).json({ message: "Appointment not found" });
    }

    if (referenceType === "TEST_BOOKING") {
      const order = await LabOrder.findById(referenceId);
      if (!order)
        return res.status(404).json({ message: "Lab order not found" });
    }

    const payment = await Payment.create({
      referenceType,
      referenceId,
      amount,
      method,
      status: "INITIATED",
    });

    res.status(201).json({
      paymentId: payment._id,
      amount,
      currency: payment.currency,
    });
  } catch (err) {
    res.status(500).json({ message: "Payment initiation failed" });
  }
});

/**
 * ---------------------------------------------------------
 * POST /payments/webhook
 * Gateway callback
 * ---------------------------------------------------------
 */
router.post("/webhook", async (req, res) => {
  try {
    const {
      paymentId,
      status, // SUCCESS | FAILED
      gatewayPaymentId,
    } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.sendStatus(404);

    // Idempotency guard
    if (payment.status === "SUCCESS") return res.sendStatus(200);

    payment.gatewayPaymentId = gatewayPaymentId;

    if (status === "SUCCESS") {
      payment.status = "SUCCESS";
      await payment.save();

      // 🔗 Apply payment to Appointment or LabOrder
    //   await processSuccessfulPayment(payment._id);
    }

    if (status === "FAILED") {
      payment.status = "FAILED";
      await payment.save();
    }

    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(500);
  }
});

/**
 * ---------------------------------------------------------
 * GET /payments/:referenceType/:referenceId
 * Get payment history for an entity
 * ---------------------------------------------------------
 */
router.get("/:referenceType/:referenceId", async (req, res) => {
  const { referenceType, referenceId } = req.params;

  const payments = await Payment.find({
    referenceType,
    referenceId,
  }).sort({ createdAt: -1 });

  res.json(payments);
});

/**
 * ---------------------------------------------------------
 * POST /payments/refund
 * Manual / admin refund
 * ---------------------------------------------------------
 */
router.post("/refund", async (req, res) => {
  try {
    const { paymentId } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment || payment.status !== "SUCCESS")
      return res.status(400).json({ message: "Invalid payment" });

    payment.status = "REFUNDED";
    await payment.save();

    // Optional: reverse booking state via policy
    res.json({ message: "Payment refunded" });
  } catch (err) {
    res.status(500).json({ message: "Refund failed" });
  }
});

/**
 * ---------------------------------------------------------
 * GET /payments/:id
 * Get single payment (debug / admin)
 * ---------------------------------------------------------
 */
router.get("/:id", async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: "Payment not found" });

  res.json(payment);
});

export default router;
