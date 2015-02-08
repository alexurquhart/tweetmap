package main

import (
	"flag"
	"github.com/cdn-madness/tweetmap/lib"
	"github.com/gorilla/mux"
	"io/ioutil"
	"net/http"
	"os"
)

var db *tweetmap.Database
var debug *bool

func main() {
	port := ":8765"

	// Setup debug mode
	debug = flag.Bool("d", false, "Start server in debug mode")
	flag.Parse()

	if !*debug {
		initLogger(ioutil.Discard, ioutil.Discard, os.Stderr)
	} else {
		initLogger(os.Stdout, os.Stdout, os.Stderr)
	}

	var err error
	db, err = tweetmap.NewDatabase()
	if err != nil {
		Error.Printf("Error connecting to database: %s", err)
		return
	}
	defer db.Disconnect()

	// Start the server
	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/tweets/past24hours", queryPast24Hrs)
	router.HandleFunc("/tweets/ward/{id:[0-9]+}", queryTweetsByWard)
	router.HandleFunc("/hashtags/past24hours", queryHashtagsPast24Hrs)
	router.HandleFunc("/hashtags/ward/{id:[0-9]+}", queryHashtagsByWard)
	router.HandleFunc("/wards/past24hours", queryWardsPast24Hrs)

	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./www/")))

	http.Handle("/", router)
	Info.Println("Starting server on port: " + port)
	http.ListenAndServe(port, nil)
}
