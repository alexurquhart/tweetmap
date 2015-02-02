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
	router.HandleFunc("/tweets/past24hours", queryPast24Hrs)
	router.HandleFunc("/tweets/ward/{id:[0-9]+}", queryTweetsByWard)
	router.HandleFunc("/hashtags/past24hours", queryHashtagsPast24Hrs)
	router.HandleFunc("/hashtags/ward/{id:[0-9]+}", queryHashtagsByWard)
	router.HandleFunc("/wards/past24hours", queryWardsPast24Hrs)

	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./www/")))

	http.Handle("/", router)
	log.Println("Starting server on port: " + port)
	http.ListenAndServe(port, nil)
}
