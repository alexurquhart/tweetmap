package tweetmap

import (
	"github.com/cdn-madness/tweetmap/protobuf"
	"github.com/golang/protobuf/proto"
	zmq "github.com/pebbe/zmq4"
)

// Initializes ZMQ as a publisher
// Returns a channel for incoming tweets that need to be pushed out
// and an error channel used for outcoming publishing or tweet marshalling errors
func InitPublisher(connStr string, tweetChan chan *prototweet.Tweet, errorChan chan error) error {
	
	go func(
	// Create a new ZMQ context
	ctx, err := zmq.NewContext()

	if err != nil {
		return err
	}

	// Start ZMQ and bind to the connection string
	pub, err := ctx.NewSocket(zmq.PUB)
	defer pub.Close()

	if err != nil {
		return err
	}

	if err := pub.Bind(connStr); err != nil {
		return err
	}

	// Loop indefinitely
	for {
		tweet, more := <-tweetChan
		if more {
			// Marshall the tweet
			m, err := proto.Marshal(tweet)
			if err != nil {
				errorChan <- err
				break
			}

			// Send the tweet
			if _, err := pub.Send("TWEET", zmq.SNDMORE); err != nil {
				errorChan <- err
				break
			}
			if _, err := pub.SendBytes(m, 0); err != nil {
				errorChan <- err
			}
		} else {
			return nil
		}
	}

	return nil
}

// Initializes ZMQ as a receiver
// Returns a channel for incoming tweets and a channel for errors.
func InitReceiver(connStr string) (chan *prototweet.Tweet, chan error, error) {

	// Make the tweet and error channel
	tweetChan := make(chan *prototweet.Tweet)
	errorChan := make(chan error)

	go func(c chan *prototweet.Tweet, e chan error) {
		// Create a new ZMQ context
		ctx, err := zmq.NewContext()

		if err != nil {
			return
		}

		// Start ZMQ and bind to the connection string
		sub, err := ctx.NewSocket(zmq.SUB)
		defer sub.Close()

		if err != nil {
			e <- err
			return
		}

		if err := sub.Connect(connStr); err != nil {
			e <- err
			return
		}

		if err := sub.SetSubscribe("TWEET"); err != nil {
			e <- err
			return
		}

		// Loop indefinitely
		for {
			// Receive the tweet
			sub.Recv(0)
			bytes, err := sub.RecvBytes(0)

			if err != nil {
				e <- err
				continue
			}

			// Attempt to unmarshall the bytes
			tweet := &prototweet.Tweet{}
			if err := proto.Unmarshal(bytes, tweet); err != nil {
				e <- err
				continue
			}

			// Send the tweet on the outbound channel!
			c <- tweet
		}
	}(tweetChan, errorChan)

	// Return the channels
	return tweetChan, errorChan, nil
}
