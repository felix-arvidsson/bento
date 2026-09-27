FROM nginx
COPY . /usr/share/nginx/html
COPY nginx/30-feeds.sh /docker-entrypoint.d/30-feeds.sh
RUN chmod +x /docker-entrypoint.d/30-feeds.sh