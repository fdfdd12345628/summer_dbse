# FROM pypy:3.6-slim
# COPY . ./app
# RUN apt-get update && \
#   apt-get install -y build-essential openssl libssl-dev && \
#   pip install -r /app/requirement.txt && \
#   cd /app/facebock && \
#   alias python='pypy3' && \
#   pypy3 manage.py migrate
# CMD /bin/bash -c "alias python='pypy3' && cd app/facebock && daphne -b 0.0.0.0 -p 8443 facebock.asgi:application"

FROM alpine
COPY requirement.txt ./app/requirement.txt
RUN echo "**** install gcc & dependency****" && \
    apk add --no-cache build-base gcc libffi-dev openssl-dev bash && \
    echo "**** install Python ****" && \
    apk add --no-cache python3-dev && \
    # if [ ! -e /usr/bin/python ]; then ln -sf python3 /usr/bin/python ; fi && \
    echo "**** install pip ****" && \
    python3 -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip3 install --no-cache --upgrade pip setuptools wheel && \
    # if [ ! -e /usr/bin/pip ]; then ln -s pip3 /usr/bin/pip ; fi \
    pip3 install -r /app/requirement.txt && \
    apk del build-base gcc

# CMD echo "done!!"
COPY . ./app
RUN cd /app/facebock && \
    python3 manage.py migrate
EXPOSE 8443
HEALTHCHECK --interval=5s --timeout=6s \
  CMD curl -fs https://localhost/ || exit 1
# CMD /bin/bash -c "cd app/facebock && daphne -e ssl:8443:privateKey=localhost-key.pem:certKey=localhost.pem facebock.asgi:application"
CMD /bin/bash -c "cd app/facebock && daphne -b 0.0.0.0 -p 8443 facebock.asgi:application"
