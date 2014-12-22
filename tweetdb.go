/*
	TweetMap

	This is a set of helper functions and structs for the Ottawa Tweet Mapper
*/
package tweetmap

import (
	"database/sql"
	_ "github.com/lib/pq"
	"time"
)

// Abstraction for the tweet database
type TweetDb struct {
	Db     *sql.DB
	schema string
}

// Initialize connection to the tweet database
func (t *TweetDb) Init(user string, database string, host string, password string, port string, schema string) error {
	t.schema = schema
	if db, err := sql.Open("postgres", "user="+user+" dbname="+database+" password="+password+" host="+host+" port="+port+" sslmode=require connect_timeout=5"); err != nil {
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
func (t *TweetDb) TweetsPast24Hrs() (map[time.Time]int, error) {
	rows, err := t.Db.Query("SELECT * FROM tweetwatcher.\"V_tweetsPast24Hrs\";")

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	result := make(map[time.Time]int)
	for rows.Next() {
		var hour time.Time
		var count int

		if err := rows.Scan(&hour, &count); err != nil {
			return nil, err
		}

		result[hour] = count
	}
	return result, nil
}
