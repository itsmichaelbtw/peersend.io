// Package util provides shared utility helpers used across the peersend server.
package util

import (
	"errors"
	"math/rand"
)

// SessionIdentifier encapsulates the parameters used to generate human-readable
// session codes such as "PS-ABCDEF". Codes consist of a fixed Prefix followed
// by Length characters sampled uniformly at random from Chars.
type SessionIdentifier struct {
	// Length is the number of random characters appended after Prefix.
	Length int

	// Chars is the alphabet from which random characters are sampled
	// (e.g. "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789").
	Chars string

	// Prefix is the static string prepended to every generated code
	// (e.g. "PS-").
	Prefix string
}

// Generate produces a single session code by concatenating Prefix with Length
// characters chosen uniformly at random from Chars. It does not check for
// collisions; use GenerateUnique when uniqueness is required.
func (s *SessionIdentifier) Generate() string {
	length := len(s.Chars)
	code := make([]byte, s.Length)
	for i := range code {
		code[i] = s.Chars[rand.Intn(length)]
	}
	return s.Prefix + string(code)
}

// GenerateUnique calls Generate repeatedly until it produces a code for which
// exists returns false, then returns that code. exists is provided by the
// caller and typically performs a repository lookup. If maxAttempts is reached
// without finding a unique code, GenerateUnique returns an empty string and an
// error.
func (s *SessionIdentifier) GenerateUnique(exists func(string) bool, maxAttempts int) (string, error) {
	for range maxAttempts {
		id := s.Generate()
		if !exists(id) {
			return id, nil
		}
	}
	return "", errors.New("unable to generate a unique session ID")
}
