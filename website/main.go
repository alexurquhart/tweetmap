package main

import (
	"github.com/cdn-madness/tweetmap/lib"
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"os"
)

var tdb *tweetmap.TweetDb

func main() {
	// Get environment variables
	pghost := os.Getenv("PGHOST")
	pgport := os.Getenv("PGPORT")
	db := os.Getenv("PGDATABASE")
	user := os.Getenv("PGUSER")
	pass := os.Getenv("PGPASSWORD")
	schema := os.Getenv("TWEET_SCHEMA")
	webport := os.Getenv("WEBPORT")

	tdb = new(tweetmap.TweetDb)

	// Initialize the tweet database
	if err := tdb.Init(user, db, pghost, pass, pgport, schema); err != nil {
		log.Printf("Error initializing tweet database: %s", err)
		return
	}
	defer tdb.Db.Close()

	// Start the server
	router := mux.NewRouter()
	router.HandleFunc("/past24Hours", queryPast24Hrs)
	router.HandleFunc("/hashtags/ward/{id:[0-9]+}", queryHashtagsByWard)
	router.HandleFunc("/tweets/ward/{id:[0-9]+}", queryTweetsByWardPast24Hrs)

	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./www/")))

	http.Handle("/", router)
	http.ListenAndServe(webport, nil)
}
