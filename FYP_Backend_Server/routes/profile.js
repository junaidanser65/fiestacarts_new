const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, verifyVendor } = require('../middleware/auth');

// Get vendor profile
// router.get('/profile', verifyToken, verifyVendor, async (req, res) => {
//   try {
//     const vendorId = req.user.id;
    
//     // Get vendor profile information
//     const [vendors] = await pool.execute(
//       'SELECT id, name, email, business_name, phone_number, address, profile_image FROM vendors WHERE id = ?',
//       [vendorId]
//     );
    
//     if (vendors.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Vendor profile not found'
//       });
//     }
    
//     // Get vendor locations
//     const [locations] = await pool.execute(
//       'SELECT id, address, latitude, longitude FROM vendor_locations WHERE vendor_id = ?',
//       [vendorId]
//     );
    
//     res.json({
//       success: true,
//       profile: {
//         ...vendors[0],
//         locations: locations || []
//       }
//     });
//   } catch (error) {
//     console.error('Get profile error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error retrieving vendor profile',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });


// Get vendor profile by ID (public or admin usage)
router.get('/profile/:id', async (req, res) => {
  // router.get("/profile/me", verifyToken, verifyVendor, async (req, res) => {
    try {
      const vendorId = req.params.id;

      // Get vendor profile information
      const [vendors] = await pool.execute(
        "SELECT id, name, email, business_name, phone_number, address, profile_image FROM vendors WHERE id = ?",
        [vendorId]
      );

      if (vendors.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Vendor profile not found",
        });
      }

      // Get vendor locations
      const [locations] = await pool.execute(
        "SELECT id, address, latitude, longitude FROM vendor_locations WHERE vendor_id = ?",
        [vendorId]
      );

      res.json({
        success: true,
        profile: {
          ...vendors[0],
          locations: locations || [],
        },
      });
    } catch (error) {
      console.error("Get profile by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving vendor profile by ID",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  });


// Update vendor profile
router.put('/profile', verifyToken, verifyVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { name, business_name, phone_number, address, profile_image } = req.body;
    
    // Update vendor profile
    await pool.execute(
      'UPDATE vendors SET name = ?, business_name = ?, phone_number = ?, address = ?, profile_image = ? WHERE id = ?',
      [name, business_name, phone_number, address, profile_image, vendorId]
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vendor profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add vendor location
router.post('/locations', verifyToken, verifyVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { address, latitude, longitude } = req.body;
    
    // Validate input
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }
    
    // Insert new location
    const [result] = await pool.execute(
      'INSERT INTO vendor_locations (vendor_id, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [vendorId, address, latitude || null, longitude || null]
    );
    
    res.status(201).json({
      success: true,
      message: 'Location added successfully',
      location: {
        id: result.insertId,
        vendor_id: vendorId,
        address,
        latitude,
        longitude
      }
    });
  } catch (error) {
    console.error('Add location error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding vendor location',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update vendor location
router.put('/locations/:id', verifyToken, verifyVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const locationId = req.params.id;
    const { address, latitude, longitude } = req.body;
    
    // Validate input
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }
    
    // Check if location exists and belongs to this vendor
    const [locations] = await pool.execute(
      'SELECT id FROM vendor_locations WHERE id = ? AND vendor_id = ?',
      [locationId, vendorId]
    );
    
    if (locations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Location not found or not authorized'
      });
    }
    
    // Update location
    await pool.execute(
      'UPDATE vendor_locations SET address = ?, latitude = ?, longitude = ? WHERE id = ?',
      [address, latitude || null, longitude || null, locationId]
    );
    
    res.json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vendor location',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete vendor location
router.delete('/locations/:id', verifyToken, verifyVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const locationId = req.params.id;
    
    // Check if location exists and belongs to this vendor
    const [locations] = await pool.execute(
      'SELECT id FROM vendor_locations WHERE id = ? AND vendor_id = ?',
      [locationId, vendorId]
    );
    
    if (locations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Location not found or not authorized'
      });
    }
    
    // Delete location
    await pool.execute(
      'DELETE FROM vendor_locations WHERE id = ?',
      [locationId]
    );
    
    res.json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting vendor location',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;