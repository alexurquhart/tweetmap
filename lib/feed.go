package tweetmap

import (
	"github.com/cdn-madness/tweetmap/protobuf"
	"github.com/darkhelmet/twitterstream"
	"time"
)

// Filter type
// Functions take a tweet and return true if it should continue being processed
type TweetFilter func(t *twitterstream.Tweet) bool

// API keys and extent bounding box coordinates
type TwitterAPIConfig struct {
	ConsumerKey    string
	ConsumerSecret string
	AccessToken    string
	AccessSecret   string
	SouthEast      twitterstream.Point
	NorthWest      twitterstream.Point
}

// Listens starts up the twitterstream
// Takes a API configuration, a filter function, and a "done" channel
// Returns a tweet channel, and an error channel
func ListenToTwitter(cfg TwitterAPIConfig, filterFunc TweetFilter, doneChan chan bool) (chan *prototweet.Tweet, chan error) {
	tweetChan := make(chan *prototweet.Tweet)
	errorChan := make(chan error)

	go func(cfg TwitterAPIConfig, filterFunc TweetFilter, doneChan chan bool, tweetChan chan *prototweet.Tweet, errorChan chan error) {
		defer close(tweetChan)
		defer close(errorChan)

		select {
		case done, more := <-doneChan:
			if done || !more {
				return
			}
		default:
			client := twitterstream.NewClientTimeout(cfg.ConsumerKey, cfg.ConsumerSecret, cfg.AccessToken, cfg.AccessSecret, 2*time.Hour)

			// Loop indefinitely
			// TODO - enable tracking to see how often connections are attempted
			for {
				// Request the stream
				stream, err := client.Locations(cfg.SouthEast, cfg.NorthWest)

				// If no connection, then sleep for 30 seconds and try again
				if err != nil {
					errorChan <- err
					time.Sleep(30 * time.Second)
					continue
				}

				for {
					tweet, err := stream.Next()
					if err != nil {
						errorChan <- err
						break
					}

					// Filter tweeet and send it off
					if filterFunc(tweet) {
						if pTweet, err := ToProtoTweet(tweet); err != nil {
							errorChan <- err
						} else {
							tweetChan <- pTweet
						}
					}
				}
			}
		}
	}(cfg, filterFunc, doneChan, tweetChan, errorChan)

	return tweetChan, errorChan
}
