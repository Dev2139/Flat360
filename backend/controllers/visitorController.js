const Visitor = require('../models/Visitor');
const Flat = require('../models/Flat');
const { sendWhatsAppMessage } = require('../services/whatsappService');

// @desc    Register visitor entry
// @route   POST /api/visitor/entry
// @access  Public/Private (Depending on use case, but usually security does it or visitor via QR)
exports.visitorEntry = async (req, res) => {
  const { visitorName, phone, reason, flatId, qrCodeId } = req.body;

  try {
    let flat;
    if (qrCodeId) {
      flat = await Flat.findOne({ qrCodeId });
    } else if (flatId) {
      flat = await Flat.findById(flatId);
    }

    if (!flat) {
      return res.status(404).json({ message: 'Flat not found' });
    }

    const visitor = await Visitor.create({
      visitorName,
      phone,
      reason,
      flatId: flat._id,
      status: 'inside',
      entryTime: new Date()
    });

    // Format Date and Time
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();

    // Send WhatsApp Notification
    const message = `Visitor Arrived\nName: ${visitorName}\nPhone: ${phone}\nReason: ${reason}\nDate: ${dateStr}\nTime: ${timeStr}`;
    
    await sendWhatsAppMessage(flat.ownerPhone, message);

    res.status(201).json(visitor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request visitor exit
// @route   PUT /api/visitor/request-exit/:id
// @access  Public
exports.requestExit = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (visitor) {
      if (visitor.status === 'left') {
        return res.status(400).json({ message: 'Visitor has already left' });
      }
      visitor.status = 'checkout_requested';
      await visitor.save();
      res.json(visitor);
    } else {
      res.status(404).json({ message: 'Visitor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get visitor status
// @route   GET /api/visitor/status/:id
// @access  Public
exports.getVisitorStatus = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (visitor) {
      res.json({ status: visitor.status });
    } else {
      res.status(404).json({ message: 'Visitor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register visitor exit
// @route   PUT /api/visitor/exit/:id
// @access  Private
exports.visitorExit = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id).populate('flatId');

    if (visitor) {
      if (visitor.status === 'left') {
        return res.status(400).json({ message: 'Visitor has already left' });
      }

      visitor.exitTime = new Date();
      visitor.status = 'left';
      await visitor.save();

      // Format Date and Time
      const dateStr = visitor.exitTime.toLocaleDateString();
      const timeStr = visitor.exitTime.toLocaleTimeString();

      // Send WhatsApp Notification
      const message = `Visitor Left\nName: ${visitor.visitorName}\nExit Time: ${timeStr}\nDate: ${dateStr}`;
      
      if (visitor.flatId && visitor.flatId.ownerPhone) {
        await sendWhatsAppMessage(visitor.flatId.ownerPhone, message);
      }

      res.json(visitor);
    } else {
      res.status(404).json({ message: 'Visitor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get visitor logs
// @route   GET /api/visitor/logs
// @access  Private
exports.getVisitorLogs = async (req, res) => {
  const { date, flatId, visitorName } = req.query;
  
  let query = {};

  if (flatId) {
    query.flatId = flatId;
  }

  if (visitorName) {
    query.visitorName = { $regex: visitorName, $options: 'i' };
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    query.entryTime = { $gte: startOfDay, $lte: endOfDay };
  }

  try {
    const logs = await Visitor.find(query)
      .populate('flatId')
      .sort({ entryTime: -1 });
      
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
