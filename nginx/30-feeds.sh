#!/bin/sh
# Generate one proxied /calendar-N.ics location per feed URL listed (semicolon
# separated) in CALENDAR_ICS_URLS. Runs as part of the nginx image's entrypoint
# (scripts in /docker-entrypoint.d/ execute before nginx starts).
set -e

: > /etc/nginx/feeds.conf
i=0
for url in $(echo "${CALENDAR_ICS_URLS:-}" | tr ';' ' '); do
	[ -n "$url" ] || continue
	i=$((i + 1))
	cat >> /etc/nginx/feeds.conf <<EOF
    location = /calendar-$i.ics {
        proxy_pass $url;
        proxy_ssl_server_name on;
        proxy_set_header Host calendar.google.com;
        proxy_buffer_size 32k;
        proxy_buffers 8 32k;
        add_header Cache-Control "no-store";
    }
EOF
done

echo "Generated /etc/nginx/feeds.conf with $i calendar feed(s)"