const express = require('express');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const sanitizer = require('sanitizer')
const { Sequelize } = require('sequelize')
const fs = require('fs')

const db = require('../models')

exports.getAll = (req, res, next) => {
  db.Post.findAll({
    include: [{
      model: db.User,
      attributes: {exclude: ['password', 'admin', 'createdAt', 'updatedAt']}
    }],
    order: [['postedat', 'DESC']]
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
  const postObject = req.file ?
  {
    ...req.body,
    postedat: new Date(),
    msg: sanitizer.escape(req.body.msg),
    img: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : {
    ...req.body,
    postedat: new Date(),
    img: null,
    msg: sanitizer.escape(req.body.msg)
  }
  const post = new db.Post({
    ...postObject
  })
  post.save()
    .then(data => res.status(200).json({data}))
    .catch(error => res.status(401).json({message: error}))
}

exports.editOne = (req, res, next) => {
  console.log(req.body)
  db.Post.findOne({where: {postId: req.params.id}})
    .then((post) => {
      if(!post) {
        return res.status(401).json({message: `Publication doesn't exist`})
      }
      // vérification utilisateur
      let token = req.headers.authorization.split(' ')[1];
      let decodedToken = jwt.verify(token, 'EZJIAOEJZHIOEJZAIOEJZAIOEZAJUIEOZAJUEIOZA');
      let userId = decodedToken.userId;
      if (post.userId !== userId){
        return res.status(401).json({message: `You are not the autor of this publication`})
      }
      let filename = post.img
      if(filename) {
        filename = post.img.split('/images/')[1]
      }
      const postObject = req.file ? {
        ...req.body,
        img: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : {
        ...req.body,
        img: req.body.delimg && ''
      }
      db.Post.update({ ...postObject }, {where: {postId: req.params.id}})
        .then(() => {
          if(filename && req.file || req.body.delimg) {
            fs.unlink(`images/${filename}`, (err) => {
              if(err) throw err;
            })
          }
          return res.status(200).json({message: 'Success'})
        })
        .catch(error => res.status(500).json({error}))
    })
    .catch(error => res.status(500).json({message: error}))
}

exports.deleteOne = (req, res, next) => {
  db.Post.findOne({where: {postId: req.params.id}})
    .then((post) => {
      if(!post) {
        return res.status(401).json({message: `Publication doesn't exist`})
      }
      let postUserId = post.userId
      let token = req.headers.authorization.split(' ')[1];
      let decodedToken = jwt.verify(token, 'EZJIAOEJZHIOEJZAIOEJZAIOEZAJUIEOZAJUEIOZA');
      let admin = decodedToken.admin
      let userId = decodedToken.userId
      if(admin) {
        postUserId = userId
      }
      if (postUserId !== userId){
        return res.status(401).json({message: `You are not the autor of this publication`})
      }
      let filename = null
      if (post.img !== null) {
        filename = post.img.split('/images/')[1]
      }
      db.Post.destroy({where: {postId: req.params.id}})
        .then(() => {
          if(filename) {
            fs.unlink(`images/${filename}`, (err => {
              if(err) throw err;
            }))
          }
          db.Cmt.destroy({where: {postId: req.params.id}})
            .then(() => res.status(201).json({message: 'Success'}))
            .catch(error => res.status(401).json({message: error}))
        })
        .catch(error => res.status(500).json({message: error}))
    })
    .catch(error => res.status(500).json({message: error}))
}

exports.postLike = (req, res, next) => {
  db.Post.findOne({where: {postId: req.params.id}})
    .then((post) => {
      console.log(post)
      if(!post) {
        return res.status(401).json({message: `Publication doesn't exist`})
      }
      const userLike = JSON.parse(post.userLike)
      const foundUser = userLike.findIndex((a) => a == req.body.userId)
      if(foundUser == -1 && req.body.like == 1) {
        const pushUser = userLike.push(req.body.userId)
      }
      if(foundUser > -1 && req.body.like == 0) {
        const pushUser = userLike.splice(foundUser, 1)
      }
      const jsonUserLike = JSON.stringify(userLike)
      const likes = userLike.length
      db.Post.update({userLike: jsonUserLike, countLike: likes}, {where: {postId: req.params.id}})
        .then(() => res.status(200).json({post}))
        .catch(error => res.status(500).json({message: error}))
    })
    .catch(error => res.status(500).json({message: error}))
}