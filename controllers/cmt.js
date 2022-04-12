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
    order: [['createdAt', 'DESC']]
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
    .then((cmt) => res.status(200).json({cmt}))
    .catch(error => {
      console.log(error)
      res.status(401).json({message: error})
    })
}

exports.editOne =  (req, res, next) => {
  const commentObject = {
    msg: sanitizer.escape(req.body.msg)
  }
  db.Cmt.findOne({where: {id: req.params.id}})
    .then((comment) => {
      if(!comment) {
        return res.status(401).json({message: `Comment doesn't exist`})
      }
      let token = req.headers.authorization.split(' ')[1];
      let decodedToken = jwt.verify(token, 'EZJIAOEJZHIOEJZAIOEJZAIOEZAJUIEOZAJUEIOZA');
      let userId = decodedToken.userId;
      if (comment.userId !== userId){
        return res.status(401).json({message: `You are not the autor of this comment`})
      }
      db.Cmt.update({ ...commentObject }, {where: {id: req.params.id}})
        .then(() => res.status(200).json({message:'Success'}))
        .catch(error => res.status(401).json({message: error}))
    })
    .catch(error => res.status(500).json({message: error}))
}

exports.deleteOne = (req, res, next) => {
  db.Cmt.findOne({where: {id: req.params.id}})
    .then((comment) => {
      if(!comment) {
        return res.status(401).json({message: `Comment doens't exist`})
      }
      let cmtUserId = comment.userId
      let token = req.headers.authorization.split(' ')[1];
      let decodedToken = jwt.verify(token, 'EZJIAOEJZHIOEJZAIOEJZAIOEZAJUIEOZAJUEIOZA');
      let admin = decodedToken.admin
      let userId = decodedToken.userId
      console.log(cmtUserId)
      if(admin) {
        cmtUserId = userId
      }
      if (cmtUserId !== userId){
        return res.status(401).json({message: `You are not the autor of this comment`})
      }
      db.Cmt.destroy({where: {id: req.params.id}})
        .then(() => res.status(200).json({message: 'ok'}))
        .catch(error => res.status(500).json({error}))
    })
    .catch(error => res.status(500).json({message: error}))
}
