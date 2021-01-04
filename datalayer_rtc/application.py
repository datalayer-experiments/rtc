import os, jinja2
from traitlets import Unicode
from jupyter_server.extension.application import ExtensionApp, ExtensionAppJinjaMixin
from .handlers import DefaultHandler, WsProxyHandler

DEFAULT_STATIC_FILES_PATH = os.path.join(os.path.dirname(__file__), "static")
DEFAULT_TEMPLATE_FILES_PATH = os.path.join(os.path.dirname(__file__), "templates")

class RtcApp(ExtensionAppJinjaMixin, ExtensionApp):

    # The name of the extension.
    name = "datalayer_rtc"

    # The url that your extension will serve its homepage.
    extension_url = '/datalayer_rtc/default'

    # Should your extension expose other server extensions when launched directly?
    load_other_extensions = True

    # Local path to static files directory.
    static_paths = [
        DEFAULT_STATIC_FILES_PATH
    ]

    # Local path to templates directory.
    template_paths = [
        DEFAULT_TEMPLATE_FILES_PATH
    ]

    def initialize_handlers(self):
        self.handlers.extend([
            (r'/{}/default'.format(self.name), DefaultHandler),
            (r'/{}/proxy'.format(self.name), WsProxyHandler),
        ])

    def initialize_settings(self):
        self.log.info('Config {}'.format(self.config))

#-----------------------------------------------------------------------------
# Main entry point
#-----------------------------------------------------------------------------

main = launch_new_instance = RtcApp.launch_instance
