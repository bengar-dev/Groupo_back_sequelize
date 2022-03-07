const express = require('express');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sanitizer = require('sanitizer')
const { Sequelize } = require('sequelize')
const fs = require('fs')

const db = require('../models')

exports.getUsers = (req, res, next) => {
  db.User.findAll()
    .then((users) => res.status(200).json(users))
    .catch((error) => res.status(401).json({error}), db.User.sync())
}

exports.getUser = (req, res, next) => {
  db.User.findOne({where: {id: req.params.id}})
    .then((user) => res.status(200).json({user}))
    .catch(error => res.status(500).json({message: error}))
}

exports.login = (req, res, next) => {
  db.User.findOne({where: { email: req.body.email} })
    .then((user) => {
      if(!user) {
        return res.status(401).json({message: 'User not found'})
      }
      bcrypt.compare(req.body.password, user.password)
        .then((valid) => {
          if(!valid) {
            return res.status(401).json({message: 'Password incorrect'})
          }
          res.status(200).json({
            userId: user.id,
            admin: user.admin,
            token: jwt.sign(
              {userId: user.id},
              'EZJIAOEJZHIOEJZAIOEJZAIOEZAJUIEOZAJUEIOZA',
              {expiresIn: '24h'}
            )
          })
        })
        .catch(error => res.status(500).json({error}))
    })
    .catch(error => res.status(500).json({error}))
}

exports.signup = (req, res, next) => {
  const validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };
  const validatePass = (pass) => {
    return pass.match(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
    )
  }
  if(!validateEmail(req.body.email)){
    return res.status(401).json({message: 'Email invalid'})
  }
  if(!validatePass(req.body.password)) {
    return res.status(401).json({message: 'Password invalid'})
  }
  bcrypt.hash(req.body.password, 10)
    .then(
      hash => {
        const user = new db.User({
          email: req.body.email,
          firstname: sanitizer.escape(req.body.firstname),
          lastname: sanitizer.escape(req.body.lastname),
          password: hash
        })
        user.save()
          .then(() => res.status(200).json({message: 'User registered'}))
          .catch(error => res.status(401).json({error}))
      }
    )
    .catch(error => res.status(500).json({error}))
}

exports.editUser = (req, res, next) => {
  console.log(req.body.img)
  db.User.findOne({where: {id: req.params.id}})
    .then((user) => {
      if(!user) {
        return res.status(401).json({message: `User doesn't exist`})
      }
      let token = req.headers.authorization.split(' ')[1];
      let decodedToken = jwt.verify(token, 'EZJIAOEJZHIOEJZAIOEJZAIOEZAJUIEOZAJUEIOZA');
      let userId = decodedToken.userId;
      if (user.id !== userId){
        return res.status(401).json({message: `This is not your profil`})
      }
      const filename = user.avatar.split('/images/')[1]
      console.log(filename)
      const userObject = req.file ? {
        ...req.body,
        avatar: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : {
        ...req.body
      }
      db.User.update({...userObject}, {where: {id: req.params.id}})
        .then(() => {
          if(req.file && filename !== undefined) {
            fs.unlink(`images/${filename}`, (err) => {
              if(err) throw err;
            })
          }
          return res.status(200).json({message: 'Success'})
        })
        .catch(error => res.status(500).json({message: error}))
    })
    .catch(error => res.status(500).json({message: error}))
}

exports.delUser = (req, res, next) => {
  db.User.findOne({where: {id: req.params.id}})
    .then((user) => {
      if(!user) {
        return res.status(401).json({message: `User doesn't exist`})
      }
      let token = req.headers.authorization.split(' ')[1];
      let decodedToken = jwt.verify(token, 'EZJIAOEJZHIOEJZAIOEJZAIOEZAJUIEOZAJUEIOZA');
      let userId = decodedToken.userId;
      if (user.id !== userId){
        return res.status(401).json({message: `This is not your profil`})
      }
      bcrypt.compare(req.body.password, user.password)
        .then((valid) => {
          if(!valid) {
            return res.status(401).json({message: 'Password inccorect'})
          }
          db.User.destroy({where: {id: req.params.id}})
            .then(() => {
              db.Post.destroy({where: {userId: req.params.id}})
                .then(() => {
                  db.Cmt.destroy({where: {userId: req.params.id}})
                    .then(() => res.status(200).json({message: 'Success'}))
                    .catch(error => res.status(500).json({message: error}))
                })
                .catch(error => res.status(500).json({message: error}))
            })
            .catch(error => res.status(500).json({message: error}))
        })
        .catch(error => res.status(500).json({message: error}))
    })
    .catch(error => res.status(500).json({message: error}))
}
