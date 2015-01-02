package tweetmap

import (
	"github.com/stretchr/testify/assert"
	"os"
	"testing"
)

var tdb *TweetDb

func init() {
	pghost := os.Getenv("PGHOST")
	port := os.Getenv("PGPORT")
	db := os.Getenv("PGDATABASE")
	user := os.Getenv("PGUSER")
	pass := os.Getenv("PGPASSWORD")
	schema := os.Getenv("TWEET_SCHEMA")
	tdb = new(TweetDb)

	tdb.Init(user, db, pghost, pass, port, schema)
}

func TestInit(t *testing.T) {
	pghost := os.Getenv("PGHOST")
	port := os.Getenv("PGPORT")
	db := os.Getenv("PGDATABASE")
	user := os.Getenv("PGUSER")
	pass := os.Getenv("PGPASSWORD")
	schema := os.Getenv("TWEET_SCHEMA")
	test := new(TweetDb)

	assert.Error(t, test.Init("wrongusername", db, pghost, pass, port, schema))
	assert.Nil(t, test.Init(user, db, pghost, pass, port, schema))
	test.Db.Close()

}

func TestTweetsPast24Hrs(t *testing.T) {
	result, err := tdb.TweetsPast24Hrs()
	assert.Nil(t, err)
	assert.NotNil(t, result)

	// returns 24 rows...
	assert.Equal(t, 24, len(result))
}
