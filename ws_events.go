package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"
)

func BroadcastClientSync(clients []string, broadcast SessionMessageChannel) {
	broadcast <- Message[any]{
		Type: "sync_online_clients",
		Data: SyncClientsData{
			Clients: clients,
		},
	}
}

func TransferSessionHost(currentClient *Client, otherClient *Client) error {
	if currentClient == nil || otherClient == nil {
		return fmt.Errorf("current or other client is nil")
	}

	if !currentClient.host {
		return fmt.Errorf("only host can transfer host status")
	}

	if otherClient.host {
		return fmt.Errorf("client is already host")
	}

	if currentClient.id == otherClient.id {
		return fmt.Errorf("cannot transfer host to self")
	}

	if currentClient.closed || otherClient.closed {
		return fmt.Errorf("one of the clients is closed")
	}

	if currentClient.session.code != otherClient.session.code {
		return fmt.Errorf("clients are not in the same session")
	}

	currentClient.host = false
	otherClient.host = true

	currentClient.message(Message[HostTransferData]{
		Type: "host_transfer",
		Data: HostTransferData{
			IsHost: currentClient.host,
		},
	})

	otherClient.message(Message[HostTransferData]{
		Type: "host_transfer",
		Data: HostTransferData{
			IsHost: otherClient.host,
		},
	})

	log.Printf("[%s] host transferred from [%s]", otherClient.id, currentClient.id)
	return nil
}

func EchoLatencyTimestamp(client *Client, message []byte) {
	serverTimestamp := time.Now().UnixMilli()

	var pingMessage Message[PingData]
	if err := json.Unmarshal(message, &pingMessage); err != nil {
		return
	}

	client.message(Message[PongData]{
		Type: "pong",
		Data: PongData{
			ServerTimestamp: serverTimestamp,
			PingData:        pingMessage.Data,
		},
	})
}
