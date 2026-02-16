FROM nginx:alpine

# Copy custom configuration file from the current directory
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets into the container
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
