const express = require('express');
const sanitizer = require('sanitizer')
const { Sequelize } = require('sequelize')
const jwt = require('jsonwebtoken')

const db = require('../models')

exports.getAll = (req, res, next) => {
  db.Cmt.findAll({
    include: [{
      model: db.User,
      attributes: {exclude: ['password', 'admin', 'createdAt', 'updatedAt']}
    }],
  })
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

exports.deleteOne = (req, res, next) => {
  db.Cmt.findOne({where: {id: req.params.id}})
    .then((comment) => {
      if(!comment) {
        return res.status(401).json({message: `Comment doens't exist`})
      }
      let token = req.headers.authorization.split(' ')[1];
      let decodedToken = jwt.verify(token, 'EZJIAOEJZHIOEJZAIOEJZAIOEZAJUIEOZAJUEIOZA');
      let userId = decodedToken.userId;
      if (comment.userId !== userId){
        return res.status(401).json({message: `You are not the autor of this comment`})
      }
      db.Cmt.destroy({where: {id: req.params.id}})
        .then(() => res.status(200).json({message: 'ok'}))
        .catch(error => res.status(500).json({error}))
    })
    .catch(error => res.status(500).json({message: error}))
}