from channels.routing import ProtocolTypeRouter
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import facebock.chat.routing

application = ProtocolTypeRouter({
    'websocket': AuthMiddlewareStack(
        URLRouter(
            facebock.chat.routing.websocket_urlpatterns
        )
    ),
    # Empty for now (http->django views is added by default)
})
