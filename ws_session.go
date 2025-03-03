package main

import (
	"sync"

	"github.com/gorilla/websocket"
)

type Session struct {
  clients map[string]*Client
  broadcast chan []byte
  lock sync.RWMutex
}

func (r *Session) connectClient(conn *websocket.Conn) *Client {
	client := Client{
		conn: conn,
		host: len(r.clients) == 0,
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	id := client.getConnectionID()
	r.clients[id] = &client

	return &client
}

func (r *Session) disconnectClient(client *Client) {
	r.lock.Lock()
	defer r.lock.Unlock()
		
	if client.host {
		// transfer host to another client
		for _, client := range r.clients {
			if !client.host {
				client.host = true
				client.message([]byte("You are now the host"))
				break
			}
		}
	}

	client.conn.Close()
	delete(r.clients, client.getConnectionID())
}

func (r *Session) broadcastMessage() {
	for message := range r.broadcast {
		r.lock.Lock()

		for _, client := range r.clients {
			client.message(message)
		}

		r.lock.Unlock()
	}
}

func (r *Session) handleClient(client *Client) {
	defer func() {
		r.disconnectClient(client)
	}()

	for {
		_, message, err := client.conn.ReadMessage()
		if err != nil {
			break
		}

		r.broadcast <- message
	}
}
