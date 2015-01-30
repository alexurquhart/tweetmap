package main

import (
	"fmt"
	"github.com/cdn-madness/tweetmap/lib"
	"github.com/gorilla/mux"
	"net/http"
)

func queryPast24Hrs(w http.ResponseWriter, r *http.Request) {
	result, err := db.Query(tweetmap.TWEETS_PAST_24HRS)

	if err != nil {
		w.WriteHeader(500)
		fmt.Fprintf(w, "Database Error: %s", err)
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Write(result)
}

func queryTweetsByWardPast24Hrs(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "ward: %s", mux.Vars(r)["id"])
}

func queryHashtagsByWard(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "ID: %s", mux.Vars(r)["id"])
}
