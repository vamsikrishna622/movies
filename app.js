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
  const getMoviesListQuery = `
    SELECT *
    FROM
    movie;
    `;
  const moviesObj = await db.all(getMoviesListQuery);
  const convertDbObjectToResponseObject = (moviesObj) => {
    let movieNameList = [];
    for (eachMovie of moviesObj) {
      const movieNameObj = {
        movieName: eachMovie.movie_name,
      };
      movieNameList.push(movieNameObj);
    }
    return movieNameList;
  };
  response.send(convertDbObjectToResponseObject(moviesObj));
});

///API 2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  console.log(movieDetails);

  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
  INSERT INTO
  movie(director_id, movie_name, lead_actor)
  VALUES
  (${directorId},'${movieName}','${leadActor}');
  `;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//API 3 check line 66 and also change cases if necessary

app.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  movieId = parseInt(movieId);

  const getMovieQuery = `
    SELECT *
    FROM 
      movie
    WHERE 
      movie_id=${movieId};
    `;
  const movie = await db.get(getMovieQuery);
  response.send(movie);
});

///API 4
app.put("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  movieId = parseInt(movieId);
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `
    UPDATE
    movie
    SET
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE 
    movie_id=${movieId};
    `;

  await db.run(updateMovieQuery);
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
  const getDirectorsQuery = `
    SELECT *
    FROM
    director;
    `;
  const directorsObj = await db.all(getDirectorsQuery);
  const convertDbObjToResponseObj = (directorsObj) => {
    let directorsList = [];
    for (eachDirector of directorsObj) {
      const director = {
        directorId: eachDirector.director_id,
        directorName: eachDirector.director_name,
      };
      directorsList.push(director);
    }
    return directorsList;
  };
  const directorsList = convertDbObjToResponseObj(directorsObj);
  response.send(directorsList);
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
