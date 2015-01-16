// Package main provides ...
package main

import (
	"github.com/cdn-madness/tweetmap/lib"
	"github.com/cdn-madness/tweetmap/protobuf"
	"github.com/darkhelmet/twitterstream"
	"log"
	"time"
)

const CONNSTR string = "tcp://127.0.0.1:7654"

func main() {
	// Create a twitterstream tweet
	inTweet := new(twitterstream.Tweet)

	inTweet.Id = 200976524

	inTweet.Coordinates = &twitterstream.Point{
		Lat:  11.1,
		Long: 11.1,
	}

	inTweet.User = twitterstream.User{
		Id:         987654321,
		ScreenName: "alexanderurq",
	}

	inTweet.Text = "This is a test tweet"

	inTweet.Entities.Hashtags = append(inTweet.Entities.Hashtags, twitterstream.Hashtag{
		Text: "tweetmap",
	})

	inTweet.Entities.Media = append(inTweet.Entities.Media, twitterstream.Medium{
		MediaUrl: "http://test.com",
	})

	inTweet.Entities.Mentions = append(inTweet.Entities.Mentions, twitterstream.Mention{
		Id:         987654321,
		ScreenName: "golang",
	})

	inTweet.Entities.Urls = append(inTweet.Entities.Urls, twitterstream.Url{
		DisplayUrl: "http://test.com",
		Url:        "http://test.com",
	})

	// Transform the tweet
	var protoTweet = new(prototweet.Tweet)
	protoTweet = tweetmap.ToProtoTweet(inTweet)

	tweetChan := make(chan *prototweet.Tweet)
	errorChan := make(chan error)

	tweetmap.InitPublisher(CONNSTR, tweetChan, errorChan)

	for i := 0; i < 1000; {
		select {
		case err := <-errorChan:
			log.Println(err.Error())
			i = 10
		case <-time.After(250 * time.Millisecond):
			log.Printf("Sent tweet %s", i)
			tweetChan <- protoTweet
			i++
		}
	}
	close(tweetChan)
}
