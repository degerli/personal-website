from flask import Flask, url_for, render_template, request, session, escape, redirect
import pymongo
import os,datetime, time, math
from blog import *
import json
from tools import *

app = Flask(__name__)
admin_password = os.environ.get('FLYINGSPARX_PASSWORD')
app.secret_key = os.environ.get('FLYINGSPARX_KEY')

@app.route('/transfer')
def transfer():
    transferPosts()
    return "Done"

# On each request, check if requester is mobile device.
# If so, set new request field to True so views can pass this info
# to the templates.
@app.before_request
def check_mobile():
    request.mobile = detectMobile(request)

# flyingsparx.net/ 
# Get all blog posts and pass to templates for rendering
# TODO: modified to allow pagination
@app.route('/')
def home():
    postList = getPosts()
    return render_template('home.html', posts = postList, mobile = request.mobile)

# flyingsparx.net/post/year/month/day
# Get the post posted on this day and pass to template for rendering.
# TODO: modified to allow for more than one post per day
@app.route('/post/<year>/<month>/<day>/')
def post(year, month, day):
    post = getPostByDate(year, month, day)
    postList = []
    postList.append(post)
    return render_template('home.html', posts = postList, mobile = request.mobile)

# flyingsparx.net/contact
@app.route('/contact/')
def contact():
        return render_template('contact.html', mobile = request.mobile)

# flyingsparx.net/research
@app.route('/research/')
def research():
        return render_template('research.html', mobile = request.mobile)

# flyingsparx.net/outputs
@app.route('/outputs/')
def outputs():
        return render_template('outputs.html', mobile = request.mobile)

# flyingsparx.net/teaching
@app.route('/teaching/')
def teaching():
        return render_template('teaching.html', mobile = request.mobile)

@app.route('/photos/')
def photos():
    photos = []
    for root, _, files in os.walk('static/photos/thumbs/'):
        for f in files:
            photos.append(str(f))
    return render_template('photos.html', mobile = request.mobile, photos = photos)

# flyingsparx.net/logout
# Logout of admin interface - pop cookie from session list
@app.route('/logout/')
def logout():
    session.pop('id')
    return redirect(url_for('show'))

# flyingspsarx.net/blog
# Redirect to the blog list page
@app.route('/blog/')
def blog():
    return redirect(url_for('show'))

# flyingsparx.net/blog/new
# If logged in and GET, show form for writing a new blog post.
# if POST, get data from form and write to mongodb
@app.route('/blog/new/', methods=['GET', 'POST'])
def new():
    if not 'id' in session:
        return redirect(url_for('show'))
    if request.method == 'GET':
        return '''<form method="POST" action="/blog/new/">
                    <input type="text" placeholder="title" name="title" /><hr /><textarea name="text" placeholder="text"></textarea><hr />
                    <input type="text" placeholder="day" name="day" /><input type="text" placeholder="month" name="month" />
                    <input type="text" placeholder="year" name="year" />
                    <input type="submit" value="submit" /></form>'''
    if request.method == 'POST':
        title = request.form['title']
        text = request.form['text']
        day = int(request.form['day'])
        month = int(request.form['month'])
        year = int(request.form['year'])
        newPost(title, text, day, month, year)
    return redirect(url_for('show'))

# flyingsparx.net/blog/show
# If logged in, show blog list with options for creating new blogs, logging out and editing existing posts
# If not logged in, show login form
@app.route('/blog/show/', methods=['GET', 'POST'])
def show():
    if request.method == 'POST':
        if request.form['password'] == admin_password:
            session['id'] = time.time()
        return redirect(url_for('show'))
    if not 'id' in session:
        return 'Password: <form method="post" action="/blog/show/"><input type="password" name="password" /><input type="submit" value="submit" /></form>'
    posts = getPosts()
    ret = "<a href='/blog/new/'>Create a new post</a> - <a href='/logout/'>Logout</a><hr />"
    for post in posts:
        ret=ret+"<h1>"+post.title+" ("+str(post.day)+"/"+str(post.month)+"/"+str(post.year)+")</h1>"
        ret=ret+'<a href="/blog/edit/'+str(post.id)+'">edit</a>'
    return ret

#flyingsparx.net/blog/edit/blog_id
# If logged in and GET, show 'new post' form with fields completed with this post's details
# if POST, get data from fields and update the blog database
@app.route('/blog/edit/<blog_id>', methods=['GET', 'POST'])
def edit(blog_id):
    if not 'id' in session:
        return redirect(url_for('show'))
    if request.method == 'GET':
        post = getPostById(blog_id)
        return '''<form method="POST" action="/blog/edit/'''+str(blog_id)+'''">
                <input type="text" placeholder="title" name="title" value="'''+str(post.title)+'''"/><hr /><textarea name="text" placeholder="text">'''+post.content+'''</textarea><hr />
                <input type="text" placeholder="day" name="day" value="'''+str(post.day)+'''"/><input type="text" placeholder="month" name="month" value="'''+str(post.month)+'''"/>
                <input type="text" placeholder="year" name="year" value="'''+str(post.year)+'''"/>
                <hr /><input type="submit" value="submit" /></form><hr /><a href="/blog/delete/'''+str(blog_id)+'''">Delete this post</a>'''
    if request.method == 'POST':
        updatePost(blog_id, request.form['title'], request.form['text'], int(request.form['day']), int(request.form['month']), int(request.form['year']))
        return redirect(url_for('show'))

# flyingsparx.net/blog/delete/blog_id
@app.route('/blog/delete/<blog_id>')
def delete(blog_id):
    if not 'id' in session:
        return redirect(url_for('show'))
    deletePost(blog_id)
    return redirect(url_for('show'))

# flyingsparx.net/blog/get
# JSON endpoint for returning blog data
# Currently used for embedding blog in willwebberley.net
@app.route('/blog/get')
@crossdomain(origin='*')
def getBlog():
    posts = getPostsAsJSON()
    return posts

# Main code
if __name__ == '__main__':
    app.debug = True # set to true and server will display any errors to the page
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)