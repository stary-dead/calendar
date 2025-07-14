FROM nginx:alpine

# Удаляем дефолтную конфигурацию
RUN rm /etc/nginx/conf.d/default.conf

# Копируем нашу конфигурацию
COPY nginx.conf /etc/nginx/conf.d/

# Создаем директории для логов если они не существуют
RUN mkdir -p /var/log/nginx

# Expose порт 80
EXPOSE 80

# Команда по умолчанию
CMD ["nginx", "-g", "daemon off;"]
