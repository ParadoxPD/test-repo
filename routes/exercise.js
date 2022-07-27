const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');

const router = express.Router();
const User = mongoose.model('User');
const Exercise = mongoose.model('Exercise');

router.get('/', (req, res) => {
    User.find({}, (err, data) => {
        if (err) return res.send(ERROR)
        res.json(data)
    })
})

router.post('/', (req, res, next) => {
    const { username } = req.body;
    User.findOne({ username }).then(user => {
        if (user) throw new Error('username already taken');
        return User.create({ username })
    })
        .then(user => res.status(200).send({
            username: user.username,
            _id: user._id
        }))
        .catch(err => {
            console.log(err);
            res.status(500).send(err.message);
        })
})

router.post('/:id/exercises', (req, res, next) => {
  let userId = req.params.id
    let { description, duration, date } = req.body;
    User.findOne({ _id: userId }).then(user => {
        if (!user) throw new Error('Unknown user with _id');
        date = date || Date.now();
        return Exercise.create({
            description, duration, date, userId
        })
            .then(ex => res.status(200).send({
                username: user.username,
                description: description,
                duration: parseInt(duration),
                _id: user._id,
                date: new Date(ex.date).toDateString()
            }))
    })
        .catch(err => {
            console.log(err);
            res.status(500).send(err.message);
        })
})

router.get('/:id/logs', (req, res, next) => {
  
  let userId = req.params.id;  
  let { from, to, limit } = req.query;
    from = moment(from, 'YYYY-MM-DD').isValid() ? moment(from, 'YYYY-MM-DD') : 0;
    to = moment(to, 'YYYY-MM-DD').isValid() ? moment(to, 'YYYY-MM-DD') : moment().add(1000000000000);
    User.findById(userId).then(user => {
        if (!user) throw new Error('Unknown user with _id');
      let count = 0;
      Exercise.find({ userId })
        .then((data) => {
          count = (data.length)
          Exercise.find({ userId })
            .where('date')
            .gte(from)
            .lte(to)
            .limit(limit)
            .exec()
            .then(log => res.status(200).send({
                _id: userId,
                username: user.username,
                count: count,
                log: log.map(o => ({
                    description: o.description,
                    duration: o.duration,
                    date: new Date(o.date).toDateString()
                }))
            }))
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err.message);
        });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err.message);
        });
      
})

module.exports = router;