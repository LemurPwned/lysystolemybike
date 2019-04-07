from flask import Flask, jsonify, Response
import logging
from backend_server.storage import Storage


class Exposer:
    def __init__(self):
        self.storage = Storage(5, 5, 60)
        self.storage.init_nodes()
        self.affinity_algo = True

        self.app = Flask(__name__)
        self.app.logger.disabled = True
        log = logging.getLogger('werkzeug')
        log.setLevel(logging.ERROR)

        @self.app.route('/trigger_calc')
        def trigger_calc():
            print("Triggering")
            nodes, hubs = self.storage.get_data_and_trigger_algo()

            nodes = [n.__dict__ for n in nodes]
            for n in nodes:
                n['history'] = dict(n['history'])
                for day in n['history'].keys():
                    n['history'][day] = list(n['history'][day])

            hubs = [h.__dict__ for h in hubs]
            resp = jsonify(hubs=hubs, nodes=nodes)
            resp.headers['Access-Control-Allow-Origin'] = '*'
            resp.headers['Content-Type'] = 'application/json'
            return resp

        @self.app.route('/toggle_cluster')
        def toggle_cluster():
            if self.affinity_algo:
                self.storage.maths.type = 'affinity'
            else:
                self.storage.maths.type = 'precomputed'

            self.affinity_algo = not self.affinity_algo

            return self.trigger_calc()


    def start(self):
        print('Exposer run on port 5000')
        self.app.run(host='0.0.0.0', debug=True)


if __name__ == "__main__":
    exposer = Exposer()
    exposer.start()
