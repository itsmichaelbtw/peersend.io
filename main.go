package main

import (
	"fmt"
	"log"
	"net/http"
)

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("healthy"))
}

func main() {
	server := SpawnServer()

	http.HandleFunc("/health", healthCheckHandler)
	http.HandleFunc("/signal", server.handleHttpConnection)

	fmt.Printf("Server started on port 8080\n")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
