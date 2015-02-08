package main

import (
	"fmt"
	"github.com/cdn-madness/tweetmap/lib"
	"github.com/gorilla/mux"
	"net/http"
)

func writeResult(res []byte, err error, w http.ResponseWriter, r *http.Request) {
	if err != nil {
		w.WriteHeader(500)
		fmt.Fprintf(w, "Database Error: %s", err)

		if *debug {
			Error.Printf("Database Error: %s\n", err)
		}
		return
	}

	if *debug {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		Info.Printf("Request:\t%s\tFrom: %s\n", r.RequestURI, r.RemoteAddr)
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Write(res)
}

func queryPast24Hrs(w http.ResponseWriter, r *http.Request) {
	result, err := db.Query(tweetmap.TWEETS_PAST_24HRS)
	writeResult(result, err, w, r)
}

func queryHashtagsPast24Hrs(w http.ResponseWriter, r *http.Request) {
	result, err := db.Query(tweetmap.TOP_HASH_PAST_24HRS)
	writeResult(result, err, w, r)
}

func queryWardsPast24Hrs(w http.ResponseWriter, r *http.Request) {
	result, err := db.Query(tweetmap.TWEETS_BY_WARD)
	writeResult(result, err, w, r)
}

func queryTweetsByWard(w http.ResponseWriter, r *http.Request) {
	result, err := db.Query(tweetmap.TWEETS_BY_WARD)
	writeResult(result, err, w, r)
}

func queryHashtagsByWard(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "ID: %s", mux.Vars(r)["id"])
}
