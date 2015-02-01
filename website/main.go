package main

import (
	"github.com/cdn-madness/tweetmap/lib"
	"github.com/gorilla/mux"
	"log"
	"net/http"
)

var db *tweetmap.Database

func main() {
	port := ":8765"

	var err error
	db, err = tweetmap.NewDatabase()
	if err != nil {
		log.Printf("Error connecting to database: %s", err)
		return
	}
	defer db.Disconnect()

	// Start the server
	router := mux.NewRouter()
	router.HandleFunc("/past24Hours", queryPast24Hrs)
	router.HandleFunc("/hashtagsPast24Hours", queryHashtagsPast24Hrs)
	router.HandleFunc("/hashtags/ward/{id:[0-9]+}", queryHashtagsByWard)
	router.HandleFunc("/tweets/ward/{id:[0-9]+}", queryTweetsByWardPast24Hrs)

	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./www/")))

	http.Handle("/", router)
	log.Println("Starting server on port: " + port)
	http.ListenAndServe(port, nil)
}
