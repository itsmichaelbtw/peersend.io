package main

import (
	"fmt"
	"log"
)

func SyncClients(clients []string, broadcast chan []byte) {
	payload := SerialiseOutgoingData("sync_online_clients", SessionData{
		Clients: clients,
	})

	broadcast <- payload
}

func TransferHost(currentClient *Client, otherClient *Client) error {
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

	currentClient.message(
		SerialiseOutgoingData("host_transfer_granted", SessionData{
			IsHost: currentClient.host,
		}),
	)

	otherClient.message(
		SerialiseOutgoingData("host_transfer_granted", SessionData{
			IsHost: otherClient.host,
		}),
	)

	log.Printf("[%s] host transferred from [%s]", otherClient.id, currentClient.id)
	return nil
}
