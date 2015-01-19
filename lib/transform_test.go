package tweetmap

import (
	"github.com/cdn-madness/tweetmap/protobuf"
	"github.com/darkhelmet/twitterstream"
	"github.com/golang/protobuf/proto"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestToProtoTweet(t *testing.T) {
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
	var err error
	protoTweet, err = ToProtoTweet(inTweet)
	assert.NoError(t, err)

	// Malform the tweet
	inTweet.Coordinates = nil
	_, err = ToProtoTweet(inTweet)
	assert.Error(t, err)

	// Marshall the tweet
	marshalled, err := proto.Marshal(protoTweet)
	assert.NoError(t, err)
	assert.NotNil(t, marshalled)

	// Unmarshal the tweet
	var finalTweet = new(prototweet.Tweet)
	err = proto.Unmarshal(marshalled, finalTweet)
	assert.NoError(t, err)

	// Compare the fields
	assert.True(t, assert.ObjectsAreEqual(protoTweet, finalTweet))
}
