from .extensions import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)

    def __repr__(self):
        return f"<User {self.name}>"

class Professor(db.Model):
    __tablename__ = 'professors'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128))
    department = db.Column(db.String(128))
    
    # --- THE FIX IS HERE ---
    # We tell SQLAlchemy: "When I say .rating, read the 'quality_rating' column"
    rating = db.Column('quality_rating', db.Float)
    
    # "When I say .difficulty, read the 'difficulty_rating' column"
    difficulty = db.Column('difficulty_rating', db.Float)

    total_ratings = db.Column('total_ratings', db.Integer)
    would_take_again = db.Column('would_take_again', db.String(10))
    tags = db.Column(db.String(512))

    def __repr__(self):
        return f"<Professor {self.name}>"