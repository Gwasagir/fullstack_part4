const blogRouter = require('express').Router()
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response) => {
  const posts = await Blog.find({})
  response.json(posts)
})

blogRouter.post('/', async (request, response, next) => {
  const body = new Blog(request.body)
  const post = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  })
  try {
    const savedPost = await post.save()
    response.status(201).json(savedPost)
  } catch(expection) {
    response.status(400)
    next(expection)
  }
})

blogRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
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