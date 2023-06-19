const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogRouter.get('/', async (request, response) => {
  const posts = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(posts)
})

blogRouter.post('/', async (request, response, next) => {
  if (!request.token) return response.status(401).json({ error: 'token missing' })
  const body = request.body
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)

  const post = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user.id
  })
  try {
    const savedPost = await post.save()
    user.blogs = user.blogs.concat(savedPost._id)
    await user.save()
    response.status(201).json(savedPost)
  } catch(expection) {
    response.status(400)
    next(expection)
  }
})

blogRouter.delete('/:id', async (request, response) => {
  if (!request.token) return response.status(401).json({ error: 'token missing' })
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)
  const blogpost = await Blog.findById(request.params.id)

  if ( blogpost.user.toString() === user.id.toString() ){
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } else {
    response.status(400)
  }
})

blogRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const post = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }
  const updatedPost = await Blog.findByIdAndUpdate(request.params.id, post, { new: true, runValidators: true })
  try {
    response.json(updatedPost)
    response.status(200).json({ message: 'Update post successful!' })
  } catch(error) {
    next(error)
  }
})

module.exports = blogRouter