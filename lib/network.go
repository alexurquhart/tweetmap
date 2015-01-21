package tweetmap

import (
	"github.com/cdn-madness/tweetmap/protobuf"
	"github.com/golang/protobuf/proto"
	zmq "github.com/pebbe/zmq4"
)

// Initializes ZMQ as a publisher
// Returns a channel for incoming tweets that need to be pushed out
// and an error channel used for outcoming publishing or tweet marshalling errors
// Goroutine exits on closing of the tweet channel
func InitPublisher(connStr string, tweetChan chan *prototweet.Tweet, errorChan chan error) {

	go func(connStr string, tweetChan chan *prototweet.Tweet, errorChan chan error) {
		defer close(errorChan)

		// Create a new ZMQ context
		ctx, err := zmq.NewContext()

		if err != nil {
			errorChan <- err
			return
		}

		// Start ZMQ and bind to the connection string
		pub, err := ctx.NewSocket(zmq.PUB)
		defer pub.Close()

		if err != nil {
			errorChan <- err
			return
		}

		if err := pub.Bind(connStr); err != nil {
			errorChan <- err
			return
		}

		for tweet := range tweetChan {
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
		}

	}(connStr, tweetChan, errorChan)

	return
}

// Initializes ZMQ as a receiver
// Returns a channel for incoming tweets and a channel for errors.
// Takes a connection string, and a boolean channel to signal when to stop receiving tweets.
// Goroutine exits when any value is passed to the done channel
func InitReceiver(connStr string, doneChan chan bool) (chan *prototweet.Tweet, chan error) {

	// Make the tweet and error channel
	tweetChan := make(chan *prototweet.Tweet)
	errorChan := make(chan error)

	go func(tweetChan chan *prototweet.Tweet, errorChan chan error, doneChan chan bool) {
		defer close(tweetChan)
		defer close(errorChan)

		// Create a new ZMQ context
		ctx, err := zmq.NewContext()

		if err != nil {
			errorChan <- err
			return
		}

		// Start ZMQ and bind to the connection string
		sub, err := ctx.NewSocket(zmq.SUB)
		defer sub.Close()

		if err != nil {
			errorChan <- err
			return
		}

		if err := sub.Connect(connStr); err != nil {
			errorChan <- err
			return
		}

		if err := sub.SetSubscribe("TWEET"); err != nil {
			errorChan <- err
			return
		}

		// Loop indefinitely
		for {
			select {
			case msg, more := <-doneChan:
				if msg || !more {
					return
				}
			default:
				// Receive the tweet
				sub.Recv(0)
				bytes, err := sub.RecvBytes(0)

				if err != nil {
					errorChan <- err
					continue
				}

				// Attempt to unmarshall the bytes
				tweet := &prototweet.Tweet{}
				if err := proto.Unmarshal(bytes, tweet); err != nil {
					errorChan <- err
					continue
				}

				// Send the tweet on the outbound channel!
				tweetChan <- tweet
			}
		}
	}(tweetChan, errorChan, doneChan)

	// Return the channels
	return tweetChan, errorChan
}
