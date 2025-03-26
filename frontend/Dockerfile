FROM nginx:alpine

COPY /js/*.js /usr/share/nginx/html/js/
COPY /css/*.css /usr/share/nginx/html/css/
COPY *.html /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]