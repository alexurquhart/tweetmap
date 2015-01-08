package main

import (
	"encoding/json"

	"code.google.com/p/go.net/websocket"
	"code.google.com/p/goprotobuf/proto"
	zmq "github.com/pebbe/zmq4"

	"alexurquhart/proto"
	"fmt"
	"log"
	"net/http"
	"time"
)

type Connections struct {
	clients      map[chan string]bool
	addClient    chan chan string
	removeClient chan chan string
	messages     chan string
}

var hub = &Connections{
	clients:      make(map[chan string]bool),
	addClient:    make(chan (chan string)),
	removeClient: make(chan (chan string)),
	messages:     make(chan string),
}

// Init
// Event loop to handle adding/removing/clients and message publishing
func (hub *Connections) Init() {
	go func() {
		for {
			select {
			case s := <-hub.addClient:
				hub.clients[s] = true
				log.Println("Added new client")
			case s := <-hub.removeClient:
				delete(hub.clients, s)
				log.Println("Removed client")
			case msg := <-hub.messages:
				for s, _ := range hub.clients {
					s <- msg
				}
				log.Printf("Broadcast:\t %d clients", len(hub.clients))
			}
		}
	}()
}

// Websocket handler
func websocketHandler(ws *websocket.Conn) {
	var in string
	messageChannel := make(chan string)
	hub.addClient <- messageChannel

	// Loop for 1 day
	for i := 0; i < 1440; {
		select {
		case msg := <-messageChannel:
			if err := websocket.Message.Send(ws, msg); err != nil {
				hub.removeClient <- messageChannel
				i = 1440
			}
		case <-time.After(time.Second * 60):
			in = fmt.Sprintf("{\"str\": \"No Data\"}\n\n")
			if err := websocket.Message.Send(ws, in); err != nil {
				hub.removeClient <- messageChannel
				i = 1440
			}
			i++
		}
	}
}

// Info Handler
// Returns the number of currently connected clients to the http server
func infoHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, "{\"clients\": %d}", len(hub.clients))
}

// Listen For Tweets
// Runs in its own goroutine
// Listens to the ZMQ socket, decodes the data, and publishes it to the
// client channel
func listenForTweets(c chan string) {
	for {
		// Socket to talk to clients
		subscriber, _ := zmq.NewSocket(zmq.SUB)
		defer subscriber.Close()
		subscriber.Connect("ipc:///tmp/tweetFeed")
		subscriber.SetSubscribe("TWEET")

		for {
			// Receive contents of the protobuffer
			subscriber.Recv(0)
			contents, _ := subscriber.RecvBytes(0)

			// Unmarshall the protocol buffer
			data := &geoTweet.GeoTweet{}
			err := proto.Unmarshal(contents, data)

			// Publish the tweet to the client channel
			if err != nil {
				log.Printf("Unmarshall ZMQ error: %s", err)
				break
			} else {
				jsonData, _ := json.Marshal(data)
				c <- string(jsonData)
			}
		}
	}
}

func main() {
	fmt.Printf("application started at: %s\n", time.Now().Format(time.RFC822))

	hub.Init()

	go listenForTweets(hub.messages)

	mux := http.NewServeMux()

	mux.Handle("/", websocket.Handler(websocketHandler))

	mux.HandleFunc("/info", infoHandler)

	http.ListenAndServe(":9876", mux)
}
