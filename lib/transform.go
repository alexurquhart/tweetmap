package tweetmap

import (
	"github.com/cdn-madness/tweetmap/protobuf"
	"github.com/darkhelmet/twitterstream"
	"github.com/golang/protobuf/proto"
)

// Takes an input tweet from the twitterstream and transform it
// into a prototweet - a type suitable for transmission over ZMQ
// and JSON serialization
func ToProtoTweet(in *twitterstream.Tweet) *prototweet.Tweet {
	// Create a new tweet
	tweet := &prototweet.Tweet{
		Id: proto.Int64(in.Id),
		User: &prototweet.Tweet_User{
			Id:   proto.Int64(in.User.Id),
			Name: proto.String(in.User.ScreenName),
		},
		Text: proto.String(in.Text),
		Coordinates: &prototweet.Tweet_Coordinate{
			Latitude:  proto.Float64(in.Coordinates.Lat.Float64()),
			Longitude: proto.Float64(in.Coordinates.Long.Float64()),
		},
	}

	// Add the hashtags
	for _, v := range in.Entities.Hashtags {
		tweet.Hashtags = append(tweet.Hashtags, v.Text)
	}

	// Add the pictures from twitter
	for _, v := range in.Entities.Media {
		pic := &prototweet.Tweet_Image{
			Source: proto.String("TWITTER"),
			Url:    proto.String(v.MediaUrl),
		}
		tweet.Pictures = append(tweet.Pictures, pic)
	}

	// Add URL's
	for _, v := range in.Entities.Urls {
		// TODO: filter out instagram links and add them as pictures
		url := &prototweet.Tweet_Url{
			Actual:  proto.String(v.Url),
			Display: proto.String(v.DisplayUrl),
		}
		tweet.Urls = append(tweet.Urls, url)
	}

	// Add mentions
	for _, v := range in.Entities.Mentions {
		mention := &prototweet.Tweet_User{
			Id:   proto.Int64(v.Id),
			Name: proto.String(v.FullName),
		}
		tweet.Mentions = append(tweet.Mentions, mention)
	}

	return tweet
}
