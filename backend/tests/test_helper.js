const Blog = require('../models/blog')

const initialPosts = [
  {
    'title': 'Blog title test',
    'author': 'Blog author test',
    'url': 'http://test//blog',
    'likes': 666,
  },
  {
    'title': 'Blog title test 2',
    'author': 'Blog author test',
    'url': 'http://test//blog',
    'likes': 1,
  }
]

const nonExistingId = async () => {
  const blogpost = new Blog({ content: 'willremovethissoon' })
  await blogpost.save()
  await blogpost.deleteOne()

  return blogpost._id.toString()
}

const postsInDb = async () => {
  const blogposts = await Blog.find({})
  return blogposts.map(post => post.toJSON())
}

module.exports = {
  initialPosts, nonExistingId, postsInDb
}