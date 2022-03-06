const express = require('express');
const bcrypt = require('bcrypt')
const sanitizer = require('sanitizer')
const { Sequelize } = require('sequelize')

const db = require('../models')

exports.getAll = (req, res, next) => {
  db.Post.findAll({
    include: [{
      model: db.User,
      attributes: {exclude: ['password', 'admin', 'createdAt', 'updatedAt']}
    }]
  })
    .then((posts) => res.status(200).json(posts))
    .catch((error) => res.status(401).json({error}), db.Post.sync())
}

exports.getOne = (req, res, next) => {
  db.Post.findOne({where: {id: req.params.id},
  include: [{
    model: db.User,
    attributes: {exclude: ['password', 'admin', 'createdAt', 'updatedAt']}
  }]})
    .then(post => res.status(200).json({post}))
    .catch(error => res.status(401).json({error}))
}

exports.postOne = (req, res, next) => {
  const postObject = req.body
  if(req.file) {
    const post = new db.Post({
      ...postObject,
      msg: sanitizer.escape(req.body.msg),
      img: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
    post.save()
    .then(() => res.status(200).json({message: 'Publication posted'}))
    .catch(error => res.status(401).json({error}))
  } else {
    const post = new db.Post({
      ...postObject,
      msg: sanitizer.escape(req.body.msg)
    })
    post.save()
    .then(() => res.status(200).json({message: 'Publication posted'}))
    .catch(error => res.status(401).json({error}))
  }
}
