from flask import Flask, jsonify
import mysql.connector
from mysql.connector import pooling 
from dotenv import load_dotenv
import os

app = Flask(__name__)

load_dotenv()

dbconfig = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASS"),
    "database": os.getenv("DB_NAME"),
}

pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size = 5,
    **dbconfig
)

@app.route("/")
def index():
    return "Python API 서비스 실행중"

@app.route("/python/stats/likes")
def likes_stats():
    conn = pool.get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
         SELECT a.title, COUNT(ul.anime_id) AS like_count 
         FROM animes a
         LEFT JOIN user_likes ul ON a.id = ul.anime_id
         GROUP BY a.id
         ORDER BY like_count DESC
         LIMIT 10          
    """)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(rows)


@app.route("/python/stats/genre_rating")
def genre_rating():
     conn = pool.get_connection()
     cursor = conn.cursor(dictionary=True)
     cursor.execute("""
       SELECT genre, AVG(rating) as avg_rating
       FROM animes 
       GROUP BY genre 
       ORDER BY avg_rating DESC            
       LIMIT 10
    """)
     rows = cursor.fetchall()
     cursor.close()
     conn.close()
     return jsonify(rows)
 

if __name__ == "__main__":
      app.run(port=8000, debug = True)