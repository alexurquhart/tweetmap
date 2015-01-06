/*
	TweetMap

	This is a set of helper functions and structs for the Ottawa Tweet Mapper
*/
package tweetmap

import (
	"database/sql"
	"errors"
	_ "github.com/lib/pq"
)

// Initialize connection to the tweet database
func (t *TweetDb) Init(user string, database string, host string, password string, port string, schema string) error {
	t.schema = schema
	connStr := "user=" + user
	connStr += " dbname=" + database
	connStr += " password=" + password
	connStr += " host=" + host
	connStr += " port=" + port
	connStr += " sslmode=require connect_timeout=5"
	if db, err := sql.Open("postgres", connStr); err != nil {
		return err
	} else {
		if err := db.Ping(); err != nil {
			return err
		}
		t.Db = db
		return nil
	}
}

// Queries the database and returns a map of tweet frequency over the past 24 hours
func (t *TweetDb) TweetsPast24Hrs() ([]TweetsPast24HrsResult, error) {
	if t.Db == nil {
		return nil, errors.New("TweetDB Error: Not connected to the database")
	}

	rows, err := t.Db.Query("SELECT * FROM tweetwatcher.\"V_tweetsPast24Hrs\";")

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var results []TweetsPast24HrsResult
	for rows.Next() {
		var result TweetsPast24HrsResult

		if err := rows.Scan(&result.hour, &result.count); err != nil {
			return nil, err
		}

		results = append(results, result)
	}
	return results, nil
}

func (t *TweetDb) TweetsByWardPast24Hrs() ([]TweetsByWardPast24HrsResult, error) {
	if t.Db == nil {
		return nil, errors.New("TweetDB Error: Not connected to the database")
	}

	rows, err := t.Db.Query("SELECT * FROM tweetwatcher.\"V_tweetsByWardDailyChange\";")

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var results []TweetsByWardPast24HrsResult
	for rows.Next() {
		var result TweetsByWardPast24HrsResult

		if err := rows.Scan(&result.wardId, &result.past24Hrs, &result.dayChange); err != nil {
			return nil, err
		}

		results = append(results, result)
	}
	return results, nil
}
