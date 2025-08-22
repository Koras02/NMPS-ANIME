import java.sql.DriverManager
import play.api.libs.json.{Json, JsValue}

object AnimeAPI extends App {
val host = sys.env.getOrElse("DB_HOST", "localhost")
val port = sys.env.getOrElse("DB_PORT", "")
val user = sys.env.getOrElse("DB_USER", "")
val pass = sys.env.getOrElse("DB_PASS", "")
val dbName = sys.env.getOrElse("DB_NAME", "")
    
   val url = s"jdbc:mysql://$host:$port/$dbName?useSSL=false&allowPublicKeyRetrieval=true"
     val connection = DriverManager.getConnection(url, user, pass)

     try {
        val statement = connection.createStatement()
        val resultSet = statement.executeQuery("SELECT * FROM animes LIMIT 10")

          var animeList = Seq.empty[JsValue]

        while (resultSet.next()) {
            animeList = animeList :+ Json.obj(
                "id" -> resultSet.getInt("id"),
                "title" -> resultSet.getString("title"),
                "genre" -> resultSet.getString("genre"),
                "episodes" -> resultSet.getInt("episodes"),
                "rating" -> resultSet.getDouble("rating"),
                "release_date" -> resultSet.getString("release_date"),
                "img_url" -> resultSet.getString("img_url"),
            )
        } 

        println(Json.prettyPrint(Json.toJson(animeList)))
        } finally {
            connection.close()
        }
     }
