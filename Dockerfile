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
    pip3 install -r /app/requirement.txt
# CMD echo "done!!"
COPY . ./app
RUN cd /app/facebock && \
    python3 manage.py migrate
EXPOSE 8443
HEALTHCHECK --interval=5s --timeout=6s \
  CMD curl -fs https://localhost/ || exit 1
CMD /bin/bash -c "cd app/facebock && daphne -e ssl:8443:privateKey=localhost-key.pem:certKey=localhost.pem facebock.asgi:application"
