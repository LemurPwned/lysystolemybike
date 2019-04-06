from flask import Flask, jsonify
import logging
from storage import Storage

if __name__ == "__main__":
    
    app = Flask(__name__)
    app.logger.disabled = True
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)

    storage = Storage()

    @app.route('/trigger_calc')
    def trigger_calc():
        hubs, nodes = storage.get_data()
        return jsonify(hubs=hubs, nodes=nodes)

    app.run(host="0.0.0.0", port=8088, debug=True)    