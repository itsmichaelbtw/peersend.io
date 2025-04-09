package main

import "net/http"

type HttpQuery struct {
	sessionCode string
	mode        string
}

func ExtractHttpQuery(r *http.Request) HttpQuery {
	query := r.URL.Query()

	return HttpQuery{
		sessionCode: query.Get("sessionCode"),
		mode:        query.Get("mode"),
	}
}
