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
	hour  time.Time
	count int
}

// Result for tweets by ward in the past 24 hrs
type TweetsByWardPast24HrsResult struct {
	wardId    int
	past24Hrs int
	dayChange int
}
