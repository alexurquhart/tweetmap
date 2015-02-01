package tweetmap

import (
	"database/sql"
	"errors"
	_ "github.com/lib/pq"
	"os"
)

// Query types
const (
	TWEETS_PAST_24HRS       int = iota
	TWEETS_BY_WARD          int = iota
	HASH_BY_WARD_PAST_24HRS int = iota
	TOP_HASH_PAST_24HRS     int = iota
)

type Database struct {
	db         *sql.DB
	statements map[int]*sql.Stmt
}

func NewDatabase() (*Database, error) {
	var db Database
	err := db.connect()
	if err != nil {
		return nil, err
	}
	return &db, nil
}

// Returns nil if currently connected to the database
func (Db Database) connected() error {
	if err := Db.db.Ping(); err != nil {
		return err
	}

	return nil
}

// Set up prepared statements for the queries
func (Db *Database) setupStatements() error {
	stmts := make(map[int]string)
	stmts[TWEETS_PAST_24HRS] = "SELECT * FROM \"V_tweetsPast24Hrs\";"
	stmts[TWEETS_BY_WARD] = "SELECT * FROM \"V_tweetsByWardDailyChange\";"

	for k, v := range stmts {
		// Try and prepare the statements
		if p, e := Db.db.Prepare(v); e != nil {
			return e
		} else {
			Db.statements[k] = p
		}
	}
	return nil
}

// Connects to the database
// Sets up all the prepared statements
// Requires the PGUSER, PGPASSWORD, PGHOST, PGPORT, and PGDATABASE environment variables to be set
func (Db *Database) connect() error {
	var connStr string
	connStr = "user=" + os.Getenv("PGUSER") + " "
	connStr += "password=" + os.Getenv("PGPASSWORD") + " "
	connStr += "host=" + os.Getenv("PGHOST") + " "
	connStr += "port=" + os.Getenv("PGPORT") + " "
	connStr += "dbname=" + os.Getenv("PGDATABASE") + " "
	connStr += "search_path=tweetwatcher"

	var err error
	Db.db, err = sql.Open("postgres", connStr)

	if err != nil {
		return err
	}

	if err := Db.connected(); err != nil {
		return nil
	} else {
		return err
	}

	if err := Db.setupStatements(); err != nil {
		Db.Disconnect()
		return err
	}

	return nil
}

// Wrapper for DB.Close()
func (Db *Database) Disconnect() {
	Db.db.Close()
}

// Query
// Returns the result of a query, in marshalled JSON, which then can be served to the client
func (Db *Database) Query(queryType int, args ...interface{}) ([]byte, error) {
	switch queryType {
	case TWEETS_PAST_24HRS:
		return Db.tweetsPast24Hrs()
	case TOP_HASH_PAST_24HRS:
		return Db.top25HashtagsPast24Hrs()
	case TWEETS_BY_WARD:
		return Db.tweetsByWard()
	}
	return nil, errors.New("Invalid query type")
}

// Returns the total number of tweets per hour
func (Db Database) tweetsPast24Hrs() ([]byte, error) {
	var result string
	err := Db.db.QueryRow("SELECT * FROM \"V_tweetsPast24Hrs\";").Scan(&result)
	if err != nil {
		return nil, err
	}
	return []byte(result), nil
}

// Returns the top 25 hashtags for the past 24 hours
func (Db Database) top25HashtagsPast24Hrs() ([]byte, error) {
	var result string
	err := Db.db.QueryRow("SELECT * FROM \"V_top25HashtagsPast24Hours\";").Scan(&result)
	if err != nil {
		return nil, err
	}
	return []byte(result), nil
}

func (Db Database) tweetsByWard() ([]byte, error) {
	var result string
	err := Db.db.QueryRow("SELECT * FROM \"V_tweetsByWardDailyChange\";").Scan(&result)
	if err != nil {
		return nil, err
	}
	return []byte(result), nil
}
