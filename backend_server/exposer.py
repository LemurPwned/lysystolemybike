from flask import Flask, jsonify
import logging
from backend_server.storage import Storage


class Exposer:
    def __init__(self):
        self.storage = Storage(10, 5, 20)
        self.storage.init_nodes()

        self.app = Flask(__name__)
        self.app.logger.disabled = True
        log = logging.getLogger('werkzeug')
        log.setLevel(logging.ERROR)

        @self.app.route('/trigger_calc')
        def trigger_calc():
            nodes, hubs = self.storage.get_data_and_trigger_algo()
            return jsonify(hubs=hubs, nodes=nodes)

    def start(self):
        print('Exposer run on port 5000')
        self.app.run(host='0.0.0.0', debug=True)

if __name__ == "__main__":
    exposer = Exposer()
    exposer.start()
