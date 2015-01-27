package main

import (
	"fmt"
	"github.com/cdn-madness/tweetmap/lib"
	"github.com/cdn-madness/tweetmap/protobuf"
	"github.com/darkhelmet/twitterstream"
	"os"
	"runtime"
	"time"
)

func main() {

	runtime.GOMAXPROCS(runtime.NumCPU())

	// Get environment variables and construct API info
	apiCfg := tweetmap.TwitterAPIConfig{
		AccessSecret:   os.Getenv("TWITTER_ACCESS_SECRET"),
		AccessToken:    os.Getenv("TWITTER_ACCESS_TOKEN"),
		ConsumerSecret: os.Getenv("TWITTER_CONSUMER_SECRET"),
		ConsumerKey:    os.Getenv("TWITTER_CONSUMER_KEY"),
		SouthEast:      twitterstream.Point{0, 0},
		NorthWest:      twitterstream.Point{90, 180},
	}

	filter := func(t *twitterstream.Tweet) bool {
		return true
	}

	doneChan := make(chan bool)
	tweetChan, errChan := tweetmap.ListenToTwitter(apiCfg, filter, doneChan)

	go func(tc chan *prototweet.Tweet) {
		for tweet := range tc {
			fmt.Printf("Received tweet from %s\n", tweet.User)
		}
		fmt.Println("Exiting tweet function\n")
	}(tweetChan)

	go func(ec chan error) {
		for err := range ec {
			fmt.Printf("Error: %s\n", err.Error())
		}
		fmt.Println("Exiting error function\n")
	}(errChan)

	time.Sleep(10 * time.Second)
	close(doneChan)
	time.Sleep(100 * time.Second)
}
