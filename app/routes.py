from app import app, db
from app.forms import LoginForm, SignUpForm
from flask import render_template, flash, redirect, url_for, send_from_directory, request, jsonify
from flask_login import current_user, login_user, logout_user
from app.models import User

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html', user=current_user)

@app.route('/login', methods=["POST", "GET"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password')
            return redirect(url_for('login'))
        login_user(user, remember=form.remember_me.data)
        return redirect(url_for('index'))
    return render_template('login.html', title="Sign In", form=form)

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/signup', methods=["POST", "GET"])
def signup():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = SignUpForm()
    if form.validate_on_submit():
        user=User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Success!')
        return redirect(url_for('login'))
    return render_template('signup.html', title="Sign Up", form=form)

@app.route('/exercise/<exercise_name>')
def exercise(exercise_name):
    return render_template('exercise.html')

@app.route('/js/vs.js')
def vs():
    return send_from_directory('../static/', 'main.js')

# This is the endpoint we recehive updates on
@app.route('/exercise_log', methods=["POST"])
def exercise_log():
    print(request.data)
    return jsonify(success=True)
