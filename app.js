const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

const convertDbObjectToResponseObject2 = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

app.get("/players/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      player_details
    ORDER BY
      player_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(
    booksArray.map((each_player) =>
      convertDbObjectToResponseObject(each_player)
    )
  );
});

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getBooksQuery = `
    SELECT
      *
    FROM
      player_details
    WHERE
      player_id = '${playerId}'`;
  const booksArray = await db.get(getBooksQuery);
  response.send(convertDbObjectToResponseObject(booksArray));
});

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const getBooksQuery = `
    UPDATE
      player_details
    SET
      player_name = '${playerName}'
    WHERE
      player_id = '${playerId}'`;
  const booksArray = await db.run(getBooksQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getBooksQuery = `
    SELECT
      *
    FROM
      match_details
    WHERE
      match_id = '${matchId}'`;
  const booksArray = await db.get(getBooksQuery);
  response.send(convertDbObjectToResponseObject2(booksArray));
});

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getmatchesQuery = `
    SELECT
      match_details.match_id,
      match_details.match,
      match_details.year
    FROM
      player_match_score NATURAL JOIN match_details
    WHERE
      player_id = '${playerId}'`;
  const matches = await db.all(getmatchesQuery);
  response.send(
    matches.map((each_player) => convertDbObjectToResponseObject2(each_player))
  );
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getplayersQuery = `
    SELECT
      player_details.player_id,
      player_details.player_name
    FROM
      player_match_score NATURAL JOIN player_details
    WHERE
      match_id = '${matchId}'`;
  const players = await db.all(getplayersQuery);
  response.send(
    players.map((each_player) => convertDbObjectToResponseObject(each_player))
  );
});

module.exports = app;
