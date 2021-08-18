class Posts {
  constructor(){
    this.posts = []
    this.comments = []
  }

  addPosts(posts){
    this.posts = posts
  }

  getPosts(){
    return this.posts
  }

  getPost(post){
    return this.posts.filter(p=>p.id == post.id)
  }

  addComments(comments){
    this.comments = comments
  }

  getComments(post){
    return this.comments.filter(c=>p.postId == post.id)
  }

  getComment(comment){
    return this.comments.filter(c=>p.id == comment.id)
  }
}

module.exports = function() {
  return new Posts()
}