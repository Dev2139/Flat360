const Flat = require('../models/Flat');
const Visitor = require('../models/Visitor');
const crypto = require('crypto');

// @desc    Get all flats
// @route   GET /api/flats
// @access  Private
exports.getFlats = async (req, res) => {
  try {
    const flats = await Flat.find({});
    
    const flatsWithStatus = await Promise.all(flats.map(async (flat) => {
      const activeVisitors = await Visitor.countDocuments({ 
        flatId: flat._id, 
        status: 'inside' 
      });
      
      let statusColor = 'green';
      if (activeVisitors === 1) {
        statusColor = 'orange';
      } else if (activeVisitors > 1) {
        statusColor = 'red';
      }
      
      return {
        ...flat.toObject(),
        activeVisitors,
        statusColor
      };
    }));

    res.json(flatsWithStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get flat by QR Code
// @route   GET /api/flats/qr/:qrCodeId
// @access  Public
exports.getFlatByQrCode = async (req, res) => {
  try {
    const flat = await Flat.findOne({ qrCodeId: req.params.qrCodeId });
    if (flat) {
      res.json(flat);
    } else {
      res.status(404).json({ message: 'Flat not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a flat
// @route   POST /api/flats
// @access  Private
exports.createFlat = async (req, res) => {
  const { flatNumber, ownerName, ownerPhone } = req.body;

  try {
    const flatExists = await Flat.findOne({ flatNumber });

    if (flatExists) {
      return res.status(400).json({ message: 'Flat number already exists' });
    }

    const qrCodeId = `flat_${flatNumber}_${crypto.randomBytes(4).toString('hex')}`;

    const flat = await Flat.create({
      flatNumber,
      ownerName,
      ownerPhone,
      qrCodeId
    });

    res.status(201).json(flat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a flat
// @route   PUT /api/flats/:id
// @access  Private
exports.updateFlat = async (req, res) => {
  const { flatNumber, ownerName, ownerPhone } = req.body;

  try {
    const flat = await Flat.findById(req.params.id);

    if (flat) {
      flat.flatNumber = flatNumber || flat.flatNumber;
      flat.ownerName = ownerName || flat.ownerName;
      flat.ownerPhone = ownerPhone || flat.ownerPhone;

      const updatedFlat = await flat.save();
      res.json(updatedFlat);
    } else {
      res.status(404).json({ message: 'Flat not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a flat
// @route   DELETE /api/flats/:id
// @access  Private
exports.deleteFlat = async (req, res) => {
  try {
    const flat = await Flat.findById(req.params.id);

    if (flat) {
      await flat.deleteOne();
      res.json({ message: 'Flat removed' });
    } else {
      res.status(404).json({ message: 'Flat not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
