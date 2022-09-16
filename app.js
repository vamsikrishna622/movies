const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
//API 1
app.get("/movies/", async (request, response) => {
  const getMoviesList = `
    SELECT *
    FROM
    moviesData.db;
    `;
  const moviesList = await db.all(getMoviesList);
  response.send(moviesList);
});

//API 2

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const createNewMovie = `
    INSERT INTO
    movie(directorId, movieName, leadActor)
    VALUES
    ${directorId},
    '${movieName}',
    '${leadActor}';`;

  const dbResponse = await db.run(createNewMovie);
  const movieId = dbResponse.lastId;
  response.send("Movie Successfully Added");
});

//API 3 check line 66 and also change cases if necessary

app.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  movieId = parseInt(movieId);

  const getMovie = `
    SELECT *
    FROM
    movie
    WHERE
    movie_id=movieId;
    `;
  const movie = await db.get(getMovie);
  response.send(movie);
});

///API 4
app.put("/movies/:movieId/", async (request, response) => {
  let movieId = request.params;
  movieId = parseInt(movieId);
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovie = `
    UPDATE
    movie
    SET
    directorId=${directorId},
    movieName=${movieName},
    leadActor=${leadActor};
    `;
  await db.run(updateMovie);
  response.send("Movie Details Updated");
});

///API 5
app.delete("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  movieId = parseInt(movieId);

  const deleteMovie = `
    DELETE FROM
    movie
    WHERE 
    movie_id = ${movieId};
    `;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

///API 6
app.get("/directors/", async (request, response) => {
  const getDirectors = `
    SELECT *
    FROM
    directors;
    `;
  const directors = await db.all(getDirectors);
  response.send(directors);
});

///API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  let { directorId } = request.params;
  directorId = parseInt(directorId);

  const getMovieNames = `
    SELECT
    movie_name
    FROM movie
    WHERE
    director_id = ${directorId};
    `;
  const movieNames = await db.all(getMovieNames);
  response.send(movieNames);
});

module.exports = app;
