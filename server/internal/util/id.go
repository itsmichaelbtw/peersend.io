package util

import (
	"errors"
	"math/rand"
)

type SessionIdentifier struct {
	Length int
	Chars  string
	Prefix string
}

func (s *SessionIdentifier) Generate() string {
	length := len(s.Chars)
	code := make([]byte, s.Length)
	for i := range code {
		code[i] = s.Chars[rand.Intn(length)]
	}
	return s.Prefix + string(code)
}

func (s *SessionIdentifier) GenerateUnique(exists func(string) bool, maxAttempts int) (string, error) {
	for i := 0; i < maxAttempts; i++ {
		id := s.Generate()
		if !exists(id) {
			return id, nil
		}
	}
	return "", errors.New("unable to generate a unique session ID")
}
