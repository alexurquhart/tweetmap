package tweetmap

import (
	"github.com/cdn-madness/tweetmap/protobuf"
	"github.com/darkhelmet/twitterstream"
	"github.com/stretchr/testify/assert"
	"log"
	"os"
	"testing"
	"time"
)

func TestListenToTwitter(t *testing.T) {
	// Get environment variables and construct API info
	apiCfg := TwitterAPIConfig{
		AccessSecret:   os.Getenv("TWITTER_ACCESS_SECRET"),
		AccessToken:    os.Getenv("TWITTER_ACCESS_TOKEN"),
		ConsumerSecret: os.Getenv("TWITTER_CONSUMER_SECRET"),
		ConsumerKey:    os.Getenv("TWITTER_CONSUMER_KEY"),
		SouthEast:      twitterstream.Point{0, 0},
		NorthWest:      twitterstream.Point{90, 180},
	}

	filter := func(t *prototweet.Tweet) bool {
		return true
	}

	doneChan := make(chan bool)
	defer close(doneChan)
	tweetChan, errChan := ListenToTwitter(apiCfg, filter, doneChan)

	select {
	case <-tweetChan:
		log.Println("Received tweet")
	case err := <-errChan:
		// Determine the error type
		if _, ok := err.(*ProtoTweetError); !ok {
			t.Log(err)
			assert.Fail(t, err.Error())
		}
	case <-time.After(time.Minute):
		assert.Fail(t, "No tweets received in past 60 seconds.")
	}

}
