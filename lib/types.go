package tweetmap

import (
	"database/sql"
	"time"
)

// Abstraction for the tweet database
type TweetDb struct {
	Db     *sql.DB
	schema string
}

// Result for tweets in the past 24 hours
type TweetsPast24HrsResult struct {
	Hour  time.Time `json:"hour"`
	Count int       `json:"count"`
}

// Result for tweets by ward in the past 24 hrs
type TweetsByWardPast24HrsResult struct {
	WardId    int `json:"wardId"`
	Past24Hrs int `json:"past24Hrs"`
	DayChange int `json:"dayChange"`
}
