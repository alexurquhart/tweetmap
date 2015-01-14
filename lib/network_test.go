package tweetmap

import (
	"github.com/cdn-madness/tweetmap/protobuf"
	"github.com/stretchr/testify/assert"
	"testing"
	"time"
)

const CONNSTR string = "tcp://*7654"

func TestInitPublisher(t *testing.T) {
	tweetChan := make(chan *prototweet.Tweet)
	errorChan := make(chan error)

	InitPublisher(CONNSTR, tweetChan, errorChan)

	select {
	case <-time.After(1 * time.Second):
		assert.Fail(t, "fail")
	case
	}
}
