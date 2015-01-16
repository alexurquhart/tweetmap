// Package main provides ...
package main

import (
	"github.com/cdn-madness/tweetmap/lib"
	"log"
)

const CONNSTR string = "tcp://127.0.0.1:7654"

func main() {
	// First set up the channels
	doneChan := make(chan bool)

	tweetChan, errChan := tweetmap.InitReceiver(CONNSTR, doneChan)

	for {
		select {
		case tweet := <-tweetChan:
			log.Println("Received tweet from @" + tweet.User.GetName())
		case err := <-errChan:
			close(doneChan)
			log.Printf("ERROR! %s", err.Error())
		}
	}
	close(doneChan)
}
