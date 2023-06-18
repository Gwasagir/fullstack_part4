const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1, author: 1, url:1 })
  response.json(users)
})

usersRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body
  if (password.length < 3) {
    response.status(400).json({ error: 'Password is too short!' })
  }
  else if (username.length < 3) {
    response.status(400).json({ error: 'Username is too short!' })
  }
  else {
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
      username,
      name,
      passwordHash,
    })
    try {
      const savedUser = await user.save()
      response.status(201).json(savedUser)
    } catch(expection) {
      response.status(400).json({ error: 'expected `username` to be unique' })
      next(expection)
    }
  }
})

usersRouter.delete('/:id', async (request, response) => {
  await User.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = usersRouter