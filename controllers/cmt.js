const express = require('express');
const sanitizer = require('sanitizer')
const { Sequelize } = require('sequelize')

const db = require('../models')

exports.getAll = (req, res, next) => {
  db.Cmt.findAll()
    .then((posts) => res.status(200).json(posts))
    .catch((error) => res.status(401).json({error}), db.Cmt.sync())
}

exports.postOne = (req, res, next) => {
  const comment = new db.Cmt({
    ...req.body,
    postId: req.params.id
  })
  comment.save()
    .then(() => res.status(200).json({message: 'Comment posted'}))
    .catch(error => res.status(401).json({error}))
}
