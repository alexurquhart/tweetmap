package tweetmap

import (
	"github.com/stretchr/testify/assert"
	"os"
	"testing"
)

func TestInit(t *testing.T) {
	pghost := os.Getenv("PGHOST")
	port := os.Getenv("PGPORT")
	db := os.Getenv("PGDATABASE")
	user := os.Getenv("PGUSER")
	pass := os.Getenv("PGPASSWORD")
	schema := os.Getenv("TWEET_SCHEMA")
	tdb := new(TweetDb)

	assert.Error(t, tdb.Init("wrongusername", db, pghost, pass, port, schema))
	assert.Nil(t, tdb.Init(user, db, pghost, pass, port, schema))
	defer tdb.Db.Close()

}
