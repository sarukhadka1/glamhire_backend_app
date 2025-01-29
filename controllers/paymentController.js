const Payment = require("../models/paymentModel");
const PurchasedItem = require("../models/purchasedItemsModel"); // or your relevant model
const { verifyKhaltiPayment, initializeKhaltiPayment } = require("../service/khaltiService");

// 1) INITIALIZE KHALTI
exports.initializeKhalti = async (req, res) => {
  try {
    const { itemId, totalPrice, website_url } = req.body;

    // 1a) Validate input
    if (!itemId || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (itemId or totalPrice).",
      });
    }

    // 1b) Check purchased item (or appointment) validity
    const purchasedItem = await PurchasedItem.findById(itemId);
    if (!purchasedItem) {
      return res.status(404).json({
        success: false,
        message: "Purchased item not found.",
      });
    }

    // 1c) For test environment, ensure price < 200 or your logic
    if (purchasedItem.totalPrice !== Number(totalPrice)) {
      return res.status(400).json({
        success: false,
        message: "Price mismatch with the item record.",
      });
    }

    // 1d) Prepare details for Khalti
    const details = {
      return_url: `${website_url}/payment/success`, // or wherever you handle success
      website_url: website_url,
      amount: totalPrice * 100, // if your totalPrice is in NPR, multiply by 100 for paisa
      purchase_order_id: purchasedItem._id,
      purchase_order_name: "Service Payment",
    };

    // 1e) Call service to initialize
    const khaltiResponse = await initializeKhaltiPayment(details);

    return res.status(200).json({
      success: true,
      message: "Khalti payment initialized.",
      payment_url: khaltiResponse.payment_url,
      pidx: khaltiResponse.pidx,
    });
  } catch (error) {
    console.error("Error in initializeKhalti:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while initializing Khalti.",
      error: error.message,
    });
  }
};

// 2) COMPLETE KHALTI PAYMENT
exports.completeKhaltiPayment = async (req, res) => {
  try {
    const { pidx, amount, productId, transactionId } = req.query;

    if (!pidx || !amount || !productId || !transactionId) {
      return res.status(400).json({
        success: false,
        message: "Missing required query parameters.",
      });
    }

    // 2a) Verify with Khalti
    const paymentInfo = await verifyKhaltiPayment(pidx);

    // 2b) Check if completed
    const isCompleted = paymentInfo?.status === "Completed";
    const isTransactionMatched = paymentInfo?.transaction_id === transactionId;
    // If you used *paisa*, paymentInfo.total_amount is in paisa. Compare carefully
    const isAmountMatched = Number(paymentInfo?.total_amount) === Number(amount);

    if (!isCompleted || !isTransactionMatched || !isAmountMatched) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed or mismatch.",
        paymentInfo,
      });
    }

    // 2c) Check the purchased item (or appointment)
    const purchasedItem = await PurchasedItem.findOne({
      _id: productId,
      totalPrice: amount / 100, // if your DB stores in NPR, and Khalti's amount is in paisa
    });
    if (!purchasedItem) {
      return res.status(400).json({
        success: false,
        message: "No matching purchased item found.",
      });
    }

    // 2d) Mark the purchased item status as completed
    purchasedItem.status = "completed";
    await purchasedItem.save();

    // 2e) Create or Update the Payment record
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: transactionId },
      {
        pidx,
        productId,
        amount,
        dataFromVerificationReq: paymentInfo,
        apiQueryFromUser: req.query,
        paymentGateway: "khalti",
        status: "success",
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      success: true,
      message: "Payment successfully verified.",
      paymentData: updatedPayment,
    });
  } catch (error) {
    console.error("Error completing Khalti payment:", error);
    res.status(500).json({
      success: false,
      message: "Error completing Khalti payment.",
      error: error.message,
    });
  }
};
