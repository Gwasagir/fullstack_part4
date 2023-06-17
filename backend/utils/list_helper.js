const dummy = () => {
  return 1
}

const totalLikes = blogs => {
  const result = blogs.reduce(function(sumLikes, blogPost) {
    return sumLikes + blogPost.likes
  }, 0)
  return blogs.length === 0
    ? 0
    : result
}

module.exports = {
  dummy,
  totalLikes
}