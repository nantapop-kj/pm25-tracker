package httpclient

import (
	"crypto/tls"
	"crypto/x509"
	"embed"
	"errors"
	"fmt"
	"io/fs"
	"net/http"
	"time"
)

//go:embed certs/*.pem
var certsFS embed.FS

func New(timeout time.Duration) (*http.Client, error) {
	roots, err := x509.SystemCertPool()
	if err != nil {
		return nil, fmt.Errorf("load system cert pool: %w", err)
	}

	intermediates, err := loadIntermediates()
	if err != nil {
		return nil, err
	}

	transport := http.DefaultTransport.(*http.Transport).Clone()
	transport.TLSClientConfig = &tls.Config{
		MinVersion:         tls.VersionTLS12,
		InsecureSkipVerify: true,
		VerifyConnection: func(cs tls.ConnectionState) error {
			return verify(cs, roots, intermediates)
		},
	}

	return &http.Client{Timeout: timeout, Transport: transport}, nil
}

func verify(cs tls.ConnectionState, roots, extra *x509.CertPool) error {
	if len(cs.PeerCertificates) == 0 {
		return errors.New("tls: server sent no certificate")
	}

	pool := extra.Clone()
	for _, c := range cs.PeerCertificates[1:] {
		pool.AddCert(c)
	}

	_, err := cs.PeerCertificates[0].Verify(x509.VerifyOptions{
		DNSName:       cs.ServerName,
		Roots:         roots,
		Intermediates: pool,
	})
	if err != nil {
		return fmt.Errorf("tls: verify certificate for %q: %w", cs.ServerName, err)
	}
	return nil
}

func loadIntermediates() (*x509.CertPool, error) {
	pool := x509.NewCertPool()

	files, err := fs.Glob(certsFS, "certs/*.pem")
	if err != nil {
		return nil, err
	}
	for _, name := range files {
		pem, err := certsFS.ReadFile(name)
		if err != nil {
			return nil, fmt.Errorf("read %s: %w", name, err)
		}
		if !pool.AppendCertsFromPEM(pem) {
			return nil, fmt.Errorf("parse %s: no PEM certificate found", name)
		}
	}

	return pool, nil
}
