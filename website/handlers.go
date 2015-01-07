package main

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
)

func queryPast24Hrs(w http.ResponseWriter, r *http.Request) {
	result, err := tdb.TweetsPast24Hrs()

	if err != nil {
		w.WriteHeader(500)
		fmt.Fprintf(w, "Database Error: %s", err)
		return
	}

	if response, err := json.Marshal(result); err != nil {
		w.WriteHeader(500)
		fmt.Fprintf(w, "JSON marshalling error: %s", err)

	} else {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.Write(response)
	}
}

func queryTweetsByWardPast24Hrs(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "ward: %s", mux.Vars(r)["id"])
}

func queryHashtagsByWard(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "ID: %s", mux.Vars(r)["id"])
}
