const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Category = require('../model/category');
const cloudinary = require('cloudinary').v2;
const checkAuth = require('../middleware/check-auth');

cloudinary.config({
  cloud_name: 'doo3cv1pd',
  api_key: '353146128953761',
  api_secret: 'UZQOExdwlwicK0WyVrS3VA_Jrww'
});

// Get all categories
router.get('/', checkAuth, (req, res, next) => {
  Category.find()
    .select('_id name photo')
    .then(result => {
      res.status(200).json({
        category: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// Save a new category
router.post('/add-category', checkAuth, (req, res, next) => {
  console.log('POST request received at /category/add-category')
  if (!req.files || !req.files.photo) {
    console.error('No photo file uploaded');
    return res.status(400).json({ error: 'No photo file uploaded' });
  }

  const file = req.files.photo;

  cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
    if (err || !result) {
      return res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
    }

    const category = new Category({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      photo: result.url,
    });

    category.save()
      .then(savedResult => {
        res.status(200).json({
          new_category: savedResult
        });
      })
      .catch(err => {
        console.error('Error saving category:', err);
        res.status(500).json({
          error: 'Failed to save category'
        });
      });
  });
});

// Get a single category by ID
router.get('/:id', checkAuth, (req, res, next) => {
  const _id = req.params.id;
  Category.findById(_id)
    .select('_id name photo')
    .then(result => {
      if (!result) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.status(200).json({ category: result });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});


// Update a category
router.put('/:id', checkAuth, (req, res, next) => {
  if (!req.files || !req.files.photo) {
    console.error('No photo file uploaded');
    return res.status(400).json({ error: 'No photo file uploaded' });
  }

  const file = req.files.photo;

  cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
    if (err || !result) {
      console.error('Cloudinary upload error:', err);
      return res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
    }

    Category.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
          photo: result.url,
        },
      },
      { new: true, useFindAndModify: false } // Add useFindAndModify: false here
    )
      .then((updatedCategory) => {
        res.status(200).json({
          updated_category: updatedCategory,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  });
});

// Delete a category
router.delete('/', checkAuth, (req, res, next) => {
  const imageUrl = req.query.imageUrl;
  const urlArray = imageUrl.split('/');
  const image = urlArray[urlArray.length - 1];
  const imageName = image.split('.')[0];
  const categoryId = req.query.id;

  Category.findByIdAndRemove(categoryId)
    .then(result => {
      cloudinary.uploader.destroy(imageName, (error, result) => {
        if (error) {
          console.error('Cloudinary deletion error:', error);
        }
        console.log('Cloudinary deletion result:', result);
      });
      res.status(200).json({
        message: 'Category deleted successfully',
        result: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
