const Blog = require('../models/blog')
const User = require('../models/user')

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

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}


module.exports = {
  initialPosts, nonExistingId, postsInDb, usersInDb
}