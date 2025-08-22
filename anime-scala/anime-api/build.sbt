import Dependencies._

ThisBuild / scalaVersion     := "2.13.12"
ThisBuild / version          := "0.1.0-SNAPSHOT"
ThisBuild / organization     := "com.example"
ThisBuild / organizationName := "example"

lazy val root = (project in file("."))
  .settings(
    name := "anime-api",
    libraryDependencies += munit % Test
  )

scalaVersion := "2.13.12"


libraryDependencies ++= Seq(
    "com.typesafe.play" %% "play-json" % "2.10.0-RC5",       // JSON 처리
  "com.typesafe" % "config" % "1.4.2",                    // 환경 변수
  "mysql" % "mysql-connector-java" % "8.0.33",             // MySQL
  "com.typesafe.akka" %% "akka-http" % "10.2.10",         // HTTP 서버
  "com.typesafe.akka" %% "akka-stream" % "2.8.4",
  "com.typesafe.play" %% "play-json" % "2.10.0",
)
// See https://www.scala-sbt.org/1.x/docs/Using-Sonatype.html for instructions on how to publish to Sonatype.

Compile / mainClass := Some("AnimeAPI")